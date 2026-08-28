import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  count: number;
  icon: LucideIcon;
  colorScheme: 'blue' | 'amber' | 'indigo' | 'emerald' | 'rose';
  subtitle?: string;
  onClick?: () => void;
  isActive?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  count,
  icon: Icon,
  colorScheme,
  subtitle,
  onClick,
  isActive = false
}) => {
  const styles = {
    blue: {
      bg: 'from-blue-50/80 to-blue-100/30',
      border: 'border-blue-200/80 hover:border-blue-400',
      activeBorder: 'ring-2 ring-blue-500 border-blue-500 bg-blue-50/90',
      iconBg: 'bg-blue-100 text-blue-600',
      badge: 'text-blue-700 bg-blue-100/80'
    },
    amber: {
      bg: 'from-amber-50/80 to-amber-100/30',
      border: 'border-amber-200/80 hover:border-amber-400',
      activeBorder: 'ring-2 ring-amber-500 border-amber-500 bg-amber-50/90',
      iconBg: 'bg-amber-100 text-amber-600',
      badge: 'text-amber-700 bg-amber-100/80'
    },
    indigo: {
      bg: 'from-indigo-50/80 to-indigo-100/30',
      border: 'border-indigo-200/80 hover:border-indigo-400',
      activeBorder: 'ring-2 ring-indigo-500 border-indigo-500 bg-indigo-50/90',
      iconBg: 'bg-indigo-100 text-indigo-600',
      badge: 'text-indigo-700 bg-indigo-100/80'
    },
    emerald: {
      bg: 'from-emerald-50/80 to-emerald-100/30',
      border: 'border-emerald-200/80 hover:border-emerald-400',
      activeBorder: 'ring-2 ring-emerald-500 border-emerald-500 bg-emerald-50/90',
      iconBg: 'bg-emerald-100 text-emerald-600',
      badge: 'text-emerald-700 bg-emerald-100/80'
    },
    rose: {
      bg: 'from-rose-50/80 to-rose-100/30',
      border: 'border-rose-200/80 hover:border-rose-400',
      activeBorder: 'ring-2 ring-rose-500 border-rose-500 bg-rose-50/90',
      iconBg: 'bg-rose-100 text-rose-600',
      badge: 'text-rose-700 bg-rose-100/80'
    }
  }[colorScheme];

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-3xl glass-card p-5 sm:p-6 transition-all shadow-sm ${
        onClick ? 'cursor-pointer glass-card-hover' : ''
      } ${isActive ? styles.activeBorder : styles.border}`}
    >
      {/* Subtle top light reflection line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent" />
      
      <div className="flex items-center justify-between relative z-10">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
            {label}
          </p>
          <h3 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {count}
          </h3>
          {subtitle && (
            <p className="text-[11px] text-slate-500 mt-1 font-semibold">
              {subtitle}
            </p>
          )}
        </div>

        <div className={`w-13 h-13 rounded-2xl flex items-center justify-center shadow-inner border border-white/60 ${styles.iconBg}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};
