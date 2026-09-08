import React, { useEffect, useState } from 'react';
import { getPendingEmergencies, OfflineQueueItem } from '../../services/offlineQueue';
import { useResQBridge } from '../../hooks/useResQBridge';
import { useToast } from '../common/Toast';
import { generateSmsUri, prepareEmergencySMS } from '../../services/smsService';
import { 
  Database, 
  RotateCcw, 
  MessageSquare, 
  Wifi, 
  AlertCircle, 
  CheckCircle2, 
  Clock,
  ArrowRight
} from 'lucide-react';

interface OfflineQueueDrawerProps {
  onSelectEmergency?: (id: string) => void;
}

export const OfflineQueueDrawer: React.FC<OfflineQueueDrawerProps> = ({ onSelectEmergency }) => {
  const { communicationConfig, actions, state } = useResQBridge();
  const toast = useToast();
  const [queueItems, setQueueItems] = useState<OfflineQueueItem[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  const loadQueue = async () => {
    try {
      const items = await getPendingEmergencies();
      setQueueItems(items);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadQueue();
    const interval = setInterval(loadQueue, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleTrySms = (item: OfflineQueueItem) => {
    const smsText = prepareEmergencySMS(item.emergency);
    const smsUri = generateSmsUri(communicationConfig.rescueTeamSMSNumber, smsText);

    // Open device SMS client
    window.open(smsUri, '_blank');
    actions.confirmSmsSent(item.id);
    toast.info('Opening SMS Client', `Sending emergency distress SMS to ${communicationConfig.rescueTeamSMSNumber}`);
    loadQueue();
  };

  const handleSyncItem = async (item: OfflineQueueItem) => {
    setIsSyncing(true);
    await actions.syncPendingEmergency(item.id);
    toast.success('Offline Emergency Synchronized', `${item.id} has been transmitted to the active rescue queue.`);
    await loadQueue();
    setIsSyncing(false);
  };

  const handleSyncAll = async () => {
    setIsSyncing(true);
    await actions.syncAllOfflineEmergencies();
    toast.success('All Offline Records Synchronized', 'Emergency coordination centers received all pending distress payloads.');
    await loadQueue();
    setIsSyncing(false);
  };

  if (queueItems.length === 0) return null;

  return (
    <div className="bg-amber-950/20 border-2 border-amber-500/40 rounded-2xl p-4 shadow-lg animate-in slide-in-from-top-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-500/30">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
            <Database className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-amber-300 flex items-center gap-1.5">
              <span>IndexedDB Offline Storage Queue</span>
              <span className="px-2 py-0.2 rounded-full bg-amber-500/30 text-amber-200 text-[10px] font-mono font-extrabold">
                {queueItems.length} PENDING
              </span>
            </h4>
            <p className="text-[11px] text-slate-400">
              Saved securely on this device during signal blackout. Auto-syncs upon connection.
            </p>
          </div>
        </div>

        <button
          type="button"
          disabled={isSyncing}
          onClick={handleSyncAll}
          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md self-start sm:self-auto shrink-0 transition-all disabled:opacity-50"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>Sync All to Rescue Dispatch</span>
        </button>
      </div>

      <div className="mt-3 space-y-2.5 max-h-56 overflow-y-auto pr-1">
        {queueItems.map((item) => (
          <div
            key={item.id}
            className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
          >
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-amber-400">{item.id}</span>
                <span className="font-semibold text-white">{item.emergency.emergencyType}</span>
                <span className="px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 text-[10px] font-bold">
                  {item.emergency.severity}
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {item.emergency.peopleCount} People (Priority: {item.emergency.priorityScore})
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                <span className="flex items-center gap-1 text-rose-400">
                  <AlertCircle className="w-3 h-3" /> Status: 🔴 Waiting
                </span>
                <span>• Saved: {new Date(item.savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>

            {/* Action Buttons for this item */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleTrySms(item)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-[11px] flex items-center gap-1 transition-colors"
                title="Open SMS application to transmit payload via cellular network"
              >
                <MessageSquare className="w-3 h-3 text-blue-400" />
                <span>Try SMS Again</span>
              </button>

              <button
                type="button"
                onClick={() => handleSyncItem(item)}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1 transition-colors shadow-xs"
              >
                <Wifi className="w-3 h-3" />
                <span>Sync Now</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
