import React, { useState, useMemo } from 'react';
import { useResQBridge } from '../../hooks/useResQBridge';
import { AdminCharts } from './AdminCharts';
import { ShelterAdminManager } from './ShelterAdminManager';
import { UrgentRequirementsManager } from './UrgentRequirementsManager';
import { CommunicationSettings } from './CommunicationSettings';
import { EmergencyAuditModal } from './EmergencyAuditModal';
import { TacticalMap } from '../map/TacticalMap';
import { PriorityBadge } from '../common/PriorityBadge';
import { StatusBadge } from '../common/StatusBadge';
import { EmergencyRequest } from '../../types';
import { 
  Building, 
  AlertTriangle, 
  Users, 
  Truck, 
  ShieldCheck, 
  PackageCheck, 
  Activity, 
  Search, 
  Eye, 
  Layers, 
  Radio,
  MessageSquare,
  Wifi,
  Database
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { state, actions, communicationStats } = useResQBridge();

  const [activeTab, setActiveTab] = useState<'overview' | 'shelters' | 'supplies' | 'incidents' | 'comms'>('overview');
  const [auditEmergency, setAuditEmergency] = useState<EmergencyRequest | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Computations for KPIs
  const totalEmergencies = state.emergencies.length;
  const activeEmergencies = state.emergencies.filter(e => e.status !== 'Resolved').length;
  const criticalEmergencies = state.emergencies.filter(e => e.status !== 'Resolved' && e.priorityScore >= 80).length;
  const peopleRequiringRescue = state.emergencies
    .filter(e => e.status !== 'Resolved')
    .reduce((acc, e) => acc + e.peopleCount, 0);

  const rescueTeamsAvailable = state.rescueTeams.filter(t => t.availability && t.status === 'Available').length;
  const rescueTeamsActive = state.rescueTeams.filter(t => !t.availability || t.status !== 'Available').length;

  const totalShelters = state.shelters.length;
  const availableShelterCapacity = state.shelters.reduce((acc, s) => acc + s.availableCapacity, 0);
  const sheltersNearlyFull = state.shelters.filter(s => s.safetyStatus === 'Nearly Full' || s.safetyStatus === 'Full').length;
  const urgentRequirementsCount = state.urgentRequirements.filter(r => r.status === 'Urgent').length;

  const filteredEmergencies = useMemo(() => {
    return state.emergencies.filter(e => {
      const q = searchQuery.toLowerCase();
      return (
        e.id.toLowerCase().includes(q) ||
        e.userName.toLowerCase().includes(q) ||
        e.emergencyType.toLowerCase().includes(q) ||
        e.address.toLowerCase().includes(q) ||
        e.status.toLowerCase().includes(q)
      );
    });
  }, [state.emergencies, searchQuery]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Admin Command Banner */}
      <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-emerald-400" />
              DISTRICT DISASTER CONTROL COMMAND
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Sector: <strong>Krishna-Godavari Flood Relief Zone</strong>
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            System-Wide Emergency Coordination Center
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Real-time multi-agency monitoring connecting Citizens, Field Rescue Units, and Relief Shelters.
          </p>
        </div>

        {/* Tab Switcher Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'overview'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('comms')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'comms'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Radio className="w-3 h-3 text-blue-400" />
            <span>SMS & Comms ({communicationStats.smsRequests + communicationStats.offlinePending})</span>
          </button>
          <button
            onClick={() => setActiveTab('shelters')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'shelters'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            Shelter Ops ({totalShelters})
          </button>
          <button
            onClick={() => setActiveTab('supplies')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'supplies'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            Urgent Supplies ({urgentRequirementsCount})
          </button>
          <button
            onClick={() => setActiveTab('incidents')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'incidents'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            All Incidents ({totalEmergencies})
          </button>
        </div>
      </div>

      {/* 10 Required KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Metric 1 */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Requests
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black font-mono text-slate-900 dark:text-white">
              {totalEmergencies}
            </span>
            <Radio className="w-4 h-4 text-blue-500" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider block">
            Active Emergencies
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black font-mono text-amber-600 dark:text-amber-400">
              {activeEmergencies}
            </span>
            <Activity className="w-4 h-4 text-amber-500" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-3.5 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 shadow-xs">
          <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block">
            Critical Emergencies
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black font-mono text-rose-700 dark:text-rose-300">
              {criticalEmergencies}
            </span>
            <AlertTriangle className="w-4 h-4 text-rose-500 animate-bounce" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            People Trapped/Need Help
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black font-mono text-slate-900 dark:text-white">
              {peopleRequiringRescue}
            </span>
            <Users className="w-4 h-4 text-purple-500" />
          </div>
        </div>

        {/* Metric 5 & 6 (Fleet) */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider block">
            Rescue Fleet Ready / Active
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black font-mono text-blue-600 dark:text-blue-400">
              {rescueTeamsAvailable} <span className="text-xs font-normal text-slate-400">/ {rescueTeamsActive} busy</span>
            </span>
            <Truck className="w-4 h-4 text-blue-500" />
          </div>
        </div>

        {/* Metric 7 & 8 (Shelters) */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider block">
            Available Shelter Spaces
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
              {availableShelterCapacity}
            </span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
        </div>

        {/* Metric 9 (Shelters Nearly Full) */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold text-yellow-600 uppercase tracking-wider block">
            Shelters Nearly Full
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black font-mono text-yellow-600 dark:text-yellow-400">
              {sheltersNearlyFull}
            </span>
            <Building className="w-4 h-4 text-yellow-500" />
          </div>
        </div>

        {/* Metric 10 (Urgent Requirements) */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider block">
            Urgent Supplies Needed
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black font-mono text-rose-600 dark:text-rose-400">
              {urgentRequirementsCount}
            </span>
            <PackageCheck className="w-4 h-4 text-rose-500" />
          </div>
        </div>
      </div>

      {/* Tab 1: Command Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <AdminCharts
            emergencies={state.emergencies}
            shelters={state.shelters}
            teams={state.rescueTeams}
          />

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-500" />
                  Regional Tactical Overview: Live Incidents, Fleets & Shelters
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Click any marker to inspect incident parameters or shelter verification status
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-slate-400">
                100% Telemetry Synced
              </span>
            </div>

            <TacticalMap
              emergencies={state.emergencies}
              teams={state.rescueTeams}
              shelters={state.shelters}
              height="460px"
              onSelectEmergency={(e) => setAuditEmergency(e)}
            />
          </div>
        </div>
      )}

      {/* Tab: SMS & Emergency Communication Settings */}
      {activeTab === 'comms' && (
        <CommunicationSettings />
      )}

      {/* Tab 2: Shelter Management */}
      {activeTab === 'shelters' && (
        <ShelterAdminManager
          shelters={state.shelters}
          onAddShelter={actions.addShelter}
          onUpdateShelter={actions.updateShelter}
          onDeleteShelter={actions.deleteShelter}
          onToggleSafety={actions.toggleShelterSafety}
          onSetVerification={actions.setShelterVerification}
        />
      )}

      {/* Tab 3: Urgent Supplies Requisition */}
      {activeTab === 'supplies' && (
        <UrgentRequirementsManager
          requirements={state.urgentRequirements}
          onAddRequirement={actions.addUrgentRequirement}
          onUpdateStatus={actions.updateRequirementStatus}
          onDeleteRequirement={actions.deleteRequirement}
        />
      )}

      {/* Tab 4: All Incidents Audit Log */}
      {activeTab === 'incidents' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Comprehensive Emergency Audit Log
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Full chronological ledger of distress calls, priority triage scores, and communication channels
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search citizen, ID, hazard..."
                className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-3">Incident ID</th>
                  <th className="p-3">Channel</th>
                  <th className="p-3">Citizen & Location</th>
                  <th className="p-3">Type & Severity</th>
                  <th className="p-3">Priority Score</th>
                  <th className="p-3">People</th>
                  <th className="p-3">Assigned Unit</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredEmergencies.map((emg) => (
                  <tr key={emg.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">
                      {emg.id}
                    </td>

                    {/* Communication Channel Pill */}
                    <td className="p-3">
                      {emg.communicationMethod === 'sms' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 font-mono">
                          <MessageSquare className="w-2.5 h-2.5" /> SMS
                        </span>
                      ) : emg.communicationMethod === 'offline_sync' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-300 font-mono">
                          <Database className="w-2.5 h-2.5" /> OFFLINE
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 font-mono">
                          <Wifi className="w-2.5 h-2.5" /> INTERNET
                        </span>
                      )}
                    </td>

                    <td className="p-3">
                      <div className="font-bold text-slate-800 dark:text-slate-100">{emg.userName}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-xs">{emg.address}</div>
                    </td>
                    <td className="p-3">
                      <span className="font-bold text-slate-700 dark:text-slate-200 block">{emg.emergencyType}</span>
                      <span className="text-[10px] text-rose-500 font-semibold">{emg.severity}</span>
                    </td>
                    <td className="p-3">
                      <PriorityBadge score={emg.priorityScore} breakdown={emg.priorityBreakdown} size="sm" />
                    </td>
                    <td className="p-3 font-mono">
                      <strong>{emg.peopleCount}</strong> people
                      {emg.injuredCount > 0 && (
                        <span className="text-rose-500 ml-1">({emg.injuredCount} inj)</span>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                        {emg.assignedRescueTeamName || 'Unassigned'}
                      </div>
                    </td>
                    <td className="p-3">
                      <StatusBadge status={emg.status} size="sm" />
                    </td>
                    <td className="p-3 text-right">
                      <button
                        type="button"
                        onClick={() => setAuditEmergency(emg)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold inline-flex items-center gap-1 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Timeline</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Audit Detail & Timeline Modal */}
      <EmergencyAuditModal
        isOpen={!!auditEmergency}
        onClose={() => setAuditEmergency(null)}
        emergency={auditEmergency}
        teams={state.rescueTeams}
        shelters={state.shelters}
      />
    </div>
  );
};
