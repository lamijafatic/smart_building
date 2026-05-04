import { LucideIcon } from 'lucide-react';

interface Props {
  label: string;
  value: string | number;
  unit?: string;
  hint?: string;
  icon?: LucideIcon;
  color?: 'orange' | 'blue' | 'green' | 'purple';
}

const colorMap = {
  orange: 'bg-brand-50 text-brand-600',
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-emerald-50 text-emerald-600',
  purple: 'bg-purple-50 text-purple-600',
};

export function StatCard({ label, value, unit, hint, icon: Icon, color = 'orange' }: Props) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex items-start gap-4">
      {Icon && (
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${colorMap[color]}`}>
          <Icon size={20} />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div>
        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-2xl font-bold text-slate-900">{value}</span>
          {unit && <span className="text-sm text-slate-500">{unit}</span>}
        </div>
        {hint && <div className="mt-0.5 text-xs text-slate-400">{hint}</div>}
      </div>
    </div>
  );
}
