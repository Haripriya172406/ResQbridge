import React, { useState, useRef } from 'react';
import { useResQBridge } from '../../hooks/useResQBridge';
import { EmergencyModal } from './EmergencyModal';
import { EmergencyStatusTracker } from './EmergencyStatusTracker';
import { NearbySheltersList } from './NearbySheltersList';
import { OfflineQueueDrawer } from './OfflineQueueDrawer';
import { TacticalMap } from '../map/TacticalMap';
import { Shelter } from '../../types';
import { 
  AlertOctagon, 
  MapPin, 
  PhoneCall, 
  Radio, 
  CheckCircle2, 
  AlertTriangle,
  Wifi,
  MessageSquare,
  Database
} from 'lucide-react';
import { useToast } from '../common/Toast';
import confetti from 'canvas-confetti';

export const CitizenDashboard: React.FC = () => {
  const { currentUser, state, actions, communicationConfig } = useResQBridge();
  const toast = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedShelter, setSelectedShelter] = useState<Shelter | undefined>(undefined);

  // Hold-to-activate logic
  const [holdProgress, setHoldProgress] = useState(0);
  const holdIntervalRef = useRef<number | null>(null);

  // Find user's active emergency (if any)
  const userEmergency = state.emergencies.find(
    (e) => (e.userId === currentUser.id || e.userName === currentUser.name) && e.status !== 'Resolved'
  );

  const handleStartHold = () => {
    if (userEmergency) {
      toast.warning(
        'Active Request In Progress',
        `You already have an active distress incident (${userEmergency.id} - ${userEmergency.status}). Opening incident update form.`
      );
    }
    if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
    let current = 0;
    holdIntervalRef.current = window.setInterval(() => {
      current += 10;
      setHoldProgress(Math.min(100, current));
      if (current >= 100) {
        clearInterval(holdIntervalRef.current!);
        holdIntervalRef.current = null;
        setHoldProgress(0);
        setIsModalOpen(true);
      }
    }, 80);
  };

  const handleCancelHold = () => {
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
    setHoldProgress(0);
  };

  const handleEmergencySubmit = (created: any) => {
    toast.success(
      'Emergency Processed',
      `ID: ${created.id} • Method: ${created.communicationMethod.toUpperCase()}`
    );

    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.7 }
      });
    } catch (e) {
      // ignore
    }
  };

  const availableTeams = state.rescueTeams.filter(t => t.availability && t.status === 'Available');
  const commMethod = actions.getEffectiveCommunicationMethod();

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Welcome & Disaster Alert Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 border border-slate-800 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/40 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 animate-pulse text-rose-400" />
              CIVILIAN EMERGENCY PORTAL
            </span>

            {/* Active Communication Channel Pill */}
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold font-mono border flex items-center gap-1.5 ${
              commMethod === 'internet'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : commMethod === 'sms'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
            }`}>
              {commMethod === 'internet' ? <Wifi className="w-3 h-3" /> : commMethod === 'sms' ? <MessageSquare className="w-3 h-3" /> : <Database className="w-3 h-3" />}
              <span>{commMethod === 'internet' ? 'ONLINE (INTERNET)' : commMethod === 'sms' ? 'SMS FALLBACK READY' : 'OFFLINE BLACKOUT'}</span>
            </span>

            <span className="text-xs text-slate-400 font-mono hidden sm:inline">
              Citizen: <strong className="text-white">{currentUser.name}</strong> ({currentUser.phone})
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Need Immediate Help? One Touch Distress Beacon
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Automatic failover: If internet is unavailable, your SOS immediately routes via compact <strong>Cellular SMS</strong> or is queued securely in <strong>IndexedDB</strong>.
          </p>

          {availableTeams.length === 0 && (
            <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-950/40 border border-amber-800/60 p-2 rounded-xl mt-2 font-mono">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Heavy fleet activity: Field battalions deployed. Priority escalation active for new distress signals.</span>
            </div>
          )}
        </div>

        {/* SOS Button Area */}
        <div className="flex flex-col items-center gap-2 self-center sm:self-auto shrink-0">
          <div className="relative group">
            {/* Hold progress animation */}
            <div
              className="absolute -inset-2 rounded-full bg-rose-600 opacity-40 group-hover:opacity-70 blur-md transition-all animate-pulse"
              style={{ transform: `scale(${1 + holdProgress / 250})` }}
            />

            <button
              type="button"
              onMouseDown={handleStartHold}
              onMouseUp={handleCancelHold}
              onMouseLeave={handleCancelHold}
              onTouchStart={handleStartHold}
              onTouchEnd={handleCancelHold}
              onClick={() => setIsModalOpen(true)}
              className="relative w-36 h-36 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-rose-600 via-rose-500 to-rose-700 hover:from-rose-500 hover:to-rose-600 active:scale-95 text-white font-black shadow-2xl border-4 border-white/20 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer select-none"
            >
              <AlertOctagon className="w-10 h-10 text-white animate-bounce" />
              <span className="text-xl tracking-wider font-extrabold">EMERGENCY</span>
              <span className="text-[10px] font-bold tracking-widest text-rose-200">
                {holdProgress > 0 ? `HOLDING ${holdProgress}%` : 'TAP OR HOLD'}
              </span>
            </button>
          </div>

          <span className="text-[11px] text-slate-400 text-center font-medium">
            Tap for emergency form or hold 1s to trigger
          </span>
        </div>
      </div>

      {/* IndexedDB Offline Queue Drawer (Renders when offline requests exist) */}
      <OfflineQueueDrawer onSelectEmergency={(id) => actions.setActiveEmergency(id)} />

      {/* Main Grid: Active SOS Tracking + Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Active Emergency Tracking (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {userEmergency ? (
            <EmergencyStatusTracker 
              emergency={userEmergency} 
              shelters={state.shelters} 
            />
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="text-base font-bold text-slate-800 dark:text-white">
                No Active Emergency Requests
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                You currently have no pending distress calls. If disaster strikes, water levels rise, or you require immediate evacuation assistance, tap the red EMERGENCY button above.
              </p>
            </div>
          )}

          {/* Nearby Shelters Component */}
          <NearbySheltersList 
            shelters={state.shelters} 
            selectedShelterId={selectedShelter?.id || userEmergency?.selectedShelterId}
            onSelectShelter={setSelectedShelter}
          />
        </div>

        {/* Right Col: Live Tactical Location Map (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-500" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-white">
                  Live Evacuation & Rescue Radar
                </h4>
              </div>
              <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                ● Live GPS
              </span>
            </div>

            <TacticalMap
              emergencies={state.emergencies}
              teams={state.rescueTeams}
              shelters={state.shelters}
              selectedEmergency={userEmergency}
              selectedShelter={selectedShelter}
              height="440px"
              onSelectShelter={setSelectedShelter}
            />

            <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-300">
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-slate-400 block text-[10px]">Your Coordinates</span>
                <span className="font-mono font-bold">16.5185° N, 80.6320° E</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-slate-400 block text-[10px]">Nearest Safe Shelter</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">Kaveri Nagar (1.2 km)</span>
              </div>
            </div>
          </div>

          {/* Emergency Helpline Contacts */}
          <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 text-white space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-emerald-400" />
              National Emergency Helplines (India)
            </h5>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700 flex justify-between">
                <span className="text-slate-400">National Disaster (NDMA):</span>
                <strong className="text-emerald-400">1078</strong>
              </div>
              <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700 flex justify-between">
                <span className="text-slate-400">Emergency Response (ERSS):</span>
                <strong className="text-emerald-400">112</strong>
              </div>
              <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700 flex justify-between">
                <span className="text-slate-400">State Disaster (SDMA):</span>
                <strong className="text-blue-400">1070</strong>
              </div>
              <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700 flex justify-between">
                <span className="text-slate-400">Ambulance Services:</span>
                <strong className="text-rose-400">108</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Form Modal */}
      <EmergencyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleEmergencySubmit}
        defaultLocation={currentUser.location}
      />
    </div>
  );
};
