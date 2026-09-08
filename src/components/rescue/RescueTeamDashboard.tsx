import React, { useState, useMemo } from 'react';
import { useResQBridge } from '../../hooks/useResQBridge';
import { PriorityBadge } from '../common/PriorityBadge';
import { StatusBadge } from '../common/StatusBadge';
import { TacticalMap } from '../map/TacticalMap';
import { RouteDisplay } from '../map/RouteDisplay';
import { PriorityExplainerModal } from './PriorityExplainerModal';
import { ShelterSelectorModal } from './ShelterSelectorModal';
import { RescueActionStepper } from './RescueActionStepper';
import { EmergencyCard } from '../common/EmergencyCard';
import { DemoRouteOption, generateRouteOptions } from '../../services/demoData';
import { EmergencyRequest, Shelter } from '../../types';
import { 
  Truck, 
  Search,
  Clock, 
  MapPin, 
  HelpCircle, 
  Filter,
  Radio,
  Wifi,
  MessageSquare,
  Database,
  ArrowRight
} from 'lucide-react';
import { useToast } from '../common/Toast';

export const RescueTeamDashboard: React.FC = () => {
  const { state, actions } = useResQBridge();
  const toast = useToast();

  const currentTeam = state.rescueTeams[0];

  // Modals state
  const [isExplainerOpen, setIsExplainerOpen] = useState(false);
  const [isShelterModalOpen, setIsShelterModalOpen] = useState(false);

  // Search by Emergency ID (SMS connection to website)
  const [searchId, setSearchId] = useState('');

  // Sorted emergencies (unresolved first, then highest priority score)
  const sortedEmergencies = useMemo(() => {
    return [...state.emergencies].sort((a, b) => {
      if (a.status === 'Resolved' && b.status !== 'Resolved') return 1;
      if (a.status !== 'Resolved' && b.status === 'Resolved') return -1;
      return b.priorityScore - a.priorityScore;
    });
  }, [state.emergencies]);

  const [selectedEmergencyId, setSelectedEmergencyId] = useState<string>(
    sortedEmergencies[0]?.id || ''
  );

  const activeEmergency = useMemo(() => {
    return state.emergencies.find(e => e.id === selectedEmergencyId) || sortedEmergencies[0];
  }, [state.emergencies, selectedEmergencyId, sortedEmergencies]);

  // Selected Shelter
  const selectedShelter = useMemo(() => {
    if (!activeEmergency?.selectedShelterId) return undefined;
    return state.shelters.find(s => s.id === activeEmergency.selectedShelterId);
  }, [state.shelters, activeEmergency]);

  // Filtered by Search ID if entered
  const displayedEmergencies = useMemo(() => {
    if (!searchId.trim()) return sortedEmergencies;
    const query = searchId.trim().toLowerCase();
    return sortedEmergencies.filter(e => 
      e.id.toLowerCase().includes(query) || 
      e.userName.toLowerCase().includes(query) ||
      e.emergencyType.toLowerCase().includes(query)
    );
  }, [sortedEmergencies, searchId]);

  // Routes: Team -> Citizen
  const teamToCitizenRoutes = useMemo(() => {
    if (!activeEmergency || !currentTeam) return [];
    return generateRouteOptions(
      currentTeam.currentLocation.lat,
      currentTeam.currentLocation.lng,
      activeEmergency.latitude,
      activeEmergency.longitude
    );
  }, [activeEmergency, currentTeam]);

  // Routes: Citizen -> Shelter
  const citizenToShelterRoutes = useMemo(() => {
    if (!activeEmergency || !selectedShelter) return [];
    return generateRouteOptions(
      activeEmergency.latitude,
      activeEmergency.longitude,
      selectedShelter.latitude,
      selectedShelter.longitude
    );
  }, [activeEmergency, selectedShelter]);

  const [selectedRouteId, setSelectedRouteId] = useState<string>('route-1-safe');

  const activeRouteForMap = useMemo(() => {
    if (activeEmergency?.status === 'Transporting to Shelter' && citizenToShelterRoutes.length > 0) {
      return citizenToShelterRoutes.find(r => r.id === selectedRouteId) || citizenToShelterRoutes[0];
    }
    return teamToCitizenRoutes.find(r => r.id === selectedRouteId) || teamToCitizenRoutes[0] || null;
  }, [activeEmergency, teamToCitizenRoutes, citizenToShelterRoutes, selectedRouteId]);

  const handleSelectShelter = (shelter: Shelter) => {
    if (!activeEmergency) return;
    actions.selectShelter(activeEmergency.id, shelter.id);
    toast.success('Shelter Reserved', `${shelter.name} assigned for ${activeEmergency.peopleCount} evacuees.`);
  };

  const handleUpdateStatus = (newStatus: EmergencyRequest['status'], note?: string) => {
    if (!activeEmergency) return;
    actions.updateEmergencyStatus(activeEmergency.id, newStatus, 'rescue', currentTeam.teamName, note);
  };

  const handleCompleteTransport = (shelterId: string) => {
    if (!activeEmergency) return;
    actions.completeTransportAndResolve(activeEmergency.id, shelterId);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim()) return;

    const matched = state.emergencies.find(e => 
      e.id.toLowerCase() === searchId.trim().toLowerCase()
    );

    if (matched) {
      setSelectedEmergencyId(matched.id);
      toast.success('Incident Located', `Retrieved ${matched.id} (${matched.communicationMethod.toUpperCase()})`);
    } else {
      toast.error('Emergency Not Found', `No synchronized incident found with ID "${searchId}".`);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner: Rescue Battalion Telemetry */}
      <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-500/30 flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-blue-400" />
              TACTICAL FIELD COMMAND
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Operating Unit: <strong className="text-white">{currentTeam.teamName}</strong> (Lead: {currentTeam.leadName})
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Live Emergency Incident Response Queue
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Sorted by <strong>Priority Score</strong>. Channels indicate if request originated via Internet, SMS Fallback, or Offline Sync.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsExplainerOpen(true)}
          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors self-start md:self-auto shrink-0 shadow-xs"
        >
          <HelpCircle className="w-4 h-4 text-amber-400" />
          <span>Priority Scoring Logic & Rules</span>
        </button>
      </div>

      {/* Main Grid: Left = Emergency Queue (5 cols), Right = Tactical Command & Map (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Emergency Queue & Search */}
        <div className="lg:col-span-5 space-y-3">
          {/* SMS Emergency ID Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="Search Emergency ID (e.g. RB-2026-00421)..."
              className="w-full text-xs pl-9 pr-20 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono focus:outline-hidden focus:ring-2 focus:ring-blue-500 shadow-xs"
            />
            {searchId && (
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[11px] font-bold"
              >
                Lookup
              </button>
            )}
          </form>

          <div className="flex items-center justify-between px-1 text-xs">
            <span className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5" />
              Incidents ({displayedEmergencies.length})
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              Ranked by Triage Risk
            </span>
          </div>

          <div className="space-y-3 max-h-[calc(100vh-320px)] overflow-y-auto pr-1">
            {displayedEmergencies.map((emg, idx) => (
              <EmergencyCard
                key={emg.id}
                emergency={emg}
                index={idx}
                isSelected={activeEmergency?.id === emg.id}
                onSelect={() => setSelectedEmergencyId(emg.id)}
              />
            ))}
          </div>
        </div>

        {/* Right Column: Selected Incident Tactical Command & Map (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {activeEmergency ? (
            <>
              {/* Mission Control Stepper Actions */}
              <RescueActionStepper
                emergency={activeEmergency}
                rescueTeam={currentTeam}
                shelters={state.shelters}
                onUpdateStatus={handleUpdateStatus}
                onOpenShelterModal={() => setIsShelterModalOpen(true)}
                onCompleteTransport={handleCompleteTransport}
              />

              {/* Tactical Map */}
              <TacticalMap
                emergencies={state.emergencies}
                teams={state.rescueTeams}
                shelters={state.shelters}
                selectedEmergency={activeEmergency}
                selectedTeam={currentTeam}
                selectedShelter={selectedShelter}
                activeRoute={activeRouteForMap}
                height="380px"
                onSelectEmergency={(e) => setSelectedEmergencyId(e.id)}
                onSelectShelter={(s) => actions.selectShelter(activeEmergency.id, s.id)}
              />

              {/* Route Alternative Displays: Team -> Citizen OR Citizen -> Shelter */}
              {activeEmergency.status === 'Transporting to Shelter' && selectedShelter ? (
                <RouteDisplay
                  title="Evacuation Safe Route: Citizen → Safe Shelter"
                  fromName={activeEmergency.address.split(',')[0]}
                  toName={selectedShelter.name}
                  routes={citizenToShelterRoutes}
                  selectedRouteId={selectedRouteId}
                  onSelectRoute={(r) => setSelectedRouteId(r.id)}
                />
              ) : (
                <RouteDisplay
                  title="Dispatch Navigation Route: Rescue Base → Citizen"
                  fromName={currentTeam.teamName}
                  toName={activeEmergency.userName}
                  routes={teamToCitizenRoutes}
                  selectedRouteId={selectedRouteId}
                  onSelectRoute={(r) => setSelectedRouteId(r.id)}
                />
              )}
            </>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-500">
              Select an emergency to coordinate field operations.
            </div>
          )}
        </div>
      </div>

      {/* Priority Scoring Explainer Modal */}
      <PriorityExplainerModal
        isOpen={isExplainerOpen}
        onClose={() => setIsExplainerOpen(false)}
      />

      {/* Algorithmic Safe Shelter Selector Modal */}
      {activeEmergency && (
        <ShelterSelectorModal
          isOpen={isShelterModalOpen}
          onClose={() => setIsShelterModalOpen(false)}
          emergency={activeEmergency}
          shelters={state.shelters}
          onSelect={handleSelectShelter}
        />
      )}
    </div>
  );
};
