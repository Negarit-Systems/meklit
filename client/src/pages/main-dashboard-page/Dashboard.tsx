import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Filter, Calendar, X, BarChart, PieChart, LineChart } from "lucide-react";
import { Doughnut, Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
} from "chart.js";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useQuery } from "@tanstack/react-query";
import { format, isValid } from "date-fns";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import {
  fetchChildren,
  fetchTrendOverTime,
  fetchStaffPerformance,
  fetchIncidentFrequency,
} from "../../services/apiService";

import type { Child, TrendData, StaffPerformance, IncidentFrequency } from "../../services/apiService";

// Register Chart.js components
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement);

// Define global constants for API date fallbacks for better maintainability
const FALLBACK_START_DATE = "2022-09-01";
const FALLBACK_END_DATE = "2027-09-01";

// Define interfaces
interface FilterState {
  centerId: string;
  classId: string;
  childId: string;
  dateRange: [Date | undefined, Date | undefined];
  dataTypes: string[];
  isFilterOpen: boolean;
}

// Chart color palette
const chartColors = {
  blue: "rgb(75, 192, 192)",
  red: "rgb(255, 99, 132)",
  yellow: "rgb(255, 205, 86)",
  green: "rgb(54, 162, 235)",
  purple: "rgb(153, 102, 255)",
  orange: "rgb(255, 159, 64)",
};

export function Dashboard() {
  const isMdUp = useMediaQuery("(min-width: 768px)");

  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const [filters, setFilters] = useState<FilterState>({
    centerId: "",
    classId: "",
    childId: "",
    dateRange: [thirtyDaysAgo, today],
    dataTypes: ["Daily Logs", "Health Records", "Staff Performance"],
    isFilterOpen: isMdUp,
  });

  const { data: children = [], isLoading: loadingChildren, error: errorChildren } = useQuery<Child[]>({
    queryKey: ["children"],
    queryFn: fetchChildren,
  });

  const { data: trendData = [], isLoading: loadingTrend, error: errorTrend } = useQuery<TrendData[]>({
    queryKey: ["daily-logs-trend", filters.dateRange, filters.childId],
    queryFn: () =>
      fetchTrendOverTime({
        startDate: filters.dateRange[0] ? format(filters.dateRange[0], "yyyy-MM-dd") : FALLBACK_START_DATE,
        endDate: filters.dateRange[1] ? format(filters.dateRange[1], "yyyy-MM-dd") : FALLBACK_END_DATE,
        childId: filters.childId || undefined,
      }),
  });

  const { data: staffData = [], isLoading: loadingStaff, error: errorStaff } = useQuery<StaffPerformance[]>({
    queryKey: ["staff-performance", filters.dateRange, filters.centerId],
    queryFn: () =>
      fetchStaffPerformance({
        startDate: filters.dateRange[0] ? format(filters.dateRange[0], "yyyy-MM-dd") : FALLBACK_START_DATE,
        endDate: filters.dateRange[1] ? format(filters.dateRange[1], "yyyy-MM-dd") : FALLBACK_END_DATE,
        centerId: filters.centerId || undefined,
      }),
  });

  const { data: incidentData = [], isLoading: loadingIncidents, error: errorIncidents } = useQuery<IncidentFrequency[]>({
    queryKey: ["incident-frequency", filters.dateRange, filters.centerId],
    queryFn: () =>
      fetchIncidentFrequency({
        startDate: filters.dateRange[0] ? format(filters.dateRange[0], "yyyy-MM-dd") : FALLBACK_START_DATE,
        endDate: filters.dateRange[1] ? format(filters.dateRange[1], "yyyy-MM-dd") : FALLBACK_END_DATE,
        centerId: filters.centerId || undefined,
      }),
  });

  const loading = loadingChildren || loadingTrend || loadingStaff || loadingIncidents;
  const error = errorChildren || errorTrend || errorStaff || errorIncidents;

  const centers = useMemo(() => {
    return Array.from(new Set(children.map((child) => child.centerId))).sort();
  }, [children]);

  const classes = useMemo(() => {
    const filteredChildrenByCenter = filters.centerId
      ? children.filter((child) => child.centerId === filters.centerId)
      : children;
    return Array.from(new Set(filteredChildrenByCenter.map((child) => child.classId))).sort();
  }, [children, filters.centerId]);

  const filteredChildren = useMemo(() => {
    return children.filter(
      (child) =>
        (!filters.centerId || child.centerId === filters.centerId) &&
        (!filters.classId || child.classId === filters.classId)
    );
  }, [children, filters.centerId, filters.classId]);

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters((prev) => ({
      ...prev,
      centerId: "",
      classId: "",
      childId: "",
      // Resetting dateRange to a default, valid range for API calls,
      // but the UI will show 'Select Start/End Date' because the values
      // are not being explicitly set in the UI. A better long-term fix
      // would be to have a single source of truth for the date state.
      dateRange: [undefined, undefined],
      dataTypes: ["Daily Logs", "Health Records", "Staff Performance"],
    }));
  };

  const toggleFilterPanel = () => {
    setFilters((prev) => ({ ...prev, isFilterOpen: !prev.isFilterOpen }));
  };

  const FilterPanel = () => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "bg-white border border-gray-200 rounded-xl p-6 shadow-md transition-all duration-300",
        isMdUp ? "min-h-[calc(100vh-4rem)] sticky top-8" : "fixed inset-0 z-50 p-4 overflow-y-auto"
      )}
    >
      <div className="flex items-center justify-between mb-6 pb-4 border-b">
        <h2 className="text-xl font-bold text-gray-800 flex items-center">
          <Filter className="h-6 w-6 mr-2 text-blue-500" /> Filters
        </h2>
        <Button variant="ghost" size="sm" onClick={toggleFilterPanel} className="text-gray-600 hover:text-gray-900 md:hidden">
          <X className="h-5 w-5" />
        </Button>
      </div>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Center</label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                {filters.centerId || "All Centers"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]">
              <DropdownMenuItem onSelect={() => handleFilterChange({ centerId: "" })}>
                All Centers
              </DropdownMenuItem>
              {centers.map((center) => (
                <DropdownMenuItem key={center} onSelect={() => handleFilterChange({ centerId: center })}>
                  {center}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between" disabled={classes.length === 0}>
                {filters.classId || "All Classes"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]">
              <DropdownMenuItem onSelect={() => handleFilterChange({ classId: "" })}>
                All Classes
              </DropdownMenuItem>
              {classes.map((classId) => (
                <DropdownMenuItem key={classId} onSelect={() => handleFilterChange({ classId })}>
                  {classId}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Child</label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between"
                disabled={loadingChildren || filteredChildren.length === 0}
              >
                {loadingChildren
                  ? "Loading..."
                  : filters.childId
                  ? filteredChildren.find((child) => child.id === filters.childId)?.firstName +
                    " " +
                    filteredChildren.find((child) => child.id === filters.childId)?.lastName
                  : "All Children"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]">
              <DropdownMenuItem onSelect={() => handleFilterChange({ childId: "" })}>
                All Children
              </DropdownMenuItem>
              {filteredChildren.map((child: Child) => (
                <DropdownMenuItem key={child.id} onSelect={() => handleFilterChange({ childId: child.id })}>
                  {child.firstName} {child.lastName}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-between pr-3">
                  {filters.dateRange[0] ? format(filters.dateRange[0], "PPP") : "Select Start Date"}
                  <Calendar className="h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <DayPicker
                  mode="single"
                  selected={filters.dateRange[0]}
                  onSelect={(date) => handleFilterChange({ dateRange: [date, filters.dateRange[1]] })}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-between pr-3">
                  {filters.dateRange[1] ? format(filters.dateRange[1], "PPP") : "Select End Date"}
                  <Calendar className="h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <DayPicker
                  mode="single"
                  selected={filters.dateRange[1]}
                  onSelect={(date) => handleFilterChange({ dateRange: [filters.dateRange[0], date] })}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Data Types</label>
          <div className="space-y-2">
            {["Daily Logs", "Health Records", "Staff Performance"].map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={type}
                  checked={filters.dataTypes.includes(type)}
                  onChange={(e) => {
                    const newTypes = e.target.checked
                      ? [...filters.dataTypes, type]
                      : filters.dataTypes.filter((dt) => dt !== type);
                    handleFilterChange({ dataTypes: newTypes });
                  }}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor={type} className="text-sm font-medium text-gray-700">
                  {type}
                </label>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-end pt-2">
          <Button variant="ghost" onClick={clearFilters} className="text-sm">
            Reset Filters
          </Button>
        </div>
      </div>
    </motion.div>
  );

  const VisualizationContainer = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-96">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-400"
          />
        </div>
      );
    }
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-96 text-red-600 bg-white rounded-lg p-4 shadow-md">
          <X className="h-12 w-12 mb-4" />
          <p>Error fetching data: {error.message}. Please try again.</p>
        </div>
      );
    }

    const showDailyLogs = filters.dataTypes.includes("Daily Logs");
    const showHealthRecords = filters.dataTypes.includes("Health Records");
    const showStaffPerformance = filters.dataTypes.includes("Staff Performance");

    const hasData =
      (showDailyLogs && trendData.length > 0) ||
      (showStaffPerformance && staffData.length > 0) ||
      (showHealthRecords && incidentData.length > 0);

    if (!hasData) {
      return (
        <div className="flex items-center justify-center h-96 text-gray-500 bg-white rounded-lg p-4 shadow-md">
          No data available for the selected filters.
        </div>
      );
    }

    const trendChartData = {
      labels: trendData.map((item) => {
        // Correctly handle the Firebase Timestamp to get a valid date string
        const date = new Date(item.date._seconds * 1000);
        return isValid(date) ? format(date, "MMM dd, yyyy") : "Invalid Date";
      }),
      datasets: [
        {
          label: "Avg Nap Duration (min)",
          data: trendData.map((item) => item.averageNapDuration || 0),
          borderColor: chartColors.blue,
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          tension: 0.4,
          fill: true,
        },
        {
          label: "Total Meals",
          data: trendData.map((item) => item.totalMeals || 0),
          borderColor: chartColors.red,
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          tension: 0.4,
          fill: true,
        },
      ],
    };

    const staffChartData = {
      labels: staffData.map((item) => item.staffId),
      datasets: [
        {
          label: "Total Logs",
          data: staffData.map((item) => item.totalLogs),
          backgroundColor: staffData.map(() => chartColors.green),
          borderColor: staffData.map(() => "rgb(54, 162, 235, 1)"),
          borderWidth: 1,
        },
      ],
    };

    const incidentDoughnutData = {
      labels: incidentData.map((item) => item.type),
      datasets: [
        {
          data: incidentData.map((item) => item.count),
          backgroundColor: [chartColors.blue, chartColors.red, chartColors.yellow, chartColors.purple],
          hoverBackgroundColor: [chartColors.blue, chartColors.red, chartColors.yellow, chartColors.purple],
          borderWidth: 2,
        },
      ],
    };

    return (
      <div className="space-y-8">
        {showDailyLogs && trendData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl p-8 shadow-md"
          >
            <div className="flex items-center mb-4 text-blue-600">
              <LineChart className="h-6 w-6 mr-2" />
              <h3 className="text-xl font-bold">Daily Log Trends</h3>
            </div>
            <div className="h-96">
              <Line data={trendChartData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </motion.div>
        )}
        {showStaffPerformance && staffData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-xl p-8 shadow-md"
          >
            <div className="flex items-center mb-4 text-green-600">
              <BarChart className="h-6 w-6 mr-2" />
              <h3 className="text-xl font-bold">Staff Performance</h3>
            </div>
            <div className="h-96">
              <Bar data={staffChartData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </motion.div>
        )}
        {showHealthRecords && incidentData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-xl p-8 shadow-md"
          >
            <div className="flex items-center mb-4 text-red-600">
              <PieChart className="h-6 w-6 mr-2" />
              <h3 className="text-xl font-bold">Incident Frequency</h3>
            </div>
            <div className="h-96 flex items-center justify-center">
              <Doughnut data={incidentDoughnutData} options={{ responsive: true, maintainAspectRatio: false, cutout: '70%' }} />
            </div>
          </motion.div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 font-sans">
      <div className="flex justify-between items-center mb-6 md:hidden">
        <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
        <Button variant="outline" size="sm" onClick={toggleFilterPanel}>
          <Filter className="h-5 w-5 mr-2" /> Filters
        </Button>
      </div>

      <div className={cn("grid gap-8", isMdUp ? "grid-cols-4" : "grid-cols-1")}>
        {isMdUp && (
          <div className="col-span-1">
            <FilterPanel />
          </div>
        )}
        <div className={cn(isMdUp ? "col-span-3" : "col-span-1")}>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-extrabold text-gray-900 mb-8 hidden md:block"
          >
            Analytics Dashboard
          </motion.h1>
          <VisualizationContainer />
        </div>
      </div>

      {!isMdUp && filters.isFilterOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 z-50 flex items-start justify-center p-4">
          <FilterPanel />
        </div>
      )}
    </div>
  );
}