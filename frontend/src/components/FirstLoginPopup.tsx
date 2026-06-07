import { useState, useEffect } from 'react';
import { Wifi, CheckCircle2, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Props {
  deviceCount: number;
  onClose: () => void;
}

export function FirstLoginPopup({ deviceCount, onClose }: Props) {
  const { markConnected } = useAuth();
  const [phase, setPhase] = useState<'idle' | 'connecting' | 'done'>('idle');
  const [connected, setConnected] = useState(0);

  useEffect(() => {
    if (phase !== 'connecting') return;
    if (connected >= deviceCount) {
      setPhase('done');
      return;
    }
    const delay = 400 + Math.random() * 300;
    const t = setTimeout(() => setConnected((n) => n + 1), delay);
    return () => clearTimeout(t);
  }, [phase, connected, deviceCount]);

  async function handleConnect() {
    setPhase('connecting');
  }

  async function handleClose() {
    await markConnected();
    onClose();
  }

  const progress = deviceCount > 0 ? Math.round((connected / deviceCount) * 100) : 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white dark:bg-[#0d0d1c] rounded-2xl shadow-2xl border border-slate-200 dark:border-white/[0.08] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-white/[0.06]">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-yellow-400/10 flex items-center justify-center">
              <Wifi size={20} className="text-yellow-400" />
            </div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">Device Setup</h2>
          </div>
          <p className="text-slate-500 dark:text-white/40 text-sm">
            Welcome! Your apartment has been configured with{' '}
            <span className="font-bold text-yellow-500">{deviceCount} device{deviceCount !== 1 ? 's' : ''}</span>.
          </p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {phase === 'idle' && (
            <div className="space-y-4">
              <div className="rounded-xl bg-yellow-50 dark:bg-yellow-400/5 border border-yellow-200 dark:border-yellow-400/20 p-4 text-sm text-yellow-800 dark:text-yellow-300">
                <strong>Before you start:</strong> Make sure all your devices are turned on and in <strong>pairing mode</strong>.
                Once ready, press <strong>Connect</strong> to begin the pairing process.
              </div>
              <p className="text-slate-400 dark:text-white/30 text-xs leading-relaxed">
                This process will connect all {deviceCount} pre-configured devices to your account. It only needs to be done once.
              </p>
            </div>
          )}

          {phase === 'connecting' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-white/60">
                  {connected < deviceCount
                    ? `Connecting device ${connected + 1} of ${deviceCount}…`
                    : 'All devices connected!'}
                </span>
                <span className="font-bold text-yellow-500">{connected}/{deviceCount}</span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-white/[0.06] rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {Array.from({ length: connected }).map((_, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-slate-500 dark:text-white/40">
                    <CheckCircle2 size={12} className="text-green-500 shrink-0" />
                    <span>Device {i + 1} connected</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {phase === 'done' && (
            <div className="text-center space-y-3 py-2">
              <div className="w-16 h-16 rounded-2xl bg-green-100 dark:bg-green-500/10 flex items-center justify-center mx-auto">
                <CheckCircle2 size={32} className="text-green-500" />
              </div>
              <div>
                <p className="font-black text-slate-900 dark:text-white text-lg">All set up!</p>
                <p className="text-slate-400 dark:text-white/40 text-sm mt-1">
                  All {deviceCount} devices are now connected and ready to use.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          {phase === 'idle' && (
            <button
              onClick={handleConnect}
              className="flex-1 bg-yellow-400 text-[#080810] font-black text-sm rounded-xl py-3 hover:bg-yellow-300 transition-all shadow-lg shadow-yellow-400/20"
            >
              Connect all devices
            </button>
          )}
          {phase === 'connecting' && (
            <button disabled className="flex-1 bg-yellow-400/40 text-[#080810]/50 font-black text-sm rounded-xl py-3 cursor-not-allowed">
              Connecting…
            </button>
          )}
          {phase === 'done' && (
            <button
              onClick={handleClose}
              className="flex-1 bg-yellow-400 text-[#080810] font-black text-sm rounded-xl py-3 hover:bg-yellow-300 transition-all shadow-lg shadow-yellow-400/20 flex items-center justify-center gap-2"
            >
              <X size={15} />
              Close &amp; start using the app
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
