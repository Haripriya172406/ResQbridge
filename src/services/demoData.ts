import { EmergencyRequest, RescueTeam, Shelter, UrgentRequirement, User } from '../types';
import { calculatePriorityScore } from './priorityCalculator';

// Base region: Coastal Disaster Response Sector (Vijayawada / Krishna Basin Flood Zone)
// Latitude ~16.505, Longitude ~80.645

export const DEMO_USERS: User[] = [
  {
    id: 'user-c1',
    name: 'Ramesh Varma',
    phone: '+91 98480 12345',
    email: 'ramesh.varma@example.com',
    role: 'citizen',
    location: {
      lat: 16.5185,
      lng: 80.6320,
      address: 'Plot 42, Riverview Enclave, Low-lying Sector 4'
    }
  },
  {
    id: 'user-c2',
    name: 'Lakshmi Priya',
    phone: '+91 94401 67890',
    email: 'lakshmi.p@example.com',
    role: 'citizen',
    location: {
      lat: 16.5090,
      lng: 80.6550,
      address: 'Old Town Lane 3, near Inundated Market Bridge'
    }
  },
  {
    id: 'user-c3',
    name: 'Arun Kumar',
    phone: '+91 98765 43210',
    email: 'arun.k@example.com',
    role: 'citizen',
    location: {
      lat: 16.5290,
      lng: 80.6180,
      address: 'North Riverside Slums, Sector 12 Block C'
    }
  },
  {
    id: 'user-rescue-1',
    name: 'Captain Vikram Rao',
    phone: '+91 98111 22334',
    email: 'ndrf.lead@resqbridge.gov.in',
    role: 'rescue',
    location: {
      lat: 16.5010,
      lng: 80.6400,
      address: 'Central Emergency Dispatch Base, Sector 1'
    }
  },
  {
    id: 'user-admin-1',
    name: 'District Collectorate Operations',
    phone: '+91 86622 99887',
    email: 'disaster.admin@resqbridge.gov.in',
    role: 'admin',
    location: {
      lat: 16.5065,
      lng: 80.6480,
      address: 'Disaster Control Command Center, Collectorate Complex'
    }
  }
];

export const INITIAL_RESCUE_TEAMS: RescueTeam[] = [
  {
    id: 'team-ndrf-01',
    teamName: 'NDRF Unit 7 - Water Rescue',
    leadName: 'Insp. Vikram Rao',
    phone: '+91 98111 22334',
    membersCount: 8,
    currentLocation: {
      lat: 16.5015,
      lng: 80.6405,
      address: 'Central Disaster Staging Depot, Sector 1'
    },
    availability: true,
    status: 'Available',
    vehicleType: 'Rescue Boat / Amphibious',
    equipment: ['Inflatable Zodiac Boats (2)', 'Life Jackets (40)', 'First Aid trauma kits', 'Satellite Radio']
  },
  {
    id: 'team-sdrf-02',
    teamName: 'SDRF Quick Response Team 3',
    leadName: 'Sub-Insp. Anita Singh',
    phone: '+91 98222 33445',
    membersCount: 6,
    currentLocation: {
      lat: 16.5210,
      lng: 80.6620,
      address: 'East Zone Fire & Emergency Station'
    },
    availability: false,
    status: 'Dispatched',
    assignedEmergencyId: 'EMG-2026-002',
    vehicleType: 'Rapid Response SUV',
    equipment: ['High-clearance 4x4', 'Chainsaws', 'Hydraulic Spreader', 'Oxygen resuscitator']
  },
  {
    id: 'team-med-03',
    teamName: 'Civil Defense Mobile Medical 01',
    leadName: 'Dr. Sandeep Patel',
    phone: '+91 98333 44556',
    membersCount: 5,
    currentLocation: {
      lat: 16.4950,
      lng: 80.6280,
      address: 'District General Hospital Logistics Yard'
    },
    availability: true,
    status: 'Available',
    vehicleType: 'Mobile Medical Ambulance',
    equipment: ['Advanced Life Support', 'Stretchers (4)', 'Triage Tent', 'Emergency Pharmaceuticals']
  },
  {
    id: 'team-eng-04',
    teamName: 'Heavy Rescue & Structural Unit 2',
    leadName: 'Eng. Rajesh Sen',
    phone: '+91 98444 55667',
    membersCount: 7,
    currentLocation: {
      lat: 16.5120,
      lng: 80.6150,
      address: 'PWD Emergency Works Depot'
    },
    availability: true,
    status: 'Available',
    vehicleType: 'Heavy Rescue Truck',
    equipment: ['Structural Shoring Gear', 'Thermal Acoustic Cameras', 'Heavy Winch', 'Flood Barrier Pumps']
  }
];

export const INITIAL_SHELTERS: Shelter[] = [
  {
    id: 'shelter-01',
    name: 'Kaveri Nagar Community Relief Center',
    latitude: 16.5125,
    longitude: 80.6495,
    address: 'Near Municipal Ground, Kaveri Nagar Main Rd',
    totalCapacity: 500,
    occupiedCapacity: 310,
    availableCapacity: 190,
    safetyStatus: 'Safe',
    verificationStatus: 'Verified',
    facilities: ['Clean Drinking Water', 'Community Kitchen', '24/7 Medical Post', 'Backup Generator', 'Sanitation Blocks'],
    contactPerson: 'M. Sudhakar (Warden)',
    contactPhone: '+91 94411 22331',
    lastVerified: '2026-09-08 20:30',
    accessibilityNotes: 'Ground floor wheelchair ramp available, flood-resilient elevated plinth.'
  },
  {
    id: 'shelter-02',
    name: 'District Indoor Stadium Relief Camp',
    latitude: 16.4980,
    longitude: 80.6420,
    address: 'Stadium Road, Officers Colony, Sector 2',
    totalCapacity: 800,
    occupiedCapacity: 755,
    availableCapacity: 45,
    safetyStatus: 'Nearly Full',
    verificationStatus: 'Verified',
    facilities: ['Separate Women/Children dorms', 'Full Medical Bay', 'Ration Distribution Point', 'Security Patrol'],
    contactPerson: 'S. K. Joshi (Camp Officer)',
    contactPhone: '+91 94422 33442',
    lastVerified: '2026-09-08 21:15',
    accessibilityNotes: 'Wide ramps, handicap-accessible washrooms, high ceiling natural ventilation.'
  },
  {
    id: 'shelter-03',
    name: 'St. Teresa Higher Secondary School',
    latitude: 16.5260,
    longitude: 80.6380,
    address: 'Cathedral Road, High Ground Zone',
    totalCapacity: 400,
    occupiedCapacity: 95,
    availableCapacity: 305,
    safetyStatus: 'Safe',
    verificationStatus: 'Verified',
    facilities: ['Classroom Dormitories', 'Kitchen Facility', 'First Aid Center', 'Solar Backup'],
    contactPerson: 'Sister Philomena',
    contactPhone: '+91 94433 44553',
    lastVerified: '2026-09-08 19:45',
    accessibilityNotes: 'Elevated two-story campus. First floor reserved for elderly and disabled evacuees.'
  },
  {
    id: 'shelter-04',
    name: 'Godavari Apex Polytechnic Pavilion',
    latitude: 16.5340,
    longitude: 80.6550,
    address: 'Ring Road Bypass, East Cantonment',
    totalCapacity: 600,
    occupiedCapacity: 120,
    availableCapacity: 480,
    safetyStatus: 'Safe',
    verificationStatus: 'Verified',
    facilities: ['Large Open Hangar', 'Heavy Water Purifier', 'Ambulance Bay', 'Helipad Access nearby'],
    contactPerson: 'Prof. K. N. Murthy',
    contactPhone: '+91 94444 55664',
    lastVerified: '2026-09-08 18:00',
    accessibilityNotes: 'Direct wide-road access for transport buses and heavy trucks.'
  },
  {
    id: 'shelter-05',
    name: 'Riverfront Zilla Parishad School',
    latitude: 16.5160,
    longitude: 80.6260,
    address: 'Embankment Road, Old Bund Sector',
    totalCapacity: 300,
    occupiedCapacity: 280,
    availableCapacity: 20,
    safetyStatus: 'Unsafe',
    verificationStatus: 'Needs Reverification',
    facilities: ['Drinking Water Tank', 'Basic First Aid'],
    contactPerson: 'B. Prabhakar',
    contactPhone: '+91 94455 66775',
    lastVerified: '2026-09-08 14:10',
    accessibilityNotes: 'WARNING: Embankment seepage detected nearby. Sheltering paused pending civil inspection.'
  },
  {
    id: 'shelter-06',
    name: 'Hilltop Forest Lodge Relief Station',
    latitude: 16.5450,
    longitude: 80.6120,
    address: 'Kondapalli Ridge Approach Road',
    totalCapacity: 250,
    occupiedCapacity: 245,
    availableCapacity: 5,
    safetyStatus: 'Nearly Full',
    verificationStatus: 'Verified',
    facilities: ['High Altitude Dry Ground', 'Emergency Kitchen', 'Communication Tower'],
    contactPerson: 'Forest Ranger Ashok',
    contactPhone: '+91 94466 77886',
    lastVerified: '2026-09-08 20:00',
    accessibilityNotes: 'Steep approach gradient. 4x4 vehicles only.'
  }
];

export const INITIAL_EMERGENCIES: EmergencyRequest[] = [
  {
    id: 'RB-2026-00421',
    userId: 'user-c1',
    userName: 'Ramesh Varma',
    userPhone: '+91 98480 12345',
    emergencyType: 'Flood',
    severity: 'Critical',
    peopleCount: 6,
    injuredCount: 2,
    childrenCount: 2,
    elderlyCount: 1,
    vulnerableCount: 1,
    description: 'Water level reached first floor roof terrace. Two elderly individuals with mobility constraints and one child shivering with fever. Urgently need boat evacuation before sunset!',
    latitude: 16.5185,
    longitude: 80.6320,
    address: 'Plot 42, Riverview Enclave, Low-lying Sector 4',
    priorityScore: 94,
    priorityBreakdown: calculatePriorityScore({
      emergencyType: 'Flood',
      severity: 'Critical',
      peopleCount: 6,
      injuredCount: 2,
      childrenCount: 2,
      elderlyCount: 1,
      vulnerableCount: 1,
      createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString()
    }),
    status: 'Request Received',
    communicationMethod: 'internet',
    createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    timeline: [
      {
        id: 'tl-101',
        timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
        displayTime: '09:25 PM',
        action: 'Emergency SOS Triggered',
        description: 'Citizen activated emergency SOS distress signal from mobile terminal via direct internet link.',
        actorRole: 'citizen',
        actorName: 'Ramesh Varma'
      },
      {
        id: 'tl-102',
        timestamp: new Date(Date.now() - 34 * 60 * 1000).toISOString(),
        displayTime: '09:26 PM',
        action: 'GPS Telemetry Acquired',
        description: 'High-precision coordinates (16.5185, 80.6320) confirmed via emergency beacon.',
        actorRole: 'System',
        actorName: 'ResQBridge Core'
      },
      {
        id: 'tl-103',
        timestamp: new Date(Date.now() - 33 * 60 * 1000).toISOString(),
        displayTime: '09:27 PM',
        action: 'Triage Priority Computed',
        description: 'Calculated Priority Score 94 (CRITICAL) due to flood submersion, 2 injured, 1 elderly, 2 children.',
        actorRole: 'System',
        actorName: 'Priority Engine'
      }
    ]
  },
  {
    id: 'RB-2026-00422',
    userId: 'user-c2',
    userName: 'Lakshmi Priya',
    userPhone: '+91 94401 67890',
    emergencyType: 'Building Collapse',
    severity: 'High',
    peopleCount: 4,
    injuredCount: 1,
    childrenCount: 1,
    elderlyCount: 0,
    vulnerableCount: 0,
    description: 'Portion of masonry wall cracked under heavy storm surges. Trapped in outer courtyard with rubble blocking main gate.',
    latitude: 16.5090,
    longitude: 80.6550,
    address: 'Old Town Lane 3, near Inundated Market Bridge',
    priorityScore: 78,
    priorityBreakdown: calculatePriorityScore({
      emergencyType: 'Building Collapse',
      severity: 'High',
      peopleCount: 4,
      injuredCount: 1,
      childrenCount: 1,
      elderlyCount: 0,
      vulnerableCount: 0,
      createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString()
    }),
    status: 'Rescue Team On the Way',
    communicationMethod: 'sms',
    smsStatus: 'SMS SENT',
    smsSentAt: new Date(Date.now() - 24 * 60 * 1000).toISOString(),
    assignedRescueTeamId: 'team-sdrf-02',
    assignedRescueTeamName: 'SDRF Quick Response Team 3',
    selectedShelterId: 'shelter-01',
    selectedShelterName: 'Kaveri Nagar Community Relief Center',
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    timeline: [
      {
        id: 'tl-201',
        timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
        displayTime: '09:35 PM',
        action: 'SMS Fallback Transmitted',
        description: 'Local tower internet offline. Transmitted via cellular SMS Fallback to Rescue Gateway (+91 94400 11222).',
        actorRole: 'citizen',
        actorName: 'Lakshmi Priya'
      },
      {
        id: 'tl-202',
        timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
        displayTime: '09:40 PM',
        action: 'Team Assigned',
        description: 'SDRF Quick Response Team 3 retrieved SMS ID RB-2026-00422 and initiated rapid vehicle rollout.',
        actorRole: 'rescue',
        actorName: 'Sub-Insp. Anita Singh'
      },
      {
        id: 'tl-203',
        timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        displayTime: '09:50 PM',
        action: 'Safe Route Selected',
        description: 'Navigating via Canal Bund Road (Safe, ETA 8 mins). Market Bridge bypass taken.',
        actorRole: 'rescue',
        actorName: 'SDRF Quick Response Team 3'
      }
    ]
  },
  {
    id: 'RB-2026-00423',
    userId: 'user-c3',
    userName: 'Arun Kumar',
    userPhone: '+91 98765 43210',
    emergencyType: 'Medical Emergency',
    severity: 'Medium',
    peopleCount: 3,
    injuredCount: 1,
    childrenCount: 0,
    elderlyCount: 1,
    vulnerableCount: 0,
    description: 'Diabetic patient exhausted insulin vials due to inundated local pharmacy. Needs non-emergency medical supply & safe transit.',
    latitude: 16.5290,
    longitude: 80.6180,
    address: 'North Riverside Slums, Sector 12 Block C',
    priorityScore: 52,
    priorityBreakdown: calculatePriorityScore({
      emergencyType: 'Medical Emergency',
      severity: 'Medium',
      peopleCount: 3,
      injuredCount: 1,
      childrenCount: 0,
      elderlyCount: 1,
      vulnerableCount: 0,
      createdAt: new Date(Date.now() - 50 * 60 * 1000).toISOString()
    }),
    status: 'Request Received',
    communicationMethod: 'internet',
    createdAt: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
    timeline: [
      {
        id: 'tl-301',
        timestamp: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
        displayTime: '09:10 PM',
        action: 'Emergency Logged',
        description: 'Medical refill and evacuation request logged.',
        actorRole: 'citizen',
        actorName: 'Arun Kumar'
      }
    ]
  },
  {
    id: 'RB-2026-00424',
    userId: 'user-c4',
    userName: 'Suresh Babu',
    userPhone: '+91 99887 76655',
    emergencyType: 'Flood',
    severity: 'Low',
    peopleCount: 2,
    injuredCount: 0,
    childrenCount: 0,
    elderlyCount: 0,
    vulnerableCount: 0,
    description: 'Water surrounding building perimeter at ankle depth. Requesting advisory on when to move to shelter.',
    latitude: 16.5050,
    longitude: 80.6650,
    address: 'East Bypass Residential Colony, Sector 8',
    priorityScore: 32,
    priorityBreakdown: calculatePriorityScore({
      emergencyType: 'Flood',
      severity: 'Low',
      peopleCount: 2,
      injuredCount: 0,
      childrenCount: 0,
      elderlyCount: 0,
      vulnerableCount: 0,
      createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString()
    }),
    status: 'Request Received',
    communicationMethod: 'offline_sync',
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    timeline: [
      {
        id: 'tl-401',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        displayTime: '09:45 PM',
        action: 'Offline Sync Reconciled',
        description: 'Distress signal queued during signal loss was automatically synchronized upon network reconnection.',
        actorRole: 'System',
        actorName: 'ResQBridge Sync Engine'
      }
    ]
  }
];

export const INITIAL_URGENT_REQUIREMENTS: UrgentRequirement[] = [
  {
    id: 'UR-101',
    item: 'Packaged Drinking Water (20L Cans)',
    quantity: '350 Cans',
    location: 'District Indoor Stadium Relief Camp',
    priority: 'Urgent',
    status: 'Urgent',
    reportedTime: '2026-09-08 20:15',
    category: 'Food & Water',
    notes: 'Municipal supply line severed due to flood silting. Urgent replenishment required.'
  },
  {
    id: 'UR-102',
    item: 'Inflatable Rescue Boats & Outboard Motors',
    quantity: '4 Units',
    location: 'Central Disaster Staging Depot, Sector 1',
    priority: 'Urgent',
    status: 'In Progress',
    reportedTime: '2026-09-08 19:40',
    category: 'Rescue Gear',
    notes: 'Requested by NDRF command for low-lying delta operations.'
  },
  {
    id: 'UR-103',
    item: 'Ready-to-Eat High Protein Meal Packets',
    quantity: '1,200 Packets',
    location: 'Kaveri Nagar Community Relief Center',
    priority: 'High',
    status: 'In Progress',
    reportedTime: '2026-09-08 21:00',
    category: 'Food & Water',
    notes: 'For distribution to newly evacuated families and children.'
  },
  {
    id: 'UR-104',
    item: 'Pediatric Antibiotics, ORS & Insulin Vials',
    quantity: '150 Kits',
    location: 'St. Teresa Higher Secondary School',
    priority: 'Urgent',
    status: 'Urgent',
    reportedTime: '2026-09-08 21:10',
    category: 'Medical',
    notes: 'Child health camp requires immediate stocks.'
  },
  {
    id: 'UR-105',
    item: 'Heavy Duty Diesel Generators (45 kVA)',
    quantity: '2 Units',
    location: 'Godavari Apex Polytechnic Pavilion',
    priority: 'Normal',
    status: 'Fulfilled',
    reportedTime: '2026-09-08 17:30',
    category: 'Logistics',
    notes: 'Installed and supplying stable power to oxygen concentrators.'
  },
  {
    id: 'UR-106',
    item: 'Waterproof Tarpaulin Sheets & Ground Mats',
    quantity: '500 Sets',
    location: 'Kaveri Nagar Community Relief Center',
    priority: 'High',
    status: 'Urgent',
    reportedTime: '2026-09-08 21:30',
    category: 'Sanitation & Shelter',
    notes: 'Additional bedding for incoming rescued citizens.'
  }
];

// Realistic route options with hazard classifications
export interface DemoRouteOption {
  id: string;
  name: string;
  distanceKm: number;
  etaMinutes: number;
  status: 'Safe' | 'Partially Blocked' | 'Flooded/Blocked';
  description: string;
  waypoints: [number, number][];
}

export function generateRouteOptions(fromLat: number, fromLng: number, toLat: number, toLng: number): DemoRouteOption[] {
  // Generate 3 plausible route paths between points
  const midLat = (fromLat + toLat) / 2;
  const midLng = (fromLng + toLng) / 2;

  // Approximate distance
  const dLat = (toLat - fromLat) * 111;
  const dLng = (toLng - fromLng) * 111 * Math.cos((fromLat * Math.PI) / 180);
  const directDist = Math.sqrt(dLat * dLat + dLng * dLng);
  const baseKm = Math.max(1.2, parseFloat(directDist.toFixed(1)));

  return [
    {
      id: 'route-1-safe',
      name: 'Route Alpha (Elevated Ring Road)',
      distanceKm: parseFloat((baseKm * 1.15).toFixed(1)),
      etaMinutes: Math.max(4, Math.round(baseKm * 2.8)),
      status: 'Safe',
      description: 'Main arterial highway. Cleared by municipal patrol, completely free of water stagnation.',
      waypoints: [
        [fromLat, fromLng],
        [fromLat + (toLat - fromLat) * 0.35 + 0.003, fromLng + (toLng - fromLng) * 0.25 - 0.004],
        [fromLat + (toLat - fromLat) * 0.70 + 0.004, fromLng + (toLng - fromLng) * 0.75 - 0.002],
        [toLat, toLng]
      ]
    },
    {
      id: 'route-2-caution',
      name: 'Route Bravo (Canal Embankment Road)',
      distanceKm: parseFloat((baseKm * 1.0).toFixed(1)),
      etaMinutes: Math.max(6, Math.round(baseKm * 3.6)),
      status: 'Partially Blocked',
      description: 'Narrow lane with 15cm standing water in underpass. High-clearance vehicles and boats only.',
      waypoints: [
        [fromLat, fromLng],
        [midLat - 0.002, midLng + 0.003],
        [toLat, toLng]
      ]
    },
    {
      id: 'route-3-blocked',
      name: 'Route Charlie (Old Market Subway)',
      distanceKm: parseFloat((baseKm * 0.9).toFixed(1)),
      etaMinutes: 25,
      status: 'Flooded/Blocked',
      description: 'HAZARD: 1.2m deep fast-moving torrent under bridge. Inundated and impassable.',
      waypoints: [
        [fromLat, fromLng],
        [midLat + 0.005, midLng - 0.004],
        [toLat, toLng]
      ]
    }
  ];
}
