import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Filter } from "lucide-react";
import { ChartSection } from "./components/ChartSection";
import { FilterPanel, type FilterState } from "./components/FilterPanel";
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
import { format } from "date-fns";
import "react-day-picker/dist/style.css";

import {
  fetchChildren,
  fetchTrendOverTime,
  fetchStaffPerformance,
  fetchIncidentFrequency,
} from "../../services/apiService";

import type { Child, TrendData, StaffPerformance, IncidentFrequency } from "../../services/apiService";

// Register Chart.js components
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement);

// Define global constants for API date fallbacks
const FALLBACK_START_DATE = "2022-09-01";
const FALLBACK_END_DATE = "2027-09-01";


export function Dashboard() {
  const isMdUp = useMediaQuery("(min-width: 768px)");

  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);

  const [filters, setFilters] = useState<FilterState>({
    centerId: "",
    classId: "",
    childId: "",
    dateRange: [sevenDaysAgo, today],
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
    retry: 1,
    refetchOnWindowFocus: false,
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
    if (!Array.isArray(children)) return [];
    return Array.from(new Set(children.map((child) => child.centerId))).sort();
  }, [children]);

  const classes = useMemo(() => {
    if (!Array.isArray(children)) return [];
    const filteredChildrenByCenter = filters.centerId
      ? children.filter((child) => child.centerId === filters.centerId)
      : children;
    return Array.from(new Set(filteredChildrenByCenter.map((child) => child.classId))).sort();
  }, [children, filters.centerId]);

  const filteredChildren = useMemo(() => {
    if (!Array.isArray(children)) return [];
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
      dateRange: [undefined, undefined],
      dataTypes: ["Daily Logs", "Health Records", "Staff Performance"],
    }));
  };

  const toggleFilterPanel = () => {
    setFilters((prev) => ({ ...prev, isFilterOpen: !prev.isFilterOpen }));
  };


  return (
    <div className="min-h-screen p-4 md:p-8 font-sans">
      <div className="flex justify-between items-center mb-6 md:hidden">
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
        {/* Mobile filter button */}
        <Button variant="outline" size="sm" onClick={toggleFilterPanel}>
          <Filter className="h-5 w-5 mr-2" /> Filters
        </Button>
      </div>

      <div className={cn("flex flex-col gap-8", isMdUp ? "grid grid-cols-4 gap-8" : "flex flex-col gap-6")}>
        {/* Desktop filter button visible only when the panel is hidden */}
        {isMdUp && !filters.isFilterOpen && (
          <div className="col-span-1 flex items-start">
            <Button
              variant="outline"
              className="mt-2"
              onClick={toggleFilterPanel}
            >
              <Filter className="h-5 w-5 mr-2" />Filters
            </Button>
          </div>
        )}

        {isMdUp && filters.isFilterOpen && (
          <div className="col-span-1">
            <FilterPanel
              isMdUp={isMdUp}
              filters={filters}
              centers={centers}
              classes={classes}
              filteredChildren={filteredChildren}
              loadingChildren={loadingChildren}
              onToggle={toggleFilterPanel}
              onChange={handleFilterChange}
              onReset={clearFilters}
            />
          </div>
        )}

        <div className={cn(isMdUp && filters.isFilterOpen ? "col-span-3" : "col-span-4", "flex flex-col gap-6")}>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-extrabold bg-gradient-to-r from-green-500 to-blue-500 text-transparent bg-clip-text mb-8 hidden md:block"
          >
            Analytics Dashboard
          </motion.h1>
          <ChartSection
            loading={loading}
            error={error as Error | undefined}
            filters={filters}
            trendData={trendData}
            staffData={staffData}
            incidentData={incidentData}
          />
        </div>
      </div>

      {!isMdUp && filters.isFilterOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 dark:bg-background/80 backdrop-blur-sm flex items-start justify-center p-4">
          <FilterPanel
            isMdUp={isMdUp}
            filters={filters}
            centers={centers}
            classes={classes}
            filteredChildren={filteredChildren}
            loadingChildren={loadingChildren}
            onToggle={toggleFilterPanel}
            onChange={handleFilterChange}
            onReset={clearFilters}
          />
        </div>
      )}
    </div>
  );
}