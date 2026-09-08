import React from 'react';
import { EmergencyRequest, RescueTeam, Shelter } from '../../types';
import { Modal } from '../common/Modal';
import { PriorityBadge } from '../common/PriorityBadge';
import { StatusBadge } from '../common/StatusBadge';
import { 
  Users, 
  MapPin, 
  Clock, 
  Truck, 
  Building2, 
  Phone, 
  Activity, 
  Heart, 
  ShieldCheck, 
  CheckCircle2,
  Navigation
} from 'lucide-react';

interface EmergencyAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  emergency: EmergencyRequest | null;
  teams: RescueTeam[];
  shelters: Shelter[];
}

export const EmergencyAuditModal: React.FC<EmergencyAuditModalProps> = ({
  isOpen,
  onClose,
  emergency,
  teams,
  shelters,
}) => {
  if (!emergency) return null;

  const assignedTeam = teams.find(t => t.id === emergency.assignedRescueTeamId);
  const selectedShelter = shelters.find(s => s.id === emergency.selectedShelterId);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Incident Audit & Lifecycle: ${emergency.id}`}
      subtitle={`Reported by ${emergency.userName} (${emergency.userPhone})`}
      maxWidth="3xl"
    >
      <div className="space-y-5 text-xs">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] text-slate-400 uppercase block font-mono">Triage Severity</span>
            <div className="mt-1">
              <PriorityBadge score={emergency.priorityScore} breakdown={emergency.priorityBreakdown} size="sm" />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] text-slate-400 uppercase block font-mono">Current Status</span>
            <div className="mt-1">
              <StatusBadge status={emergency.status} size="sm" />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] text-slate-400 uppercase block font-mono">Total Persons</span>
            <span className="font-extrabold text-base text-slate-900 dark:text-white font-mono mt-0.5 block">
              {emergency.peopleCount} <span className="text-xs font-normal text-rose-500">({emergency.injuredCount} inj)</span>
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] text-slate-400 uppercase block font-mono">Hazard Type</span>
            <span className="font-bold text-sm text-slate-900 dark:text-white mt-0.5 block">
              {emergency.emergencyType}
            </span>
          </div>
        </div>

        {/* Location & Demographic Triage Details */}
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">DISTRESS TELEMETRY</span>
              <p className="font-bold text-slate-900 dark:text-white text-xs mt-0.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                {emergency.address}
              </p>
              <span className="text-[11px] font-mono text-slate-500">
                Coordinates: {emergency.latitude.toFixed(4)}° N, {emergency.longitude.toFixed(4)}° E
              </span>
            </div>
            <div className="text-right font-mono text-[11px] text-slate-400">
              Reported: {new Date(emergency.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>

          {emergency.description && (
            <p className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 italic text-slate-600 dark:text-slate-300">
              "{emergency.description}"
            </p>
          )}

          <div className="flex flex-wrap gap-3 pt-1 text-[11px] font-mono text-slate-600 dark:text-slate-300">
            <span>Children: <strong>{emergency.childrenCount}</strong></span>
            <span>Elderly: <strong>{emergency.elderlyCount}</strong></span>
            <span>Vulnerable/Disabilities: <strong>{emergency.vulnerableCount}</strong></span>
          </div>
        </div>

        {/* Field Dispatch & Safe Shelter Allocation Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Rescue Team Allocation */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-blue-50/20 dark:bg-blue-950/20">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1">
              <Truck className="w-3.5 h-3.5" /> Assigned Rescue Unit
            </span>
            {assignedTeam ? (
              <div className="mt-2 space-y-1">
                <div className="font-bold text-slate-900 dark:text-white text-sm">
                  {assignedTeam.teamName}
                </div>
                <div className="text-slate-500 dark:text-slate-400 text-[11px]">
                  Lead: {assignedTeam.leadName} • {assignedTeam.membersCount} crew members
                </div>
                <div className="text-slate-500 dark:text-slate-400 text-[11px] flex items-center gap-1 font-mono">
                  <Phone className="w-2.5 h-2.5" /> {assignedTeam.phone}
                </div>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">
                  Status: {assignedTeam.status}
                </div>
              </div>
            ) : (
              <div className="text-slate-400 italic mt-2">
                Pending assignment by rescue dispatcher.
              </div>
            )}
          </div>

          {/* Shelter Allocation */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-emerald-50/20 dark:bg-emerald-950/20">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" /> Target Safe Relief Shelter
            </span>
            {selectedShelter ? (
              <div className="mt-2 space-y-1">
                <div className="font-bold text-slate-900 dark:text-white text-sm">
                  {selectedShelter.name}
                </div>
                <div className="text-slate-500 dark:text-slate-400 text-[11px]">
                  {selectedShelter.address}
                </div>
                <div className="text-emerald-600 dark:text-emerald-400 font-mono font-bold text-[11px]">
                  Capacity: {selectedShelter.availableCapacity} / {selectedShelter.totalCapacity} spaces open
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  Safety: <strong>{selectedShelter.safetyStatus}</strong> (Verified: {selectedShelter.lastVerified})
                </div>
              </div>
            ) : (
              <div className="text-slate-400 italic mt-2">
                Algorithmic shelter capacity allocation in progress.
              </div>
            )}
          </div>
        </div>

        {/* Action Event Timeline */}
        <div>
          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Complete Incident Action Timeline
          </h4>

          <div className="space-y-2.5 border-l-2 border-slate-200 dark:border-slate-700 ml-2 pl-4">
            {emergency.timeline.map((event) => (
              <div key={event.id} className="relative group">
                <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-white dark:ring-slate-900" />
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-bold text-slate-800 dark:text-white text-xs">
                    {event.action}
                  </span>
                  <span className="font-mono text-[10px] text-slate-400 shrink-0">
                    {event.displayTime}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {event.description}
                </p>
                <span className="text-[10px] text-slate-400 font-mono">
                  Actor: <strong>{event.actorName}</strong> ({event.actorRole})
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};
