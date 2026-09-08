export type UserRole = 'citizen' | 'rescue' | 'admin';

export type EmergencyType = 
  | 'Flood'
  | 'Fire'
  | 'Earthquake'
  | 'Cyclone'
  | 'Landslide'
  | 'Medical Emergency'
  | 'Building Collapse'
  | 'Other';

export type SeverityLevel = 'Critical' | 'High' | 'Medium' | 'Low';

export type EmergencyStatus = 
  | 'Request Received'
  | 'Rescue Team Assigned'
  | 'Rescue Team On the Way'
  | 'Arrived'
  | 'Transporting to Shelter'
  | 'Resolved';

export type PriorityCategory = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type CommunicationMethod = 'internet' | 'sms' | 'offline_sync';

export type SMSStatus = 'SMS READY' | 'SMS SENT' | 'SMS FAILED' | 'WAITING FOR CONNECTION';

export type NetworkSimulationMode = 'auto' | 'force_internet' | 'force_sms' | 'force_offline';

export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: UserRole;
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
}

export interface PriorityBreakdown {
  baseSeverityScore: number;
  peopleScore: number;
  injuredScore: number;
  childrenScore: number;
  elderlyScore: number;
  vulnerableScore: number;
  waitingTimeScore: number;
  rawTotal: number;
  normalizedScore: number;
  category: PriorityCategory;
}

export interface TimelineEvent {
  id: string;
  timestamp: string; // ISO string
  displayTime: string; // e.g. "10:21 AM"
  action: string;
  description: string;
  actorRole: UserRole | 'System';
  actorName: string;
}

export interface EmergencyRequest {
  id: string; // e.g. RB-2026-00421
  userId: string;
  userName: string;
  userPhone: string;
  emergencyType: EmergencyType;
  severity: SeverityLevel;
  peopleCount: number;
  injuredCount: number;
  childrenCount: number;
  elderlyCount: number;
  vulnerableCount: number;
  description?: string;
  latitude: number;
  longitude: number;
  address: string;
  priorityScore: number;
  priorityBreakdown: PriorityBreakdown;
  status: EmergencyStatus;
  communicationMethod: CommunicationMethod;
  smsStatus?: SMSStatus;
  isOfflinePending?: boolean;
  smsSentAt?: string;
  assignedRescueTeamId?: string;
  assignedRescueTeamName?: string;
  selectedShelterId?: string;
  selectedShelterName?: string;
  createdAt: string;
  updatedAt: string;
  timeline: TimelineEvent[];
}

export type TeamStatus = 'Available' | 'Dispatched' | 'On Scene' | 'Transporting' | 'Offline';

export interface RescueTeam {
  id: string;
  teamName: string;
  leadName: string;
  phone: string;
  membersCount: number;
  currentLocation: {
    lat: number;
    lng: number;
    address: string;
  };
  availability: boolean;
  status: TeamStatus;
  assignedEmergencyId?: string;
  vehicleType: 'Rescue Boat / Amphibious' | 'Rapid Response SUV' | 'Heavy Rescue Truck' | 'Mobile Medical Ambulance';
  equipment: string[];
}

export type ShelterSafetyStatus = 'Safe' | 'Nearly Full' | 'Full' | 'Unsafe';
export type ShelterVerificationStatus = 'Verified' | 'Pending Verification' | 'Needs Reverification' | 'Unsafe';

export interface Shelter {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  totalCapacity: number;
  occupiedCapacity: number;
  availableCapacity: number;
  safetyStatus: ShelterSafetyStatus;
  verificationStatus: ShelterVerificationStatus;
  facilities: string[];
  contactPerson: string;
  contactPhone: string;
  lastVerified: string;
  accessibilityNotes?: string;
}

export type RequirementPriority = 'Urgent' | 'High' | 'Normal';
export type RequirementStatus = 'Urgent' | 'In Progress' | 'Fulfilled';

export interface UrgentRequirement {
  id: string;
  item: string;
  quantity: string;
  location: string;
  priority: RequirementPriority;
  status: RequirementStatus;
  reportedTime: string;
  category: 'Food & Water' | 'Medical' | 'Rescue Gear' | 'Sanitation & Shelter' | 'Logistics';
  notes?: string;
}

export interface RouteSegment {
  id: string;
  name: string;
  fromLat: number;
  fromLng: number;
  toLat: number;
  toLng: number;
  distanceKm: number;
  estimatedMinutes: number;
  status: 'Safe' | 'Partially Blocked' | 'Flooded/Blocked';
  conditionNote: string;
  waypoints: [number, number][];
}

export interface EmergencyCommunicationConfig {
  rescueTeamSMSNumber: string;
  smsProvider: 'twilio' | 'aws_sns' | 'textlocal' | 'custom_gateway';
  smsApiStatus: 'Connected' | 'Simulation Active' | 'Offline';
  lastSMSTest?: string;
  communicationMode: NetworkSimulationMode;
}

export interface CommunicationStats {
  internetRequests: number;
  smsRequests: number;
  offlinePending: number;
  failedAttempts: number;
  successfulSubmissions: number;
}
