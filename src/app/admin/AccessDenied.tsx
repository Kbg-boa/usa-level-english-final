import { useNavigate } from 'react-router';
import { Shield, AlertCircle, XCircle, Home } from 'lucide-react';

interface AccessDeniedProps {
  type?: 'config' | 'auth' | 'role' | 'blocked' | 'inactive';
  message?: string;
  details?: string;
}

export function AccessDenied({ 
  type = 'auth', 
  message = 'Access denied',
  details = 'You do not have permission to access this area.'
}: AccessDeniedProps) {
  const navigate = useNavigate();

  const getIcon = () => {
    switch (type) {
      case 'config':
        return <XCircle className="w-8 h-8 text-red-600" />;
      case 'blocked':
      case 'inactive':
        return <AlertCircle className="w-8 h-8 text-orange-600" />;
      default:
        return <Shield className="w-8 h-8 text-red-600" />;
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'config':
        return 'Configuration Required';
      case 'role':
        return 'Insufficient Privileges';
      case 'blocked':
        return 'Account Blocked';
      case 'inactive':
        return 'Account Inactive';
      default:
        return 'Access Denied';
    }
  };

  const getBackgroundClass = () => {
    switch (type) {
      case 'config':
        return 'from-gray-900 via-red-900 to-gray-900';
      case 'blocked':
      case 'inactive':
        return 'from-gray-900 via-orange-900 to-gray-900';
      default:
        return 'from-gray-900 via-blue-900 to-gray-900';
    }
  };

  const getIconBgClass = () => {
    switch (type) {
      case 'config':
        return 'bg-red-100';
      case 'blocked':
      case 'inactive':
        return 'bg-orange-100';
      default:
        return 'bg-red-100';
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${getBackgroundClass()} flex items-center justify-center p-4`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      {/* Access Denied Card */}
      <div className="relative w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center">
            {/* Icon */}
            <div className={`inline-flex items-center justify-center w-16 h-16 ${getIconBgClass()} rounded-2xl mb-4`}>
              {getIcon()}
            </div>
            
            {/* Title */}
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {getTitle()}
            </h1>
            
            {/* Message */}
            <p className="text-gray-600 mb-6">
              {message}
            </p>
            
            {/* Details Box */}
            {type === 'config' ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left mb-6">
                <p className="text-sm text-red-800 font-medium mb-2">
                  🔒 Missing Environment Variables
                </p>
                <ul className="text-xs text-red-600 space-y-1">
                  <li>• VITE_SUPABASE_PROJECT_ID</li>
                  <li>• VITE_SUPABASE_ANON_KEY</li>
                </ul>
                <p className="text-xs text-red-600 mt-3">
                  {details}
                </p>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-red-800 font-medium">
                  🔒 Super Admin Access Required
                </p>
                <p className="text-xs text-red-600 mt-1">
                  {details}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={() => navigate('/admin/login')}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 transition-all flex items-center justify-center gap-2"
              >
                <Shield className="w-5 h-5" />
                Go to Login
              </button>

              <button
                onClick={() => navigate('/')}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
              >
                <Home className="w-5 h-5" />
                Return to Home
              </button>
            </div>

            {/* Additional Info */}
            {type === 'config' && (
              <p className="text-sm text-gray-500 mt-4">
                Contact your system administrator to configure the admin panel.
              </p>
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
