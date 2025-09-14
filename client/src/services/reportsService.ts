import { apiClient } from "@/lib/axios";
import type { Child, TrendData, StaffPerformance, IncidentFrequency } from "./apiService";

// Extended interfaces for reports-specific data
export interface ExtendedTrendData extends TrendData {
  totalMoods?: number;
  napCount?: number;
  otherTypeCounts?: Record<string, number>;
  moodCounts?: Record<string, number>;
  mealStatusCounts?: Record<string, number>;
}

export interface TimelineData {
  timestamp: { _seconds: number } | string;
  type: string;
  actionTaken: string;
}

export interface StaffAnalysis {
  staffId: string;
  totalRecords: number;
  incidentsReported?: number;
  medicationsReported?: number;
}

export interface ActionDistribution {
  [key: string]: number;
}

export interface ReportData {
  trendOverTime: ExtendedTrendData[];
  staffPerformance: StaffPerformance[];
  incidentFrequency: IncidentFrequency[];
  timeline: TimelineData[];
  staffAnalysis: StaffAnalysis[];
  actionDistribution: ActionDistribution;
}

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface TrendFilters {
  childId?: string;
  classId?: string;
  centerId?: string;
}

// Helper to safely extract data from Promise.allSettled results
const getData = (result: any) => {
  if (result.status === "fulfilled") {
    const apiData = result.value.data?.data || result.value.data || [];
    return apiData;
  }
  return [];
};

const getDataObject = (result: any) => {
  if (result.status === "fulfilled") {
    return result.value.data || {};
  }
  return {};
};

// ---------------- Children ----------------

export const fetchChildren = async (): Promise<Child[]> => {
  try {
    const response = await apiClient.get("/child/");
    if (response.data.success) {
      return response.data.data || [];
    }
    return [];
  } catch (error) {
    return [];
  }
};

// ---------------- Filtered Trend Data ----------------

export const fetchFilteredTrendData = async (
  filters: TrendFilters,
  dateRange: DateRange
): Promise<ExtendedTrendData[]> => {
  if (!filters.childId && !filters.classId && !filters.centerId) {
    return [];
  } 

  try {
    const baseParams: any = {
      _t: Date.now(),
    };
    
    // Only add date parameters if they are provided
    if (dateRange.startDate) {
      baseParams.startDate = dateRange.startDate;
    }
    if (dateRange.endDate) {
      baseParams.endDate = dateRange.endDate;
    }

    const params = { ...baseParams } as any;
    if (filters.childId) params.childId = filters.childId;
    if (filters.classId) params.classId = filters.classId;
    if (filters.centerId) params.centerId = filters.centerId;

    const response = await apiClient.get("/daily-logs/trend-over-time", {
      params,
    });

    if (response.data.success) {
      return response.data.data || [];
    }
    return [];
  } catch (error) {
    return [];
  }
};

// ---------------- All Reports Data ----------------

export const fetchAllReports = async (dateRange: DateRange): Promise<ReportData> => {
  try {
    const baseParams: any = {
      _t: Date.now(),
    };
    
    // Only add date parameters if they are provided
    if (dateRange.startDate) {
      baseParams.startDate = dateRange.startDate;
    }
    if (dateRange.endDate) {
      baseParams.endDate = dateRange.endDate;
    }

    const [
      trendRes,
      staffPerfRes,
      incidentRes,
      timelineRes,
      staffAnalysisRes,
      actionDistRes,
    ] = await Promise.allSettled([
      apiClient.get("/daily-logs/trend-over-time", { params: baseParams }),
      apiClient.get("/daily-logs/staff-performance", { params: baseParams }),
      apiClient.get("/health-records/incident-frequency", {
        params: baseParams,
      }),
      apiClient.get("/health-records/timeline", { params: baseParams }),
      apiClient.get("/health-records/staff-analysis", { params: baseParams }),
      apiClient.get("/health-records/action-distribution", {
        params: baseParams,
      }),
    ]);

    return {
      trendOverTime: getData(trendRes),
      staffPerformance: getData(staffPerfRes),
      incidentFrequency: getData(incidentRes),
      timeline: getData(timelineRes),
      staffAnalysis: getData(staffAnalysisRes),
      actionDistribution: getDataObject(actionDistRes),
    };
  } catch (error) {
    throw new Error("Failed to fetch report data");
  }
};

