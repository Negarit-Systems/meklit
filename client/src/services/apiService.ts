const API_BASE_URL = "http://localhost:5000/api";

// Define interfaces
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
}

export interface IncidentFrequency {
  type: string;
  count: number;
}

const fetchWithErrorHandling = async (url: string, options: RequestInit = {}) => {
  try {
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...options.headers,
    };

    console.log('Fetching URL:', url);
    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`HTTP Error ${response.status}: ${url}`, errorText);
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      } catch {
        throw new Error(`HTTP error! status: ${response.status}, response: ${errorText.substring(0, 100)}...`);
      }
    }

    const contentType = response.headers.get('content-type');
    if (response.status === 204 || !contentType || !contentType.includes('application/json')) {
      return null;
    }

    const jsonData = await response.json();
    return jsonData.data || jsonData;
  } catch (error) {
    console.error('API Error for', url, ':', error);
    throw error instanceof Error ? error : new Error('Network error occurred');
  }
};

// Fetch all children initially, filter client-side
export const fetchChildren = async (): Promise<Child[]> => {
  const url = `${API_BASE_URL}/child`;
  console.log('fetchChildren URL:', url);
  return await fetchWithErrorHandling(url);
};

export const fetchTrendOverTime = async (filters: {
  startDate: string;
  endDate: string;
  centerId?: string;
  classId?: string;
  childId?: string;
}): Promise<TrendData[]> => {
  const params = new URLSearchParams({
    startDate: filters.startDate,
    endDate: filters.endDate,
    ...(filters.centerId && { centerId: filters.centerId }),
    ...(filters.classId && { classId: filters.classId }),
    ...(filters.childId && { childId: filters.childId }),
  }).toString();
  const url = `${API_BASE_URL}/daily-logs/trend-over-time?${params}`;
  return await fetchWithErrorHandling(url);
};

export const fetchStaffPerformance = async (filters: {
  startDate: string;
  endDate: string;
  centerId?: string;
}): Promise<StaffPerformance[]> => {
  const params = new URLSearchParams({
    startDate: filters.startDate,
    endDate: filters.endDate,
    ...(filters.centerId && { centerId: filters.centerId }),
  }).toString();
  const url = `${API_BASE_URL}/daily-logs/staff-performance?${params}`;
  return await fetchWithErrorHandling(url);
};

export const fetchIncidentFrequency = async (filters: {
  startDate: string;
  endDate: string;
  centerId?: string;
}): Promise<IncidentFrequency[]> => {
  const params = new URLSearchParams({
    startDate: filters.startDate,
    endDate: filters.endDate,
    ...(filters.centerId && { centerId: filters.centerId }),
  }).toString();
  const url = `${API_BASE_URL}/health-records/incident-frequency?${params}`;
  return await fetchWithErrorHandling(url);
};