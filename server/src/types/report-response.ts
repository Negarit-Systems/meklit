export type TrendData = {
  date: string;
  averageNapDuration?: number;
  napCount?: number;
  mealStatusCounts?: Record<string, number>;
  totalMeals?: number;
  moodCounts?: Record<string, number>;
  totalMoods?: number;
  activityCounts?: Record<string, number>;
  totalActivities?: number;
  otherTypeCounts?: Record<string, number>;
};

export type StaffPerformance = {
  staffId: string;
  totalLogs: number;
  logsByType: Record<string, number>;
};

export type ComparativeData = {
  group: string;
  totalLogs?: number;
  mealStatuses: Record<string, number>;
  averageSleepDuration?: number;
  engagementLevels: Record<string, number>;
  moodCounts: Record<string, number>;
  mealCount: number;
  napCount: number;
  totalIncidents: number;
  incidentDistribution: Record<string, number>;
};

export type IncidentFrequencyData = {
  type: string;
  count: number;
};

export type TimelineEvent = {
  id: string;
  childId: string;
  timestamp: Date;
  type: string;
  incident?: string;
  medication?: string;
  actionTaken: string;
};

export type ChildHealthProfile = {
  childId: string;
  totalIncidents: number;
  totalMedications: number;
  incidentDistribution: Record<string, number>;
  medicationDistribution: Record<string, number>;
  actionDistribution: Record<string, number>;
  recentEntries: TimelineEvent[];
};

export type StaffAnalysis = {
  staffId: string;
  totalRecords: number;
  incidentsReported: number;
  medicationsReported: number;
};

export type ActivityEngagementData = {
  activityName: string;
  engagementCounts: Record<string, number>;
};

export type ClassComparisonData = {
  classId: string;
  averageNapDuration: number;
  totalIncidents: number;
};


export type ClassActivityEngagement = {
  classId: string;
  activities: ActivityEngagementData[];
};