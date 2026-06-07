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
  Sun,
  Moon,
  HelpCircle,
  Send,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

function ContactModal({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSent(true);
    }, 800);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#0a0a14] border border-slate-200 dark:border-white/[0.1] rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <HelpCircle size={18} className="text-yellow-500 dark:text-yellow-400" />
            <h2 className="text-base font-black text-slate-900 dark:text-white">Contact Support</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 dark:text-white/30 hover:text-slate-700 dark:hover:text-white transition">
            <X size={18} />
          </button>
        </div>

        {sent ? (
          <div className="text-center py-8 space-y-3">
            <CheckCircle2 size={40} className="mx-auto text-emerald-500" />
            <p className="text-base font-bold text-slate-900 dark:text-white">Message sent!</p>
            <p className="text-sm text-slate-400 dark:text-white/40">Our support team will get back to you shortly.</p>
            <button
              onClick={onClose}
              className="mt-2 px-6 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-bold rounded-xl text-sm transition"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-white/40 mb-1.5">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-xl bg-slate-50 dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.1] text-slate-900 dark:text-white px-3.5 py-2.5 text-sm focus:outline-none focus:border-yellow-400 dark:focus:border-yellow-400/60 transition"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-white/40 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl bg-slate-50 dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.1] text-slate-900 dark:text-white px-3.5 py-2.5 text-sm focus:outline-none focus:border-yellow-400 dark:focus:border-yellow-400/60 transition"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-white/40 mb-1.5">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={4}
                className="w-full rounded-xl bg-slate-50 dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.1] text-slate-900 dark:text-white px-3.5 py-2.5 text-sm focus:outline-none focus:border-yellow-400 dark:focus:border-yellow-400/60 transition resize-none"
                placeholder="Describe your issue or question…"
              />
            </div>
            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                disabled={sending || !message.trim()}
                className="flex items-center gap-2 px-5 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-bold rounded-xl text-sm transition disabled:opacity-60"
              >
                <Send size={14} />
                {sending ? 'Sending…' : 'Send message'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 dark:border-white/[0.1] text-slate-600 dark:text-white/60 hover:bg-slate-100 dark:hover:bg-white/[0.04] transition"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/devices', label: 'Devices', icon: Zap },
  { to: '/rooms', label: 'Rooms', icon: DoorOpen },
  { to: '/building', label: 'Building', icon: Building2 },
];

export function Layout() {
  const { user, logout } = useAuth();
  const { isDark, toggle } = useTheme();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showContact, setShowContact] = useState(false);

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const SidebarContent = () => (
    <>
      <div className="px-5 py-5 border-b border-slate-200 dark:border-white/[0.06] flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-yellow-400 flex items-center justify-center shrink-0 shadow-lg shadow-yellow-400/20">
          <Building2 size={19} className="text-[#080810]" />
        </div>
        <div>
          <p className="text-sm font-black leading-tight text-slate-900 dark:text-white tracking-tight">ISBS</p>
          <p className="text-xs text-slate-400 dark:text-white/35 leading-tight">Smart Building</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-yellow-50 text-yellow-700 border border-yellow-200 dark:bg-yellow-400/10 dark:text-yellow-400 dark:border-yellow-400/20'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 border border-transparent dark:text-white/45 dark:hover:bg-white/[0.05] dark:hover:text-white'
              }`
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-slate-200 dark:border-white/[0.06] space-y-2">
        <button
          onClick={toggle}
          className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-white/40 dark:hover:bg-white/[0.05] dark:hover:text-white transition"
          aria-label="Toggle theme"
        >
          {isDark ? <Sun size={15} /> : <Moon size={15} />}
          {isDark ? 'Light mode' : 'Dark mode'}
        </button>

        <button
          onClick={() => setShowContact(true)}
          className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-white/40 dark:hover:bg-white/[0.05] dark:hover:text-white transition"
        >
          <HelpCircle size={15} />
          Contact Support
        </button>

        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-white/[0.04]">
          <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-xs font-black text-[#080810] shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user?.name}</p>
            <p className="text-xs text-slate-400 dark:text-white/35 truncate capitalize">{user?.role?.toLowerCase()}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-white/40 dark:hover:bg-white/[0.05] dark:hover:text-white transition"
        >
          <LogOut size={15} />
          Sign out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080810] flex">
      <aside className="hidden lg:flex flex-col w-60 bg-white dark:bg-[#0a0a14] border-r border-slate-200 dark:border-white/[0.06] shrink-0 fixed inset-y-0 left-0 z-30">
        <SidebarContent />
      </aside>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="relative flex flex-col w-64 bg-white dark:bg-[#0a0a14] border-r border-slate-200 dark:border-white/[0.06] z-50">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 text-slate-400 dark:text-white/40 hover:text-slate-900 dark:hover:text-white"
            >
              <X size={20} />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col lg:ml-60">
        <header className="lg:hidden bg-white dark:bg-[#0a0a14] border-b border-slate-200 dark:border-white/[0.06] px-4 py-3 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="text-slate-400 dark:text-white/50 hover:text-slate-900 dark:hover:text-white transition"
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-yellow-400 flex items-center justify-center">
                <Building2 size={14} className="text-[#080810]" />
              </div>
              <span className="font-black text-slate-900 dark:text-white text-sm">ISBS</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggle}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 dark:text-white/40 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition"
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-xs font-black text-[#080810]">
              {initials}
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {showContact && <ContactModal onClose={() => setShowContact(false)} />}
    </div>
  );
}
