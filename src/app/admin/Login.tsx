import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Shield, Mail, Lock, AlertCircle, Loader, XCircle } from 'lucide-react';

// Environment detection
const IS_DEV = import.meta.env.DEV;
const IS_PROD = import.meta.env.PROD;
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_PROJECT_ID 
  ? `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co`
  : null;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || null;

export function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);

  useEffect(() => {
    // PRODUCTION: Block if Supabase not configured
    if (IS_PROD && (!SUPABASE_URL || !SUPABASE_KEY)) {
      setConfigError('Admin panel is not configured. Supabase environment variables are required in production.');
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // PRODUCTION: Block completely if Supabase not configured
      if (IS_PROD && (!SUPABASE_URL || !SUPABASE_KEY)) {
        throw new Error('Admin panel is not configured. Contact system administrator.');
      }

      // DEV MODE: Mock login (only in local development)
      if (IS_DEV && (!SUPABASE_URL || !SUPABASE_KEY)) {
        console.log('🔓 DEV MODE: Supabase not configured - Mock login enabled');
        
        if (email && password) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Store mock session
          localStorage.setItem('admin_session', JSON.stringify({
            user: { email, role: 'super_admin', full_name: 'Dev Admin' },
            timestamp: Date.now()
          }));
          
          console.log('✅ DEV MODE: Mock login successful');
          navigate('/admin/dashboard');
          return;
        } else {
          throw new Error('Please enter email and password');
        }
      }

      // PRODUCTION MODE: Real Supabase auth with strict validation
      if (!SUPABASE_URL || !SUPABASE_KEY) {
        throw new Error('Supabase configuration missing');
      }

      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
      
      // Step 1: Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error('Login failed - no user returned');
      }

      console.log('🔐 Supabase auth successful, checking permissions...');

      // Step 2: Fetch user details from users_extended
      const { data: userData, error: userError } = await supabase
        .from('users_extended')
        .select('id, email, full_name, role, is_active, is_blocked')
        .eq('id', authData.user.id)
        .single();

      if (userError || !userData) {
        await supabase.auth.signOut();
        throw new Error('User not found in database');
      }

      console.log('👤 User found:', userData.email, '| Role:', userData.role);

      // Step 3: CRITICAL - Check role is super_admin
      if (userData.role !== 'super_admin') {
        console.error('🚫 [SECURITY] Unauthorized access attempt - Role:', userData.role, '| Required: super_admin');
        await supabase.auth.signOut();
        throw new Error('Access denied - Super Admin privileges required');
      }

      // Step 4: Check account is active
      if (!userData.is_active) {
        console.error('🚫 [SECURITY] Account not active:', userData.email);
        await supabase.auth.signOut();
        throw new Error('Account is not active');
      }

      // Step 5: Check account is not blocked
      if (userData.is_blocked) {
        console.error('🚫 [SECURITY] Account blocked:', userData.email);
        await supabase.auth.signOut();
        throw new Error('Account is blocked');
      }

      console.log('✅ All security checks passed');

      // Step 6: Update last login
      await supabase
        .from('users_extended')
        .update({
          last_login_at: new Date().toISOString(),
          login_count: (userData as any).login_count + 1 || 1,
        })
        .eq('id', authData.user.id);

      // Success - redirect to dashboard
      console.log('🎉 Login successful, redirecting to dashboard');
      navigate('/admin/dashboard');
    } catch (err: any) {
      console.error('❌ Login error:', err);
      setError(err.message || 'Login failed');

      // Log failed login attempt (security audit)
      if (SUPABASE_URL && IS_PROD) {
        try {
          await fetch(
            `${SUPABASE_URL}/functions/v1/make-server-680c8781/admin/security/log-failed-login`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email,
                error: err.message,
                timestamp: new Date().toISOString(),
              }),
            }
          ).catch(() => {}); // Ignore errors in logging
        } catch {}
      }
    } finally {
      setLoading(false);
    }
  };

  // PRODUCTION: Show config error if Supabase not configured
  if (configError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-gray-900 flex items-center justify-center p-4">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        <div className="relative w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-2xl mb-4">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Configuration Required</h1>
              <p className="text-gray-600 mb-6">{configError}</p>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left">
                <p className="text-sm font-medium text-red-800 mb-2">
                  🔒 Missing Environment Variables
                </p>
                <ul className="text-xs text-red-600 space-y-1">
                  <li>• VITE_SUPABASE_PROJECT_ID</li>
                  <li>• VITE_SUPABASE_ANON_KEY</li>
                </ul>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Contact your system administrator to configure the admin panel.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-2xl mb-4 shadow-xl">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">USA Level English</h1>
          <p className="text-blue-200 text-lg">Admin Dashboard</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Admin Login
          </h2>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">Login Failed</p>
                <p className="text-sm text-red-600 mt-1">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@example.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Verifying credentials...
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Info */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800 font-medium mb-1">
                🔒 Super Admin Access Only
              </p>
              <p className="text-xs text-blue-600">
                Only verified users with Super Admin role can access this panel. All login attempts are logged and monitored.
              </p>
            </div>
            {IS_DEV && (!SUPABASE_URL || !SUPABASE_KEY) && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-3">
                <p className="text-sm text-yellow-800 font-medium mb-1">
                  ⚠️ DEV MODE ACTIVE
                </p>
                <p className="text-xs text-yellow-600">
                  Running in development mode - Any credentials accepted for testing. Production requires Supabase authentication with super_admin role.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-blue-200">
            Protected by enterprise-grade security
          </p>
        </div>
      </div>
    </div>
  );
}
