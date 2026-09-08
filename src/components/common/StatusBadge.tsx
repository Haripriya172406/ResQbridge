import React from 'react';
import { EmergencyStatus } from '../../types';
import { 
  Inbox, 
  UserCheck, 
  Navigation, 
  MapPin, 
  Building2, 
  CheckCircle2 
} from 'lucide-react';

interface StatusBadgeProps {
  status: EmergencyStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  let colorStyle = 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
  let Icon = Inbox;
  let pulse = false;

  switch (status) {
    case 'Request Received':
      colorStyle = 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800';
      Icon = Inbox;
      pulse = true;
      break;
    case 'Rescue Team Assigned':
      colorStyle = 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800';
      Icon = UserCheck;
      break;
    case 'Rescue Team On the Way':
      colorStyle = 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800';
      Icon = Navigation;
      pulse = true;
      break;
    case 'Arrived':
      colorStyle = 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800';
      Icon = MapPin;
      break;
    case 'Transporting to Shelter':
      colorStyle = 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800';
      Icon = Building2;
      pulse = true;
      break;
    case 'Resolved':
      colorStyle = 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800';
      Icon = CheckCircle2;
      break;
  }

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3.5 py-1.5 font-medium'
  }[size];

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4'
  }[size];

  return (
    <span className={`inline-flex items-center gap-1.5 font-medium rounded-full border shadow-2xs ${colorStyle} ${sizeClasses}`}>
      <Icon className={`${iconSizes} ${pulse ? 'animate-pulse text-current' : ''}`} />
      <span>{status}</span>
    </span>
  );
};
