import { useEffect, useState } from 'react';
import { BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, Users, Monitor, Globe } from 'lucide-react';

// Check if Supabase is configured
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_PROJECT_ID 
  ? `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co`
  : null;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || null;

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function Analytics() {
  const [dateFilter, setDateFilter] = useState('7');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analyticsData, setAnalyticsData] = useState<any>(null);

  useEffect(() => {
    fetchAnalytics();
  }, [dateFilter]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // DEV MODE: Use mock data
      if (!SUPABASE_URL || !SUPABASE_KEY) {
        console.log('DEV MODE: Using mock analytics data');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setAnalyticsData({
          dailyVisitors: [
            { date: 'Mon', visitors: 245 },
            { date: 'Tue', visitors: 312 },
            { date: 'Wed', visitors: 289 },
            { date: 'Thu', visitors: 401 },
            { date: 'Fri', visitors: 378 },
            { date: 'Sat', visitors: 156 },
            { date: 'Sun', visitors: 189 },
          ],
          devices: [
            { name: 'Desktop', value: 45 },
            { name: 'Mobile', value: 35 },
            { name: 'Tablet', value: 20 },
          ],
          topPages: [
            { page: '/dashboard', views: 1234 },
            { page: '/vocabulary', views: 987 },
            { page: '/conversation', views: 756 },
            { page: '/pronunciation', views: 543 },
            { page: '/grammar', views: 421 },
          ],
          topCountries: [
            { country: 'USA', users: 450 },
            { country: 'UK', users: 320 },
            { country: 'Canada', users: 280 },
            { country: 'Australia', users: 190 },
            { country: 'France', users: 145 },
          ],
        });
        
        setLoading(false);
        return;
      }

      // PRODUCTION MODE: Fetch from API
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/make-server-680c8781/admin/analytics?days=${dateFilter}`,
        {
          headers: {
            'Authorization': `Bearer ${SUPABASE_KEY}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const data = await response.json();
      setAnalyticsData(data);
    } catch (err: any) {
      console.error('Analytics fetch error:', err);
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
        <p className="text-red-800">Error loading analytics: {error}</p>
        <button
          onClick={fetchAnalytics}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const deviceData = analyticsData?.devices
    ? analyticsData.devices.map((device: { name: string, value: number }) => ({
        name: device.name.charAt(0).toUpperCase() + device.name.slice(1),
        value: device.value,
      }))
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">Detailed usage statistics</p>
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-gray-600" />
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Daily Visitors Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900">Daily Visitors</h2>
        </div>

        {analyticsData?.dailyVisitors && analyticsData.dailyVisitors.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData.dailyVisitors}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="visitors"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-gray-500">
            No visitor data available
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Devices Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Monitor className="w-5 h-5 text-purple-600" />
            <h2 className="text-xl font-bold text-gray-900">Devices</h2>
          </div>

          {deviceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={deviceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              No device data available
            </div>
          )}
        </div>

        {/* Top Pages */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Users className="w-5 h-5 text-green-600" />
            <h2 className="text-xl font-bold text-gray-900">Top Pages</h2>
          </div>

          {analyticsData?.topPages && analyticsData.topPages.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.topPages.slice(0, 8)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis
                  type="category"
                  dataKey="page"
                  width={150}
                  tick={{ fontSize: 11 }}
                  tickFormatter={(value) => value.length > 20 ? value.slice(0, 20) + '...' : value}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
                <Bar dataKey="views" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              No page data available
            </div>
          )}
        </div>
      </div>

      {/* Top Countries */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Globe className="w-5 h-5 text-orange-600" />
          <h2 className="text-xl font-bold text-gray-900">Top Countries</h2>
        </div>

        {analyticsData?.topCountries && analyticsData.topCountries.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.topCountries}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="country" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Legend />
              <Bar dataKey="users" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-gray-500">
            No country data available
          </div>
        )}
      </div>
    </div>
  );
}