import React, { useState, useEffect } from "react";
import { apiClient } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  TrendingUp,
  Users,
  Download,
  RefreshCw,
  Clock,
  AlertTriangle,
  UserCheck,
  PieChart,
} from "lucide-react";

// Import components
import ChartCard from "./ChartCard";
import TableCard from "./TableCard";
import DateFilters from "./DateFilters";
import TrendDetailsModal from "./TrendDetailsModal";
import StaffDetailsModal from "./StaffDetailsModal";

// Import types
import type {
  ReportData,
  ChartData,
  DateRange,
  TrendFilters,
  FilteredInsights,
  StaffPerformanceDetail,
} from "./types";

const ReportsDashboard: React.FC = () => {
  const [reportData, setReportData] = useState<ReportData>({
    trendOverTime: [],
    staffPerformance: [],
    comparative: [],
    incidentFrequency: [],
    timeline: [],
    staffAnalysis: [],
    actionDistribution: {},
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });
  const [showTrendDetails, setShowTrendDetails] = useState(false);
  const [showStaffDetails, setShowStaffDetails] = useState(false);
  const [children, setChildren] = useState<any[]>([]);
  const [trendFilters, setTrendFilters] = useState<TrendFilters>({
    childId: "",
    classId: "",
    centerId: "",
  });
  const [filteredTrendData, setFilteredTrendData] = useState<any[]>([]);
  const [loadingFilteredData, setLoadingFilteredData] = useState(false);

  const fetchChildren = async () => {
    try {
      const response = await apiClient.get("/child/");

      if (response.data.success) {
        setChildren(response.data.data || []);
      } else {
        setChildren([]);
      }
    } catch (error) {
      setChildren([]);
    }
  };

  const fetchFilteredTrendData = async (filters: {
    childId?: string;
    classId?: string;
    centerId?: string;
  }) => {
    if (!filters.childId && !filters.classId && !filters.centerId) {
      setFilteredTrendData([]);
      return;
    }

    try {
      setLoadingFilteredData(true);

      const baseParams = {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        _t: Date.now(),
      };

      const params = { ...baseParams } as any;
      if (filters.childId) params.childId = filters.childId;
      if (filters.classId) params.classId = filters.classId;
      if (filters.centerId) params.centerId = filters.centerId;

      const response = await apiClient.get("/daily-logs/trend-over-time", {
        params,
      });

      if (response.data.success) {
        setFilteredTrendData(response.data.data || []);
      }
    } catch (error) {
      setFilteredTrendData([]);
    } finally {
      setLoadingFilteredData(false);
    }
  };

  // Process filtered data for meaningful insights
  const processFilteredInsights = (data: any[]): FilteredInsights | null => {
    if (!data || data.length === 0) return null;

    const totalDays = data.length;
    const totalMeals = data.reduce(
      (sum, day) => sum + (day.totalMeals || 0),
      0
    );
    const totalMoods = data.reduce(
      (sum, day) => sum + (day.totalMoods || 0),
      0
    );
    const totalNaps = data.reduce((sum, day) => sum + (day.napCount || 0), 0);
    const totalDiaperChanges = data.reduce(
      (sum, day) =>
        sum +
        Object.values(day.otherTypeCounts || {}).reduce(
          (a: number, b: unknown) => a + (b as number),
          0
        ),
      0
    );

    const napDays = data.filter((day) => day.napCount > 0);
    const avgNapDuration =
      napDays.length > 0
        ? napDays.reduce((sum, day) => sum + (day.averageNapDuration || 0), 0) /
          napDays.length
        : 0;

    const moodCounts = data.reduce((acc, day) => {
      Object.entries(day.moodCounts || {}).forEach(([mood, count]) => {
        acc[mood] = (acc[mood] || 0) + (count as number);
      });
      return acc;
    }, {} as Record<string, number>);

    const mealCounts = data.reduce((acc, day) => {
      Object.entries(day.mealStatusCounts || {}).forEach(([status, count]) => {
        acc[status] = (acc[status] || 0) + (count as number);
      });
      return acc;
    }, {} as Record<string, number>);

    const activityTrends = data.map((day) => ({
      date: new Date(day.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      meals: day.totalMeals || 0,
      moods: day.totalMoods || 0,
      naps: day.napCount !== undefined ? day.napCount : 0,
      diapers: (day.otherTypeCounts && day.otherTypeCounts.Diaper) || 0,
    }));

    return {
      totalDays,
      totalMeals,
      totalMoods,
      totalNaps,
      totalDiaperChanges,
      avgNapDuration: Math.round(avgNapDuration),
      moodCounts,
      mealCounts,
      activityTrends,
    };
  };

  const fetchAllReports = async () => {
    try {
      setLoading(true);
      setError(null);

      const baseParams = {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        _t: Date.now(),
      };

      const [
        trendRes,
        staffPerfRes,
        comparativeRes,
        incidentRes,
        timelineRes,
        staffAnalysisRes,
        actionDistRes,
      ] = await Promise.allSettled([
        apiClient.get("/daily-logs/trend-over-time", { params: baseParams }),
        apiClient.get("/daily-logs/staff-performance", { params: baseParams }),
        apiClient.get("/daily-logs/comparative", {
          params: { ...baseParams, groupBy: "classId" },
        }),
        apiClient.get("/health-records/incident-frequency", {
          params: baseParams,
        }),
        apiClient.get("/health-records/timeline", { params: baseParams }),
        apiClient.get("/health-records/staff-analysis", { params: baseParams }),
        apiClient.get("/health-records/action-distribution", {
          params: baseParams,
        }),
      ]);

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

      const newReportData = {
        trendOverTime: getData(trendRes),
        staffPerformance: getData(staffPerfRes),
        comparative: getData(comparativeRes),
        incidentFrequency: getData(incidentRes),
        timeline: getData(timelineRes),
        staffAnalysis: getData(staffAnalysisRes),
        actionDistribution: getDataObject(actionDistRes),
      };

      setReportData(newReportData);
    } catch (err) {
      setError("Failed to fetch report data");
      console.error("Error fetching reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChildren().then(() => {
      fetchAllReports();
    });
  }, []);

  const processTrendData = (): ChartData[] => {
    if (
      !Array.isArray(reportData.trendOverTime) ||
      reportData.trendOverTime.length === 0
    ) {
      return [];
    }

    const weeklyData: { [key: string]: { total: number; count: number } } = {};

    reportData.trendOverTime.forEach((item) => {
      if (item.date) {
        const date = new Date(item.date);
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        const weekKey = weekStart.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });

        if (!weeklyData[weekKey]) {
          weeklyData[weekKey] = { total: 0, count: 0 };
        }

        weeklyData[weekKey].total +=
          (item.totalMeals || 0) +
          (item.totalMoods || 0) +
          (item.napCount || 0);
        weeklyData[weekKey].count += 1;
      }
    });

    return Object.entries(weeklyData)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .map(([week, data], index) => ({
        name: `Week of ${week}`,
        value: Math.round(data.total / data.count),
        color: getColor(index),
      }));
  };

  const processStaffPerformance = (): ChartData[] => {
    if (
      !Array.isArray(reportData.staffPerformance) ||
      reportData.staffPerformance.length === 0
    ) {
      return [];
    }
    return reportData.staffPerformance.map((item, index) => ({
      name: item.staffId || `Staff ${index + 1}`,
      value: item.totalLogs || 0,
      color: getColor(index),
    }));
  };

  const processDetailedStaffPerformance = (): StaffPerformanceDetail[] => {
    if (
      !Array.isArray(reportData.staffPerformance) ||
      reportData.staffPerformance.length === 0
    ) {
      return [];
    }

    return reportData.staffPerformance.map((staff) => ({
      staffId: staff.staffId,
      totalLogs: staff.totalLogs,
      logsByType: staff.logsByType || {},
    }));
  };

  const processIncidentFrequency = (): ChartData[] => {
    if (
      !Array.isArray(reportData.incidentFrequency) ||
      reportData.incidentFrequency.length === 0
    ) {
      return [];
    }
    return reportData.incidentFrequency.map((item, index) => ({
      name: item.type || `Incident ${index + 1}`,
      value: item.count || 0,
      color: getIncidentColor(item.type),
    }));
  };

  const processStaffAnalysis = (): ChartData[] => {
    if (
      !Array.isArray(reportData.staffAnalysis) ||
      reportData.staffAnalysis.length === 0
    ) {
      return [];
    }
    return reportData.staffAnalysis.map((item, index) => ({
      name: item.staffId || `Staff ${index + 1}`,
      value: item.totalRecords || 0,
      color: getColor(index),
    }));
  };

  const processActionDistribution = (): ChartData[] => {
    if (Object.keys(reportData.actionDistribution).length === 0) {
      return [];
    }
    return Object.entries(reportData.actionDistribution).map(
      ([action, count], index) => ({
        name: action,
        value: count as number,
        color: getColor(index),
      })
    );
  };

  const getColor = (index: number): string => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-red-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-orange-500",
    ];
    return colors[index % colors.length];
  };

  const getIncidentColor = (type: string): string => {
    const colors: { [key: string]: string } = {
      Incident: "bg-red-500",
      MedicationAdministered: "bg-blue-500",
      Checkup: "bg-green-500",
      Vaccination: "bg-yellow-500",
    };
    return colors[type] || "bg-gray-500";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Loading reports...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">
              Error Loading Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchAllReports} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-secondary to-primary text-transparent bg-clip-text">
            Reports Dashboard
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Comprehensive analytics and insights from your child care data
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={fetchAllReports} className="flex-1 sm:flex-none">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button className="flex-1 sm:flex-none">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <DateFilters
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        onApplyFilters={fetchAllReports}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <ChartCard
          data={processTrendData()}
          title="Trend Over Time"
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
          description="Weekly activity trends"
          showDetailsButton={true}
          onDetailsClick={() => setShowTrendDetails(true)}
        />

        <ChartCard
          data={processStaffPerformance()}
          title="Staff Performance"
          icon={<UserCheck className="h-4 w-4 text-muted-foreground" />}
          description="Total logs by staff member"
          showDetailsButton={true}
          onDetailsClick={() => setShowStaffDetails(true)}
        />

        <ChartCard
          data={processIncidentFrequency()}
          title="Incident Frequency"
          icon={<AlertTriangle className="h-4 w-4 text-muted-foreground" />}
          description="Health incident frequency"
        />

        <ChartCard
          data={processStaffAnalysis()}
          title="Staff Analysis"
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          description="Staff record analysis"
        />

        <ChartCard
          data={processActionDistribution()}
          title="Action Distribution"
          icon={<PieChart className="h-4 w-4 text-muted-foreground" />}
          description="Health action distribution"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TableCard
          data={
            Array.isArray(reportData.timeline) && reportData.timeline.length > 0
              ? reportData.timeline
              : []
          }
          title="Health Timeline"
          icon={<Clock className="h-4 w-4 text-muted-foreground" />}
          columns={[
            {
              key: "timestamp",
              label: "Date",
              render: (value) => new Date(value).toLocaleDateString(),
            },
            {
              key: "type",
              label: "Type",
              render: (value) => <Badge variant="outline">{value}</Badge>,
            },
            { key: "actionTaken", label: "Action", render: (value) => value },
          ]}
        />

        <TableCard
          data={
            Array.isArray(reportData.comparative) &&
            reportData.comparative.length > 0
              ? reportData.comparative
              : []
          }
          title="Comparative Analysis"
          icon={<BarChart3 className="h-4 w-4 text-muted-foreground" />}
          columns={[
            { key: "category", label: "Category", render: (value) => value },
            {
              key: "current",
              label: "Current",
              render: (value) => `${value}%`,
            },
            {
              key: "previous",
              label: "Previous",
              render: (value) => `${value}%`,
            },
          ]}
        />
      </div>

      <TrendDetailsModal
        isOpen={showTrendDetails}
        onClose={() => setShowTrendDetails(false)}
        trendFilters={trendFilters}
        onTrendFiltersChange={setTrendFilters}
        filteredTrendData={filteredTrendData}
        loadingFilteredData={loadingFilteredData}
        reportData={reportData.trendOverTime}
        dateRange={dateRange}
        children={children}
        onFetchFilteredTrendData={fetchFilteredTrendData}
        processFilteredInsights={processFilteredInsights}
      />

      <StaffDetailsModal
        isOpen={showStaffDetails}
        onClose={() => setShowStaffDetails(false)}
        staffPerformanceDetails={processDetailedStaffPerformance()}
        getColor={getColor}
      />
    </div>
  );
};

export default ReportsDashboard;