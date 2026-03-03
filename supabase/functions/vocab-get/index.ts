// ============================================================================
// EDGE FUNCTION: vocab-get
// Endpoint: /vocab/random ou /vocab/category/:category
// Auth: Required
// Rate Limit: 30 req/min per user
// ============================================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { rateLimiter } from '../_shared/rate-limiter.ts';
import { detectSuspiciousActivity } from '../_shared/anti-scraping.ts';

// Rate limits
const RATE_LIMITS = {
  free: { perMinute: 30, perHour: 300 },
  premium: { perMinute: 100, perHour: 1500 },
  admin: { perMinute: 1000, perHour: 100000 },
};

// Pagination limits (force small batches to prevent dumping)
const PAGINATION = {
  free: { min: 10, max: 20 },
  premium: { min: 20, max: 50 },
  admin: { min: 50, max: 100 },
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // ========================================================================
    // 1. AUTHENTICATION
    // ========================================================================
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify JWT and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ========================================================================
    // 2. GET USER PROFILE & CHECK IF BLOCKED
    // ========================================================================
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('users_profile')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: 'User profile not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (profile.is_blocked) {
      return new Response(
        JSON.stringify({ 
          error: 'Account blocked due to suspicious activity',
          contact: 'support@usalevelenglish.com'
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ========================================================================
    // 3. RATE LIMITING
    // ========================================================================
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';
    
    const rateLimitResult = await rateLimiter({
      userId: user.id,
      ip: clientIP,
      endpoint: '/vocab/get',
      limits: RATE_LIMITS[profile.role as keyof typeof RATE_LIMITS],
      supabase: supabaseAdmin,
    });

    if (!rateLimitResult.allowed) {
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded',
          retryAfter: rateLimitResult.retryAfter,
          limit: rateLimitResult.limit
        }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'Retry-After': String(rateLimitResult.retryAfter)
          } 
        }
      );
    }

    // ========================================================================
    // 4. ANTI-SCRAPING DETECTION
    // ========================================================================
    const suspicionResult = await detectSuspiciousActivity({
      userId: user.id,
      ip: clientIP,
      userAgent,
      endpoint: '/vocab/get',
      supabase: supabaseAdmin,
    });

    if (suspicionResult.isHighRisk) {
      // Update suspicion score
      await supabaseAdmin
        .from('users_profile')
        .update({ 
          suspicious_activity_score: suspicionResult.score,
          last_suspicious_activity: new Date().toISOString()
        })
        .eq('id', user.id);

      // If score too high, require CAPTCHA or slow down
      if (suspicionResult.score > 100) {
        return new Response(
          JSON.stringify({ 
            error: 'Suspicious activity detected',
            action: 'CAPTCHA_REQUIRED',
            reasons: suspicionResult.reasons
          }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Artificial slowdown for medium-risk
      if (suspicionResult.score > 50) {
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }

    // ========================================================================
    // 5. PARSE REQUEST PARAMETERS
    // ========================================================================
    const url = new URL(req.url);
    const category = url.searchParams.get('category');
    const limit = Math.min(
      parseInt(url.searchParams.get('limit') || '20'),
      PAGINATION[profile.role as keyof typeof PAGINATION].max
    );
    const offset = parseInt(url.searchParams.get('offset') || '0');

    // ========================================================================
    // 6. FETCH VOCABULARY (RLS automatically filters by role)
    // ========================================================================
    let query = supabase
      .from('vocabulary')
      .select('id, word, translation, category, difficulty, example_sentence, pronunciation')
      .range(offset, offset + limit - 1);

    if (category) {
      query = query.eq('category', category);
    }

    // Random order (prevents sequential scraping)
    const { data: vocab, error: vocabError } = await query.order('random()');

    if (vocabError) {
      console.error('Vocabulary fetch error:', vocabError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch vocabulary' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ========================================================================
    // 7. LOG REQUEST
    // ========================================================================
    await supabaseAdmin.from('rate_limiting_log').insert({
      user_id: user.id,
      ip_address: clientIP,
      endpoint: '/vocab/get',
      user_agent: userAgent,
      response_status: 200,
      is_suspicious: suspicionResult.isHighRisk,
      suspicion_reasons: suspicionResult.reasons,
    });

    // Increment request counter
    await supabaseAdmin.rpc('increment_request_count', { uid: user.id });

    // ========================================================================
    // 8. RESPONSE
    // ========================================================================
    return new Response(
      JSON.stringify({
        success: true,
        data: vocab,
        meta: {
          count: vocab.length,
          offset,
          limit,
          role: profile.role,
          requestsToday: profile.daily_request_count + 1,
        },
      }),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'X-RateLimit-Remaining': String(rateLimitResult.remaining),
        } 
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
