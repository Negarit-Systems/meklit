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
import { Filter } from "lucide-react";
import { Bar as BarChart } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useMediaQuery } from "@/hooks/use-media-query";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface FilterState {
  dateRange: [string, string];
  groupBy: "classId" | "childId";
  centerId: string;
}

interface Child {
  id: string;
  firstName: string;
  lastName: string;
  centerId: string;
  classId: string;
}

export function Comparision() {
  const isMdUp = useMediaQuery("(min-width: 768px)");
  const [filters, setFilters] = useState<FilterState>({
    dateRange: ["2022-09-01", "2027-09-01"],
    groupBy: "classId",
    centerId: "",
  });

  const { data: children, isLoading: loadingChildren } = useQuery({
    queryKey: ["children", filters.centerId],
    queryFn: async () => {
      const response = await fetch(`http://localhost:5000/api/children?${new URLSearchParams({
        centerId: filters.centerId || "",
      })}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          Accept: "*/*",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch children");
      const { data } = await response.json();
      return data;
    },
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["daily-logs-comparative", filters],
    queryFn: async () => {
      const response = await fetch(`http://localhost:5000/api/daily-logs/comparative?${new URLSearchParams({
        startDate: filters.dateRange[0],
        endDate: filters.dateRange[1],
        groupBy: filters.groupBy,
        centerId: filters.centerId || "",
      })}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          Accept: "*/*",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch comparative data");
      return response.json();
    },
  });

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({
      dateRange: ["2022-09-01", "2027-09-01"],
      groupBy: "classId",
      centerId: "",
    });
  };

  const FilterPanel = () => (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-card border border-border rounded-xl p-6 space-y-6 shadow-lg"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-primary">Comparison Filters</h2>
        <Button variant="ghost" size="sm" onClick={clearFilters} className="text-destructive hover:text-destructive/80">
          Clear All
        </Button>
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground">Group By</label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between mt-1">
              {filters.groupBy === "classId" ? "Class" : "Child"}
              <Filter className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onSelect={() => handleFilterChange({ groupBy: "classId" })}>
              Class
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => handleFilterChange({ groupBy: "childId" })}>
              Child
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
    </motion.div>
  );

  const VisualizationContainer = () => {
    if (isLoading || loadingChildren) {
      return (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="flex items-center justify-center h-64"
        >
          <div className="rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
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
    if (!data?.data) {
      return (
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          No data available for the selected filters.
        </div>
      );
    }

    const comparativeChartData = {
      labels: data.data.map((item: any) =>
        filters.groupBy === "childId"
          ? children?.find((child: Child) => child.id === item.group)?.firstName + " " + children?.find((child: Child) => child.id === item.group)?.lastName
          : item.group
      ) || [],
      datasets: [
        {
          label: "Total Logs",
          data: data.data.map((item: any) => item.totalLogs) || [],
          backgroundColor: "bg-blue-500",
          borderColor: "border-blue-700",
          borderWidth: 2,
        },
        {
          label: "Meal Count",
          data: data.data.map((item: any) => item.mealCount) || [],
          backgroundColor: "bg-green-500",
          borderColor: "border-green-700",
          borderWidth: 2,
        },
        {
          label: "Nap Count",
          data: data.data.map((item: any) => item.napCount) || [],
          backgroundColor: "bg-red-500",
          borderColor: "border-red-700",
          borderWidth: 2,
        },
      ],
    };

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="space-y-8">
        <div className="grid grid-cols-1 gap-6">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-card border border-border rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
          >
            <h3 className="text-xl font-bold mb-4 text-primary">Comparative Analysis by {filters.groupBy === "classId" ? "Class" : "Child"}</h3>
            <BarChart
              data={comparativeChartData}
              options={{
                responsive: true,
                plugins: { legend: { position: "top" }, title: { display: true, text: `Comparison by ${filters.groupBy === "classId" ? "Class" : "Child"}` } },
              }}
            />
          </motion.div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className={cn("flex flex-col md:flex-row gap-6 p-6 bg-background/95 rounded-xl", isMdUp ? "flex-row" : "flex-col")}>
      <div className={cn("md:w-1/4", isMdUp ? "w-1/4" : "w-full")}>
        <FilterPanel />
      </div>
      <div className={cn("flex-1", isMdUp ? "w-3/4" : "w-full")}>
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold mb-6 text-primary"
        >
          Comparison Dashboard
        </motion.h1>
        <VisualizationContainer />
      </div>
    </div>
  );
}