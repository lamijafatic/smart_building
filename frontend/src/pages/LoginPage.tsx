import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('demo@smartbuilding.test');
  const [password, setPassword] = useState('demo1234');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch {
      setError('Invalid email or password.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* ── Left visual panel ── */}
      <div
        className="hidden lg:flex flex-col relative w-[58%] overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #07070f 0%, #0c0c1a 55%, #080f0b 100%)' }}
      >
        {/* Subtle grid */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.045 }} aria-hidden="true">
          <defs>
            <pattern id="login-grid" width="52" height="52" patternUnits="userSpaceOnUse">
              <path d="M 52 0 L 0 0 0 52" fill="none" stroke="white" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#login-grid)" />
        </svg>

        {/* Glow orbs */}
        <div
          className="absolute animate-pulse"
          style={{
            top: '18%', left: '18%',
            width: 420, height: 420,
            background: 'radial-gradient(circle, rgba(250,204,21,0.16) 0%, transparent 68%)',
            borderRadius: '50%',
            animationDuration: '5s',
          }}
        />
        <div
          className="absolute animate-pulse"
          style={{
            bottom: '15%', right: '8%',
            width: 280, height: 280,
            background: 'radial-gradient(circle, rgba(250,204,21,0.10) 0%, transparent 70%)',
            borderRadius: '50%',
            animationDuration: '7s',
            animationDelay: '1.5s',
          }}
        />
        <div
          className="absolute animate-pulse"
          style={{
            top: '65%', left: '5%',
            width: 190, height: 190,
            background: 'radial-gradient(circle, rgba(250,204,21,0.07) 0%, transparent 70%)',
            borderRadius: '50%',
            animationDuration: '6s',
            animationDelay: '3s',
          }}
        />

        {/* IoT network nodes SVG */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 560 700"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          <g stroke="rgba(250,204,21,0.22)" strokeWidth="1" fill="none" strokeDasharray="4 3">
            <line x1="112" y1="210" x2="252" y2="315" />
            <line x1="252" y1="315" x2="392" y2="210" />
            <line x1="252" y1="315" x2="196" y2="490" />
            <line x1="196" y1="490" x2="336" y2="525" />
            <line x1="392" y1="210" x2="448" y2="385" />
            <line x1="448" y1="385" x2="336" y2="525" />
            <line x1="56" y1="420" x2="196" y2="490" />
            <line x1="112" y1="210" x2="56" y2="420" />
            <line x1="392" y1="210" x2="476" y2="168" />
            <line x1="252" y1="315" x2="280" y2="168" />
          </g>
          <g>
            <circle cx="112" cy="210" r="5" fill="rgba(250,204,21,0.55)" />
            <circle cx="252" cy="315" r="8" fill="rgba(250,204,21,0.75)" />
            <circle cx="392" cy="210" r="5" fill="rgba(250,204,21,0.55)" />
            <circle cx="196" cy="490" r="5" fill="rgba(250,204,21,0.55)" />
            <circle cx="336" cy="525" r="5" fill="rgba(250,204,21,0.55)" />
            <circle cx="448" cy="385" r="4" fill="rgba(250,204,21,0.4)" />
            <circle cx="56"  cy="420" r="4" fill="rgba(250,204,21,0.4)" />
            <circle cx="476" cy="168" r="3" fill="rgba(250,204,21,0.3)" />
            <circle cx="280" cy="168" r="3" fill="rgba(250,204,21,0.3)" />
          </g>
          {/* Pulsing ring on hub node */}
          <circle cx="252" cy="315" r="18" stroke="rgba(250,204,21,0.18)" strokeWidth="1.5" fill="none" />
          <circle cx="252" cy="315" r="30" stroke="rgba(250,204,21,0.08)" strokeWidth="1" fill="none" />
        </svg>

        {/* Panel content */}
        <div className="relative z-10 flex flex-col justify-between h-full p-14">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-400 flex items-center justify-center shadow-lg shadow-yellow-400/20">
              <Building2 size={18} className="text-[#080810]" />
            </div>
            <span className="text-white font-black text-lg tracking-tight">ISBS</span>
          </div>

          {/* Headline */}
          <div>
            <p className="text-yellow-400/60 text-xs font-bold tracking-[0.2em] uppercase mb-5">
              Smart Building Platform
            </p>
            <h2 className="text-[3.2rem] font-black text-white leading-[1.05] mb-6">
              Intelligent<br />Spaces,<br />
              <span className="text-yellow-400">Seamless Living</span>
            </h2>
            <p className="text-white/30 text-[0.95rem] leading-relaxed max-w-[300px]">
              Monitor energy, manage devices, and control every room — all from one unified dashboard.
            </p>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-7">
            <div>
              <div className="text-white font-black text-2xl">24/7</div>
              <div className="text-white/25 text-xs mt-0.5 tracking-wide">Monitoring</div>
            </div>
            <div className="w-px h-9 bg-white/10" />
            <div>
              <div className="text-white font-black text-2xl">100+</div>
              <div className="text-white/25 text-xs mt-0.5 tracking-wide">Device types</div>
            </div>
            <div className="w-px h-9 bg-white/10" />
            <div>
              <div className="text-white font-black text-2xl">Real‑time</div>
              <div className="text-white/25 text-xs mt-0.5 tracking-wide">Analytics</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white dark:bg-[#07070f]">
        {/* Mobile logo (hidden on desktop) */}
        <div className="lg:hidden mb-10 text-center">
          <div className="w-14 h-14 rounded-2xl bg-yellow-400 flex items-center justify-center mx-auto mb-3 shadow-xl shadow-yellow-400/20">
            <Building2 size={26} className="text-[#080810]" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">ISBS</h1>
          <p className="text-slate-400 dark:text-white/30 text-sm mt-1">Intelligent Spaces, Seamless Living</p>
        </div>

        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-1">Welcome back</h2>
          <p className="text-slate-400 dark:text-white/40 text-sm mb-8">Sign in to manage your building</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-slate-400 dark:text-white/50 uppercase tracking-widest mb-2">
                Email address
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/30" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.1] pl-10 pr-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/25 focus:outline-none focus:border-yellow-400 dark:focus:border-yellow-400/50 focus:bg-white dark:focus:bg-white/[0.08] transition"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-slate-400 dark:text-white/50 uppercase tracking-widest mb-2">
                Password
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/30" />
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.1] pl-10 pr-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/25 focus:outline-none focus:border-yellow-400 dark:focus:border-yellow-400/50 focus:bg-white dark:focus:bg-white/[0.08] transition"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2.5 bg-yellow-400 text-[#080810] rounded-xl py-3 font-black text-sm hover:bg-yellow-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-yellow-400/20 hover:shadow-yellow-400/30 hover:scale-[1.01]"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-400 dark:text-white/30 mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-yellow-600 dark:text-yellow-400 font-semibold hover:underline">
              Sign up
            </Link>
          </p>

          <p className="text-center text-xs text-slate-300 dark:text-white/20 mt-10">
            &copy; {new Date().getFullYear()} ISBS &nbsp;&middot;&nbsp; Intelligent Spaces, Seamless Living
          </p>
        </div>
      </div>
    </div>
  );
}
