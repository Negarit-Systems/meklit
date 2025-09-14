// --- Existing types for Activity reports ---
export interface ActivityEngagementData {
  activityName: string;
  engagementCounts: Record<string, number>;
}

export interface ClassActivityEngagement {
  classId: string;
  activities: ActivityEngagementData[];
}

// --- Existing types for the main 'reports' service ---
export interface SummaryReportData {
  id: string; // Can be a classId OR a centerId
  averageNapDuration: number;
  totalIncidents: number;
}

export interface ComparisonData {
  id: string; // Can be a classId OR a centerId
  averageNapDuration: number;
  totalIncidents: number;
}

// --- CORRECTED TYPES FOR THE 'daily-log' SERVICE ---

// For the /daily-logs/trend-over-time endpoint
// This now matches the object shape from your daily-log.ts service
export interface TrendData {
  date: string;
  averageNapDuration: number;
  napCount: number;
  mealStatusCounts: Record<string, number>;
  totalMeals: number;
  moodCounts: Record<string, number>;
  totalMoods: number;
  otherTypeCounts: Record<string, number>;
}

// For the /daily-logs/staff-performance endpoint
// This now includes the missing 'logsByType' property
export interface StaffPerformance {
  staffId: string;
  totalLogs: number;
  logsByType: Record<string, number>; // e.g., { "Nap": 10, "Meal": 25 }
}

// For the /daily-logs/comparative endpoint
export interface ComparativeData {
  id: string; // The ID of the item being grouped (e.g., a classId or centerId)
  metric: number; // The calculated metric for that group
}

// --- Existing types from the 'health-record' service ---

export interface IncidentFrequencyData {
  type: string;
  count: number;
}

export interface TimelineEvent {
  id: string;
  childId: string;
  timestamp: any;
  type: string;
  incident?: string;
  medication?: string;
  actionTaken: string;
}

export interface ChildHealthProfile {
  childId: string;
  totalIncidents: number;
  totalMedications: number;
  incidentDistribution: Record<string, number>;
  medicationDistribution: Record<string, number>;
  actionDistribution: Record<string, number>;
  recentEntries: TimelineEvent[];
}

export interface StaffAnalysis {
  staffId: string;
  totalRecords: number;
  incidentsReported: number;
  medicationsReported: number;
}

export interface ChildComparisonData {
  childId: string;
  totalIncidents: number;
  totalNapDuration: number;
  averageNapDuration: number;
}