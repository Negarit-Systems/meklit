// (This file might contain other types, you can keep them)
// For example, you might still have these, which is fine:
export interface ActivityEngagementData {
  activityName: string;
  engagementCounts: Record<string, number>;
}

export interface ClassActivityEngagement {
  classId: string;
  activities: ActivityEngagementData[];
}

// --- THIS IS THE IMPORTANT PART ---
// 1. Rename ClassReportData and change classId to a generic 'id'
export interface SummaryReportData {
  id: string; // Can be a classId OR a centerId
  averageNapDuration: number;
  totalIncidents: number;
}

// 2. Do the same for the comparison data type.
//    The old 'ClassComparisonData' is now this more generic 'ComparisonData'.
export interface ComparisonData {
  id: string; // Can be a classId OR a centerId
  averageNapDuration: number;
  totalIncidents: number;
}

// You might also have these other types from your health-record service.
// It's okay to leave them here.
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
