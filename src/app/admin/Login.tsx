import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Shield, Mail, Lock, AlertCircle, Loader } from 'lucide-react';

// Mode DEV: Skip Supabase if not configured
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // DEV MODE: Skip auth if Supabase not configured
      if (!SUPABASE_URL || !SUPABASE_KEY) {
        console.log('DEV MODE: Supabase not configured - Mock login');
        
        // Mock successful login for demo purposes
        if (email && password) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Store mock session
          localStorage.setItem('admin_session', JSON.stringify({
            user: { email, role: 'super_admin' },
            timestamp: Date.now()
          }));
          
          // Redirect to dashboard
          navigate('/admin/dashboard');
          return;
        } else {
          throw new Error('Please enter email and password');
        }
      }

      // PRODUCTION MODE: Real Supabase auth
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
      
      // Sign in with Supabase Auth
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

      // Check if user has admin role
      const { data: userData, error: userError } = await supabase
        .from('users_extended')
        .select('role, is_active, is_blocked')
        .eq('id', authData.user.id)
        .single();

      if (userError) {
        // User might not exist in users_extended yet
        throw new Error('User not found in database');
      }

      if (!userData.is_active) {
        await supabase.auth.signOut();
        throw new Error('Account is not active');
      }

      if (userData.is_blocked) {
        await supabase.auth.signOut();
        throw new Error('Account is blocked');
      }

      if (!['admin', 'super_admin'].includes(userData.role)) {
        await supabase.auth.signOut();
        throw new Error('Access denied - Admin privileges required');
      }

      // Update last login
      await supabase
        .from('users_extended')
        .update({
          last_login_at: new Date().toISOString(),
          login_count: (userData as any).login_count + 1 || 1,
        })
        .eq('id', authData.user.id);

      // Success - redirect to dashboard
      navigate('/admin/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed');

      // Log failed login attempt (security)
      if (SUPABASE_URL) {
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
              }),
            }
          ).catch(() => {}); // Ignore errors in logging
        } catch {}
      }
    } finally {
      setLoading(false);
    }
  };

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
                  Signing in...
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
                🔒 Admin Access Only
              </p>
              <p className="text-xs text-blue-600">
                Only authorized administrators can access this panel. All login attempts are logged.
              </p>
            </div>
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