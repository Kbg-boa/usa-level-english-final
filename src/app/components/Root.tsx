import { Outlet, NavLink } from "react-router";
import { Brain, Flame, User, Target, Headphones, Book, Briefcase } from "lucide-react";

export default function Root() {
  const navItems = [
    { to: "/", icon: Brain, label: "Dashboard", end: true },
    { to: "/fluency", icon: Flame, label: "Fluency" },
    { to: "/input", icon: Headphones, label: "Input" },
    { to: "/structure", icon: Book, label: "Structure" },
    { to: "/professional", icon: Briefcase, label: "Professional" },
    { to: "/coach", icon: User, label: "Coach" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🇺🇸</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">USA Level English</h1>
                <p className="text-sm text-blue-300">7-Day Fluency Upgrade</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 px-4 py-2 rounded-full">
              <Flame className="w-5 h-5 text-white" />
              <span className="font-bold text-white">Day 1/7</span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-black/20 backdrop-blur-sm border-b border-white/5">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-1 overflow-x-auto py-2">
            {navItems.map(({ to, icon: Icon, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/50"
                      : "text-gray-300 hover:bg-white/10 hover:text-white"
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}