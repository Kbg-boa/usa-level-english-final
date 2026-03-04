import { useEffect, useState } from 'react';
import { Users, Activity, Shield, BookOpen, TrendingUp, Globe } from 'lucide-react';

// Check if Supabase is configured
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_PROJECT_ID 
  ? `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co`
  : null;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || null;

interface DashboardStats {
  totalUsers: number;
  activeToday: number;
  activeSessions: number;
  lessonsCompletedToday: number;
  totalLessonsCompleted: number;
  securityAlerts: number;
}

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeToday: 0,
    activeSessions: 0,
    lessonsCompletedToday: 0,
    totalLessonsCompleted: 0,
    securityAlerts: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // DEV MODE: Use mock data if Supabase not configured
      if (!SUPABASE_URL || !SUPABASE_KEY) {
        console.log('DEV MODE: Using mock dashboard stats');
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
        
        setStats({
          totalUsers: 1247,
          activeToday: 89,
          activeSessions: 34,
          lessonsCompletedToday: 156,
          totalLessonsCompleted: 8934,
          securityAlerts: 3,
        });
        
        setLoading(false);
        return;
      }

      // PRODUCTION MODE: Fetch from API
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/make-server-680c8781/admin/dashboard/stats`,
        {
          headers: {
            'Authorization': `Bearer ${SUPABASE_KEY}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }

      const data = await response.json();
      setStats(data.stats);
    } catch (err: any) {
      console.error('Stats fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-800">Error loading dashboard: {error}</p>
        <button
          onClick={fetchStats}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const statCards = [
    {
      icon: Users,
      label: 'Total Users',
      value: stats.totalUsers,
      change: null,
      color: 'bg-blue-500',
    },
    {
      icon: Activity,
      label: 'Active Today',
      value: stats.activeToday,
      change: null,
      color: 'bg-green-500',
    },
    {
      icon: Shield,
      label: 'Active Sessions',
      value: stats.activeSessions,
      change: null,
      color: 'bg-purple-500',
    },
    {
      icon: BookOpen,
      label: 'Lessons Completed Today',
      value: stats.lessonsCompletedToday,
      change: null,
      color: 'bg-orange-500',
    },
    {
      icon: TrendingUp,
      label: 'Total Lessons Completed',
      value: stats.totalLessonsCompleted,
      change: null,
      color: 'bg-indigo-500',
    },
    {
      icon: Shield,
      label: 'Security Alerts (7 days)',
      value: stats.securityAlerts,
      change: null,
      color: 'bg-red-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of your application</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stat.value.toLocaleString()}
                  </p>
                  {stat.change && (
                    <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      {stat.change}
                    </p>
                  )}
                </div>
                <div className={`${stat.color} rounded-full p-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Top Countries */}
      {stats?.top_countries && stats.top_countries.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Globe className="w-5 h-5 text-gray-600" />
            <h2 className="text-xl font-bold text-gray-900">Top Countries</h2>
          </div>

          <div className="space-y-4">
            {stats.top_countries.map((country, index) => {
              const total = stats.total_users || 1;
              const percentage = Math.round((country.count / total) * 100);

              return (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">
                      {country.country || 'Unknown'}
                    </span>
                    <span className="text-sm text-gray-600">
                      {country.count} users ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/admin/users"
            className="flex items-center gap-3 p-4 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <Users className="w-6 h-6 text-blue-600" />
            <div>
              <p className="font-semibold text-gray-900">Manage Users</p>
              <p className="text-sm text-gray-600">View and edit users</p>
            </div>
          </a>

          <a
            href="/admin/security"
            className="flex items-center gap-3 p-4 rounded-lg border-2 border-gray-200 hover:border-red-500 hover:bg-red-50 transition-colors"
          >
            <Shield className="w-6 h-6 text-red-600" />
            <div>
              <p className="font-semibold text-gray-900">Security Logs</p>
              <p className="text-sm text-gray-600">Check alerts</p>
            </div>
          </a>

          <a
            href="/admin/messages"
            className="flex items-center gap-3 p-4 rounded-lg border-2 border-gray-200 hover:border-green-500 hover:bg-green-50 transition-colors"
          >
            <Activity className="w-6 h-6 text-green-600" />
            <div>
              <p className="font-semibold text-gray-900">Send Message</p>
              <p className="text-sm text-gray-600">Broadcast to users</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}