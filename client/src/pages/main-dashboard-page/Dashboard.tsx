import * as React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { Calendar, Filter, X } from "lucide-react"
import { Bar as BarChart, Line as LineChart, Pie } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"
import { useMediaQuery } from "@/hooks/use-media-query"

// Placeholder for apiService
const apiService = {
  getDailyLogs: async (filters: any) => {
    // Mock API call
    return {
      meals: { total: 150, data: [20, 25, 30, 25, 20, 15, 15] },
      naps: { total: 80, data: [10, 12, 15, 13, 10, 10, 10] },
      diapers: { total: 100, data: [15, 15, 20, 15, 15, 10, 10] },
    }
  },
  getHealthRecords: async (filters: any) => {
    // Mock API call
    return {
      incidents: { total: 30, data: { fever: 10, rash: 8, other: 12 } },
    }
  },
}

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

interface FilterState {
  center: string
  class: string
  child: string
  symptoms: string[]
  napDuration: [number, number]
  dateRange: [string, string]
  dataTypes: string[]
  compareEntities: string[]
  staff: string
}

export function Dashboard() {
  const isMdUp = useMediaQuery("(min-width: 768px)")
  const [filters, setFilters] = useState<FilterState>({
    center: "",
    class: "",
    child: "",
    symptoms: [],
    napDuration: [0, 120],
    dateRange: ["", ""],
    dataTypes: ["Daily Logs", "Health Records"],
    compareEntities: [],
    staff: "",
  })
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const [dailyLogs, healthRecords] = await Promise.all([
          apiService.getDailyLogs(filters),
          apiService.getHealthRecords(filters),
        ])
        setData({ dailyLogs, healthRecords })
      } catch (err) {
        setError("Failed to fetch data. Please try again.")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [filters])

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }

  const clearFilters = () => {
    setFilters({
      center: "",
      class: "",
      child: "",
      symptoms: [],
      napDuration: [0, 120],
      dateRange: ["", ""],
      dataTypes: ["Daily Logs", "Health Records"],
      compareEntities: [],
      staff: "",
    })
  }

  const FilterPanel = () => (
    <div className="bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 border border-border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Filters</h2>
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          Clear All
        </Button>
      </div>
      <div>
        <label className="block text-sm font-medium">Center</label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              {filters.center || "Select Center"}
              <Filter className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onSelect={() => handleFilterChange({ center: "Center A" })}>
              Center A
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => handleFilterChange({ center: "Center B" })}>
              Center B
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div>
        <label className="block text-sm font-medium">Class</label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              {filters.class || "Select Class"}
              <Filter className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onSelect={() => handleFilterChange({ class: "Class 1" })}>
              Class 1
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => handleFilterChange({ class: "Class 2" })}>
              Class 2
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div>
        <label className="block text-sm font-medium">Child</label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              {filters.child || "Select Child"}
              <Filter className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onSelect={() => handleFilterChange({ child: "Child A" })}>
              Child A
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => handleFilterChange({ child: "Child B" })}>
              Child B
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div>
        <label className="block text-sm font-medium">Symptoms</label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              {filters.symptoms.length > 0 ? filters.symptoms.join(", ") : "Select Symptoms"}
              <Filter className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              onSelect={() =>
                handleFilterChange({
                  symptoms: filters.symptoms.includes("Fever")
                    ? filters.symptoms.filter((s) => s !== "Fever")
                    : [...filters.symptoms, "Fever"],
                })
              }
            >
              Fever
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() =>
                handleFilterChange({
                  symptoms: filters.symptoms.includes("Rash")
                    ? filters.symptoms.filter((s) => s !== "Rash")
                    : [...filters.symptoms, "Rash"],
                })
              }
            >
              Rash
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div>
        <label className="block text-sm font-medium">Nap Duration (minutes)</label>
        <Input
          type="range"
          min="0"
          max="120"
          value={filters.napDuration[1]}
          onChange={(e) =>
            handleFilterChange({ napDuration: [0, parseInt(e.target.value)] })
          }
        />
        <span className="text-sm text-muted-foreground">
          {filters.napDuration[0]} - {filters.napDuration[1]} minutes
        </span>
      </div>
      <div>
        <label className="block text-sm font-medium">Date Range</label>
        <div className="flex gap-2">
          <Input
            type="date"
            value={filters.dateRange[0]}
            onChange={(e) =>
              handleFilterChange({ dateRange: [e.target.value, filters.dateRange[1]] })
            }
          />
          <Input
            type="date"
            value={filters.dateRange[1]}
            onChange={(e) =>
              handleFilterChange({ dateRange: [filters.dateRange[0], e.target.value] })
            }
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium">Data Types</label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
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
      <div>
        <label className="block text-sm font-medium">Compare Entities</label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              {filters.compareEntities.length > 0
                ? filters.compareEntities.join(", ")
                : "Select Entities"}
              <Filter className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              onSelect={() =>
                handleFilterChange({
                  compareEntities: filters.compareEntities.includes("Child A")
                    ? filters.compareEntities.filter((e) => e !== "Child A")
                    : [...filters.compareEntities, "Child A"],
                })
              }
            >
              Child A
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() =>
                handleFilterChange({
                  compareEntities: filters.compareEntities.includes("Child B")
                    ? filters.compareEntities.filter((e) => e !== "Child B")
                    : [...filters.compareEntities, "Child B"],
                })
              }
            >
              Child B
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div>
        <label className="block text-sm font-medium">Staff</label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              {filters.staff || "Select Staff"}
              <Filter className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onSelect={() => handleFilterChange({ staff: "Staff A" })}>
              Staff A
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => handleFilterChange({ staff: "Staff B" })}>
              Staff B
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )

  const VisualizationContainer = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      )
    }
    if (error) {
      return (
        <div className="flex items-center justify-center h-64 text-destructive">
          {error}
        </div>
      )
    }
    if (!data || (!data.dailyLogs && !data.healthRecords)) {
      return (
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          No records match the current filters
        </div>
      )
    }

    const chartData = {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      datasets: [
        ...(filters.dataTypes.includes("Daily Logs")
          ? [
              {
                label: "Meals",
                data: data.dailyLogs.meals.data,
                backgroundColor: "rgba(59, 130, 246, 0.5)",
              },
              {
                label: "Naps",
                data: data.dailyLogs.naps.data,
                backgroundColor: "rgba(34, 197, 94, 0.5)",
              },
              {
                label: "Diapers",
                data: data.dailyLogs.diapers.data,
                backgroundColor: "rgba(255, 99, 132, 0.5)",
              },
            ]
          : []),
      ],
    }

    const healthPieData = {
      labels: ["Fever", "Rash", "Other"],
      datasets: [
        {
          data: [
            data.healthRecords.incidents.data.fever,
            data.healthRecords.incidents.data.rash,
            data.healthRecords.incidents.data.other,
          ],
          backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
        },
      ],
    }

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2">Daily Activities</h3>
            <BarChart
              data={chartData}
              options={{
                responsive: true,
                plugins: { legend: { position: "top" }, title: { display: true, text: "Daily Logs" } },
              }}
            />
          </div>
          {filters.dataTypes.includes("Health Records") && (
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2">Health Incidents</h3>
              <Pie
                data={healthPieData}
                options={{
                  responsive: true,
                  plugins: { legend: { position: "top" }, title: { display: true, text: "Health Incidents" } },
                }}
              />
            </div>
          )}
        </div>
        {filters.compareEntities.length > 0 && (
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2">Comparison: {filters.compareEntities.join(" vs ")}</h3>
            <BarChart
              data={{
                labels: filters.compareEntities,
                datasets: [
                  {
                    label: "Nap Duration",
                    data: filters.compareEntities.map(() => Math.random() * 100),
                    backgroundColor: "rgba(59, 130, 246, 0.5)",
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: { legend: { position: "top" }, title: { display: true, text: "Comparison" } },
              }}
            />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col md:flex-row gap-6", isMdUp ? "flex-row" : "flex-col")}>
      <div className={cn("md:w-1/4", isMdUp ? "w-1/4" : "w-full")}>
        <FilterPanel />
      </div>
      <div className={cn("flex-1", isMdUp ? "w-3/4" : "w-full")}>
        <VisualizationContainer />
      </div>
    </div>
  )
}