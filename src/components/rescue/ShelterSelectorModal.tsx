import React, { useMemo } from 'react';
import { EmergencyRequest, Shelter } from '../../types';
import { Modal } from '../common/Modal';
import { 
  Building2, 
  ShieldCheck, 
  AlertTriangle, 
  XCircle, 
  MapPin, 
  Users, 
  Navigation, 
  Check, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface ShelterSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  emergency: EmergencyRequest;
  shelters: Shelter[];
  onSelect: (shelter: Shelter) => void;
}

export const ShelterSelectorModal: React.FC<ShelterSelectorModalProps> = ({
  isOpen,
  onClose,
  emergency,
  shelters,
  onSelect,
}) => {
  // Compute recommendation score for each shelter
  // Factors: Safety status (+50 pts if Safe, -100 if Unsafe), Available capacity (+30 if space >= peopleCount), Distance (+20 for closest)
  const rankedShelters = useMemo(() => {
    return shelters.map((s) => {
      // Approximate distance calculation
      const dLat = (s.latitude - emergency.latitude) * 111;
      const dLng = (s.longitude - emergency.longitude) * 111 * Math.cos((s.latitude * Math.PI) / 180);
      const distKm = parseFloat(Math.sqrt(dLat * dLat + dLng * dLng).toFixed(1));

      let recommendationScore = 50;

      // 1. Safety
      if (s.safetyStatus === 'Safe') recommendationScore += 50;
      else if (s.safetyStatus === 'Nearly Full') recommendationScore += 20;
      else if (s.safetyStatus === 'Unsafe') recommendationScore -= 100;

      // 2. Capacity sufficiency
      const neededSpace = emergency.peopleCount || 1;
      if (s.availableCapacity >= neededSpace) {
        recommendationScore += 30;
      } else {
        recommendationScore -= 50;
      }

      // 3. Distance penalty
      recommendationScore -= Math.min(30, distKm * 5);

      // 4. Verification bonus
      if (s.verificationStatus === 'Verified') recommendationScore += 10;

      return {
        ...s,
        distKm,
        recommendationScore
      };
    }).sort((a, b) => b.recommendationScore - a.recommendationScore);
  }, [shelters, emergency]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Algorithmic Safe Shelter Selection"
      subtitle={`Evacuating ${emergency.peopleCount} individuals from ${emergency.address}`}
      maxWidth="3xl"
    >
      <div className="space-y-4">
        {/* Recommendation Engine Banner */}
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-900 dark:text-emerald-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>
              Ranked dynamically by: <strong>Safety Status</strong> + <strong>Sufficient Capacity ({emergency.peopleCount} required)</strong> + <strong>Minimal Distance</strong>
            </span>
          </div>
          <span className="font-mono text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
            AUTO-OPTIMIZED
          </span>
        </div>

        {/* List of Shelters */}
        <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
          {rankedShelters.map((shelter, idx) => {
            const isTopPick = idx === 0 && shelter.safetyStatus === 'Safe' && shelter.availableCapacity >= emergency.peopleCount;
            const hasEnoughSpace = shelter.availableCapacity >= emergency.peopleCount;
            const isUnsafe = shelter.safetyStatus === 'Unsafe';
            const occupancyPct = Math.round((shelter.occupiedCapacity / shelter.totalCapacity) * 100);

            return (
              <div
                key={shelter.id}
                className={`p-4 rounded-xl border transition-all ${
                  isTopPick
                    ? 'border-emerald-500 ring-2 ring-emerald-500/30 bg-emerald-50/30 dark:bg-emerald-950/20'
                    : isUnsafe
                    ? 'border-rose-200 dark:border-rose-900/40 bg-rose-50/20 opacity-70'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        {shelter.name}
                      </h4>
                      {isTopPick && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-600 text-white flex items-center gap-1 shadow-xs">
                          <Sparkles className="w-3 h-3" /> BEST MATCH
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        shelter.safetyStatus === 'Safe'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          : shelter.safetyStatus === 'Nearly Full'
                          ? 'bg-amber-50 text-amber-700 border-amber-300'
                          : 'bg-rose-50 text-rose-700 border-rose-300'
                      }`}>
                        {shelter.safetyStatus}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {shelter.address} • <strong className="text-slate-700 dark:text-slate-300">{shelter.distKm} km away</strong>
                    </p>

                    {shelter.accessibilityNotes && (
                      <p className="text-[11px] text-blue-600 dark:text-blue-400 italic">
                        {shelter.accessibilityNotes}
                      </p>
                    )}
                  </div>

                  {/* Capacity & Selection Button */}
                  <div className="flex items-center gap-4 sm:self-center shrink-0">
                    <div className="text-right">
                      <div className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                        {shelter.availableCapacity} Available
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        ({occupancyPct}% full • Total {shelter.totalCapacity})
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={isUnsafe || !hasEnoughSpace}
                      onClick={() => {
                        onSelect(shelter);
                        onClose();
                      }}
                      className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all ${
                        isUnsafe || !hasEnoughSpace
                          ? 'bg-slate-200 text-slate-400 cursor-not-allowed dark:bg-slate-800 dark:text-slate-600'
                          : isTopPick
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950/30 active:scale-95'
                          : 'bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900'
                      }`}
                    >
                      <span>Select Shelter</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
};
