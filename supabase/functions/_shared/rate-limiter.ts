// ============================================================================
// SHARED: Rate Limiter
// Multi-layer rate limiting: IP-based + User-based
// ============================================================================

import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface RateLimitConfig {
  userId: string;
  ip: string;
  endpoint: string;
  limits: {
    perMinute: number;
    perHour: number;
  };
  supabase: SupabaseClient;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfter?: number;
  limit: number;
}

export async function rateLimiter(config: RateLimitConfig): Promise<RateLimitResult> {
  const { userId, ip, endpoint, limits, supabase } = config;

  const now = new Date();
  const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

  // ========================================================================
  // 1. CHECK USER-BASED RATE LIMIT (per minute)
  // ========================================================================
  const { data: userMinuteRequests, error: userMinError } = await supabase
    .from('rate_limiting_log')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('endpoint', endpoint)
    .gte('created_at', oneMinuteAgo.toISOString());

  if (userMinError) {
    console.error('Rate limit check error (user/minute):', userMinError);
    // Fail open (allow request if DB check fails)
    return { allowed: true, remaining: 0, limit: limits.perMinute };
  }

  const userMinuteCount = userMinuteRequests || 0;
  if (userMinuteCount >= limits.perMinute) {
    return {
      allowed: false,
      remaining: 0,
      retryAfter: 60,
      limit: limits.perMinute,
    };
  }

  // ========================================================================
  // 2. CHECK USER-BASED RATE LIMIT (per hour)
  // ========================================================================
  const { data: userHourRequests, error: userHourError } = await supabase
    .from('rate_limiting_log')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('endpoint', endpoint)
    .gte('created_at', oneHourAgo.toISOString());

  if (userHourError) {
    console.error('Rate limit check error (user/hour):', userHourError);
    return { allowed: true, remaining: 0, limit: limits.perHour };
  }

  const userHourCount = userHourRequests || 0;
  if (userHourCount >= limits.perHour) {
    return {
      allowed: false,
      remaining: 0,
      retryAfter: 3600,
      limit: limits.perHour,
    };
  }

  // ========================================================================
  // 3. CHECK IP-BASED RATE LIMIT (backup, prevents multi-account abuse)
  // ========================================================================
  const IP_LIMIT_PER_MINUTE = 100;
  const { data: ipMinuteRequests, error: ipError } = await supabase
    .from('rate_limiting_log')
    .select('id', { count: 'exact', head: true })
    .eq('ip_address', ip)
    .eq('endpoint', endpoint)
    .gte('created_at', oneMinuteAgo.toISOString());

  if (!ipError && (ipMinuteRequests || 0) >= IP_LIMIT_PER_MINUTE) {
    return {
      allowed: false,
      remaining: 0,
      retryAfter: 60,
      limit: IP_LIMIT_PER_MINUTE,
    };
  }

  // ========================================================================
  // 4. ALLOW REQUEST
  // ========================================================================
  return {
    allowed: true,
    remaining: limits.perMinute - userMinuteCount - 1,
    limit: limits.perMinute,
  };
}
