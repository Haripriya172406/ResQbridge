import { EmergencyType, PriorityBreakdown, PriorityCategory, SeverityLevel } from '../types';

export interface PriorityInput {
  emergencyType: EmergencyType;
  severity: SeverityLevel;
  peopleCount: number;
  injuredCount: number;
  childrenCount: number;
  elderlyCount: number;
  vulnerableCount: number;
  createdAt?: string; // ISO string
}

/**
 * Calculates a transparent Priority Score (0-100) based on disaster severity,
 * casualty density, vulnerable demographics, and elapsed response wait time.
 * 
 * NOTE: This is a project/demo prioritization model designed for prototype
 * disaster coordination and is not a certified medical triage standard.
 */
export function calculatePriorityScore(input: PriorityInput): PriorityBreakdown {
  // 1. Severity Points
  let baseSeverityScore = 10;
  switch (input.severity) {
    case 'Critical':
      baseSeverityScore = 50;
      break;
    case 'High':
      baseSeverityScore = 35;
      break;
    case 'Medium':
      baseSeverityScore = 20;
      break;
    case 'Low':
      baseSeverityScore = 10;
      break;
  }

  // 2. People Count Contribution (5 pts per person, capped at 25 pts)
  const safePeople = Math.max(1, input.peopleCount || 1);
  const peopleScore = Math.min(25, safePeople * 5);

  // 3. Injured People (+10 pts per injured person, capped at 30 pts)
  const safeInjured = Math.max(0, input.injuredCount || 0);
  const injuredScore = Math.min(30, safeInjured * 10);

  // 4. Children (+5 pts per child, capped at 15 pts)
  const safeChildren = Math.max(0, input.childrenCount || 0);
  const childrenScore = Math.min(15, safeChildren * 5);

  // 5. Elderly (+5 pts per elderly, capped at 15 pts)
  const safeElderly = Math.max(0, input.elderlyCount || 0);
  const elderlyScore = Math.min(15, safeElderly * 5);

  // 6. Vulnerable / Disabilities (+7 pts per person, capped at 21 pts)
  const safeVulnerable = Math.max(0, input.vulnerableCount || 0);
  const vulnerableScore = Math.min(21, safeVulnerable * 7);

  // 7. Waiting Time Escalation (+1 pt per 3 minutes unrescued, capped at 15 pts)
  let waitingTimeScore = 0;
  if (input.createdAt) {
    const elapsedMinutes = Math.max(0, (Date.now() - new Date(input.createdAt).getTime()) / (1000 * 60));
    waitingTimeScore = Math.min(15, Math.floor(elapsedMinutes / 3));
  }

  // Raw Total Calculation
  const rawTotal = 
    baseSeverityScore + 
    peopleScore + 
    injuredScore + 
    childrenScore + 
    elderlyScore + 
    vulnerableScore + 
    waitingTimeScore;

  // Normalize to 0-100 scale:
  // Base range max possible raw sum ~ 50 + 25 + 30 + 15 + 15 + 21 + 15 = 171.
  // We normalize smoothly while ensuring high-risk emergencies reliably reach 80-100.
  // Formula: Math.min(100, Math.round(rawTotal * (100 / 125))) or clamped scale
  const normalizedScore = Math.min(100, Math.max(5, Math.round((rawTotal / 120) * 100)));

  // Categorize
  let category: PriorityCategory = 'LOW';
  if (normalizedScore >= 80) {
    category = 'CRITICAL';
  } else if (normalizedScore >= 60) {
    category = 'HIGH';
  } else if (normalizedScore >= 40) {
    category = 'MEDIUM';
  } else {
    category = 'LOW';
  }

  return {
    baseSeverityScore,
    peopleScore,
    injuredScore,
    childrenScore,
    elderlyScore,
    vulnerableScore,
    waitingTimeScore,
    rawTotal,
    normalizedScore,
    category
  };
}

export const PRIORITY_MODEL_DISCLAIMER = 
  "ResQBridge Demo Prioritization Model: Weighted calculation combining reported severity, vulnerable headcounts, and dynamic response wait times. Designed for simulated emergency triage demonstration.";
