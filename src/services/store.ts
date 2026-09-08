import { 
  CommunicationMethod,
  CommunicationStats,
  EmergencyCommunicationConfig,
  EmergencyRequest, 
  EmergencyStatus, 
  NetworkSimulationMode,
  PriorityBreakdown, 
  RescueTeam, 
  Shelter, 
  ShelterSafetyStatus, 
  SMSStatus,
  TimelineEvent, 
  UrgentRequirement, 
  User, 
  UserRole 
} from '../types';
import { 
  DEMO_USERS, 
  INITIAL_EMERGENCIES, 
  INITIAL_RESCUE_TEAMS, 
  INITIAL_SHELTERS, 
  INITIAL_URGENT_REQUIREMENTS 
} from './demoData';
import { calculatePriorityScore } from './priorityCalculator';
import { 
  getPendingEmergencies, 
  removeEmergencyFromQueue, 
  saveEmergencyOffline 
} from './offlineQueue';

const STORAGE_KEY = 'resqbridge_disaster_state_v2';
const BROADCAST_CHANNEL_NAME = 'resqbridge_live_sync';

interface AppState {
  currentUser: User;
  emergencies: EmergencyRequest[];
  rescueTeams: RescueTeam[];
  shelters: Shelter[];
  urgentRequirements: UrgentRequirement[];
  activeEmergencyId?: string;
  communicationConfig: EmergencyCommunicationConfig;
  failedSmsCount: number;
}

type Listener = (state: AppState) => void;

class ResQBridgeStore {
  private state: AppState;
  private listeners: Set<Listener> = new Set();
  private broadcastChannel: BroadcastChannel | null = null;

  constructor() {
    this.state = this.loadInitialState();

    if (typeof window !== 'undefined') {
      try {
        this.broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
        this.broadcastChannel.onmessage = (event) => {
          if (event.data && event.data.type === 'SYNC_STATE') {
            this.state = event.data.payload;
            this.notify();
          }
        };
      } catch (e) {
        console.warn('BroadcastChannel not supported in current environment', e);
      }

      window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEY && e.newValue) {
          try {
            this.state = JSON.parse(e.newValue);
            this.notify();
          } catch (err) {
            console.error('Failed to parse synchronized storage', err);
          }
        }
      });

      // Auto-retry offline items when connection is restored
      window.addEventListener('online', () => {
        console.log('Network connection restored. Auto-synchronizing offline queue...');
        this.syncAllOfflineEmergencies();
      });

      // Check on startup if there are pending offline emergencies
      this.checkAndSyncOfflineQueue();
    }
  }

  private loadInitialState(): AppState {
    const defaultConfig: EmergencyCommunicationConfig = {
      rescueTeamSMSNumber: '+91 94400 11222',
      smsProvider: 'textlocal',
      smsApiStatus: 'Connected',
      lastSMSTest: '2026-09-08 21:45',
      communicationMode: 'auto'
    };

    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && parsed.emergencies && parsed.shelters && parsed.rescueTeams) {
            return {
              ...parsed,
              communicationConfig: parsed.communicationConfig || defaultConfig,
              failedSmsCount: parsed.failedSmsCount || 0
            };
          }
        }
      } catch (e) {
        console.warn('Could not read from localStorage', e);
      }
    }

    return {
      currentUser: DEMO_USERS[0], // Ramesh Varma (Citizen)
      emergencies: INITIAL_EMERGENCIES,
      rescueTeams: INITIAL_RESCUE_TEAMS,
      shelters: INITIAL_SHELTERS,
      urgentRequirements: INITIAL_URGENT_REQUIREMENTS,
      activeEmergencyId: INITIAL_EMERGENCIES[0].id,
      communicationConfig: defaultConfig,
      failedSmsCount: 1
    };
  }

  private saveState(broadcast = true) {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      } catch (e) {
        console.warn('Failed to save to localStorage', e);
      }
    }

    if (broadcast && this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({
          type: 'SYNC_STATE',
          payload: this.state
        });
      } catch (e) {
        console.warn('Failed to broadcast state', e);
      }
    }

    this.notify();
  }

  private notify() {
    this.listeners.forEach((listener) => listener(this.state));
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getState(): AppState {
    return this.state;
  }

  // --- ACTIONS ---

  public setRole(role: UserRole, userId?: string) {
    const matchingUser = userId 
      ? DEMO_USERS.find(u => u.id === userId)
      : DEMO_USERS.find(u => u.role === role);

    if (matchingUser) {
      this.state.currentUser = matchingUser;
    } else {
      this.state.currentUser = {
        id: `user-${role}-adhoc`,
        name: role === 'admin' ? 'Command Admin' : role === 'rescue' ? 'Rescue Captain' : 'Citizen User',
        phone: '+91 90000 00000',
        email: `${role}@resqbridge.gov.in`,
        role
      };
    }
    this.saveState();
  }

  public setActiveEmergency(id: string) {
    this.state.activeEmergencyId = id;
    this.saveState();
  }

  public setCommunicationMode(mode: NetworkSimulationMode) {
    this.state.communicationConfig.communicationMode = mode;
    this.saveState();
  }

  public updateCommunicationConfig(config: Partial<EmergencyCommunicationConfig>) {
    this.state.communicationConfig = {
      ...this.state.communicationConfig,
      ...config
    };
    this.saveState();
  }

  /**
   * Evaluates current active communication path based on simulation settings or actual browser connection
   */
  public getEffectiveCommunicationMethod(): CommunicationMethod {
    const mode = this.state.communicationConfig.communicationMode;
    if (mode === 'force_internet') return 'internet';
    if (mode === 'force_sms') return 'sms';
    if (mode === 'force_offline') return 'offline_sync';

    // Auto-detect using browser navigator.onLine
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return 'sms';
    }
    return 'internet';
  }

  public createEmergency(params: {
    userId: string;
    userName: string;
    userPhone: string;
    emergencyType: EmergencyRequest['emergencyType'];
    severity: EmergencyRequest['severity'];
    peopleCount: number;
    injuredCount: number;
    childrenCount: number;
    elderlyCount: number;
    vulnerableCount: number;
    description?: string;
    latitude: number;
    longitude: number;
    address: string;
    preferredMethod?: CommunicationMethod;
  }): EmergencyRequest {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Format ID according to specification: RB-2026-XXXXX
    const sequenceNumber = 420 + this.state.emergencies.length + 1;
    const id = `RB-${now.getFullYear()}-${String(sequenceNumber).padStart(5, '0')}`;

    const priorityBreakdown: PriorityBreakdown = calculatePriorityScore({
      emergencyType: params.emergencyType,
      severity: params.severity,
      peopleCount: params.peopleCount,
      injuredCount: params.injuredCount,
      childrenCount: params.childrenCount,
      elderlyCount: params.elderlyCount,
      vulnerableCount: params.vulnerableCount,
      createdAt: now.toISOString()
    });

    const commMethod = params.preferredMethod || this.getEffectiveCommunicationMethod();
    const isOffline = commMethod === 'offline_sync';

    let initialTimelineDesc = `Citizen reported ${params.emergencyType} affecting ${params.peopleCount} individuals via direct internet connection.`;
    if (commMethod === 'sms') {
      initialTimelineDesc = `Internet link unavailable. Transmitted via cellular SMS Fallback to Rescue Gateway (${this.state.communicationConfig.rescueTeamSMSNumber}).`;
    } else if (isOffline) {
      initialTimelineDesc = `Total communication blackout. Encrypted and saved to client IndexedDB offline queue pending channel restoration.`;
    }

    const newTimeline: TimelineEvent[] = [
      {
        id: `tl-${Date.now()}-1`,
        timestamp: now.toISOString(),
        displayTime: timeString,
        action: commMethod === 'sms' 
          ? 'Emergency Transmitted via SMS Fallback' 
          : isOffline 
          ? 'Emergency Saved to Offline Queue' 
          : 'Emergency Transmitted via Internet',
        description: initialTimelineDesc,
        actorRole: 'citizen',
        actorName: params.userName
      },
      {
        id: `tl-${Date.now()}-2`,
        timestamp: now.toISOString(),
        displayTime: timeString,
        action: 'Location Received',
        description: `Captured coordinates (${params.latitude.toFixed(4)}, ${params.longitude.toFixed(4)}): ${params.address}.`,
        actorRole: 'System',
        actorName: 'ResQBridge Core'
      },
      {
        id: `tl-${Date.now()}-3`,
        timestamp: now.toISOString(),
        displayTime: timeString,
        action: 'Priority Calculated Locally',
        description: `Calculated Priority Score ${priorityBreakdown.normalizedScore}/100 (${priorityBreakdown.category} Priority).`,
        actorRole: 'System',
        actorName: 'Priority Engine'
      }
    ];

    const newEmergency: EmergencyRequest = {
      ...params,
      id,
      priorityScore: priorityBreakdown.normalizedScore,
      priorityBreakdown,
      status: 'Request Received',
      communicationMethod: commMethod,
      smsStatus: commMethod === 'sms' ? 'SMS READY' : isOffline ? 'WAITING FOR CONNECTION' : undefined,
      isOfflinePending: isOffline,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      timeline: newTimeline
    };

    // If completely offline, save to client IndexedDB queue
    if (isOffline) {
      saveEmergencyOffline(newEmergency).catch(err => console.error('Failed to save to IndexedDB', err));
    }

    // Prepend to emergencies list
    this.state.emergencies = [newEmergency, ...this.state.emergencies];
    this.state.activeEmergencyId = id;
    this.saveState();
    return newEmergency;
  }

  public confirmSmsSent(emergencyId: string) {
    const emg = this.state.emergencies.find(e => e.id === emergencyId);
    if (!emg) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    emg.communicationMethod = 'sms';
    emg.smsStatus = 'SMS SENT';
    emg.isOfflinePending = false;
    emg.smsSentAt = now.toISOString();
    emg.updatedAt = now.toISOString();

    emg.timeline.push({
      id: `tl-${Date.now()}`,
      timestamp: now.toISOString(),
      displayTime: timeStr,
      action: 'SMS Delivery Verified',
      description: `Emergency payload dispatched to rescue coordination number (${this.state.communicationConfig.rescueTeamSMSNumber}).`,
      actorRole: 'citizen',
      actorName: emg.userName
    });

    this.saveState();
  }

  public markSmsFailed(emergencyId: string) {
    const emg = this.state.emergencies.find(e => e.id === emergencyId);
    if (!emg) return;

    emg.smsStatus = 'SMS FAILED';
    emg.isOfflinePending = true;
    emg.communicationMethod = 'offline_sync';
    this.state.failedSmsCount += 1;

    saveEmergencyOffline(emg).catch(err => console.error(err));
    this.saveState();
  }

  public async syncPendingEmergency(emergencyId: string) {
    const emg = this.state.emergencies.find(e => e.id === emergencyId);
    if (!emg) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    emg.isOfflinePending = false;
    emg.communicationMethod = 'offline_sync';
    emg.smsStatus = undefined;
    emg.updatedAt = now.toISOString();

    emg.timeline.push({
      id: `tl-${Date.now()}`,
      timestamp: now.toISOString(),
      displayTime: timeStr,
      action: 'Offline Incident Synchronized',
      description: 'Communication channel restored. Emergency successfully synchronized into active dispatch queue.',
      actorRole: 'System',
      actorName: 'ResQBridge Sync Engine'
    });

    await removeEmergencyFromQueue(emergencyId);
    this.saveState();
  }

  public async syncAllOfflineEmergencies() {
    try {
      const pending = await getPendingEmergencies();
      for (const item of pending) {
        await this.syncPendingEmergency(item.id);
      }
    } catch (e) {
      console.error('Offline queue sync error', e);
    }
  }

  private async checkAndSyncOfflineQueue() {
    try {
      const pending = await getPendingEmergencies();
      if (pending.length > 0 && this.state.communicationConfig.communicationMode !== 'force_offline') {
        await this.syncAllOfflineEmergencies();
      }
    } catch (e) {
      // ignore
    }
  }

  public getCommunicationStats(): CommunicationStats {
    const internetRequests = this.state.emergencies.filter(e => e.communicationMethod === 'internet').length;
    const smsRequests = this.state.emergencies.filter(e => e.communicationMethod === 'sms').length;
    const offlinePending = this.state.emergencies.filter(e => e.isOfflinePending).length;
    const successfulSubmissions = this.state.emergencies.filter(e => !e.isOfflinePending).length;

    return {
      internetRequests,
      smsRequests,
      offlinePending,
      failedAttempts: this.state.failedSmsCount,
      successfulSubmissions
    };
  }

  public assignRescueTeam(emergencyId: string, teamId: string) {
    const emergency = this.state.emergencies.find(e => e.id === emergencyId);
    const team = this.state.rescueTeams.find(t => t.id === teamId);
    if (!emergency || !team) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    emergency.assignedRescueTeamId = team.id;
    emergency.assignedRescueTeamName = team.teamName;
    emergency.status = 'Rescue Team Assigned';
    emergency.updatedAt = now.toISOString();

    team.availability = false;
    team.status = 'Dispatched';
    team.assignedEmergencyId = emergencyId;

    emergency.timeline.push({
      id: `tl-${Date.now()}`,
      timestamp: now.toISOString(),
      displayTime: timeStr,
      action: 'Rescue Team Assigned',
      description: `${team.teamName} (Lead: ${team.leadName}) dispatched to scene.`,
      actorRole: 'rescue',
      actorName: team.teamName
    });

    this.saveState();
  }

  public updateEmergencyStatus(
    emergencyId: string, 
    newStatus: EmergencyStatus, 
    actorRole: UserRole, 
    actorName: string, 
    note?: string
  ) {
    const emergency = this.state.emergencies.find(e => e.id === emergencyId);
    if (!emergency) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    emergency.status = newStatus;
    emergency.updatedAt = now.toISOString();

    if (emergency.assignedRescueTeamId) {
      const team = this.state.rescueTeams.find(t => t.id === emergency.assignedRescueTeamId);
      if (team) {
        if (newStatus === 'Rescue Team On the Way') {
          team.status = 'Dispatched';
        } else if (newStatus === 'Arrived') {
          team.status = 'On Scene';
        } else if (newStatus === 'Transporting to Shelter') {
          team.status = 'Transporting';
        } else if (newStatus === 'Resolved') {
          team.status = 'Available';
          team.availability = true;
          team.assignedEmergencyId = undefined;
        }
      }
    }

    emergency.timeline.push({
      id: `tl-${Date.now()}`,
      timestamp: now.toISOString(),
      displayTime: timeStr,
      action: `Status: ${newStatus}`,
      description: note || `Emergency status progressed to "${newStatus}".`,
      actorRole,
      actorName
    });

    this.saveState();
  }

  public selectShelter(emergencyId: string, shelterId: string) {
    const emergency = this.state.emergencies.find(e => e.id === emergencyId);
    const shelter = this.state.shelters.find(s => s.id === shelterId);
    if (!emergency || !shelter) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    emergency.selectedShelterId = shelter.id;
    emergency.selectedShelterName = shelter.name;
    emergency.updatedAt = now.toISOString();

    emergency.timeline.push({
      id: `tl-${Date.now()}`,
      timestamp: now.toISOString(),
      displayTime: timeStr,
      action: 'Shelter Selected',
      description: `Matched with ${shelter.name} (${shelter.availableCapacity} available spaces, Status: ${shelter.safetyStatus}).`,
      actorRole: 'rescue',
      actorName: 'Rescue Coordinator'
    });

    this.saveState();
  }

  public completeTransportAndResolve(emergencyId: string, shelterId: string) {
    const emergency = this.state.emergencies.find(e => e.id === emergencyId);
    const shelter = this.state.shelters.find(s => s.id === shelterId);
    if (!emergency) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (shelter) {
      const addedPeople = emergency.peopleCount || 1;
      shelter.occupiedCapacity += addedPeople;
      shelter.availableCapacity = Math.max(0, shelter.totalCapacity - shelter.occupiedCapacity);

      const occupancyRate = shelter.occupiedCapacity / shelter.totalCapacity;
      if (occupancyRate >= 1) {
        shelter.safetyStatus = 'Full';
      } else if (occupancyRate >= 0.85) {
        shelter.safetyStatus = 'Nearly Full';
      }
    }

    if (emergency.assignedRescueTeamId) {
      const team = this.state.rescueTeams.find(t => t.id === emergency.assignedRescueTeamId);
      if (team) {
        team.status = 'Available';
        team.availability = true;
        team.assignedEmergencyId = undefined;
      }
    }

    emergency.status = 'Resolved';
    emergency.updatedAt = now.toISOString();

    emergency.timeline.push({
      id: `tl-${Date.now()}-1`,
      timestamp: now.toISOString(),
      displayTime: timeStr,
      action: 'Shelter Reached & People Accommodated',
      description: `All ${emergency.peopleCount} citizens safely transferred into ${shelter ? shelter.name : 'designated shelter'}. Shelter capacity updated.`,
      actorRole: 'rescue',
      actorName: emergency.assignedRescueTeamName || 'Rescue Team'
    });

    emergency.timeline.push({
      id: `tl-${Date.now()}-2`,
      timestamp: now.toISOString(),
      displayTime: timeStr,
      action: 'Emergency Resolved',
      description: 'Rescue mission successfully completed. Team made available for next priority dispatch.',
      actorRole: 'System',
      actorName: 'ResQBridge Core'
    });

    this.saveState();
  }

  public addShelter(shelter: Omit<Shelter, 'id' | 'lastVerified'>) {
    const id = `shelter-${Date.now()}`;
    const newShelter: Shelter = {
      ...shelter,
      id,
      lastVerified: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };
    this.state.shelters = [...this.state.shelters, newShelter];
    this.saveState();
    return newShelter;
  }

  public updateShelter(updated: Shelter) {
    const idx = this.state.shelters.findIndex(s => s.id === updated.id);
    if (idx >= 0) {
      this.state.shelters[idx] = {
        ...updated,
        lastVerified: new Date().toISOString().replace('T', ' ').slice(0, 16)
      };
      this.saveState();
    }
  }

  public deleteShelter(shelterId: string) {
    this.state.shelters = this.state.shelters.filter(s => s.id !== shelterId);
    this.saveState();
  }

  public toggleShelterSafety(shelterId: string, status: ShelterSafetyStatus) {
    const shelter = this.state.shelters.find(s => s.id === shelterId);
    if (shelter) {
      shelter.safetyStatus = status;
      shelter.lastVerified = new Date().toISOString().replace('T', ' ').slice(0, 16);
      this.saveState();
    }
  }

  public setShelterVerification(shelterId: string, status: Shelter['verificationStatus']) {
    const shelter = this.state.shelters.find(s => s.id === shelterId);
    if (shelter) {
      shelter.verificationStatus = status;
      shelter.lastVerified = new Date().toISOString().replace('T', ' ').slice(0, 16);
      this.saveState();
    }
  }

  public addUrgentRequirement(req: Omit<UrgentRequirement, 'id' | 'reportedTime'>) {
    const newReq: UrgentRequirement = {
      ...req,
      id: `UR-${Date.now().toString().slice(-4)}`,
      reportedTime: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };
    this.state.urgentRequirements = [newReq, ...this.state.urgentRequirements];
    this.saveState();
    return newReq;
  }

  public updateRequirementStatus(id: string, status: UrgentRequirement['status']) {
    const req = this.state.urgentRequirements.find(r => r.id === id);
    if (req) {
      req.status = status;
      this.saveState();
    }
  }

  public deleteRequirement(id: string) {
    this.state.urgentRequirements = this.state.urgentRequirements.filter(r => r.id !== id);
    this.saveState();
  }

  public resetToDemoData() {
    this.state = {
      currentUser: DEMO_USERS[0],
      emergencies: INITIAL_EMERGENCIES,
      rescueTeams: INITIAL_RESCUE_TEAMS,
      shelters: INITIAL_SHELTERS,
      urgentRequirements: INITIAL_URGENT_REQUIREMENTS,
      activeEmergencyId: INITIAL_EMERGENCIES[0].id,
      communicationConfig: {
        rescueTeamSMSNumber: '+91 94400 11222',
        smsProvider: 'textlocal',
        smsApiStatus: 'Connected',
        lastSMSTest: '2026-09-08 21:45',
        communicationMode: 'auto'
      },
      failedSmsCount: 1
    };
    this.saveState();
  }
}

export const store = new ResQBridgeStore();
