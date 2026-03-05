import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';

// Environment detection
const IS_DEV = import.meta.env.DEV;
const IS_PROD = import.meta.env.PROD;
const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ||
  (import.meta.env.VITE_SUPABASE_PROJECT_ID
    ? `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co`
    : null);

const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || null;

interface AdminUser {
  id?: string;
  email: string;
  full_name?: string;
  role: string;
  is_active?: boolean;
  is_blocked?: boolean;
}

export function useAdminAuth() {
  const navigate = useNavigate();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      // PRODUCTION: Block if Supabase not configured
      if (IS_PROD && (!SUPABASE_URL || !SUPABASE_KEY)) {
        console.error('🚫 [SECURITY] Admin panel blocked - Supabase not configured in production');
        setLoading(false);
        navigate('/admin/login');
        return;
      }

      // DEV MODE: Load from localStorage (only in local development)
      if (IS_DEV && (!SUPABASE_URL || !SUPABASE_KEY)) {
        console.log('🔓 DEV MODE: Loading session from localStorage');
        
        const session = localStorage.getItem('admin_session');
        if (session) {
          const parsedSession = JSON.parse(session);
          
          // Verify role
          if (parsedSession.user?.role === 'super_admin') {
            setUser(parsedSession.user);
            console.log('✅ DEV MODE: User loaded:', parsedSession.user.email);
          } else {
            console.error('🚫 DEV MODE: Invalid role:', parsedSession.user?.role);
            localStorage.removeItem('admin_session');
          }
        }
        setLoading(false);
        return;
      }

      // PRODUCTION MODE: Load from Supabase with strict validation
      if (!SUPABASE_URL || !SUPABASE_KEY) {
        throw new Error('Supabase configuration missing');
      }

      console.log('🔐 PRODUCTION MODE: Loading user from Supabase...');

      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

      // Step 1: Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('🚫 Session error:', sessionError);
        setLoading(false);
        return;
      }

      if (!session) {
        console.log('ℹ️ No active session');
        setLoading(false);
        return;
      }

      // Step 2: Get user details from users_extended
      const { data: userData, error: userError } = await supabase
        .from('users_extended')
        .select('id, email, full_name, role, is_active, is_blocked')
        .eq('id', session.user.id)
        .single();

      if (userError || !userData) {
        console.error('🚫 User not found in database:', userError);
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      console.log('👤 User found:', userData.email, '| Role:', userData.role);

      // Step 3: Verify super_admin role
      if (userData.role !== 'super_admin') {
        console.error('🚫 [SECURITY] Invalid role:', userData.role, '| Required: super_admin');
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      // Step 4: Verify account is active
      if (!userData.is_active) {
        console.error('🚫 [SECURITY] Account not active:', userData.email);
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      // Step 5: Verify account is not blocked
      if (userData.is_blocked) {
        console.error('🚫 [SECURITY] Account blocked:', userData.email);
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      // All checks passed
      console.log('✅ User loaded successfully');
      setUser(userData as AdminUser);
      setLoading(false);
    } catch (error) {
      console.error('❌ Error loading user:', error);
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // DEV MODE: Clear localStorage
      if (IS_DEV && (!SUPABASE_URL || !SUPABASE_KEY)) {
        console.log('🔓 DEV MODE: Clearing localStorage session');
        localStorage.removeItem('admin_session');
        setUser(null);
        navigate('/admin/login');
        return;
      }

      // PRODUCTION MODE: Sign out from Supabase
      if (!SUPABASE_URL || !SUPABASE_KEY) {
        throw new Error('Supabase configuration missing');
      }

      console.log('🔐 PRODUCTION MODE: Signing out from Supabase...');

      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
      await supabase.auth.signOut();
      
      console.log('✅ Signed out successfully');
      setUser(null);
      navigate('/admin/login');
    } catch (error) {
      console.error('❌ Logout error:', error);
      navigate('/admin/login');
    }
  };

  return { user, loading, logout };
}
