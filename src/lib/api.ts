// ============================================================================
// API CLIENT
// All API calls go through Edge Functions (never direct DB access)
// ============================================================================

import { supabase } from './supabase';
import type { VocabularyItem, QuizQuestion, Template } from './supabase';

const EDGE_FUNCTION_URL = import.meta.env.VITE_SUPABASE_URL?.replace(
  'https://',
  ''
).replace('.supabase.co', '');

const FUNCTIONS_BASE = `https://${EDGE_FUNCTION_URL}.supabase.co/functions/v1`;

/**
 * Get auth headers with current session token
 */
async function getAuthHeaders(): Promise<HeadersInit> {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.access_token) {
    throw new Error('Not authenticated');
  }

  return {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json',
  };
}

/**
 * Handle API errors
 */
function handleApiError(error: unknown, context: string): never {
  console.error(`[API Error] ${context}:`, error);
  
  if (error instanceof Error) {
    throw new Error(`${context}: ${error.message}`);
  }
  
  throw new Error(`${context}: Unknown error`);
}

// ============================================================================
// VOCABULARY API
// ============================================================================

export interface VocabParams {
  category?: string;
  limit?: number;
  offset?: number;
}

export interface VocabResponse {
  success: boolean;
  data: VocabularyItem[];
  meta: {
    count: number;
    offset: number;
    limit: number;
    role: string;
    requestsToday: number;
  };
}

/**
 * Fetch vocabulary items (paginated, rate-limited)
 */
export async function getVocabulary(params: VocabParams = {}): Promise<VocabResponse> {
  try {
    const headers = await getAuthHeaders();
    const queryParams = new URLSearchParams();
    
    if (params.category) queryParams.set('category', params.category);
    if (params.limit) queryParams.set('limit', String(params.limit));
    if (params.offset) queryParams.set('offset', String(params.offset));

    const response = await fetch(
      `${FUNCTIONS_BASE}/vocab-get?${queryParams.toString()}`,
      { headers }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch vocabulary');
    }

    return await response.json();
  } catch (error) {
    return handleApiError(error, 'getVocabulary');
  }
}

// ============================================================================
// QUIZ API
// ============================================================================

export interface QuizResponse {
  success: boolean;
  data: QuizQuestion[];
  meta: {
    count: number;
    difficulty: string;
  };
}

/**
 * Get daily quiz (premium only)
 */
export async function getDailyQuiz(difficulty?: string): Promise<QuizResponse> {
  try {
    const headers = await getAuthHeaders();
    const queryParams = new URLSearchParams();
    
    if (difficulty) queryParams.set('difficulty', difficulty);

    const response = await fetch(
      `${FUNCTIONS_BASE}/quiz-daily?${queryParams.toString()}`,
      { headers }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch quiz');
    }

    return await response.json();
  } catch (error) {
    return handleApiError(error, 'getDailyQuiz');
  }
}

// ============================================================================
// TEMPLATES API
// ============================================================================

export interface TemplatesResponse {
  success: boolean;
  data: Template[];
  meta: {
    count: number;
    category?: string;
  };
}

/**
 * Get templates list (premium only)
 */
export async function getTemplates(category?: string): Promise<TemplatesResponse> {
  try {
    const headers = await getAuthHeaders();
    const queryParams = new URLSearchParams();
    
    if (category) queryParams.set('category', category);

    const response = await fetch(
      `${FUNCTIONS_BASE}/templates-list?${queryParams.toString()}`,
      { headers }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch templates');
    }

    return await response.json();
  } catch (error) {
    return handleApiError(error, 'getTemplates');
  }
}

// ============================================================================
// USER UPGRADE API
// ============================================================================

export interface UpgradeResponse {
  success: boolean;
  checkoutUrl?: string;
  error?: string;
}

/**
 * Initiate upgrade to premium (will integrate Stripe later)
 */
export async function upgradeToPremium(): Promise<UpgradeResponse> {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(
      `${FUNCTIONS_BASE}/user-upgrade`,
      {
        method: 'POST',
        headers,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to initiate upgrade');
    }

    return await response.json();
  } catch (error) {
    return handleApiError(error, 'upgradeToPremium');
  }
}

// ============================================================================
// ANALYTICS API
// ============================================================================

export interface ActivityLog {
  activity_type: 'word_learned' | 'quiz_completed' | 'lesson_started' | 'template_used';
  metadata?: Record<string, unknown>;
}

/**
 * Log user activity
 */
export async function logActivity(activity: ActivityLog): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    await supabase
      .from('user_activity')
      .insert({
        user_id: user.id,
        ...activity,
      });
  } catch (error) {
    // Non-critical, just log error
    console.error('Failed to log activity:', error);
  }
}
