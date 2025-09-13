export interface ReportData {
  trendOverTime: any[];
  staffPerformance: any[];
  comparative: any[];
  incidentFrequency: any[];
  timeline: any[];
  staffAnalysis: any[];
  actionDistribution: any;
}

export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface TrendFilters {
  childId: string;
  classId: string;
  centerId: string;
}

export interface FilteredInsights {
  totalDays: number;
  totalMeals: number;
  totalMoods: number;
  totalNaps: number;
  totalDiaperChanges: number;
  avgNapDuration: number;
  moodCounts: Record<string, number>;
  mealCounts: Record<string, number>;
  activityTrends: Array<{
    date: string;
    meals: number;
    moods: number;
    naps: number;
    diapers: number;
  }>;
}

export interface StaffPerformanceDetail {
  staffId: string;
  totalLogs: number;
  logsByType: Record<string, number>;
}

export interface TableColumn {
  key: string;
  label: string;
  render?: (value: any, item: any) => React.ReactNode;
}
