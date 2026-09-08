import React from 'react';
import { EmergencyRequest, EmergencyStatus, Shelter } from '../../types';
import { PriorityBadge } from '../common/PriorityBadge';
import { StatusBadge } from '../common/StatusBadge';
import { 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Phone, 
  ShieldCheck, 
  Truck, 
  Building2, 
  AlertCircle,
  Users,
  Wifi,
  MessageSquare,
  Database
} from 'lucide-react';

interface EmergencyStatusTrackerProps {
  emergency: EmergencyRequest;
  shelters: Shelter[];
}

const STEPS: EmergencyStatus[] = [
  'Request Received',
  'Rescue Team Assigned',
  'Rescue Team On the Way',
  'Arrived',
  'Transporting to Shelter',
  'Resolved'
];

export const EmergencyStatusTracker: React.FC<EmergencyStatusTrackerProps> = ({ emergency, shelters }) => {
  const currentStepIndex = STEPS.indexOf(emergency.status);
  const matchedShelter = shelters.find(s => s.id === emergency.selectedShelterId);

  let teamDistance = '3.4 km';
  let teamEta = '9 mins';

  if (emergency.status === 'Arrived' || emergency.status === 'Transporting to Shelter' || emergency.status === 'Resolved') {
    teamDistance = 'On Scene';
    teamEta = '0 mins';
  } else if (emergency.status === 'Rescue Team On the Way') {
    teamDistance = '1.8 km';
    teamEta = '4 mins';
  }

  let shelterDistance = matchedShelter ? '2.9 km' : 'Calculating optimal shelter...';

  // Communication Method Pill
  const commBadge = (
    <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold">
      {emergency.communicationMethod === 'sms' ? (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300 dark:bg-amber-950 dark:text-amber-300">
          <MessageSquare className="w-3 h-3 text-amber-500" />
          <span>SMS FALLBACK ({emergency.smsStatus || 'SMS SENT'})</span>
        </span>
      ) : emergency.communicationMethod === 'offline_sync' ? (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-300 dark:bg-blue-950 dark:text-blue-300">
          <Database className="w-3 h-3 text-blue-500" />
          <span>OFFLINE SYNC</span>
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300">
          <Wifi className="w-3 h-3 text-emerald-500" />
          <span>INTERNET GATEWAY</span>
        </span>
      )}
    </div>
  );

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-5">
      {/* Top Banner: Emergency ID, Priority & Current Status */}
      <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-slate-400">DISPATCH ID:</span>
            <span className="text-sm font-mono font-extrabold text-slate-900 dark:text-white">
              {emergency.id}
            </span>
            {commBadge}
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mt-1">
            {emergency.emergencyType} Distress Call • {emergency.peopleCount} People
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span>{emergency.address}</span>
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <StatusBadge status={emergency.status} size="md" />
          <PriorityBadge 
            score={emergency.priorityScore} 
            breakdown={emergency.priorityBreakdown} 
            size="md"
          />
        </div>
      </div>

      {/* Progress Stepper (6 Life-cycle stages) */}
      <div className="pt-2">
        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
          Live Rescue Mission Progress
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
          {STEPS.map((step, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;

            let stepColor = 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700';
            if (isCompleted) {
              stepColor = 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
            } else if (isCurrent) {
              stepColor = 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-400 dark:border-blue-700 ring-2 ring-blue-500/20';
            }

            return (
              <div
                key={step}
                className={`p-2.5 rounded-xl border text-center transition-all ${stepColor}`}
              >
                <div className="flex items-center justify-center mb-1">
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : isCurrent ? (
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping inline-block" />
                  ) : (
                    <span className="text-[10px] font-mono opacity-50">0{idx + 1}</span>
                  )}
                </div>
                <div className="text-[11px] font-bold leading-tight line-clamp-2">
                  {step}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Real-Time Coordination Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
        {/* Rescue Team Info Card */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-blue-500" />
              Assigned Rescue Unit
            </span>
            {emergency.assignedRescueTeamName ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                ACTIVE
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                DISPATCHING...
              </span>
            )}
          </div>

          {emergency.assignedRescueTeamName ? (
            <div className="space-y-2">
              <div className="text-sm font-bold text-slate-800 dark:text-white">
                {emergency.assignedRescueTeamName}
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 block">Current Distance</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">{teamDistance}</span>
                </div>
                <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 block">Est. Arrival (ETA)</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400 font-mono">{teamEta}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-500 dark:text-slate-400 italic py-2">
              Triage priority analyzed. Nearest disaster response battalion is being automatically assigned.
            </div>
          )}
        </div>

        {/* Selected Safe Shelter Card */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-emerald-500" />
              Target Safe Shelter
            </span>
            {matchedShelter ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                SAFE & RESERVED
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                COORDINATING
              </span>
            )}
          </div>

          {matchedShelter ? (
            <div className="space-y-2">
              <div className="text-sm font-bold text-slate-800 dark:text-white">
                {matchedShelter.name}
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 block">Shelter Distance</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">{shelterDistance}</span>
                </div>
                <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 block">Available Spaces</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                    {matchedShelter.availableCapacity} / {matchedShelter.totalCapacity}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-500 dark:text-slate-400 italic py-2">
              Safe route and shelter capacity algorithm is coordinating nearest elevated evacuation station.
            </div>
          )}
        </div>
      </div>

      {/* Citizen Safety Advisory during wait */}
      <div className="p-3 bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-xl text-xs flex items-start gap-2.5 text-amber-800 dark:text-amber-300">
        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
        <div>
          <strong className="font-semibold">Communication Note:</strong> If you lose cellular data, ResQBridge automatically preserves your distress signal and transmits compact SMS updates to the rescue team base. Keep your battery conserved.
        </div>
      </div>
    </div>
  );
};
