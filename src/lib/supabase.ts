// ============================================================================
// SUPABASE CLIENT CONFIGURATION
// ============================================================================

import { createClient } from '@supabase/supabase-js';

// Environment variables (set in Vercel)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables!');
  console.error('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

// Create singleton Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface UserProfile {
  id: string;
  email: string;
  role: 'free' | 'premium' | 'admin';
  daily_request_count: number;
  total_requests: number;
  is_blocked: boolean;
  suspicious_activity_score: number;
  display_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface VocabularyItem {
  id: string;
  word: string;
  translation: string;
  category: string;
  difficulty: 'intermediate' | 'advanced' | 'native';
  example_sentence?: string;
  pronunciation?: string;
  usage_notes?: string;
  synonyms?: string[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  correct_answer: string;
  wrong_answers: string[];
  category: string;
  difficulty: 'intermediate' | 'advanced' | 'native';
}

export interface Template {
  id: string;
  name: string;
  category: string;
  description?: string;
  content: Record<string, unknown>;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get current user profile
 */
export async function getUserProfile(): Promise<UserProfile | null> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return null;
    }

    const { data, error } = await supabase
      .from('users_profile')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Profile fetch error:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Unexpected error fetching profile:', error);
    return null;
  }
}

/**
 * Sign in with email OTP
 */
export async function signInWithOTP(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

/**
 * Sign in with Google OAuth
 */
export async function signInWithGoogle(): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

/**
 * Sign out
 */
export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
}

/**
 * Get current session
 */
export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}
