import * as React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Filter, Calendar, Activity, Users, AlertTriangle } from "lucide-react";
import { Bar as BarChart, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useMediaQuery } from "@/hooks/use-media-query";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

interface FilterState {
  centerId: string;
  classId: string;
  childId: string;
  dateRange: [string, string];
  dataTypes: string[];
}

interface Child {
  id: string;
  firstName: string;
  lastName: string;
  centerId: string;
  classId: string;
}

export function Dashboard() {
  const isMdUp = useMediaQuery("(min-width: 768px)");
  const [filters, setFilters] = useState<FilterState>({
    centerId: "",
    classId: "",
    childId: "",
    dateRange: ["2022-09-01", "2027-09-01"],
    dataTypes: ["Daily Logs", "Health Records"],
  });

  // Fetch children for filter options
  const { data: children, isLoading: loadingChildren } = useQuery({
    queryKey: ["children", filters.centerId, filters.classId],
    queryFn: async () => {
      const response = await fetch(`http://localhost:5000/api/children?${new URLSearchParams({
        centerId: filters.centerId || "",
        classId: filters.classId || "",
      })}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          Accept: "*/*",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch children");
      const { data } = await response.json();
      return data; // Array of Child
    },
  });

  // Fetch data for charts
  const { data: trendData, isLoading: loadingTrend, error: errorTrend } = useQuery({
    queryKey: ["daily-logs-trend", filters],
    queryFn: async () => {
      const response = await fetch(`http://localhost:5000/api/daily-logs/trend-over-time?${new URLSearchParams({
        startDate: filters.dateRange[0],
        endDate: filters.dateRange[1],
        centerId: filters.centerId || "",
        classId: filters.classId || "",
        childId: filters.childId || "",
      })}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          Accept: "*/*",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch daily logs trend");
      return response.json();
    },
  });

  const { data: staffData, isLoading: loadingStaff, error: errorStaff } = useQuery({
    queryKey: ["daily-logs-staff", filters],
    queryFn: async () => {
      const response = await fetch(`http://localhost:5000/api/daily-logs/staff-performance?${new URLSearchParams({
        startDate: filters.dateRange[0],
        endDate: filters.dateRange[1],
        centerId: filters.centerId || "",
      })}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          Accept: "*/*",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch staff performance");
      return response.json();
    },
  });

  const { data: incidentData, isLoading: loadingIncidents, error: errorIncidents } = useQuery({
    queryKey: ["health-incident-frequency", filters],
    queryFn: async () => {
      const response = await fetch(`http://localhost:5000/api/health-records/incident-frequency?${new URLSearchParams({
        startDate: filters.dateRange[0],
        endDate: filters.dateRange[1],
        centerId: filters.centerId || "",
      })}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          Accept: "*/*",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch incident frequency");
      return response.json();
    },
  });

  const loading = loadingChildren || loadingTrend || loadingStaff || loadingIncidents;
  const error = errorTrend || errorStaff || errorIncidents;

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({
      centerId: "",
      classId: "",
      childId: "",
      dateRange: ["2022-09-01", "2027-09-01"],
      dataTypes: ["Daily Logs", "Health Records"],
    });
  };

  const FilterPanel = () => (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-card border border-border rounded-2xl p-6 space-y-6 shadow-lg"
    >
      <div className="flex items-center justify-between bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-4">
        <h2 className="text-xl font-bold text-white">Analytics Filters <Filter className="h-5 w-5 inline ml-2" /></h2>
        <Button variant="ghost" size="sm" onClick={clearFilters} className="text-white hover:text-gray-200">
          Clear All
        </Button>
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground">Center</label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between mt-1">
              {filters.centerId || "Select Center"}
              <Filter className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {[...new Set(children?.map((child: Child) => child.centerId))].map((centerId) => (
              <DropdownMenuItem key={centerId} onSelect={() => handleFilterChange({ centerId })}>
                {centerId}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground">Class</label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between mt-1">
              {filters.classId || "Select Class"}
              <Filter className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {[...new Set(children?.filter((child: Child) => !filters.centerId || child.centerId === filters.centerId).map((child: Child) => child.classId))].map((classId) => (
              <DropdownMenuItem key={classId} onSelect={() => handleFilterChange({ classId })}>
                {classId}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground">Child</label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between mt-1">
              {filters.childId ? children?.find((child: Child) => child.id === filters.childId)?.firstName + " " + children?.find((child: Child) => child.id === filters.childId)?.lastName : "Select Child"}
              <Filter className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {children?.filter((child: Child) => (!filters.centerId || child.centerId === filters.centerId) && (!filters.classId || child.classId === filters.classId)).map((child: Child) => (
              <DropdownMenuItem key={child.id} onSelect={() => handleFilterChange({ childId: child.id })}>
                {child.firstName} {child.lastName}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground">Date Range</label>
        <div className="flex gap-2 mt-1">
          <Input
            type="date"
            value={filters.dateRange[0]}
            onChange={(e) => handleFilterChange({ dateRange: [e.target.value, filters.dateRange[1]] })}
            className="w-full"
          />
          <Input
            type="date"
            value={filters.dateRange[1]}
            onChange={(e) => handleFilterChange({ dateRange: [filters.dateRange[0], e.target.value] })}
            className="w-full"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground">Data Types</label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between mt-1">
              {filters.dataTypes.length > 0 ? filters.dataTypes.join(", ") : "Select Data Types"}
              <Filter className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              onSelect={() =>
                handleFilterChange({
                  dataTypes: filters.dataTypes.includes("Daily Logs")
                    ? filters.dataTypes.filter((dt) => dt !== "Daily Logs")
                    : [...filters.dataTypes, "Daily Logs"],
                })
              }
            >
              Daily Logs
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() =>
                handleFilterChange({
                  dataTypes: filters.dataTypes.includes("Health Records")
                    ? filters.dataTypes.filter((dt) => dt !== "Health Records")
                    : [...filters.dataTypes, "Health Records"],
                })
              }
            >
              Health Records
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  );

  const VisualizationContainer = () => {
    if (loading) {
      return (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="flex items-center justify-center h-64"
        >
          <div className="rounded-full h-12 w-12 border-t-4 border-b-4 border-primary animate-spin" />
        </motion.div>
      );
    }
    if (error) {
      return (
        <div className="flex items-center justify-center h-64 text-destructive">
          Failed to load data. Please try again.
        </div>
      );
    }
    if (!trendData?.data && !staffData?.data && !incidentData) {
      return (
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          No data available for the selected filters.
        </div>
      );
    }

    const trendChartData = {
      labels: trendData?.data?.map((item: any) => new Date(item.date._seconds * 1000).toLocaleDateString()) || [],
      datasets: [
        ...(filters.dataTypes.includes("Daily Logs")
          ? [
              {
                label: "Average Nap Duration",
                data: trendData?.data?.map((item: any) => item.averageNapDuration) || [],
                backgroundColor: "bg-green-500",
                borderColor: "border-green-700",
                borderWidth: 2,
              },
              {
                label: "Total Meals",
                data: trendData?.data?.map((item: any) => item.totalMeals) || [],
                backgroundColor: "bg-blue-500",
                borderColor: "border-blue-700",
                borderWidth: 2,
              },
            ]
          : []),
      ],
    };

    const staffChartData = {
      labels: staffData?.data?.map((item: any) => item.staffId) || [],
      datasets: [
        {
          label: "Total Logs",
          data: staffData?.data?.map((item: any) => item.totalLogs) || [],
          backgroundColor: "bg-purple-500",
          borderColor: "border-purple-700",
          borderWidth: 2,
        },
      ],
    };

    const incidentPieData = {
      labels: incidentData?.map((item: any) => item.type) || [],
      datasets: [
        {
          data: incidentData?.map((item: any) => item.count) || [],
          backgroundColor: ["bg-red-500", "bg-blue-500", "bg-yellow-500"],
          borderColor: ["border-red-700", "border-blue-700", "border-yellow-700"],
          borderWidth: 1,
        },
      ],
    };

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filters.dataTypes.includes("Daily Logs") && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.3 }}
              className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-8 shadow-2xl hover:shadow-3xl text-white"
            >
              <div className="flex items-center mb-4">
                <Activity className="h-8 w-8 mr-3" />
                <h3 className="text-2xl font-extrabold">Daily Log Trends</h3>
              </div>
              <BarChart
                data={trendChartData}
                options={{
                  responsive: true,
                  plugins: { legend: { position: "top", labels: { color: "white" } }, title: { display: true, text: "Daily Log Trends", color: "white" } },
                }}
              />
            </motion.div>
          )}
          {filters.dataTypes.includes("Daily Logs") && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.3 }}
              className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-8 shadow-2xl hover:shadow-3xl text-white"
            >
              <div className="flex items-center mb-4">
                <Users className="h-8 w-8 mr-3" />
                <h3 className="text-2xl font-extrabold">Staff Performance</h3>
              </div>
              <BarChart
                data={staffChartData}
                options={{
                  responsive: true,
                  plugins: { legend: { position: "top", labels: { color: "white" } }, title: { display: true, text: "Staff Performance", color: "white" } },
                }}
              />
            </motion.div>
          )}
          {filters.dataTypes.includes("Health Records") && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.3 }}
              className="bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl p-8 shadow-2xl hover:shadow-3xl text-white"
            >
              <div className="flex items-center mb-4">
                <AlertTriangle className="h-8 w-8 mr-3" />
                <h3 className="text-2xl font-extrabold">Incident Frequency</h3>
              </div>
              <Pie
                data={incidentPieData}
                options={{
                  responsive: true,
                  plugins: { legend: { position: "top", labels: { color: "white" } }, title: { display: true, text: "Health Incidents", color: "white" } },
                }}
              />
            </motion.div>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className={cn("flex flex-col md:flex-row gap-8 p-6 bg-background/95 rounded-xl", isMdUp ? "flex-row" : "flex-col")}>
      <div className={cn("md:w-1/4", isMdUp ? "w-1/4" : "w-full")}>
        <FilterPanel />
      </div>
      <div className={cn("flex-1", isMdUp ? "w-3/4" : "w-full")}>
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-extrabold mb-8 text-primary"
        >
          Analytics Dashboard
        </motion.h1>
        <VisualizationContainer />
      </div>
    </div>
  );
}