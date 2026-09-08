import React from 'react';
import { EmergencyRequest, RescueTeam, Shelter } from '../../types';
import { 
  Check, 
  Navigation, 
  MapPin, 
  Users, 
  Building2, 
  Truck, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { useToast } from '../common/Toast';
import confetti from 'canvas-confetti';

interface RescueActionStepperProps {
  emergency: EmergencyRequest;
  rescueTeam: RescueTeam;
  shelters: Shelter[];
  onUpdateStatus: (newStatus: EmergencyRequest['status'], note?: string) => void;
  onOpenShelterModal: () => void;
  onCompleteTransport: (shelterId: string) => void;
}

export const RescueActionStepper: React.FC<RescueActionStepperProps> = ({
  emergency,
  rescueTeam,
  shelters,
  onUpdateStatus,
  onOpenShelterModal,
  onCompleteTransport,
}) => {
  const toast = useToast();

  const handleAccept = () => {
    onUpdateStatus('Rescue Team Assigned', `${rescueTeam.teamName} accepted incident command.`);
    toast.success('Incident Accepted', `Assigned to ${rescueTeam.teamName}.`);
  };

  const handleNavigate = () => {
    onUpdateStatus('Rescue Team On the Way', `${rescueTeam.teamName} rolling out via safe corridor.`);
    toast.info('Team In Transit', 'En route to citizen coordinates.');
  };

  const handleArrived = () => {
    onUpdateStatus('Arrived', `${rescueTeam.teamName} has arrived on scene at citizen location.`);
    toast.success('Team On Scene', 'Arrival verified at distress coordinates.');
  };

  const handleStartTransport = () => {
    if (!emergency.selectedShelterId) {
      toast.warning('Shelter Required', 'Please select a suitable shelter before initiating transport.');
      onOpenShelterModal();
      return;
    }
    onUpdateStatus('Transporting to Shelter', `Transporting ${emergency.peopleCount} evacuees to ${emergency.selectedShelterName}.`);
    toast.info('Transport In Progress', `Moving safely to ${emergency.selectedShelterName}.`);
  };

  const handleResolve = () => {
    if (!emergency.selectedShelterId) {
      toast.warning('Shelter Required', 'Designate a shelter to complete capacity transfer.');
      onOpenShelterModal();
      return;
    }
    onCompleteTransport(emergency.selectedShelterId);
    toast.success('Mission Successfully Resolved', `${emergency.peopleCount} individuals accommodated safely. Shelter capacity updated.`);
    try {
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
    } catch (e) {}
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Field Mission Control
          </span>
          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
            Operational Response Stepper
          </h4>
        </div>
        <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2.5 py-1 rounded-full border border-blue-200 dark:border-blue-800">
          Status: {emergency.status}
        </span>
      </div>

      {/* Dynamic Action Buttons according to current life-cycle stage */}
      <div className="flex flex-wrap items-center gap-2.5">
        {emergency.status === 'Request Received' && (
          <button
            type="button"
            onClick={handleAccept}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs shadow-md shadow-blue-950/30 flex items-center gap-2 transition-all active:scale-95"
          >
            <Check className="w-4 h-4" />
            <span>1. Accept Incident & Assign Team</span>
          </button>
        )}

        {(emergency.status === 'Rescue Team Assigned' || emergency.status === 'Request Received') && (
          <button
            type="button"
            onClick={handleNavigate}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs shadow-md shadow-indigo-950/30 flex items-center gap-2 transition-all active:scale-95"
          >
            <Navigation className="w-4 h-4" />
            <span>2. Start Navigation to Citizen</span>
          </button>
        )}

        {(emergency.status === 'Rescue Team On the Way') && (
          <button
            type="button"
            onClick={handleArrived}
            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold text-xs shadow-md shadow-amber-950/30 flex items-center gap-2 transition-all active:scale-95"
          >
            <MapPin className="w-4 h-4" />
            <span>3. Mark Team Arrived On Scene</span>
          </button>
        )}

        {emergency.status === 'Arrived' && (
          <>
            <button
              type="button"
              onClick={onOpenShelterModal}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-xs shadow-md flex items-center gap-2 transition-all active:scale-95"
            >
              <Building2 className="w-4 h-4 text-emerald-500" />
              <span>4. {emergency.selectedShelterName ? `Shelter: ${emergency.selectedShelterName.slice(0, 16)}...` : 'Select Safe Shelter'}</span>
            </button>

            <button
              type="button"
              onClick={handleStartTransport}
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold text-xs shadow-md shadow-purple-950/30 flex items-center gap-2 transition-all active:scale-95"
            >
              <Truck className="w-4 h-4" />
              <span>5. Start Transport of Rescued Evacuees</span>
            </button>
          </>
        )}

        {emergency.status === 'Transporting to Shelter' && (
          <button
            type="button"
            onClick={handleResolve}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-emerald-950/40 flex items-center gap-2 transition-all active:scale-95 animate-pulse"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>6. Mark Shelter Arrival & Resolve Incident</span>
          </button>
        )}

        {emergency.status === 'Resolved' && (
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-3.5 py-2 rounded-xl border border-emerald-300 dark:border-emerald-800">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Incident Successfully Evacuated & Resolved</span>
          </div>
        )}
      </div>
    </div>
  );
};
