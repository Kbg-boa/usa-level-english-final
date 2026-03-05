import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Shield, AlertCircle, Loader } from 'lucide-react';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_PROJECT_ID 
  ? `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co`
  : null;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || null;

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    try {
      // DEV MODE: Check localStorage session
      if (!SUPABASE_URL || !SUPABASE_KEY) {
        const session = localStorage.getItem('admin_session');
        
        if (!session) {
          setErrorMessage('Access denied - Please login');
          setIsAuthorized(false);
          setIsChecking(false);
          setTimeout(() => navigate('/admin/login'), 2000);
          return;
        }

        const parsedSession = JSON.parse(session);
        
        // CRITICAL: Check role is super_admin
        if (parsedSession.user?.role !== 'super_admin') {
          console.error('[SECURITY] Unauthorized access attempt - Role:', parsedSession.user?.role, '| Required: super_admin');
          setErrorMessage('Access denied - Super Admin privileges required');
          setIsAuthorized(false);
          setIsChecking(false);
          localStorage.removeItem('admin_session'); // Clear invalid session
          setTimeout(() => navigate('/admin/login'), 2000);
          return;
        }

        // Session valid
        setIsAuthorized(true);
        setIsChecking(false);
        return;
      }

      // PRODUCTION MODE: Check Supabase auth + role
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

      // Check if user is authenticated
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        setErrorMessage('Access denied - Please login');
        setIsAuthorized(false);
        setIsChecking(false);
        setTimeout(() => navigate('/admin/login'), 2000);
        return;
      }

      // Check user role from database
      const { data: userData, error: userError } = await supabase
        .from('users_extended')
        .select('role, is_active, is_blocked')
        .eq('id', session.user.id)
        .single();

      if (userError || !userData) {
        setErrorMessage('Access denied - User not found');
        setIsAuthorized(false);
        setIsChecking(false);
        await supabase.auth.signOut();
        setTimeout(() => navigate('/admin/login'), 2000);
        return;
      }

      // CRITICAL: Only super_admin allowed
      if (userData.role !== 'super_admin') {
        console.error('[SECURITY] Unauthorized access attempt - User ID:', session.user.id, '| Role:', userData.role, '| Required: super_admin');
        setErrorMessage('Access denied - Super Admin privileges required');
        setIsAuthorized(false);
        setIsChecking(false);
        await supabase.auth.signOut();
        setTimeout(() => navigate('/admin/login'), 2000);
        return;
      }

      // Check if account is active
      if (!userData.is_active) {
        setErrorMessage('Access denied - Account inactive');
        setIsAuthorized(false);
        setIsChecking(false);
        await supabase.auth.signOut();
        setTimeout(() => navigate('/admin/login'), 2000);
        return;
      }

      // Check if account is blocked
      if (userData.is_blocked) {
        setErrorMessage('Access denied - Account blocked');
        setIsAuthorized(false);
        setIsChecking(false);
        await supabase.auth.signOut();
        setTimeout(() => navigate('/admin/login'), 2000);
        return;
      }

      // All checks passed
      setIsAuthorized(true);
      setIsChecking(false);
    } catch (error) {
      console.error('Access check error:', error);
      setErrorMessage('Access denied - Security check failed');
      setIsAuthorized(false);
      setIsChecking(false);
      setTimeout(() => navigate('/admin/login'), 2000);
    }
  };

  // Loading state
  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div className="flex items-center justify-center gap-2 text-white">
            <Loader className="w-5 h-5 animate-spin" />
            <p className="text-lg">Verifying access...</p>
          </div>
        </div>
      </div>
    );
  }

  // Access denied
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-2xl mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-600 mb-6">
              {errorMessage || 'You do not have permission to access this area.'}
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800 font-medium">
                🔒 Super Admin Access Required
              </p>
              <p className="text-xs text-red-600 mt-1">
                Only users with Super Admin role can access the admin dashboard.
              </p>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Redirecting to login...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Authorized - render children
  return <>{children}</>;
}
