import { createClient } from '@supabase/supabase-js';

// Check if Supabase is configured
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_PROJECT_ID 
  ? `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co`
  : null;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || null;

let supabase: ReturnType<typeof createClient> | null = null;

if (SUPABASE_URL && SUPABASE_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
}

/**
 * Track a page view event
 * Records page visits with user information if available
 */
export async function trackPageView(path: string): Promise<void> {
  // Skip tracking if Supabase is not configured (DEV MODE)
  if (!supabase) {
    console.log(`[Analytics DEV] Page view: ${path}`);
    return;
  }

  try {
    // Get current session
    const { data: { session } } = await supabase.auth.getSession();
    
    // Get user agent
    const userAgent = navigator.userAgent;
    
    // Insert analytics event
    const { error } = await supabase
      .from('analytics_events')
      .insert({
        event_type: 'page_view',
        page_path: path,
        user_id: session?.user?.id || null,
        user_email: session?.user?.email || null,
        user_agent: userAgent,
      });

    if (error) {
      console.error('Analytics tracking error:', error);
    } else {
      console.log(`[Analytics] Page view tracked: ${path}`);
    }
  } catch (err) {
    console.error('Analytics tracking exception:', err);
  }
}

/**
 * Track a custom event
 */
export async function trackEvent(
  eventType: string,
  metadata?: Record<string, any>
): Promise<void> {
  if (!supabase) {
    console.log(`[Analytics DEV] Event: ${eventType}`, metadata);
    return;
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    const { error } = await supabase
      .from('analytics_events')
      .insert({
        event_type: eventType,
        page_path: window.location.pathname,
        user_id: session?.user?.id || null,
        user_email: session?.user?.email || null,
        user_agent: navigator.userAgent,
        metadata,
      });

    if (error) {
      console.error('Event tracking error:', error);
    }
  } catch (err) {
    console.error('Event tracking exception:', err);
  }
}

/**
 * Track security event
 */
export async function trackSecurityEvent(
  eventType: string,
  email?: string,
  metadata?: Record<string, any>
): Promise<void> {
  if (!supabase) {
    console.log(`[Security DEV] Event: ${eventType}`, { email, metadata });
    return;
  }

  try {
    const { error } = await supabase
      .from('security_logs')
      .insert({
        event_type: eventType,
        email: email || null,
        ip_address: null, // IP would need to come from server-side
        user_agent: navigator.userAgent,
        metadata,
      });

    if (error) {
      console.error('Security event tracking error:', error);
    }
  } catch (err) {
    console.error('Security event tracking exception:', err);
  }
}
