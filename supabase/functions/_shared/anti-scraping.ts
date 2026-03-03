// ============================================================================
// SHARED: Anti-Scraping Detection
// Detects and scores suspicious patterns
// ============================================================================

import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface SuspicionConfig {
  userId: string;
  ip: string;
  userAgent: string;
  endpoint: string;
  supabase: SupabaseClient;
}

interface SuspicionResult {
  isHighRisk: boolean;
  score: number;
  reasons: string[];
}

export async function detectSuspiciousActivity(config: SuspicionConfig): Promise<SuspicionResult> {
  const { userId, ip, userAgent, endpoint, supabase } = config;

  let score = 0;
  const reasons: string[] = [];

  const now = new Date();
  const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // ========================================================================
  // 1. CHECK USER AGENT (bot detection)
  // ========================================================================
  const botPatterns = [
    'bot', 'crawler', 'scraper', 'spider', 'python', 'curl', 
    'wget', 'httpclient', 'axios', 'fetch', 'postman'
  ];

  const suspiciousUA = botPatterns.some(pattern => 
    userAgent.toLowerCase().includes(pattern)
  );

  if (suspiciousUA) {
    score += 50;
    reasons.push('Suspicious user agent detected');
  }

  // ========================================================================
  // 2. CHECK REQUEST FREQUENCY (too fast = bot)
  // ========================================================================
  const { data: recentRequests } = await supabase
    .from('rate_limiting_log')
    .select('created_at')
    .eq('user_id', userId)
    .eq('endpoint', endpoint)
    .gte('created_at', oneMinuteAgo.toISOString())
    .order('created_at', { ascending: false })
    .limit(10);

  if (recentRequests && recentRequests.length >= 8) {
    // More than 8 requests in last minute
    score += 30;
    reasons.push('Unusually high request frequency');

    // Check if requests are suspiciously uniform (bot pattern)
    const intervals = [];
    for (let i = 1; i < recentRequests.length; i++) {
      const diff = new Date(recentRequests[i - 1].created_at).getTime() - 
                   new Date(recentRequests[i].created_at).getTime();
      intervals.push(diff);
    }

    // If all intervals are very similar (±100ms), it's a bot
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.every(i => Math.abs(i - avgInterval) < 100);

    if (variance && intervals.length > 3) {
      score += 40;
      reasons.push('Robotic request pattern detected');
    }
  }

  // ========================================================================
  // 3. CHECK SEQUENTIAL PAGINATION (scraping pattern)
  // ========================================================================
  const { data: paginationHistory } = await supabase
    .from('rate_limiting_log')
    .select('endpoint')
    .eq('user_id', userId)
    .gte('created_at', oneHourAgo.toISOString())
    .order('created_at', { ascending: true })
    .limit(50);

  if (paginationHistory && paginationHistory.length > 20) {
    // Detect if user is systematically going through pages
    const offsetPattern = /offset=(\d+)/;
    const offsets = paginationHistory
      .map(log => {
        const match = log.endpoint.match(offsetPattern);
        return match ? parseInt(match[1]) : null;
      })
      .filter(o => o !== null);

    // Check if offsets are sequential (0, 20, 40, 60...)
    let isSequential = true;
    for (let i = 1; i < Math.min(offsets.length, 10); i++) {
      if (offsets[i] !== offsets[i - 1] + 20 && offsets[i] !== offsets[i - 1] + 50) {
        isSequential = false;
        break;
      }
    }

    if (isSequential && offsets.length >= 5) {
      score += 60;
      reasons.push('Sequential pagination scraping pattern');
    }
  }

  // ========================================================================
  // 4. CHECK MULTIPLE ACCOUNTS FROM SAME IP (evasion attempt)
  // ========================================================================
  const { data: ipAccounts, error: ipError } = await supabase
    .from('rate_limiting_log')
    .select('user_id')
    .eq('ip_address', ip)
    .gte('created_at', oneDayAgo.toISOString());

  if (!ipError && ipAccounts) {
    const uniqueUsers = new Set(ipAccounts.map(log => log.user_id));
    if (uniqueUsers.size > 5) {
      score += 50;
      reasons.push('Multiple accounts from same IP');
    }
  }

  // ========================================================================
  // 5. CHECK TOTAL DAILY REQUESTS (abnormal usage)
  // ========================================================================
  const { data: dailyRequests } = await supabase
    .from('rate_limiting_log')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', oneDayAgo.toISOString());

  const dailyCount = dailyRequests || 0;

  if (dailyCount > 5000) {
    score += 70;
    reasons.push('Abnormally high daily request count');
  } else if (dailyCount > 2000) {
    score += 30;
    reasons.push('High daily request count');
  }

  // ========================================================================
  // 6. CHECK PREVIOUS SUSPICIOUS ACTIVITY
  // ========================================================================
  const { data: profile } = await supabase
    .from('users_profile')
    .select('suspicious_activity_score')
    .eq('id', userId)
    .single();

  if (profile && profile.suspicious_activity_score > 50) {
    score += profile.suspicious_activity_score / 2;
    reasons.push('Previous suspicious activity on record');
  }

  // ========================================================================
  // 7. RETURN RESULT
  // ========================================================================
  return {
    isHighRisk: score > 50,
    score: Math.min(score, 200), // Cap at 200
    reasons,
  };
}

// ============================================================================
// AUTO-BAN FUNCTION (call this if score > 150)
// ============================================================================
export async function autoBlockUser(userId: string, supabase: SupabaseClient): Promise<void> {
  await supabase
    .from('users_profile')
    .update({ 
      is_blocked: true,
      suspicious_activity_score: 200,
      last_suspicious_activity: new Date().toISOString()
    })
    .eq('id', userId);

  console.log(`[AUTO-BAN] User ${userId} has been blocked due to suspicious activity`);
}
