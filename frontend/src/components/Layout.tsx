import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Zap,
  DoorOpen,
  LogOut,
  Building2,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/devices', label: 'Devices', icon: Zap },
  { to: '/rooms', label: 'Rooms', icon: DoorOpen },
];

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="hidden lg:flex flex-col w-60 bg-slate-900 text-white shrink-0 fixed inset-y-0 left-0 z-30">
        <div className="px-5 py-5 border-b border-slate-700 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-brand-500 flex items-center justify-center shrink-0">
            <Building2 size={20} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold leading-tight text-white">Smart Building</p>
            <p className="text-xs text-slate-400 leading-tight">Management System</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-brand-600 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-slate-700">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-800 mb-2">
            <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 truncate">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative flex flex-col w-64 bg-slate-900 text-white z-50">
            <div className="px-5 py-5 border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
                  <Building2 size={18} className="text-white" />
                </div>
                <p className="text-sm font-bold text-white">Smart Building</p>
              </div>
              <button onClick={() => setMobileOpen(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1">
              {navItems.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-brand-600 text-white'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`
                  }
                >
                  <Icon size={18} />
                  {label}
                </NavLink>
              ))}
            </nav>
            <div className="px-3 py-4 border-t border-slate-700">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition"
              >
                <LogOut size={16} />
                Sign out
              </button>
            </div>
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col lg:ml-60">
        <header className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="text-slate-600 hover:text-slate-900"
            >
              <Menu size={22} />
            </button>
            <span className="font-semibold text-slate-900">Smart Building</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-xs font-bold text-white">
            {initials}
          </div>
        </header>

        <div className="hidden lg:flex items-center bg-white border-b border-slate-200 px-8 py-3">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Building2 size={14} />
            <ChevronRight size={14} />
            <span className="text-slate-900 font-medium">{user?.name}</span>
          </div>
        </div>

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
