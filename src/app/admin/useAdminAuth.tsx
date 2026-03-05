import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_PROJECT_ID 
  ? `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co`
  : null;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || null;

interface AdminUser {
  id?: string;
  email: string;
  full_name?: string;
  role: string;
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
      // DEV MODE: Load from localStorage
      if (!SUPABASE_URL || !SUPABASE_KEY) {
        const session = localStorage.getItem('admin_session');
        if (session) {
          const parsedSession = JSON.parse(session);
          setUser(parsedSession.user);
        }
        setLoading(false);
        return;
      }

      // PRODUCTION MODE: Load from Supabase
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setLoading(false);
        return;
      }

      // Get user details from users_extended
      const { data: userData } = await supabase
        .from('users_extended')
        .select('id, email, full_name, role')
        .eq('id', session.user.id)
        .single();

      if (userData) {
        setUser(userData as AdminUser);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading user:', error);
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // DEV MODE: Clear localStorage
      if (!SUPABASE_URL || !SUPABASE_KEY) {
        localStorage.removeItem('admin_session');
        setUser(null);
        navigate('/admin/login');
        return;
      }

      // PRODUCTION MODE: Sign out from Supabase
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
      await supabase.auth.signOut();
      
      setUser(null);
      navigate('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/admin/login');
    }
  };

  return { user, loading, logout };
}
