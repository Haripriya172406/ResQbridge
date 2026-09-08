import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatisticsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'rose' | 'amber' | 'blue' | 'emerald' | 'purple' | 'slate';
  badgeText?: string;
  trend?: string;
}

export const StatisticsCard: React.FC<StatisticsCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'blue',
  badgeText,
  trend,
}) => {
  const colorMap = {
    rose: {
      bg: 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40',
      text: 'text-rose-700 dark:text-rose-300',
      iconBg: 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
    },
    amber: {
      bg: 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40',
      text: 'text-amber-700 dark:text-amber-300',
      iconBg: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    },
    blue: {
      bg: 'bg-blue-50/70 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/40',
      text: 'text-blue-700 dark:text-blue-300',
      iconBg: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
    },
    emerald: {
      bg: 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40',
      text: 'text-emerald-700 dark:text-emerald-300',
      iconBg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
    },
    purple: {
      bg: 'bg-purple-50/70 dark:bg-purple-950/20 border-purple-200 dark:border-purple-900/40',
      text: 'text-purple-700 dark:text-purple-300',
      iconBg: 'bg-purple-500/15 text-purple-600 dark:text-purple-400',
    },
    slate: {
      bg: 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800',
      text: 'text-slate-800 dark:text-white',
      iconBg: 'bg-slate-200/60 dark:bg-slate-700 text-slate-700 dark:text-slate-300',
    },
  }[color];

  return (
    <div className={`p-4 rounded-2xl border transition-all shadow-xs flex flex-col justify-between ${colorMap.bg}`}>
      <div className="flex items-start justify-between gap-2">
        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          {title}
        </span>
        <div className={`p-2 rounded-xl ${colorMap.iconBg}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-2">
        <div className="flex items-baseline gap-2">
          <span className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${colorMap.text}`}>
            {value}
          </span>
          {badgeText && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              {badgeText}
            </span>
          )}
        </div>

        {(subtitle || trend) && (
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {subtitle && <span>{subtitle}</span>}
            {trend && <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">{trend}</span>}
          </div>
        )}
      </div>
    </div>
  );
};
