import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  Users,
  Download,
  RefreshCw,
  Clock,
  AlertTriangle,
  UserCheck,
  PieChart,
  X,
} from "lucide-react";

// Import components
import ChartCard from "./ChartCard";
import TableCard from "./TableCard";
import DateFilters from "./DateFilters";
import TrendDetailsModal from "./TrendDetailsModal";
import StaffDetailsModal from "./StaffDetailsModal";

// Import services
import {
  fetchChildren,
  fetchFilteredTrendData,
  fetchAllReports,
  type ReportData,
  type DateRange,
  type TrendFilters,
  type ExtendedTrendData,
} from "@/services/reportsService";
import type { Child } from "@/services/apiService";

// Import types
import type {
  ChartData,
  FilteredInsights,
  StaffPerformanceDetail,
} from "./types";

const ReportsDashboard: React.FC = () => {
  const [reportData, setReportData] = useState<ReportData>({
    trendOverTime: [],
    staffPerformance: [],
    incidentFrequency: [],
    timeline: [],
    staffAnalysis: [],
    actionDistribution: {},
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasData, setHasData] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: "",
    endDate: "",
  });
  const [showTrendDetails, setShowTrendDetails] = useState(false);
  const [showStaffDetails, setShowStaffDetails] = useState(false);
  const [children, setChildren] = useState<Child[]>([]);
  const [trendFilters, setTrendFilters] = useState<TrendFilters>({
    childId: "",
    classId: "",
    centerId: "",
  });
  const [filteredTrendData, setFilteredTrendData] = useState<ExtendedTrendData[]>([]);
  const [loadingFilteredData, setLoadingFilteredData] = useState(false);

  const handleFetchChildren = async () => {
    const childrenData = await fetchChildren();
    setChildren(childrenData);
  };

  const handleFetchFilteredTrendData = async (filters: TrendFilters) => {
    if (!filters.childId && !filters.classId && !filters.centerId) {
      setFilteredTrendData([]);
      return;
    }

    try {
      setLoadingFilteredData(true);
      const filteredData = await fetchFilteredTrendData(filters, dateRange);
      setFilteredTrendData(filteredData);
    } catch (error) {
      setFilteredTrendData([]);
    } finally {
      setLoadingFilteredData(false);
    }
  };

  // Process filtered data for meaningful insights
  const processFilteredInsights = (data: ExtendedTrendData[]): FilteredInsights | null => {
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

    const napDays = data.filter((day) => (day.napCount || 0) > 0);
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

    const activityTrends = data.map((day) => {
      let date: Date;
      if (typeof day.date === 'string') {
        date = new Date(day.date);
      } else if (day.date && typeof day.date === 'object' && '_seconds' in day.date) {
        date = new Date(day.date._seconds * 1000);
      } else {
        date = new Date();
      }

      return {
        date: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        meals: day.totalMeals || 0,
        moods: day.totalMoods || 0,
        naps: day.napCount !== undefined ? day.napCount : 0,
        diapers: (day.otherTypeCounts && day.otherTypeCounts.Diaper) || 0,
      };
    });

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

  const handleFetchAllReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const newReportData = await fetchAllReports(dateRange);
      setReportData(newReportData);
      setHasData(true);
    } catch (err) {
      setError("Failed to fetch report data");
      console.error("Error fetching reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleFetchChildren();
    // Automatically fetch all data on component mount (with empty dates)
    handleFetchAllReports();
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
        let date: Date;
        if (typeof item.date === 'string') {
          date = new Date(item.date);
        } else if (item.date && typeof item.date === 'object' && '_seconds' in item.date) {
          date = new Date(item.date._seconds * 1000);
        } else {
          return; // Skip invalid dates
        }

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
      incidents: item.incidentsReported || 0,
      medications: item.medicationsReported || 0,
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

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-secondary to-primary text-transparent bg-clip-text">
            Reports Dashboard
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Comprehensive analytics and insights data
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={handleFetchAllReports}
            className="w-full sm:w-auto"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
          <Button className="w-full sm:w-auto">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <DateFilters
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        onApplyFilters={handleFetchAllReports}
        loading={loading}
      />

      {/* Error State */}
      {error && (
        <div className="flex flex-col items-center justify-center p-8 text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <X className="h-8 w-8 mb-3" />
          <p className="text-center mb-4">Error fetching data: {error}</p>
          <Button onClick={handleFetchAllReports} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      )}

      {/* Loading State for Data */}
      {loading && !error && (
        <div className="flex items-center justify-center p-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-400"
          />
        </div>
      )}

      {/* Empty Cards when no data has been fetched yet */}
      {!loading && !error && !hasData && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            <ChartCard
              data={[]}
              title="Trend Over Time"
              icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
              description="Weekly activity trends"
              showDetailsButton={true}
              onDetailsClick={() => setShowTrendDetails(true)}
            />

            <ChartCard
              data={[]}
              title="Incident Frequency"
              icon={<AlertTriangle className="h-4 w-4 text-muted-foreground" />}
              description="Health incident frequency"
            />

            <ChartCard
              data={[]}
              title="Action Distribution"
              icon={<PieChart className="h-4 w-4 text-muted-foreground" />}
              description="Health action distribution"
              chartType="pie"
            />

            <ChartCard
              data={[]}
              title="Staff Performance"
              icon={<UserCheck className="h-4 w-4 text-muted-foreground" />}
              description="Total logs by staff member"
              showDetailsButton={true}
              onDetailsClick={() => setShowStaffDetails(true)}
            />

            <ChartCard
              data={[]}
              title="Staff Analysis"
              icon={<Users className="h-4 w-4 text-muted-foreground" />}
              description="Staff record analysis with incidents & medications"
              showBreakdown={true}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TableCard
              data={[]}
              title="Health Timeline"
              icon={<Clock className="h-4 w-4 text-muted-foreground" />}
              columns={[
                {
                  key: "timestamp",
                  label: "Date",
                  render: (value) => {
                    // Handle Firebase timestamp format
                    if (value && typeof value === 'object' && value._seconds) {
                      return new Date(value._seconds * 1000).toLocaleDateString();
                    }
                    // Handle regular timestamp
                    if (value) {
                      return new Date(value).toLocaleDateString();
                    }
                    return 'N/A';
                  },
                },
                {
                  key: "type",
                  label: "Type",
                  render: (value) => (
                    <Badge
                      variant="outline"
                      className={`text-xs font-semibold ${
                        value === "Incident"
                          ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                          : "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                      }`}
                    >
                      {value}
                    </Badge>
                  ),
                },
                { key: "actionTaken", label: "Action", render: (value) => value },
              ]}
            />
          </div>
        </>
      )}

      {/* Data Content - Show when data has been fetched */}
      {!loading && !error && hasData && (
        <>
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
              data={processIncidentFrequency()}
              title="Incident Frequency"
              icon={<AlertTriangle className="h-4 w-4 text-muted-foreground" />}
              description="Health incident frequency"
            />

            <ChartCard
              data={processActionDistribution()}
              title="Action Distribution"
              icon={<PieChart className="h-4 w-4 text-muted-foreground" />}
              description="Health action distribution"
              chartType="pie"
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
              data={processStaffAnalysis()}
              title="Staff Analysis"
              icon={<Users className="h-4 w-4 text-muted-foreground" />}
              description="Staff record analysis with incidents & medications"
              showBreakdown={true}
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
                  render: (value) => {
                    // Handle Firebase timestamp format
                    if (value && typeof value === 'object' && value._seconds) {
                      return new Date(value._seconds * 1000).toLocaleDateString();
                    }
                    // Handle regular timestamp
                    if (value) {
                      return new Date(value).toLocaleDateString();
                    }
                    return 'N/A';
                  },
                },
                {
                  key: "type",
                  label: "Type",
                  render: (value) => (
                    <Badge
                      variant="outline"
                      className={`text-xs font-semibold ${
                        value === "Incident"
                          ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                          : "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                      }`}
                    >
                      {value}
                    </Badge>
                  ),
                },
                { key: "actionTaken", label: "Action", render: (value) => value },
              ]}
            />
          </div>
        </>
      )}

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
        onFetchFilteredTrendData={handleFetchFilteredTrendData}
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