import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Shield, AlertCircle, Loader, XCircle } from 'lucide-react';

// Environment detection
const IS_DEV = import.meta.env.DEV;
const IS_PROD = import.meta.env.PROD;
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
  const [errorType, setErrorType] = useState<'config' | 'auth' | null>(null);

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    try {
      // PRODUCTION: Block completely if Supabase not configured
      if (IS_PROD && (!SUPABASE_URL || !SUPABASE_KEY)) {
        console.error('🚫 [SECURITY] Admin panel blocked - Supabase not configured in production');
        setErrorType('config');
        setErrorMessage('Admin panel is not configured. Supabase environment variables are required.');
        setIsAuthorized(false);
        setIsChecking(false);
        setTimeout(() => navigate('/admin/login'), 3000);
        return;
      }

      // DEV MODE: Check localStorage session (only in local development)
      if (IS_DEV && (!SUPABASE_URL || !SUPABASE_KEY)) {
        console.log('🔓 DEV MODE: Checking localStorage session');
        
        const session = localStorage.getItem('admin_session');
        
        if (!session) {
          setErrorType('auth');
          setErrorMessage('Access denied - Please login');
          setIsAuthorized(false);
          setIsChecking(false);
          setTimeout(() => navigate('/admin/login'), 2000);
          return;
        }

        const parsedSession = JSON.parse(session);
        
        // CRITICAL: Check role is super_admin
        if (parsedSession.user?.role !== 'super_admin') {
          console.error('🚫 [SECURITY] DEV MODE - Unauthorized access attempt - Role:', parsedSession.user?.role, '| Required: super_admin');
          setErrorType('auth');
          setErrorMessage('Access denied - Super Admin privileges required');
          setIsAuthorized(false);
          setIsChecking(false);
          localStorage.removeItem('admin_session'); // Clear invalid session
          setTimeout(() => navigate('/admin/login'), 2000);
          return;
        }

        console.log('✅ DEV MODE: Session valid');
        setIsAuthorized(true);
        setIsChecking(false);
        return;
      }

      // PRODUCTION MODE: Check Supabase auth + role with strict validation
      if (!SUPABASE_URL || !SUPABASE_KEY) {
        throw new Error('Supabase configuration missing');
      }

      console.log('🔐 PRODUCTION MODE: Verifying Supabase session...');

      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

      // Step 1: Check if user is authenticated
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('🚫 [SECURITY] Session error:', sessionError);
        setErrorType('auth');
        setErrorMessage('Session verification failed');
        setIsAuthorized(false);
        setIsChecking(false);
        setTimeout(() => navigate('/admin/login'), 2000);
        return;
      }

      if (!session) {
        console.error('🚫 [SECURITY] No active session');
        setErrorType('auth');
        setErrorMessage('Access denied - Please login');
        setIsAuthorized(false);
        setIsChecking(false);
        setTimeout(() => navigate('/admin/login'), 2000);
        return;
      }

      console.log('🔐 Session found, verifying user permissions...');

      // Step 2: Fetch user details from users_extended
      const { data: userData, error: userError } = await supabase
        .from('users_extended')
        .select('id, email, role, is_active, is_blocked')
        .eq('id', session.user.id)
        .single();

      if (userError || !userData) {
        console.error('🚫 [SECURITY] User not found in database:', userError);
        setErrorType('auth');
        setErrorMessage('Access denied - User not found');
        setIsAuthorized(false);
        setIsChecking(false);
        await supabase.auth.signOut();
        setTimeout(() => navigate('/admin/login'), 2000);
        return;
      }

      console.log('👤 User found:', userData.email, '| Role:', userData.role);

      // Step 3: CRITICAL - Only super_admin allowed
      if (userData.role !== 'super_admin') {
        console.error('🚫 [SECURITY] Unauthorized access attempt - User ID:', session.user.id, '| Role:', userData.role, '| Required: super_admin');
        setErrorType('auth');
        setErrorMessage('Access denied - Super Admin privileges required');
        setIsAuthorized(false);
        setIsChecking(false);
        await supabase.auth.signOut();
        setTimeout(() => navigate('/admin/login'), 2000);
        return;
      }

      // Step 4: Check if account is active
      if (!userData.is_active) {
        console.error('🚫 [SECURITY] Account not active:', userData.email);
        setErrorType('auth');
        setErrorMessage('Access denied - Account inactive');
        setIsAuthorized(false);
        setIsChecking(false);
        await supabase.auth.signOut();
        setTimeout(() => navigate('/admin/login'), 2000);
        return;
      }

      // Step 5: Check if account is blocked
      if (userData.is_blocked) {
        console.error('🚫 [SECURITY] Account blocked:', userData.email);
        setErrorType('auth');
        setErrorMessage('Access denied - Account blocked');
        setIsAuthorized(false);
        setIsChecking(false);
        await supabase.auth.signOut();
        setTimeout(() => navigate('/admin/login'), 2000);
        return;
      }

      // All checks passed
      console.log('✅ All security checks passed - Access granted');
      setIsAuthorized(true);
      setIsChecking(false);
    } catch (error) {
      console.error('❌ Access check error:', error);
      setErrorType('auth');
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
    const isConfigError = errorType === 'config';
    
    return (
      <div className={`min-h-screen bg-gradient-to-br ${isConfigError ? 'from-gray-900 via-red-900 to-gray-900' : 'from-gray-900 via-blue-900 to-gray-900'} flex items-center justify-center p-4`}>
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center">
            <div className={`inline-flex items-center justify-center w-16 h-16 ${isConfigError ? 'bg-red-100' : 'bg-red-100'} rounded-2xl mb-4`}>
              {isConfigError ? (
                <XCircle className="w-8 h-8 text-red-600" />
              ) : (
                <AlertCircle className="w-8 h-8 text-red-600" />
              )}
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {isConfigError ? 'Configuration Required' : 'Access Denied'}
            </h1>
            
            <p className="text-gray-600 mb-6">
              {errorMessage || 'You do not have permission to access this area.'}
            </p>
            
            {isConfigError ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left">
                <p className="text-sm text-red-800 font-medium mb-2">
                  🔒 Missing Environment Variables
                </p>
                <ul className="text-xs text-red-600 space-y-1">
                  <li>• VITE_SUPABASE_PROJECT_ID</li>
                  <li>• VITE_SUPABASE_ANON_KEY</li>
                </ul>
                <p className="text-xs text-red-600 mt-3">
                  The admin panel requires Supabase configuration in production.
                </p>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800 font-medium">
                  🔒 Super Admin Access Required
                </p>
                <p className="text-xs text-red-600 mt-1">
                  Only users with Super Admin role can access the admin dashboard.
                </p>
              </div>
            )}
            
            <p className="text-sm text-gray-500 mt-4">
              {isConfigError ? 'Contact your system administrator.' : 'Redirecting to login...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Authorized - render children
  return <>{children}</>;
}
