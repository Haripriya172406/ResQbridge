import React from 'react';
import { RescueTeam } from '../../types';
import { Truck, Phone, Users, CheckCircle2, AlertCircle, MapPin, Wrench } from 'lucide-react';

interface RescueTeamCardProps {
  team: RescueTeam;
  isSelected?: boolean;
  onSelect?: () => void;
}

export const RescueTeamCard: React.FC<RescueTeamCardProps> = ({
  team,
  isSelected = false,
  onSelect,
}) => {
  const isAvailable = team.availability && team.status === 'Available';

  return (
    <div
      onClick={onSelect}
      className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
        isSelected
          ? 'border-blue-500 ring-2 ring-blue-500/30 bg-blue-50/30 dark:bg-blue-950/20 shadow-md'
          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900 shadow-xs'
      }`}
    >
      <div>
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
              {team.teamName}
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Lead: {team.leadName} • {team.membersCount} Crew Members
            </p>
          </div>

          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
              isAvailable
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                : 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-300'
            }`}
          >
            {team.status}
          </span>
        </div>

        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 my-2">
          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
          <span className="truncate">{team.currentLocation.address}</span>
        </div>

        <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs space-y-1 mb-3">
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-500 dark:text-slate-400">Vehicle:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{team.vehicleType}</span>
          </div>
          {team.assignedEmergencyId && (
            <div className="flex justify-between text-[11px]">
              <span className="text-amber-600 dark:text-amber-400 font-medium">Assigned Mission:</span>
              <span className="font-mono font-bold text-amber-700 dark:text-amber-300">{team.assignedEmergencyId}</span>
            </div>
          )}
        </div>

        {/* Equipment Badges */}
        <div className="flex flex-wrap gap-1 mb-2">
          {team.equipment.slice(0, 2).map((eq) => (
            <span
              key={eq}
              className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
            >
              {eq}
            </span>
          ))}
          {team.equipment.length > 2 && (
            <span className="text-[10px] text-slate-400 font-mono self-center">
              +{team.equipment.length - 2}
            </span>
          )}
        </div>
      </div>

      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-mono">
        <span className="flex items-center gap-1">
          <Phone className="w-2.5 h-2.5" />
          {team.phone}
        </span>
        <span className="text-blue-500 font-semibold">GPS Active</span>
      </div>
    </div>
  );
};
