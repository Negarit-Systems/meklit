import { apiClient } from "@/lib/axios";

// Interfaces
export interface Child {
  id: string;
  firstName: string;
  lastName: string;
  centerId: string;
  classId: string;
}

export interface TrendData {
  date: { _seconds: number };
  averageNapDuration?: number;
  totalMeals?: number;
  type?: string;
}

export interface StaffPerformance {
  staffId: string;
  totalLogs: number;
  logsByType?: Record<string, number>;
}

export interface IncidentFrequency {
  type: string;
  count: number;
}

// Helper to safely extract data from API responses
const extractData = <T>(response: any): T => {
  return response.data?.data ?? response.data;
};

// ---------------- Children ----------------

// Fetch all children (no filters to get complete dataset)
export const fetchChildren = async (): Promise<Child[]> => {
  const response = await apiClient.get("/child");
  return extractData<Child[]>(response);
};

// ---------------- Trend Over Time ----------------

export const fetchTrendOverTime = async (filters: {
  startDate: string;
  endDate: string;
  centerId?: string;
  classId?: string;
  childId?: string;
}): Promise<TrendData[]> => {
  const params: Record<string, string> = {
    startDate: filters.startDate,
    endDate: filters.endDate,
  };
  if (filters.centerId) params.centerId = filters.centerId;
  if (filters.classId) params.classId = filters.classId;
  if (filters.childId) params.childId = filters.childId;

  const response = await apiClient.get("/daily-logs/trend-over-time", { params });
  return extractData<TrendData[]>(response);
};

// ---------------- Staff Performance ----------------

export const fetchStaffPerformance = async (filters: {
  startDate: string;
  endDate: string;
  centerId?: string;
}): Promise<StaffPerformance[]> => {
  const params: Record<string, string> = {
    startDate: filters.startDate,
    endDate: filters.endDate,
  };
  if (filters.centerId) params.centerId = filters.centerId;

  const response = await apiClient.get("/daily-logs/staff-performance", { params });
  return extractData<StaffPerformance[]>(response);
};

// ---------------- Incident Frequency ----------------

export const fetchIncidentFrequency = async (filters: {
  startDate: string;
  endDate: string;
  centerId?: string;
}): Promise<IncidentFrequency[]> => {
  const params: Record<string, string> = {
    startDate: filters.startDate,
    endDate: filters.endDate,
  };
  if (filters.centerId) params.centerId = filters.centerId;

  const response = await apiClient.get("/health-records/incident-frequency", { params });
  return extractData<IncidentFrequency[]>(response);
};
