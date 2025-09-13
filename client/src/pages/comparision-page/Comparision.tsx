import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Filter } from "lucide-react";
import { Bar as BarChart, Line as LineChart } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { fetchChildren, fetchTrendOverTime, fetchHealthTimeline } from "@/services/apiComparsion";
import { useMediaQuery } from "@/hooks/use-media-query";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

interface Child {
  id: string;
  name: string;
  centerId: string;
  classId: string;
}

interface TrendData {
  date: string;
  averageNapDuration?: number;
  totalMeals?: number;
  // Add more fields as needed from API response
}

interface HealthRecord {
  childId: string;
  createdAt: string;
  // Add more fields as needed
}

interface MetricOption {
  value: string;
  label: string;
  source: "daily" | "health";
  aggType: "average" | "total";
}

const metrics: MetricOption[] = [
  { value: "napDuration", label: "Average Nap Duration (minutes)", source: "daily", aggType: "average" },
  { value: "meals", label: "Total Meals", source: "daily", aggType: "total" },
  { value: "incidents", label: "Total Incidents", source: "health", aggType: "total" },
  // Add more metrics as needed
];

const getColor = (index: number) => {
  const colors = [
    "rgba(59, 130, 246, 0.5)",
    "rgba(34, 197, 94, 0.5)",
    "rgba(255, 99, 132, 0.5)",
    "rgba(255, 159, 64, 0.5)",
    "rgba(153, 102, 255, 0.5)",
  ];
  return colors[index % colors.length];
};

export function Comparison() {
  const isMdUp = useMediaQuery("(min-width: 768px)");
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comparisonLevel, setComparisonLevel] = useState<"child" | "class" | "center">("child");
  const [selectedEntities, setSelectedEntities] = useState<string[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<string>("napDuration");
  const [viewType, setViewType] = useState<"aggregate" | "trend" | "table">("aggregate");
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });
  const [selectedCenter, setSelectedCenter] = useState<string>("");
  const [data, setData] = useState<Record<string, TrendData[] | HealthRecord[]>>({});

  // Fetch children
  useEffect(() => {
    const fetchChildrenData = async () => {
      try {
        console.log("Fetching children...");
        const childrenData = await fetchChildren();
        console.log("Raw children data:", childrenData);
        // Map API response to match the expected Child interface
        const mappedChildren = childrenData.map((child) => ({
          id: child.id,
          name: child.firstName && child.lastName ? `${child.firstName} ${child.lastName}` : child.id, // Fallback to id if names are missing
          centerId: child.centerId,
          classId: child.classId,
        }));
        console.log("Mapped children:", mappedChildren);
        setChildren(mappedChildren);
      } catch (err) {
        console.error("Error fetching children:", err);
        setError("Failed to fetch children. Check console for details.");
      } finally {
        setLoading(false);
      }
    };
    fetchChildrenData();
  }, []);

  // Get unique lists
  const uniqueCenters = [...new Set(children.map((c) => c.centerId))].sort();
  const uniqueClasses = [...new Set(children.map((c) => c.classId))].sort();
  const childList = children.map((c) => ({ value: c.id, label: c.name }));

  const entities = comparisonLevel === "child"
    ? childList
    : comparisonLevel === "class"
    ? uniqueClasses.map((cl) => ({ value: cl, label: cl }))
    : uniqueCenters.map((ce) => ({ value: ce, label: ce }));

  const getLabel = (id: string) => {
    if (comparisonLevel === "child") {
      return children.find((c) => c.id === id)?.name || id;
    }
    return id;
  };

  const metricObj = metrics.find((m) => m.value === selectedMetric)!;

  // Fetch data when filters change
  useEffect(() => {
    if (selectedEntities.length < 2) {
      setData({});
      return;
    }

    const fetchComparisonData = async () => {
      setLoading(true);
      setError(null);
      try {
        const newData: Record<string, TrendData[] | HealthRecord[]> = {};
        const isHealth = metricObj.source === "health";

        if (isHealth && comparisonLevel === "class") {
          // Special case: fetch all for center and group by class
          if (!selectedCenter) {
            throw new Error("Please select a center for class comparison on health metrics");
          }
          const allRecords = await fetchHealthTimeline({
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
            centerId: selectedCenter,
          });

          // Map childId to classId
          const childToClass = new Map(children.map((c) => [c.id, c.classId]));

          for (const classId of selectedEntities) {
            const filtered = allRecords.filter((r: HealthRecord) => childToClass.get(r.childId) === classId);
            newData[classId] = filtered;
          }
        } else {
          // Standard per entity fetch
          const paramName = comparisonLevel === "child" ? "childId" : comparisonLevel === "class" ? "classId" : "centerId";

          const promises = selectedEntities.map(async (id) => {
            const filters: any = {
              startDate: dateRange.startDate,
              endDate: dateRange.endDate,
            };
            if (isHealth) {
              if (comparisonLevel === "child") {
                filters.childId = id;
              } else if (comparisonLevel === "center") {
                filters.centerId = id;
              }
            } else {
              filters[paramName] = id;
            }

            const entityData = isHealth
              ? await fetchHealthTimeline(filters)
              : await fetchTrendOverTime(filters);
            return { id, data: entityData };
          });

          const results = await Promise.all(promises);
          results.forEach((r) => {
            newData[r.id] = r.data;
          });
        }

        setData(newData);
      } catch (err) {
        console.error("Error fetching comparison data:", err);
        setError("Failed to fetch comparison data. Check console for details.");
      } finally {
        setLoading(false);
      }
    };

    fetchComparisonData();
  }, [selectedEntities, dateRange, comparisonLevel, selectedMetric, selectedCenter, children]);

  // Compute aggregate value
  const computeAggregate = (entityData: TrendData[] | HealthRecord[], metric: MetricOption) => {
    if (entityData.length === 0) return 0;

    if (metric.source === "health") {
      return entityData.length; // Total incidents
    }

    const dailyData = entityData as TrendData[];

    if (metric.value === "napDuration") {
      const sum = dailyData.reduce((s, d) => s + (d.averageNapDuration || 0), 0);
      return dailyData.length > 0 ? Math.round(sum / dailyData.length) : 0;
    } else if (metric.value === "meals") {
      const sum = dailyData.reduce((s, d) => s + (d.totalMeals || 0), 0);
      return metric.aggType === "total" ? sum : Math.round(sum / dailyData.length);
    }

    return 0;
  };

  // Get all unique dates sorted
  const getAllDates = () => {
    const allDates = new Set<string>();
    Object.values(data).forEach((entityData) => {
      entityData.forEach((item) => {
        const date = "date" in item ? item.date : new Date(item.createdAt).toISOString().split("T")[0];
        allDates.add(date);
      });
    });
    return Array.from(allDates).sort();
  };

  // Get value for date
  const getValueForDate = (entityData: TrendData[] | HealthRecord[], date: string, metric: MetricOption) => {
    if (metric.source === "health") {
      const records = entityData as HealthRecord[];
      return records.filter((r) => new Date(r.createdAt).toISOString().split("T")[0] === date).length;
    }

    const dailyData = entityData as TrendData[];
    const day = dailyData.find((d) => d.date === date);
    if (!day) return 0;

    if (metric.value === "napDuration") return day.averageNapDuration || 0;
    if (metric.value === "meals") return day.totalMeals || 0;

    return 0;
  };

  const renderVisualization = () => {
    if (loading) {
      return <div className="flex items-center justify-center h-64">Loading...</div>;
    }
    if (error) {
      return <div className="flex items-center justify-center h-64 text-red-500">{error}</div>;
    }
    if (selectedEntities.length < 2) {
      return <div className="flex items-center justify-center h-64">Select at least two entities to compare</div>;
    }

    if (viewType === "table") {
      // Simple table view
      return (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left">Entity</th>
                <th className="px-6 py-3 text-left">Value</th>
              </tr>
            </thead>
            <tbody>
              {selectedEntities.map((id) => (
                <tr key={id}>
                  <td className="px-6 py-4">{getLabel(id)}</td>
                  <td className="px-6 py-4">{computeAggregate(data[id] || [], metricObj)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    const labels = viewType === "aggregate" ? selectedEntities.map(getLabel) : getAllDates();

    const chartData = {
      labels,
      datasets: viewType === "aggregate"
        ? [
            {
              label: metricObj.label,
              data: selectedEntities.map((id) => computeAggregate(data[id] || [], metricObj)),
              backgroundColor: selectedEntities.map((_, idx) => getColor(idx)),
            },
          ]
        : selectedEntities.map((id, idx) => ({
            label: getLabel(id),
            data: labels.map((date) => getValueForDate(data[id] || [], date, metricObj)),
            borderColor: getColor(idx).replace("0.5", "1"),
            backgroundColor: getColor(idx),
            fill: false,
          })),
    };

    const ChartComponent = viewType === "aggregate" ? BarChart : LineChart;

    return (
      <ChartComponent
        data={chartData}
        options={{
          responsive: true,
          plugins: {
            legend: { position: "top" },
            title: { display: true, text: `${metricObj.label} Comparison` },
          },
        }}
      />
    );
  };

  return (
    <div className="flex flex-col md:flex-row gap-6">
      <div className="md:w-1/4 w-full">
        <Card>
          <CardHeader>
            <CardTitle>Comparison Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Comparison Level</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {comparisonLevel.charAt(0).toUpperCase() + comparisonLevel.slice(1)}s
                    <Filter className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onSelect={() => setComparisonLevel("child")}>Children</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setComparisonLevel("class")}>Classes</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setComparisonLevel("center")}>Centers</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {comparisonLevel === "class" && metricObj.source === "health" && (
              <div>
                <label className="block text-sm font-medium">Center</label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      {selectedCenter || "Select Center"}
                      <Filter className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {uniqueCenters.map((ce) => (
                      <DropdownMenuItem key={ce} onSelect={() => setSelectedCenter(ce)}>
                        {ce}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium">Entities</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {selectedEntities.length > 0 ? `${selectedEntities.length} selected` : "Select Entities"}
                    <Filter className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {entities.map((ent) => (
                    <DropdownMenuItem
                      key={ent.value}
                      onSelect={() => {
                        setSelectedEntities((prev) =>
                          prev.includes(ent.value)
                            ? prev.filter((e) => e !== ent.value)
                            : [...prev, ent.value]
                        );
                      }}
                    >
                      {ent.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div>
              <label className="block text-sm font-medium">Metric</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {metrics.find((m) => m.value === selectedMetric)?.label || "Select Metric"}
                    <Filter className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {metrics.map((m) => (
                    <DropdownMenuItem key={m.value} onSelect={() => setSelectedMetric(m.value)}>
                      {m.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div>
              <label className="block text-sm font-medium">View Type</label>
              <div className="flex gap-2">
                <Button
                  variant={viewType === "aggregate" ? "default" : "outline"}
                  onClick={() => setViewType("aggregate")}
                >
                  Aggregate
                </Button>
                <Button
                  variant={viewType === "trend" ? "default" : "outline"}
                  onClick={() => setViewType("trend")}
                >
                  Trend
                </Button>
                <Button
                  variant={viewType === "table" ? "default" : "outline"}
                  onClick={() => setViewType("table")}
                >
                  Table
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium">Date Range</label>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange((prev) => ({ ...prev, startDate: e.target.value }))}
                />
                <Input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange((prev) => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex-1">
        <Card>
          <CardHeader>
            <CardTitle>Comparison Visualization</CardTitle>
          </CardHeader>
          <CardContent>{renderVisualization()}</CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Comparison;