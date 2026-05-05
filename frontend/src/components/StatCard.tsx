import { LucideIcon } from 'lucide-react';

interface Props {
  label: string;
  value: string | number;
  unit?: string;
  hint?: string;
  icon?: LucideIcon;
  color?: 'yellow' | 'blue' | 'green' | 'purple';
}

const colorMap: Record<string, { icon: string; bg: string }> = {
  yellow: { icon: 'text-yellow-500 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-400/8' },
  blue:   { icon: 'text-blue-500 dark:text-blue-400',   bg: 'bg-blue-50 dark:bg-blue-400/8' },
  green:  { icon: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-400/8' },
  purple: { icon: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-400/8' },
};

export function StatCard({ label, value, unit, hint, icon: Icon, color = 'yellow' }: Props) {
  const c = colorMap[color];
  return (
    <div className="bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-2xl p-5 flex items-start gap-4 hover:border-slate-300 dark:hover:border-white/[0.14] transition-all duration-200 shadow-sm dark:shadow-none">
      {Icon && (
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${c.bg}`}>
          <Icon size={19} className={c.icon} />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-white/35">{label}</div>
        <div className="mt-1.5 flex items-baseline gap-1.5">
          <span className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">{value}</span>
          {unit && <span className="text-sm text-slate-400 dark:text-white/40">{unit}</span>}
        </div>
        {hint && <div className="mt-1 text-xs text-slate-400 dark:text-white/25">{hint}</div>}
      </div>
    </div>
  );
}
