import React from 'react';
import { EmergencyRequest } from '../../types';
import { PriorityBadge } from './PriorityBadge';
import { StatusBadge } from './StatusBadge';
import { Clock, MapPin, Users, Activity, Baby, Smile, ChevronRight, Wifi, MessageSquare, Database } from 'lucide-react';

interface EmergencyCardProps {
  emergency: EmergencyRequest;
  isSelected?: boolean;
  onSelect?: () => void;
  index?: number;
}

export const EmergencyCard: React.FC<EmergencyCardProps> = ({
  emergency,
  isSelected = false,
  onSelect,
  index,
}) => {
  const isResolved = emergency.status === 'Resolved';

  const commChannelPill = (
    <div className="flex items-center gap-1 font-mono text-[10px] font-bold">
      {emergency.communicationMethod === 'sms' ? (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300">
          <MessageSquare className="w-2.5 h-2.5" /> SMS FALLBACK
        </span>
      ) : emergency.communicationMethod === 'offline_sync' ? (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-300">
          <Database className="w-2.5 h-2.5" /> OFFLINE SYNC
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
          <Wifi className="w-2.5 h-2.5" /> INTERNET
        </span>
      )}
    </div>
  );

  return (
    <div
      onClick={onSelect}
      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
        isSelected
          ? 'border-blue-500 ring-2 ring-blue-500/25 bg-blue-50/20 dark:bg-blue-950/20 shadow-md'
          : isResolved
          ? 'border-slate-200 dark:border-slate-800 opacity-60 bg-slate-50/40 dark:bg-slate-800/20'
          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900 shadow-xs'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          {index !== undefined && (
            <span className="font-mono text-xs font-bold text-slate-400">
              #{index + 1}
            </span>
          )}
          <span className="text-xs font-mono font-extrabold text-slate-900 dark:text-white">
            {emergency.id}
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {emergency.emergencyType}
          </span>
        </div>

        <PriorityBadge score={emergency.priorityScore} breakdown={emergency.priorityBreakdown} size="sm" />
      </div>

      <div className="flex items-center justify-between mb-1.5">
        <h4 className="text-sm font-bold text-slate-800 dark:text-white leading-tight">
          {emergency.userName}
        </h4>
        {commChannelPill}
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-2">
        <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
        <span className="truncate">{emergency.address}</span>
      </p>

      {emergency.description && (
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3 leading-relaxed">
          {emergency.description}
        </p>
      )}

      {/* Casualty Demographics Grid */}
      <div className="grid grid-cols-4 gap-1.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-center font-mono text-[11px] mb-3">
        <div>
          <span className="text-slate-400 text-[9px] block">PEOPLE</span>
          <strong className="text-slate-800 dark:text-slate-200">{emergency.peopleCount}</strong>
        </div>
        <div>
          <span className="text-rose-500 text-[9px] block">INJURED</span>
          <strong className="text-rose-600 dark:text-rose-400">{emergency.injuredCount}</strong>
        </div>
        <div>
          <span className="text-amber-500 text-[9px] block">CHILD</span>
          <strong className="text-amber-600 dark:text-amber-400">{emergency.childrenCount}</strong>
        </div>
        <div>
          <span className="text-indigo-500 text-[9px] block">ELDERLY</span>
          <strong className="text-indigo-600 dark:text-indigo-400">{emergency.elderlyCount}</strong>
        </div>
      </div>

      {/* Footer: Status & Reported Time */}
      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
        <StatusBadge status={emergency.status} size="sm" />
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
            <Clock className="w-3 h-3" />
            {new Date(emergency.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          {onSelect && <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
        </div>
      </div>
    </div>
  );
};
