import { Link, Outlet, useLocation } from 'react-router';
import { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Shield,
  MessageSquare,
  FileText,
  LogOut,
  Menu,
  X,
  Loader
} from 'lucide-react';
import { useAdminAuth } from './useAdminAuth';

export function AdminLayout() {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user, loading, logout } = useAdminAuth();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: Users, label: 'Users', path: '/admin/users' },
    { icon: BarChart3, label: 'Analytics', path: '/admin/analytics' },
    { icon: Shield, label: 'Security', path: '/admin/security' },
    { icon: MessageSquare, label: 'Messages', path: '/admin/messages' },
    { icon: FileText, label: 'Content', path: '/admin/content' },
  ];

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-gray-900 text-white transition-transform duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } w-64 lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-800">
          <div>
            <h1 className="text-xl font-bold">USA English</h1>
            <p className="text-xs text-gray-400">Admin Panel</p>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Info */}
        {user && (
          <div className="px-6 py-4 border-b border-gray-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-sm font-semibold">
                {user.email?.[0]?.toUpperCase() || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user.full_name || 'Admin'}
                </p>
                <p className="text-xs text-gray-400 truncate">{user.email}</p>
              </div>
            </div>
            {user.role === 'super_admin' && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-500/20 border border-red-500/30 rounded-full">
                <Shield className="w-3 h-3 text-red-400" />
                <span className="text-xs font-semibold text-red-300">SUPER ADMIN</span>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 ${isSidebarOpen ? 'lg:ml-64' : ''}`}>
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-40">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden text-gray-600 hover:text-gray-900"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-4 ml-auto">
            {user?.role === 'super_admin' && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-200 rounded-full">
                <Shield className="w-3.5 h-3.5 text-red-600" />
                <span className="text-xs font-bold text-red-700">SUPER ADMIN</span>
              </div>
            )}
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {user?.full_name || 'Admin'}
              </p>
              <p className="text-xs text-gray-500">
                {user?.email}
              </p>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
