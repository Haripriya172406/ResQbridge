import React, { useState } from 'react';
import { PriorityBreakdown, PriorityCategory } from '../../types';
import { PRIORITY_MODEL_DISCLAIMER } from '../../services/priorityCalculator';
import { AlertTriangle, Info } from 'lucide-react';

interface PriorityBadgeProps {
  score: number;
  breakdown?: PriorityBreakdown;
  size?: 'sm' | 'md' | 'lg';
  showDetailsButton?: boolean;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ 
  score, 
  breakdown, 
  size = 'md',
  showDetailsButton = true 
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  let category: PriorityCategory = 'LOW';
  let badgeStyle = 'bg-sky-50 text-sky-700 border-sky-300 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800';
  let dotStyle = 'bg-sky-500';

  if (score >= 80) {
    category = 'CRITICAL';
    badgeStyle = 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800';
    dotStyle = 'bg-rose-500 animate-ping';
  } else if (score >= 60) {
    category = 'HIGH';
    badgeStyle = 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800';
    dotStyle = 'bg-amber-500';
  } else if (score >= 40) {
    category = 'MEDIUM';
    badgeStyle = 'bg-amber-50/70 text-amber-600 border-amber-200 dark:bg-yellow-950/30 dark:text-yellow-300 dark:border-yellow-800';
    dotStyle = 'bg-yellow-500';
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-semibold',
    lg: 'text-sm px-3.5 py-1.5 font-bold'
  }[size];

  return (
    <div className="relative inline-flex items-center gap-1.5">
      <span 
        className={`inline-flex items-center gap-1.5 rounded-full border shadow-xs ${badgeStyle} ${sizeClasses}`}
        title={`Priority Score: ${score}/100`}
      >
        <span className="relative flex h-2 w-2">
          {score >= 80 && (
            <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${dotStyle}`} />
          )}
          <span className={`relative inline-flex rounded-full h-2 w-2 ${dotStyle.replace('animate-ping', '')}`} />
        </span>
        <span>{category}</span>
        <span className="opacity-75 font-mono text-[11px]">({score})</span>
      </span>

      {showDetailsButton && breakdown && (
        <button
          type="button"
          onClick={() => setShowTooltip(!showTooltip)}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded transition-colors"
          title="Explain Priority Calculation"
        >
          <Info className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Breakdown Tooltip / Flyout */}
      {showTooltip && breakdown && (
        <div 
          className="absolute z-50 left-0 top-full mt-2 w-72 p-3.5 bg-slate-900 text-white rounded-xl shadow-xl border border-slate-800 text-xs animate-in fade-in zoom-in-95 duration-150"
          onMouseLeave={() => setShowTooltip(false)}
        >
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
            <span className="font-semibold flex items-center gap-1.5 text-slate-100">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              Priority Score Formula
            </span>
            <span className="font-mono font-bold text-amber-300">{score}/100</span>
          </div>

          <div className="space-y-1 text-slate-300 font-mono text-[11px]">
            <div className="flex justify-between">
              <span>Base Severity:</span>
              <span className="text-white font-semibold">+{breakdown.baseSeverityScore} pts</span>
            </div>
            <div className="flex justify-between">
              <span>Casualty Headcount:</span>
              <span className="text-white font-semibold">+{breakdown.peopleScore} pts</span>
            </div>
            {breakdown.injuredScore > 0 && (
              <div className="flex justify-between text-rose-300">
                <span>Injured People (+10/ea):</span>
                <span className="font-semibold">+{breakdown.injuredScore} pts</span>
              </div>
            )}
            {breakdown.childrenScore > 0 && (
              <div className="flex justify-between">
                <span>Children (+5/ea):</span>
                <span className="text-white font-semibold">+{breakdown.childrenScore} pts</span>
              </div>
            )}
            {breakdown.elderlyScore > 0 && (
              <div className="flex justify-between">
                <span>Elderly (+5/ea):</span>
                <span className="text-white font-semibold">+{breakdown.elderlyScore} pts</span>
              </div>
            )}
            {breakdown.vulnerableScore > 0 && (
              <div className="flex justify-between">
                <span>Vulnerable/Disability (+7/ea):</span>
                <span className="text-white font-semibold">+{breakdown.vulnerableScore} pts</span>
              </div>
            )}
            {breakdown.waitingTimeScore > 0 && (
              <div className="flex justify-between text-amber-300">
                <span>Wait Escalation (+1/3min):</span>
                <span className="font-semibold">+{breakdown.waitingTimeScore} pts</span>
              </div>
            )}
          </div>

          <div className="mt-2 pt-2 border-t border-slate-800 text-[10px] text-slate-400 italic leading-tight">
            {PRIORITY_MODEL_DISCLAIMER}
          </div>
        </div>
      )}
    </div>
  );
};
