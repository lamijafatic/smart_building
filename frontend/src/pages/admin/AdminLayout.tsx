import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Building2, Users, BarChart2, Shield, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface NavItem {
  label: string;
  to: string;
  Icon: React.ElementType;
  end?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Buildings', to: '/admin', Icon: Building2, end: true },
  { label: 'Users', to: '/admin/users', Icon: Users },
  { label: 'Stats', to: '/admin/stats', Icon: BarChart2 },
];

export function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 dark:bg-[#07070f]">
      {/* Sidebar */}
      <aside
        className="flex flex-col w-60 shrink-0 h-full overflow-y-auto"
        style={{ background: '#07070f', borderRight: '1px solid rgba(255,255,255,0.06)' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-6">
          <div className="w-8 h-8 rounded-lg bg-yellow-400/10 flex items-center justify-center shrink-0">
            <Shield size={16} className="text-yellow-400" />
          </div>
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-yellow-400 leading-none">
              ISBS Admin
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-0.5 pb-4">
          {NAV_ITEMS.map(({ label, to, Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-yellow-400/10 text-yellow-400'
                    : 'text-white/40 hover:text-white/80 hover:bg-white/[0.04]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={16} className={isActive ? 'text-yellow-400' : 'text-white/30'} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User + logout */}
        <div className="px-3 pb-5 pt-2 border-t border-white/[0.06]">
          {user && (
            <div className="px-3 py-2 mb-2">
              <p className="text-xs font-semibold text-white/70 truncate">{user.name}</p>
              <p className="text-[10px] text-white/25 truncate">{user.email}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-[#0b0b18]">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
