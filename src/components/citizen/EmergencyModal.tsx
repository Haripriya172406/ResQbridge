import React, { useState, useMemo } from 'react';
import { EmergencyRequest, EmergencyType, SeverityLevel } from '../../types';
import { Modal } from '../common/Modal';
import { useResQBridge } from '../../hooks/useResQBridge';
import { prepareEmergencySMS, generateSmsUri } from '../../services/smsService';
import { calculatePriorityScore } from '../../services/priorityCalculator';
import { 
  AlertOctagon, 
  MapPin, 
  Users, 
  Activity, 
  Navigation,
  Baby,
  Smile,
  Accessibility,
  MessageSquare,
  Database,
  Wifi,
  WifiOff,
  CheckCircle2,
  AlertTriangle,
  Send,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { useToast } from '../common/Toast';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  defaultLocation?: { lat: number; lng: number; address: string };
}

const EMERGENCY_TYPES: EmergencyType[] = [
  'Flood',
  'Fire',
  'Earthquake',
  'Cyclone',
  'Landslide',
  'Medical Emergency',
  'Building Collapse',
  'Other'
];

const SEVERITY_LEVELS: { level: SeverityLevel; label: string; desc: string; color: string }[] = [
  { level: 'Critical', label: 'Critical (Life in Danger)', desc: 'Immediate threat to life, submerged/trapped', color: 'border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-300' },
  { level: 'High', label: 'High (Severe Hazard)', desc: 'Rising water, structural cracks, medical shock', color: 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300' },
  { level: 'Medium', label: 'Medium (Urgent Need)', desc: 'Cut-off supplies, medicine depletion, shelter need', color: 'border-yellow-500 bg-yellow-500/10 text-yellow-700 dark:text-yellow-300' },
  { level: 'Low', label: 'Low (Precautionary)', desc: 'Pre-emptive evacuation, basic query, monitoring', color: 'border-blue-500 bg-blue-500/10 text-blue-700 dark:text-blue-300' },
];

export const EmergencyModal: React.FC<EmergencyModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  defaultLocation
}) => {
  const { actions, communicationConfig } = useResQBridge();
  const toast = useToast();

  const [emergencyType, setEmergencyType] = useState<EmergencyType>('Flood');
  const [severity, setSeverity] = useState<SeverityLevel>('Critical');
  const [peopleCount, setPeopleCount] = useState<number>(4);
  const [injuredCount, setInjuredCount] = useState<number>(1);
  const [childrenCount, setChildrenCount] = useState<number>(1);
  const [elderlyCount, setElderlyCount] = useState<number>(0);
  const [vulnerableCount, setVulnerableCount] = useState<number>(0);
  const [description, setDescription] = useState<string>('Water level rising quickly in residential compound.');

  // Location state
  const [lat, setLat] = useState<number>(defaultLocation?.lat || 16.5185);
  const [lng, setLng] = useState<number>(defaultLocation?.lng || 80.6320);
  const [address, setAddress] = useState<string>(defaultLocation?.address || 'Plot 42, Riverview Enclave, Sector 4');
  const [isDetectingGps, setIsDetectingGps] = useState(false);

  // Post-submission communication phase state
  const [submittedEmergency, setSubmittedEmergency] = useState<EmergencyRequest | null>(null);
  const [smsSentConfirmed, setSmsSentConfirmed] = useState(false);

  // Real-time calculated priority score
  const priorityPreview = useMemo(() => {
    return calculatePriorityScore({
      emergencyType,
      severity,
      peopleCount,
      injuredCount,
      childrenCount,
      elderlyCount,
      vulnerableCount
    });
  }, [emergencyType, severity, peopleCount, injuredCount, childrenCount, elderlyCount, vulnerableCount]);

  // Determine communication method based on system configuration & network state
  const commMethod = actions.getEffectiveCommunicationMethod();

  const handleCaptureLocation = () => {
    setIsDetectingGps(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLat(parseFloat(position.coords.latitude.toFixed(4)));
          setLng(parseFloat(position.coords.longitude.toFixed(4)));
          setAddress(`GPS Telemetry Lock (${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)})`);
          setIsDetectingGps(false);
          toast.success('Location Locked', 'Captured real GPS coordinates from device.');
        },
        () => {
          setIsDetectingGps(false);
          toast.warning('GPS Fallback Active', 'Using calibrated disaster sector telemetry.');
          setLat(16.5190);
          setLng(80.6315);
          setAddress('Simulated Sector: Riverview Enclave Block B');
        },
        { timeout: 6000 }
      );
    } else {
      setIsDetectingGps(false);
      toast.warning('GPS Telemetry Simulated', 'Coordinates pinned to sector.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (peopleCount < 1) {
      toast.error('Invalid Count', 'Please specify at least 1 person at the scene.');
      return;
    }

    const payload = {
      emergencyType,
      severity,
      peopleCount,
      injuredCount,
      childrenCount,
      elderlyCount,
      vulnerableCount,
      description: description.trim() || `Disaster emergency distress signal reported for ${emergencyType}.`,
      latitude: lat,
      longitude: lng,
      address: address.trim() || 'Disaster Sector 4 Grid',
      preferredMethod: commMethod
    };

    const created = actions.createEmergency({
      userId: 'user-c1',
      userName: 'Ramesh Varma',
      userPhone: '+91 98480 12345',
      ...payload
    });

    setSubmittedEmergency(created);

    if (commMethod === 'internet') {
      onSubmit(created);
      onClose();
    } else if (commMethod === 'sms') {
      // Keep modal open to display Case 2 SMS Fallback UI
      toast.warning('Internet Unavailable', 'Opening emergency SMS fallback transmitter.');
    } else if (commMethod === 'offline_sync') {
      // Keep modal open briefly to show Case 3 IndexedDB confirmation
      toast.error('No Communication Available', 'Emergency saved securely to client IndexedDB queue.');
    }
  };

  const handleLaunchSms = () => {
    if (!submittedEmergency) return;
    const smsText = prepareEmergencySMS(submittedEmergency);
    const smsUri = generateSmsUri(communicationConfig.rescueTeamSMSNumber, smsText);

    // Trigger mobile SMS app
    window.open(smsUri, '_blank');
    actions.confirmSmsSent(submittedEmergency.id);
    setSmsSentConfirmed(true);
    toast.success('SMS Client Opened', `Emergency payload transferred. Confirm send in your messaging app.`);
  };

  const handleDemoConfirmSms = () => {
    if (!submittedEmergency) return;
    actions.confirmSmsSent(submittedEmergency.id);
    setSmsSentConfirmed(true);
    toast.success('SMS Fallback Successful', 'Emergency request logged at Rescue Command.');
    onSubmit(submittedEmergency);
    onClose();
  };

  const handleFinishOffline = () => {
    if (submittedEmergency) {
      onSubmit(submittedEmergency);
    }
    onClose();
  };

  const handleClose = () => {
    setSubmittedEmergency(null);
    setSmsSentConfirmed(false);
    onClose();
  };

  // Render Post-Submission Fallback Screens (Case 2: SMS Fallback or Case 3: Offline Queue)
  if (submittedEmergency) {
    const smsPreviewText = prepareEmergencySMS(submittedEmergency);

    return (
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title={commMethod === 'sms' ? "Emergency SMS Fallback Mode" : "Emergency Saved Offline (Blackout)"}
        subtitle={`Incident Ref: ${submittedEmergency.id}`}
        maxWidth="lg"
      >
        <div className="space-y-4 text-xs">
          {commMethod === 'sms' && (
            <>
              {/* CASE 2 Banner: Internet Unavailable -> Trying SMS Fallback */}
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200">
                <div className="flex items-center gap-2 font-bold text-sm text-amber-800 dark:text-amber-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping inline-block" />
                  <span>🟠 INTERNET UNAVAILABLE — TRYING EMERGENCY SMS FALLBACK</span>
                </div>
                <p className="text-[11px] mt-1 text-slate-600 dark:text-slate-300 leading-relaxed">
                  Local data towers are unreachable. ResQBridge prepared an optimized SMS distress payload for direct transmission over the cellular network to the Rescue Coordination Base.
                </p>
              </div>

              {/* SMS Preview Card */}
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-white space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800 pb-2">
                  <span className="flex items-center gap-1 font-mono">
                    <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                    TO: <strong className="text-white">{communicationConfig.rescueTeamSMSNumber}</strong>
                  </span>
                  <span className="font-mono text-[10px] bg-slate-800 px-2 py-0.5 rounded text-amber-400">
                    Status: {smsSentConfirmed ? 'SMS SENT' : 'SMS READY'}
                  </span>
                </div>

                <pre className="text-[11px] font-mono whitespace-pre-wrap text-emerald-400 bg-slate-950/80 p-3 rounded-xl border border-slate-800 leading-relaxed">
                  {smsPreviewText}
                </pre>

                <div className="text-[10px] text-slate-400 flex items-center justify-between font-mono pt-1">
                  <span>Standard 160-char format</span>
                  <span>Coordinates: {submittedEmergency.latitude.toFixed(4)}, {submittedEmergency.longitude.toFixed(4)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-2 justify-end">
                <button
                  type="button"
                  onClick={handleLaunchSms}
                  className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs shadow-md flex items-center justify-center gap-1.5 transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open Phone SMS App</span>
                </button>

                <button
                  type="button"
                  onClick={handleDemoConfirmSms}
                  className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-950/30 flex items-center justify-center gap-1.5 transition-all animate-pulse"
                >
                  <Send className="w-4 h-4" />
                  <span>Confirm Emergency SMS Sent</span>
                </button>
              </div>
            </>
          )}

          {commMethod === 'offline_sync' && (
            <>
              {/* CASE 3 Banner: No Internet & No Signal -> Saved Offline in IndexedDB */}
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-rose-800 dark:text-rose-300">
                  <Database className="w-4 h-4 text-rose-500 animate-pulse" />
                  <span>🔴 EMERGENCY SAVED OFFLINE (INDEXEDDB QUEUE)</span>
                </div>
                <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                  Your emergency information has been saved securely on this device and will be sent automatically when communication becomes available.
                </p>
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 font-mono text-[11px] border border-rose-200 dark:border-rose-900/60 text-slate-800 dark:text-slate-200">
                  <div>ID: <strong>{submittedEmergency.id}</strong></div>
                  <div>Hazard: {submittedEmergency.emergencyType} • {submittedEmergency.peopleCount} People</div>
                  <div>Priority: {submittedEmergency.priorityScore}/100 ({submittedEmergency.priorityBreakdown.category})</div>
                  <div>Storage Engine: <strong>IndexedDB (resqbridge_offline_db)</strong></div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleFinishOffline}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 font-bold rounded-xl shadow-md text-xs"
                >
                  Close & Monitor Offline Queue
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>
    );
  }

  // Standard SOS Entry Form
  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Disaster Emergency Distress Form (SOS)"
      subtitle="Priority Triage Engine calculates risk locally before transmitting via optimal channel."
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Active Communication Channel Indicator Banner */}
        <div className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
          commMethod === 'internet'
            ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
            : commMethod === 'sms'
            ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300'
            : 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300'
        }`}>
          <div className="flex items-center gap-2">
            {commMethod === 'internet' ? (
              <Wifi className="w-4 h-4 text-emerald-500" />
            ) : commMethod === 'sms' ? (
              <MessageSquare className="w-4 h-4 text-amber-500" />
            ) : (
              <WifiOff className="w-4 h-4 text-rose-500" />
            )}
            <span className="font-bold">
              Channel: {commMethod === 'internet' ? '🟢 Internet Gateway Ready' : commMethod === 'sms' ? '🟠 SMS Fallback Channel Active' : '🔴 Offline Blackout (IndexedDB)'}
            </span>
          </div>
          <span className="font-mono text-[10px] font-bold opacity-80 uppercase">
            {communicationConfig.communicationMode}
          </span>
        </div>

        {/* Step 1: Emergency Type */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            1. Emergency Hazard Type
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {EMERGENCY_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setEmergencyType(type)}
                className={`py-2 px-3 text-xs font-semibold rounded-xl border text-center transition-all ${
                  emergencyType === type
                    ? 'border-rose-500 bg-rose-600 text-white shadow-md shadow-rose-900/30'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Severity Level */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            2. Disaster Severity Level
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {SEVERITY_LEVELS.map((s) => (
              <div
                key={s.level}
                onClick={() => setSeverity(s.level)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  severity === s.level
                    ? `${s.color} ring-2 ring-current`
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="font-bold text-xs">{s.label}</div>
                <div className="text-[11px] opacity-80 mt-0.5 leading-tight">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Step 3: Location Telemetry */}
        <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              3. Current Location Telemetry
            </label>
            <button
              type="button"
              onClick={handleCaptureLocation}
              disabled={isDetectingGps}
              className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
            >
              <Navigation className={`w-3.5 h-3.5 ${isDetectingGps ? 'animate-spin' : ''}`} />
              {isDetectingGps ? 'Locking GPS...' : 'Capture My GPS'}
            </button>
          </div>

          <div className="space-y-2">
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Landmark, building name or street..."
              className="w-full text-xs px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-rose-500"
              required
            />
            <div className="flex items-center gap-3 text-[11px] font-mono text-slate-500 dark:text-slate-400">
              <span>Lat: <strong>{lat.toFixed(4)}</strong></span>
              <span>Lng: <strong>{lng.toFixed(4)}</strong></span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">• High-Accuracy Coordinates</span>
            </div>
          </div>
        </div>

        {/* Step 4: Demographics & Casualties */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              4. Headcount & Casualty Demographics
            </label>
            <span className="text-[11px] font-mono font-bold text-rose-500">
              Score Preview: {priorityPreview.normalizedScore}/100 ({priorityPreview.category})
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {/* Total People */}
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
              <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 flex items-center justify-center gap-1">
                <Users className="w-3 h-3 text-blue-500" /> Total
              </span>
              <input
                type="number"
                min="1"
                max="50"
                value={peopleCount}
                onChange={(e) => setPeopleCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full text-center text-base font-bold mt-1 bg-transparent text-slate-900 dark:text-white border-b border-slate-300 dark:border-slate-600 focus:outline-hidden focus:border-rose-500"
              />
            </div>

            {/* Injured */}
            <div className="p-2.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-center">
              <span className="text-[11px] font-semibold text-rose-700 dark:text-rose-300 flex items-center justify-center gap-1">
                <Activity className="w-3 h-3 text-rose-500" /> Injured
              </span>
              <input
                type="number"
                min="0"
                max={peopleCount}
                value={injuredCount}
                onChange={(e) => setInjuredCount(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full text-center text-base font-bold mt-1 bg-transparent text-rose-700 dark:text-rose-300 border-b border-rose-300 dark:border-rose-800 focus:outline-hidden focus:border-rose-500"
              />
            </div>

            {/* Children */}
            <div className="p-2.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-center">
              <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-300 flex items-center justify-center gap-1">
                <Baby className="w-3 h-3 text-amber-500" /> Children
              </span>
              <input
                type="number"
                min="0"
                max={peopleCount}
                value={childrenCount}
                onChange={(e) => setChildrenCount(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full text-center text-base font-bold mt-1 bg-transparent text-amber-700 dark:text-amber-300 border-b border-amber-300 dark:border-amber-800 focus:outline-hidden focus:border-amber-500"
              />
            </div>

            {/* Elderly */}
            <div className="p-2.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/40 text-center">
              <span className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 flex items-center justify-center gap-1">
                <Smile className="w-3 h-3 text-indigo-500" /> Elderly
              </span>
              <input
                type="number"
                min="0"
                max={peopleCount}
                value={elderlyCount}
                onChange={(e) => setElderlyCount(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full text-center text-base font-bold mt-1 bg-transparent text-indigo-700 dark:text-indigo-300 border-b border-indigo-300 dark:border-indigo-800 focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            {/* Vulnerable/Disabilities */}
            <div className="p-2.5 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/40 text-center">
              <span className="text-[11px] font-semibold text-purple-700 dark:text-purple-300 flex items-center justify-center gap-1">
                <Accessibility className="w-3 h-3 text-purple-500" /> Disability
              </span>
              <input
                type="number"
                min="0"
                max={peopleCount}
                value={vulnerableCount}
                onChange={(e) => setVulnerableCount(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full text-center text-base font-bold mt-1 bg-transparent text-purple-700 dark:text-purple-300 border-b border-purple-300 dark:border-purple-800 focus:outline-hidden focus:border-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Step 5: Message */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            5. Situation Description / Message
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Water level rapidly increasing. Trapped on second floor."
            className="w-full text-xs px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-rose-500"
          />
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 active:bg-rose-700 rounded-xl shadow-lg shadow-rose-950/40 flex items-center gap-2 transition-all transform active:scale-95"
          >
            <AlertOctagon className="w-4 h-4" />
            <span>TRANSMIT EMERGENCY SOS NOW</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
