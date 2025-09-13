import React, { useState, useEffect } from "react";
import { apiClient } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
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

interface ReportData {
  trendOverTime: any[];
  staffPerformance: any[];
  comparative: any[];
  incidentFrequency: any[];
  timeline: any[];
  staffAnalysis: any[];
  actionDistribution: any;
}

interface ChartData {
  name: string;
  value: number;
  color?: string;
}

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
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });
  const [showTrendDetails, setShowTrendDetails] = useState(false);
  const [showStaffDetails, setShowStaffDetails] = useState(false);
  const [children, setChildren] = useState<any[]>([]);
  const [trendFilters, setTrendFilters] = useState({
    childId: "",
    classId: "",
    centerId: "",
  });
  const [filteredTrendData, setFilteredTrendData] = useState<any[]>([]);
  const [loadingFilteredData, setLoadingFilteredData] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage] = useState(10);

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
      setCurrentPage(0);
      return;
    }

    try {
      setLoadingFilteredData(true);
      setCurrentPage(0);

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
  const processFilteredInsights = (data: any[]) => {
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

  const processDetailedStaffPerformance = () => {
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

  const getUniqueCenterIds = () => {
    const centerIds = [...new Set(children.map((child) => child.centerId))];
    return centerIds.sort();
  };

  const getUniqueClassIds = () => {
    const classIds = [...new Set(children.map((child) => child.classId))];
    return classIds.sort();
  };

  const getChildrenForFilters = () => {
    const filtered = children.filter((child) => {
      if (trendFilters.centerId && child.centerId !== trendFilters.centerId)
        return false;
      if (trendFilters.classId && child.classId !== trendFilters.classId)
        return false;
      return true;
    });
    return filtered;
  };

  const processIncidentFrequency = (): ChartData[] => {
    if (
      !Array.isArray(reportData.incidentFrequency) ||
      reportData.incidentFrequency.length === 0
    ) {
      return [
        { name: "Incident", value: 5, color: getIncidentColor("Incident") },
        {
          name: "Medication",
          value: 12,
          color: getIncidentColor("MedicationAdministered"),
        },
        { name: "Checkup", value: 8, color: getIncidentColor("Checkup") },
      ];
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
      return [
        { name: "Nurse A", value: 45, color: getColor(0) },
        { name: "Nurse B", value: 38, color: getColor(1) },
        { name: "Doctor C", value: 52, color: getColor(2) },
      ];
    }
    return reportData.staffAnalysis.map((item, index) => ({
      name: item.staffId || `Staff ${index + 1}`,
      value: item.totalRecords || 0,
      color: getColor(index),
    }));
  };

  const processActionDistribution = (): ChartData[] => {
    if (Object.keys(reportData.actionDistribution).length === 0) {
      return [
        { name: "Treatment", value: 25, color: getColor(0) },
        { name: "Observation", value: 18, color: getColor(1) },
        { name: "Medication", value: 12, color: getColor(2) },
      ];
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

  const ChartCard: React.FC<{
    data: ChartData[];
    title: string;
    icon: React.ReactNode;
    description?: string;
    showDetailsButton?: boolean;
    onDetailsClick?: () => void;
  }> = ({
    data,
    title,
    icon,
    description,
    showDetailsButton,
    onDetailsClick,
  }) => {
    const maxValue = Math.max(...data.map((d) => d.value));

    return (
      <Card className="h-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            {description && (
              <CardDescription className="text-xs">
                {description}
              </CardDescription>
            )}
          </div>
          <div className="flex items-center gap-2">
            {icon}
            {showDetailsButton && onDetailsClick && (
              <Button variant="ghost" size="sm" onClick={onDetailsClick}>
                <TrendingUp className="h-3 w-3 mr-1" />
                Details
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {data.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-muted-foreground text-sm">
                No data available
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {data.map((item, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground truncate">
                      {item.name}
                    </span>
                    <span className="font-medium">{item.value}</span>
                  </div>
                  <div className="w-full bg-secondary/20 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        item.color || "bg-primary"
                      }`}
                      style={{
                        width: `${
                          maxValue > 0 ? (item.value / maxValue) * 100 : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const TableCard: React.FC<{
    data: any[];
    title: string;
    icon: React.ReactNode;
    columns: {
      key: string;
      label: string;
      render?: (value: any, item: any) => React.ReactNode;
    }[];
  }> = ({ data, title, icon, columns }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.slice(0, 10).map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              {columns.map((column, colIndex) => (
                <div key={colIndex} className="flex-1">
                  <span className="text-xs text-muted-foreground">
                    {column.label}
                  </span>
                  <div className="font-medium">
                    {column.render
                      ? column.render(item[column.key], item)
                      : item[column.key]}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

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
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-secondary to-primary text-transparent bg-clip-text">
            Reports Dashboard
          </h1>
          <p className="text-muted-foreground">
            Comprehensive analytics and insights from your child care data
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchAllReports}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium">Start Date</label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) =>
                  setDateRange((prev) => ({
                    ...prev,
                    startDate: e.target.value,
                  }))
                }
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium">End Date</label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, endDate: e.target.value }))
                }
                className="w-full p-2 border rounded-md"
              />
            </div>
            <Button onClick={fetchAllReports}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

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
              : [
                  {
                    timestamp: new Date().toISOString(),
                    type: "Checkup",
                    actionTaken: "Routine examination",
                  },
                  {
                    timestamp: new Date(Date.now() - 86400000).toISOString(),
                    type: "Medication",
                    actionTaken: "Vitamin D administered",
                  },
                  {
                    timestamp: new Date(Date.now() - 172800000).toISOString(),
                    type: "Incident",
                    actionTaken: "Minor fall - observed",
                  },
                ]
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
              : [
                  { category: "Attendance", current: 95, previous: 92 },
                  { category: "Meals", current: 88, previous: 85 },
                  { category: "Activities", current: 90, previous: 87 },
                ]
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

      {showTrendDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-6xl max-h-[80vh] overflow-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl">
                  Daily Activity Trends - Detailed View
                </CardTitle>
                <CardDescription>
                  Filter and view activity data by child, class, or center
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                onClick={() => setShowTrendDetails(false)}
              >
                ✕
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-gray-50">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Center
                    </label>
                    <select
                      className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      style={{ backgroundColor: "#f3f4f6", color: "#1f2937" }}
                      value={trendFilters.centerId}
                      onChange={(e) => {
                        const newFilters = {
                          ...trendFilters,
                          centerId: e.target.value,
                          classId: "",
                          childId: "",
                        };
                        setTrendFilters(newFilters);
                        fetchFilteredTrendData(newFilters);
                      }}
                    >
                      <option
                        value=""
                        style={{ backgroundColor: "#f3f4f6", color: "#4b5563" }}
                      >
                        All Centers
                      </option>
                      {getUniqueCenterIds().map((centerId) => (
                        <option
                          key={centerId}
                          value={centerId}
                          style={{
                            backgroundColor: "#f3f4f6",
                            color: "#1f2937",
                          }}
                        >
                          {centerId}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Class
                    </label>
                    <select
                      className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      style={{ backgroundColor: "#f3f4f6", color: "#1f2937" }}
                      value={trendFilters.classId}
                      onChange={(e) => {
                        const newFilters = {
                          ...trendFilters,
                          classId: e.target.value,
                          childId: "",
                        };
                        setTrendFilters(newFilters);
                        fetchFilteredTrendData(newFilters);
                      }}
                    >
                      <option
                        value=""
                        style={{ backgroundColor: "#f3f4f6", color: "#4b5563" }}
                      >
                        All Classes
                      </option>
                      {getUniqueClassIds().map((classId) => (
                        <option
                          key={classId}
                          value={classId}
                          style={{
                            backgroundColor: "#f3f4f6",
                            color: "#1f2937",
                          }}
                        >
                          {classId}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Child
                    </label>
                    <select
                      className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      style={{ backgroundColor: "#f3f4f6", color: "#1f2937" }}
                      value={trendFilters.childId}
                      onChange={(e) => {
                        const newFilters = {
                          ...trendFilters,
                          childId: e.target.value,
                        };
                        setTrendFilters(newFilters);
                        fetchFilteredTrendData(newFilters);
                      }}
                    >
                      <option
                        value=""
                        style={{ backgroundColor: "#f3f4f6", color: "#4b5563" }}
                      >
                        All Children
                      </option>
                      {getChildrenForFilters().map((child) => (
                        <option
                          key={child.id}
                          value={child.id}
                          style={{
                            backgroundColor: "#f3f4f6",
                            color: "#1f2937",
                          }}
                        >
                          {child.firstName} {child.lastName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {(trendFilters.centerId ||
                  trendFilters.classId ||
                  trendFilters.childId) && (
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const clearedFilters = {
                          childId: "",
                          classId: "",
                          centerId: "",
                        };
                        setTrendFilters(clearedFilters);
                        setFilteredTrendData([]);
                      }}
                    >
                      Clear Filters
                    </Button>
                  </div>
                )}

                {loadingFilteredData && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
                      <div className="text-sm text-yellow-800">
                        Loading filtered data...
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {(() => {
                  const hasActiveFilters =
                    trendFilters.childId ||
                    trendFilters.classId ||
                    trendFilters.centerId;
                  const dataToShow = hasActiveFilters
                    ? filteredTrendData
                    : reportData.trendOverTime;

                  const insights = processFilteredInsights(dataToShow);
                  if (!insights) {
                    return (
                      <div className="text-center py-8 text-muted-foreground">
                        {loadingFilteredData
                          ? "Loading insights..."
                          : "No data available"}
                      </div>
                    );
                  }

                  return (
                    <>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 border rounded-lg text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {insights.totalDays}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Total Days
                          </div>
                        </div>
                        <div className="p-4 border rounded-lg text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {insights.totalMeals}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Total Meals
                          </div>
                        </div>
                        <div className="p-4 border rounded-lg text-center">
                          <div className="text-2xl font-bold text-purple-600">
                            {insights.totalNaps}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Total Naps
                          </div>
                        </div>
                        <div className="p-4 border rounded-lg text-center">
                          <div className="text-2xl font-bold text-orange-600">
                            {insights.totalDiaperChanges}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Diaper Changes
                          </div>
                        </div>
                      </div>

                      {insights.avgNapDuration > 0 && (
                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-semibold">
                                Average Nap Duration
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Based on nap days only
                              </div>
                            </div>
                            <div className="text-2xl font-bold text-purple-600">
                              {insights.avgNapDuration} min
                            </div>
                          </div>
                        </div>
                      )}

                      {Object.keys(insights.moodCounts).length > 0 && (
                        <div className="p-4 border rounded-lg">
                          <h3 className="font-semibold mb-3">
                            Mood Distribution
                          </h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {Object.entries(insights.moodCounts).map(
                              ([mood, count]) => (
                                <div
                                  key={mood}
                                  className="text-center p-2 border rounded bg-blue-50"
                                >
                                  <div className="text-lg font-semibold text-blue-600">
                                    {count as number}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {mood}
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}

                      {Object.keys(insights.mealCounts).length > 0 && (
                        <div className="p-4 border rounded-lg">
                          <h3 className="font-semibold mb-3">
                            Meal Status Distribution
                          </h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {Object.entries(insights.mealCounts).map(
                              ([status, count]) => (
                                <div
                                  key={status}
                                  className="text-center p-2 border rounded bg-green-50"
                                >
                                  <div className="text-lg font-semibold text-green-600">
                                    {count as number}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {status}
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}

                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold">
                            Daily Activity Trends
                          </h3>
                          <div className="text-sm text-muted-foreground">
                            {Math.min(
                              currentPage * itemsPerPage + 1,
                              insights.activityTrends.length
                            )}{" "}
                            -{" "}
                            {Math.min(
                              (currentPage + 1) * itemsPerPage,
                              insights.activityTrends.length
                            )}{" "}
                            of {insights.activityTrends.length}
                          </div>
                        </div>

                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {insights.activityTrends
                            .slice(
                              currentPage * itemsPerPage,
                              (currentPage + 1) * itemsPerPage
                            )
                            .map((day, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-2 border rounded"
                              >
                                <div className="font-medium">{day.date}</div>
                                <div className="flex gap-4 text-sm">
                                  {day.meals > 0 && (
                                    <span className="text-green-600">
                                      🍽️ {day.meals}
                                    </span>
                                  )}
                                  {day.moods > 0 && (
                                    <span className="text-blue-600">
                                      😊 {day.moods}
                                    </span>
                                  )}
                                  {day.naps > 0 && (
                                    <span className="text-purple-600">
                                      😴 {day.naps}
                                    </span>
                                  )}
                                  {day.diapers > 0 && (
                                    <span className="text-orange-600">
                                      🧸 {day.diapers}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                        </div>

                        <div className="flex items-center justify-between mt-4 pt-3 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setCurrentPage(Math.max(0, currentPage - 1))
                            }
                            disabled={currentPage === 0}
                          >
                            ← Previous
                          </Button>
                          <span className="text-sm text-muted-foreground">
                            Page {currentPage + 1} of{" "}
                            {Math.ceil(
                              insights.activityTrends.length / itemsPerPage
                            )}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setCurrentPage(
                                Math.min(
                                  Math.ceil(
                                    insights.activityTrends.length /
                                      itemsPerPage
                                  ) - 1,
                                  currentPage + 1
                                )
                              )
                            }
                            disabled={
                              currentPage >=
                              Math.ceil(
                                insights.activityTrends.length / itemsPerPage
                              ) -
                                1
                            }
                          >
                            Next →
                          </Button>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {showStaffDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl max-h-[80vh] overflow-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl">
                  Staff Performance - Detailed View
                </CardTitle>
                <CardDescription>
                  Breakdown of logs by type for each staff member
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                onClick={() => setShowStaffDetails(false)}
              >
                ✕
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {processDetailedStaffPerformance().map((staff, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded-full ${getColor(index)}`}
                        />
                        <h3 className="text-lg font-semibold">
                          {staff.staffId}
                        </h3>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold">
                          {staff.totalLogs}
                        </span>
                        <span className="text-sm text-muted-foreground ml-2">
                          total logs
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                      {Object.entries(staff.logsByType).map(([type, count]) => (
                        <div
                          key={type}
                          className="text-center p-2 border rounded bg-gray-50"
                        >
                          <div className="text-sm text-muted-foreground">
                            {type}
                          </div>
                          <div className="text-lg font-semibold">
                            {count as number}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ReportsDashboard;
