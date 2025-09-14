import type React from "react"
import { useEffect, useState } from "react"
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
} from "chart.js"
import {
  fetchChildren,
  fetchTrendOverTime,
  fetchClassComparison,
  fetchCenterComparison,
  type ReportSummaryItem,
} from "@/services/apiComparsion"
import { ReportSummary } from "./ReportSummary"
import { Header } from "./components/Header"
import { FilterBar } from "./components/FilterBar"
import { Visualization } from "./components/Visualization"
import { BarChart3, Table2, TrendingUp } from "lucide-react"

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend)

interface Child {
  id: string
  name: string
  centerId: string
  classId: string
}

interface TrendData {
  date: string
  averageNapDuration?: number
  totalMeals?: number
  totalIncidents?: number
}

interface MetricOption {
  value: string
  label: string
  source: "daily" | "health"
  aggType: "average" | "total"
  icon: React.ReactNode
}

const metrics: MetricOption[] = [
  {
    value: "averageNapDuration",
    label: "Average Nap Duration",
    source: "daily",
    aggType: "average",
    icon: <TrendingUp className="h-4 w-4" />,
  },
  {
    value: "totalIncidents",
    label: "Total Incidents",
    source: "health",
    aggType: "total",
    icon: <BarChart3 className="h-4 w-4" />,
  },
  {
    value: "both",
    label: "Both Metrics",
    source: "daily",
    aggType: "average",
    icon: <Table2 className="h-4 w-4" />,
  },
]

export function Comparison() {
  const [children, setChildren] = useState<Child[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [comparisonLevel, setComparisonLevel] = useState<"child" | "class" | "center">("class")
  const [entity1, setEntity1] = useState<string | null>(null)
  const [entity2, setEntity2] = useState<string | null>(null)
  const [selectedMetric, setSelectedMetric] = useState<string>("both")
  const [viewType, setViewType] = useState<"aggregate" | "table">("aggregate")
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });
  const [considerDateRange, setConsiderDateRange] = useState(false);
  const [useStartDate, setUseStartDate] = useState(true);
  const [useEndDate, setUseEndDate] = useState(true);
  const [selectedCenter, setSelectedCenter] = useState<string>("");
  const [data, setData] = useState<ReportSummaryItem[] | null>(null);

  // Fetch children
  useEffect(() => {
    const fetchChildrenData = async () => {
      try {
        console.log("Fetching children...")
        const childrenData = await fetchChildren()
        console.log("Raw children data:", childrenData)
        // Map API response to match the expected Child interface
        const mappedChildren = childrenData.map((child) => ({
          id: child.id,
          name: child.firstName && child.lastName ? `${child.firstName} ${child.lastName}` : child.id, // Fallback to id if names are missing
          centerId: child.centerId,
          classId: child.classId,
        }))
        console.log("Mapped children:", mappedChildren)
        setChildren(mappedChildren)
      } catch (err) {
        console.error("Error fetching children:", err)
        setError("Failed to fetch children. Check console for details.")
      } finally {
        setLoading(false)
      }
    }
    fetchChildrenData()
  }, [])

  // Set default entities for class comparison
  useEffect(() => {
    if (comparisonLevel === "class" && children.length > 0) {
      const classes = [...new Set(children.map((c) => c.classId))].sort()
      if (classes.length >= 2) {
        setEntity1(classes[0])
        setEntity2(classes[1])
      }
    }
  }, [children, comparisonLevel])

  // Get unique lists
  const uniqueCenters = [...new Set(children.map((c) => c.centerId))].sort()
  const uniqueClasses = [...new Set(children.map((c) => c.classId))].sort()
  const childList = children.map((c) => ({ value: c.id, label: c.name }))

  const entities =
    comparisonLevel === "child"
      ? childList
      : comparisonLevel === "class"
        ? uniqueClasses.map((cl) => ({ value: cl, label: cl }))
        : uniqueCenters.map((ce) => ({ value: ce, label: ce }))

  const getLabel = (id: string) => {
    if (comparisonLevel === "child") {
      return children.find((c) => c.id === id)?.name || id
    }
    return id
  }

  const metricObj = metrics.find((m) => m.value === selectedMetric)!

  // Fetch data when filters change
  useEffect(() => {
    if (!entity1 || !entity2) {
      setData(null)
      return
    }

    const fetchComparisonData = async () => {
      setLoading(true)
      setError(null)
      try {
        let comparisonData
        const filters: { startDate?: string; endDate?: string } = {}
        if (considerDateRange) {
          if (useStartDate) filters.startDate = dateRange.startDate
          if (useEndDate) filters.endDate = dateRange.endDate
        }

        if (comparisonLevel === "class") {
          comparisonData = await fetchClassComparison({
            ...filters,
            classId1: entity1,
            classId2: entity2,
          })
        } else if (comparisonLevel === "center") {
          comparisonData = await fetchCenterComparison({
            ...filters,
            centerId1: entity1,
            centerId2: entity2,
          })
        } else {
          // For child comparison, fetch data for each and format it like ReportSummaryItem
          const [data1, data2] = await Promise.all([
            fetchTrendOverTime({ ...filters, childId: entity1 }),
            fetchTrendOverTime({ ...filters, childId: entity2 }),
          ])

          const aggregate = (d: TrendData[]) => ({
            averageNapDuration: d.reduce((sum, i) => sum + (i.averageNapDuration || 0), 0) / d.length || 0,
            totalIncidents: d.reduce((sum, i) => sum + (i.totalIncidents || 0), 0),
          })

          const agg1 = aggregate(data1)
          const agg2 = aggregate(data2)

          comparisonData = [
            { id: entity1, ...agg1 },
            { id: entity2, ...agg2 },
          ]
        }

        setData(comparisonData)
      } catch (err) {
        console.error("Error fetching comparison data:", err)
        setError("Failed to fetch comparison data. Check console for details.")
      } finally {
        setLoading(false)
      }
    }

    fetchComparisonData()
  }, [entity1, entity2, dateRange, comparisonLevel, children, considerDateRange, useStartDate, useEndDate])

  return (
    <div className="space-y-6">
      <Header />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <FilterBar
            comparisonLevel={comparisonLevel}
            setComparisonLevel={setComparisonLevel}
            entity1={entity1}
            setEntity1={setEntity1}
            entity2={entity2}
            setEntity2={setEntity2}
            selectedMetric={selectedMetric}
            setSelectedMetric={setSelectedMetric}
            viewType={viewType}
            setViewType={setViewType}
            dateRange={dateRange}
            setDateRange={setDateRange}
            considerDateRange={considerDateRange}
            setConsiderDateRange={setConsiderDateRange}
            useStartDate={useStartDate}
            setUseStartDate={setUseStartDate}
            useEndDate={useEndDate}
            setUseEndDate={setUseEndDate}
            selectedCenter={selectedCenter}
            setSelectedCenter={setSelectedCenter}
            entities={entities}
            uniqueCenters={uniqueCenters}
            getLabel={getLabel}
          />
        </div>

        <div className="lg:col-span-3">
          <Visualization
            loading={loading}
            error={error}
            entity1={entity1}
            entity2={entity2}
            data={data}
            viewType={viewType}
            selectedMetric={selectedMetric}
            getLabel={getLabel}
            metricObj={metricObj}
          />
        </div>
      </div>
    </div>
  )
}

export default function ComparisonPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <Comparison />
        <ReportSummary />
      </div>
    </div>
  )
}
