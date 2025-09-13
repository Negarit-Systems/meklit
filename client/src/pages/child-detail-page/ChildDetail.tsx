import * as React from "react";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Filter } from "lucide-react";
import { Line as LineChart } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend);

interface FilterState {
  dateRange: [string, string];
  limit: number;
}

export function ChildDetail() {
  const { id } = useParams<{ id: string }>();
  const isMdUp = useMediaQuery("(min-width: 768px)");
  const [filters, setFilters] = useState<FilterState>({
    dateRange: ["2022-09-01", "2027-09-01"],
    limit: 10,
  });

  const { data: child, isLoading: loadingChild } = useQuery({
    queryKey: ["child", id],
    queryFn: async () => {
      const response = await fetch(`http://localhost:5000/api/children/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          Accept: "*/*",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch child");
      return response.json();
    },
  });

  const { data: profileData, isLoading: loadingProfile, error: errorProfile } = useQuery({
    queryKey: ["health-child-profile", id, filters],
    queryFn: async () => {
      const response = await fetch(`http://localhost:5000/api/health-records/child-health-profile?${new URLSearchParams({
        childId: id!,
        limit: filters.limit.toString(),
        startDate: filters.dateRange[0],
        endDate: filters.dateRange[1],
      })}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          Accept: "*/*",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch child health profile");
      return response.json();
    },
  });

  const { data: timelineData, isLoading: loadingTimeline, error: errorTimeline } = useQuery({
    queryKey: ["health-timeline", id, filters.dateRange],
    queryFn: async () => {
      const response = await fetch(`http://localhost:5000/api/health-records/timeline?${new URLSearchParams({
        startDate: filters.dateRange[0],
        endDate: filters.dateRange[1],
        childId: id!,
      })}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          Accept: "*/*",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch timeline");
      return response.json();
    },
  });

  const loading = loadingChild || loadingProfile || loadingTimeline;
  const error = errorProfile || errorTimeline;

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({
      dateRange: ["2022-09-01", "2027-09-01"],
      limit: 10,
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
        <h2 className="text-xl font-bold text-primary">Filters</h2>
        <Button variant="ghost" size="sm" onClick={clearFilters} className="text-destructive hover:text-destructive/80">
          Clear All
        </Button>
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
        <label className="block text-sm font-medium text-foreground">Limit Recent Entries</label>
        <Input
          type="number"
          value={filters.limit}
          onChange={(e) => handleFilterChange({ limit: parseInt(e.target.value) })}
          min={1}
          max={50}
          className="w-full mt-1"
        />
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
    if (!profileData?.data && !timelineData) {
      return (
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          No data available for this child.
        </div>
      );
    }

    const timelineChartData = {
      labels: timelineData?.map((item: any) => new Date(item.timestamp._seconds * 1000).toLocaleDateString()) || [],
      datasets: [
        {
          label: "Health Events",
          data: timelineData?.map(() => 1) || [],
          backgroundColor: "bg-red-500",
          borderColor: "border-red-700",
          borderWidth: 2,
          fill: true,
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
            <h3 className="text-xl font-bold mb-4 text-primary">Health Timeline</h3>
            <LineChart
              data={timelineChartData}
              options={{
                responsive: true,
                plugins: { legend: { position: "top" }, title: { display: true, text: "Health Events Timeline" } },
              }}
            />
          </motion.div>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-card border border-border rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
          >
            <h3 className="text-xl font-bold mb-4 text-primary">Recent Entries</h3>
            <ul className="space-y-4">
              {profileData?.data?.recentEntries?.map((entry: any) => (
                <li key={entry.id} className="border-b border-border pb-2">
                  <p><strong>Type:</strong> {entry.type}</p>
                  <p><strong>Timestamp:</strong> {new Date(entry.timestamp._seconds * 1000).toLocaleString()}</p>
                  <p><strong>Details:</strong> {entry.details.incident || entry.details.medication || "N/A"}</p>
                  <p><strong>Action:</strong> {entry.actionTaken}</p>
                </li>
              ))}
            </ul>
          </motion.div>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-card border border-border rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
          >
            <h3 className="text-xl font-bold mb-4 text-primary">Summary</h3>
            <p><strong>Total Incidents:</strong> {profileData?.data?.totalIncidents || 0}</p>
            <p><strong>Total Medications:</strong> {profileData?.data?.totalMedications || 0}</p>
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
          Child Details: {child?.data?.firstName} {child?.data?.lastName}
        </motion.h1>
        <VisualizationContainer />
      </div>
    </div>
  );
}