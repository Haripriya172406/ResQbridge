import React from 'react';
import { Shelter } from '../../types';
import { ShieldCheck, AlertTriangle, XCircle, MapPin, Phone, Users } from 'lucide-react';

interface ShelterCardProps {
  shelter: Shelter;
  distanceKm?: number;
  isSelected?: boolean;
  onSelect?: () => void;
  showSelectButton?: boolean;
}

export const ShelterCard: React.FC<ShelterCardProps> = ({
  shelter,
  distanceKm,
  isSelected = false,
  onSelect,
  showSelectButton = false,
}) => {
  const occupancyRate = shelter.occupiedCapacity / shelter.totalCapacity;
  const isSafe = shelter.safetyStatus === 'Safe';
  const isNearlyFull = shelter.safetyStatus === 'Nearly Full';

  let statusBadge = (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
      <ShieldCheck className="w-3 h-3" /> Safe
    </span>
  );

  if (isNearlyFull) {
    statusBadge = (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300">
        <AlertTriangle className="w-3 h-3" /> Nearly Full
      </span>
    );
  } else if (!isSafe) {
    statusBadge = (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300">
        <XCircle className="w-3 h-3" /> Unsafe
      </span>
    );
  }

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
        <div className="flex items-start justify-between gap-2 mb-2">
          <h5 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-snug">
            {shelter.name}
          </h5>
          {statusBadge}
        </div>

        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-2">
          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
          <span className="truncate">{shelter.address}</span>
          {distanceKm !== undefined && (
            <span className="font-semibold text-slate-700 dark:text-slate-300 shrink-0 font-mono">
              • {distanceKm} km
            </span>
          )}
        </div>

        {/* Capacity Meter */}
        <div className="space-y-1 mb-3">
          <div className="flex justify-between text-[11px] font-mono">
            <span className="text-slate-500 dark:text-slate-400">Available:</span>
            <strong className={shelter.availableCapacity > 50 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
              {shelter.availableCapacity} / {shelter.totalCapacity}
            </strong>
          </div>
          <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                occupancyRate >= 0.9
                  ? 'bg-rose-500'
                  : occupancyRate >= 0.7
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, Math.round(occupancyRate * 100))}%` }}
            />
          </div>
        </div>

        {/* Facilities Pills */}
        <div className="flex flex-wrap gap-1 mb-3">
          {shelter.facilities.slice(0, 3).map((f) => (
            <span
              key={f}
              className="px-1.5 py-0.5 rounded text-[10px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
            >
              {f}
            </span>
          ))}
          {shelter.facilities.length > 3 && (
            <span className="text-[10px] text-slate-400 font-mono self-center">
              +{shelter.facilities.length - 3}
            </span>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
        <span className="flex items-center gap-1">
          <Phone className="w-3 h-3 text-slate-400" />
          {shelter.contactPhone}
        </span>
        <span className="font-mono">Ver: {shelter.lastVerified.split(' ')[1]}</span>
      </div>
    </div>
  );
};
