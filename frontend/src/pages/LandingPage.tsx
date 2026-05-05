import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Zap,
  Shield,
  BarChart3,
  Smartphone,
  Menu,
  X,
  Activity,
  CheckCircle2,
  ArrowRight,
  Lightbulb,
  Cpu,
  ChevronDown,
  Wifi,
} from 'lucide-react';

const slides = [
  {
    headline: 'Intelligent Spaces,',
    accent: 'Seamless Living',
    description:
      'The all-in-one smart building platform for modern residents. Monitor, control, and optimize every corner of your home — in real time.',
  },
  {
    headline: 'Real-Time Energy',
    accent: 'at Your Fingertips',
    description:
      'Track every watt, every hour. Beautiful interactive charts give you instant insight into your apartment\'s energy footprint.',
  },
  {
    headline: 'Control Everything,',
    accent: 'From Anywhere',
    description:
      'Lights, AC, appliances — manage every device in every room with a single tap, wherever you are in the world.',
  },
];

const features = [
  {
    icon: Zap,
    title: 'Live Energy Monitoring',
    desc: 'Real-time kWh tracking updates every 15 seconds with today, weekly, and monthly breakdowns.',
    color: 'text-yellow-400',
    border: 'border-yellow-400/20 hover:border-yellow-400/50',
    glow: 'bg-yellow-400/5',
  },
  {
    icon: Smartphone,
    title: 'Remote Device Control',
    desc: 'Toggle any light, AC, or appliance instantly from anywhere — one tap, instant response.',
    color: 'text-blue-400',
    border: 'border-blue-400/20 hover:border-blue-400/50',
    glow: 'bg-blue-400/5',
  },
  {
    icon: BarChart3,
    title: 'Analytics & Insights',
    desc: 'Daily and weekly consumption charts with per-room and per-device breakdowns.',
    color: 'text-emerald-400',
    border: 'border-emerald-400/20 hover:border-emerald-400/50',
    glow: 'bg-emerald-400/5',
  },
  {
    icon: Shield,
    title: 'Secure Access',
    desc: 'JWT-authenticated sessions ensure only authorized residents can access their apartment.',
    color: 'text-purple-400',
    border: 'border-purple-400/20 hover:border-purple-400/50',
    glow: 'bg-purple-400/5',
  },
  {
    icon: Cpu,
    title: 'Continuous Tracking',
    desc: 'Gap-filling algorithm ensures zero energy data loss — even across server restarts.',
    color: 'text-orange-400',
    border: 'border-orange-400/20 hover:border-orange-400/50',
    glow: 'bg-orange-400/5',
  },
  {
    icon: Activity,
    title: 'Multi-Room Management',
    desc: 'Organize devices by room — living room, kitchen, bedroom — and get per-room analytics.',
    color: 'text-pink-400',
    border: 'border-pink-400/20 hover:border-pink-400/50',
    glow: 'bg-pink-400/5',
  },
];

const stats = [
  { value: '15s', label: 'Update interval' },
  { value: '6+', label: 'Room types' },
  { value: '8+', label: 'Device types' },
  { value: '24/7', label: 'Energy tracking' },
];

const release1Features = [
  'User authentication with secure JWT sessions',
  'Multi-apartment resident management',
  'Room-based device organization',
  'Real-time device toggle (ON / OFF)',
  'IoT energy simulation engine (15 s ticks)',
  'Offline gap-filling — zero data loss',
  'Interactive energy analytics dashboard',
  'Per-device 7-day consumption history',
  'Live power draw monitoring',
  'Daily & weekly trend charts',
];

export function LandingPage() {
  const [slide, setSlide] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setSlide((s) => (s + 1) % slides.length), 4500);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#080810] text-white overflow-x-hidden font-sans">

      {/* ── Navbar ── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-[#080810]/90 backdrop-blur-xl border-b border-white/[0.06] shadow-2xl'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-yellow-400 flex items-center justify-center shadow-lg shadow-yellow-400/30">
              <Building2 size={19} className="text-[#080810]" />
            </div>
            <span className="text-xl font-black tracking-tight">ISBS</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/60">
            {['features', 'about', 'releases'].map((id) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className="capitalize hover:text-white transition-colors duration-200"
              >
                {id}
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-medium text-white/70 hover:text-white transition px-4 py-2"
            >
              Log in
            </Link>
            <Link
              to="/login"
              className="text-sm font-bold bg-yellow-400 text-[#080810] px-5 py-2 rounded-full hover:bg-yellow-300 transition shadow-lg shadow-yellow-400/20"
            >
              Get Started
            </Link>
          </div>

          <button
            className="md:hidden text-white/70 hover:text-white transition"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden bg-[#0d0d1a] border-t border-white/[0.06] px-6 py-5 space-y-1">
            {['features', 'about', 'releases'].map((id) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className="capitalize block w-full text-left text-sm text-white/60 hover:text-white py-3 border-b border-white/[0.04] transition"
              >
                {id}
              </button>
            ))}
            <div className="pt-4 flex gap-3">
              <Link
                to="/login"
                className="flex-1 text-center text-sm font-medium border border-white/15 rounded-full py-2.5 hover:bg-white/5 transition"
              >
                Log in
              </Link>
              <Link
                to="/login"
                className="flex-1 text-center text-sm font-bold bg-yellow-400 text-[#080810] rounded-full py-2.5 hover:bg-yellow-300 transition"
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-16 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-yellow-400/[0.04] rounded-full blur-[150px]" />
          <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-yellow-500/[0.06] rounded-full blur-[120px]" />
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-blue-600/[0.04] rounded-full blur-[100px]" />
          <div
            className="absolute inset-0 opacity-[0.015]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-yellow-400/[0.08] border border-yellow-400/20 rounded-full px-4 py-1.5 text-yellow-400 text-xs font-bold tracking-widest uppercase mb-10">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
            Release 1 — Now Live
          </div>

          <div className="relative" style={{ minHeight: '220px' }}>
            {slides.map((s, i) => (
              <div
                key={i}
                className={`absolute inset-x-0 top-0 transition-all duration-700 ease-in-out ${
                  i === slide
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-6 pointer-events-none'
                }`}
              >
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08]">
                  {s.headline}
                  <br />
                  <span className="text-yellow-400">{s.accent}</span>
                </h1>
                <p className="text-lg sm:text-xl text-white/50 leading-relaxed max-w-2xl mx-auto mt-7">
                  {s.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-[200px] flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/login"
              className="inline-flex items-center gap-2.5 bg-yellow-400 text-[#080810] font-black px-9 py-4 rounded-full hover:bg-yellow-300 transition-all duration-200 text-sm shadow-xl shadow-yellow-400/25 hover:shadow-yellow-400/40 hover:scale-105"
            >
              Get Started Free
              <ArrowRight size={16} />
            </Link>
            <button
              onClick={() => scrollTo('features')}
              className="inline-flex items-center gap-2.5 border border-white/15 text-white/70 font-semibold px-9 py-4 rounded-full hover:bg-white/[0.04] hover:text-white hover:border-white/30 transition-all duration-200 text-sm"
            >
              Discover Features
              <ChevronDown size={16} />
            </button>
          </div>

          <div className="mt-10 flex items-center justify-center gap-2.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlide(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === slide
                    ? 'w-7 h-1.5 bg-yellow-400'
                    : 'w-1.5 h-1.5 bg-white/20 hover:bg-white/40'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-white/20 text-xs animate-bounce">
          <ChevronDown size={18} />
        </div>
      </section>

      {/* ── Stats strip ── */}
      <section className="py-16 border-y border-white/[0.05] bg-white/[0.015]">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="text-4xl font-black text-yellow-400 tabular-nums">{s.value}</p>
              <p className="text-sm text-white/40 mt-1.5 font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-yellow-400 text-xs font-bold uppercase tracking-widest mb-3">
              What we offer
            </p>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight">
              Everything your building needs
            </h2>
            <p className="text-white/40 text-lg mt-5 max-w-lg mx-auto leading-relaxed">
              One platform to monitor, control, and optimize every device in your home.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <div
                key={f.title}
                className={`relative rounded-2xl border p-7 transition-all duration-300 group cursor-default ${f.border} ${f.glow}`}
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-5 bg-white/5`}>
                  <f.icon size={20} className={f.color} />
                </div>
                <h3 className="text-base font-bold mb-2.5 text-white/90">{f.title}</h3>
                <p className="text-sm text-white/45 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── About ── */}
      <section id="about" className="py-32 px-6 bg-white/[0.015] border-y border-white/[0.05]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <p className="text-yellow-400 text-xs font-bold uppercase tracking-widest mb-4">
                About ISBS
              </p>
              <h2 className="text-4xl sm:text-5xl font-black leading-tight mb-8">
                Built for the buildings of tomorrow
              </h2>
              <p className="text-white/55 text-lg leading-relaxed mb-6">
                ISBS (Intelligent Smart Building System) is a resident-facing platform that puts
                the power of building management directly in your hands. Control your devices,
                track your energy, understand your consumption — all from one beautiful dashboard.
              </p>
              <p className="text-white/40 text-base leading-relaxed">
                Developed at the International Burch University as part of the IT 309 Software
                Engineering course, ISBS demonstrates how modern web technologies can power
                genuinely useful, production-grade smart home applications.
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-sm text-white/50">
                  <Wifi size={14} className="text-yellow-400" />
                  Real-time IoT simulation
                </div>
                <div className="flex items-center gap-2 text-sm text-white/50">
                  <Shield size={14} className="text-yellow-400" />
                  Secure by design
                </div>
                <div className="flex items-center gap-2 text-sm text-white/50">
                  <Cpu size={14} className="text-yellow-400" />
                  Always-on tracking
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  icon: Lightbulb,
                  label: 'Smart Devices',
                  value: 'Full control over lights, AC, appliances',
                },
                {
                  icon: BarChart3,
                  label: 'Energy Insights',
                  value: 'Track usage by day, week, or month',
                },
                {
                  icon: Shield,
                  label: 'Secure by Design',
                  value: 'JWT auth, per-user apartment isolation',
                },
                {
                  icon: Cpu,
                  label: 'Zero Data Loss',
                  value: 'Continuous simulation with gap-filling',
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5 hover:border-yellow-400/25 hover:bg-yellow-400/[0.03] transition-all duration-300"
                >
                  <item.icon size={22} className="text-yellow-400 mb-4" />
                  <p className="text-sm font-bold mb-1.5 text-white/85">{item.label}</p>
                  <p className="text-xs text-white/35 leading-relaxed">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Release History ── */}
      <section id="releases" className="py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-yellow-400 text-xs font-bold uppercase tracking-widest mb-3">
              Release History
            </p>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight">
              Built, tested, shipped
            </h2>
            <p className="text-white/40 text-lg mt-5 max-w-md mx-auto">
              Transparent development, milestone by milestone.
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-5 top-3 bottom-3 w-px bg-gradient-to-b from-yellow-400/60 via-yellow-400/20 to-transparent" />

            <div className="space-y-8 pl-14">
              <div className="relative">
                <div className="absolute -left-[3.4rem] w-7 h-7 rounded-full bg-yellow-400 flex items-center justify-center shadow-lg shadow-yellow-400/40">
                  <span className="text-[#080810] text-xs font-black">1</span>
                </div>

                <div className="bg-white/[0.03] border border-yellow-400/15 rounded-2xl p-8 hover:border-yellow-400/30 transition-all duration-300">
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                    <div>
                      <div className="inline-flex items-center gap-2 bg-yellow-400/10 text-yellow-400 text-xs font-bold rounded-full px-3 py-1 mb-3 border border-yellow-400/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                        Current Release
                      </div>
                      <h3 className="text-2xl font-black text-white">
                        Release 1 — Core System
                      </h3>
                      <p className="text-white/35 text-sm mt-1.5">
                        May 2026 &nbsp;·&nbsp; Milestone 2 &nbsp;·&nbsp; IBU IT 309
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {release1Features.map((feat) => (
                      <div key={feat} className="flex items-start gap-2.5">
                        <CheckCircle2
                          size={15}
                          className="text-yellow-400 mt-0.5 shrink-0"
                        />
                        <span className="text-sm text-white/60 leading-relaxed">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="relative opacity-40">
                <div className="absolute -left-[3.4rem] w-7 h-7 rounded-full bg-white/8 border border-white/15 flex items-center justify-center">
                  <span className="text-white/30 text-xs font-black">2</span>
                </div>
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-8">
                  <h3 className="text-xl font-bold text-white/35 mb-2">
                    Release 2 — Automation & Scheduling
                  </h3>
                  <p className="text-white/25 text-sm">
                    Automation rules, device scheduling, push notifications &amp; more. Coming soon.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-32 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="relative rounded-3xl border border-yellow-400/15 overflow-hidden p-14">
            <div className="absolute inset-0 bg-gradient-to-b from-yellow-400/[0.06] to-transparent pointer-events-none" />
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow-400/[0.06] rounded-full blur-[80px]" />
            </div>

            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-yellow-400 flex items-center justify-center mx-auto mb-8 shadow-xl shadow-yellow-400/30">
                <Building2 size={30} className="text-[#080810]" />
              </div>
              <h2 className="text-4xl sm:text-5xl font-black mb-5">Ready to go smarter?</h2>
              <p className="text-white/50 text-lg mb-10 max-w-md mx-auto leading-relaxed">
                Join ISBS and take complete control of your building — starting today.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2.5 bg-yellow-400 text-[#080810] font-black px-10 py-4 rounded-full hover:bg-yellow-300 transition-all duration-200 text-base shadow-xl shadow-yellow-400/25 hover:scale-105"
              >
                Get Started Free
                <ArrowRight size={17} />
              </Link>
              <p className="text-white/20 text-xs mt-6">
                Demo credentials pre-filled — just click Sign In
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/[0.05] py-14 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap items-start justify-between gap-10 mb-12">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-yellow-400 flex items-center justify-center">
                  <Building2 size={16} className="text-[#080810]" />
                </div>
                <span className="font-black text-white">ISBS</span>
              </div>
              <p className="text-white/30 text-sm max-w-xs leading-relaxed">
                Intelligent Smart Building System. <br />
                Intelligent Spaces, Seamless Living.
              </p>
            </div>

            <div className="flex gap-16 text-sm">
              <div className="space-y-3">
                <p className="text-white/20 text-xs font-bold uppercase tracking-widest mb-4">
                  Platform
                </p>
                {['features', 'about', 'releases'].map((id) => (
                  <button
                    key={id}
                    onClick={() => scrollTo(id)}
                    className="block capitalize text-white/40 hover:text-white/70 transition"
                  >
                    {id}
                  </button>
                ))}
              </div>
              <div className="space-y-3">
                <p className="text-white/20 text-xs font-bold uppercase tracking-widest mb-4">
                  Account
                </p>
                <Link to="/login" className="block text-white/40 hover:text-white/70 transition">
                  Log in
                </Link>
                <Link to="/login" className="block text-white/40 hover:text-white/70 transition">
                  Sign up
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t border-white/[0.05] pt-8 flex flex-wrap items-center justify-between gap-4">
            <p className="text-white/20 text-xs">
              © {new Date().getFullYear()} ISBS &nbsp;·&nbsp; IBU IT 309 Software Engineering
            </p>
            <p className="text-white/15 text-xs">
              Intelligent Spaces, Seamless Living
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
