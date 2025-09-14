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
  fetchClassComparison,
  fetchCenterComparison,
  fetchChildComparison,
  type ReportSummaryItem,
} from "@/services/apiComparsion"
import { ReportSummary } from "./ReportSummary"
import { Header } from "./components/Header"
import { FilterBar } from "./components/FilterBar"
import { Visualization } from "./components/Visualization"
import ChildEventsChart from "./components/ChildEventsChart"
import { BarChart3, Table2, TrendingUp, Pill, Moon } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend)

interface Child {
  id: string
  name: string
  centerId: string
  classId: string
}

// Removed unused TrendData interface since child comparison uses dedicated API

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
    value: "totalMedications",
    label: "Total Medications",
    source: "health",
    aggType: "total",
    icon: <Pill className="h-4 w-4" />,
  },
  {
    value: "totalNapDuration",
    label: "Total Nap Duration",
    source: "daily",
    aggType: "total",
    icon: <Moon className="h-4 w-4" />,
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
  const [comparisonLevel, setComparisonLevel] = useState<"child" | "class" | "center">("child")
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
  const [childEventsData, setChildEventsData] = useState<
    { childId: string; healthEvents: { type: string }[] }[] | null
  >(null)

  // Animation variants
  const pageVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1],
        when: "beforeChildren",
        staggerChildren: 0.06,
      },
    },
  } as const

  const sectionVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, y: -8, transition: { duration: 0.25 } },
  } as const

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
    if (children.length > 0) {
      if (comparisonLevel === "class") {
        const classes = [...new Set(children.map((c) => c.classId))].sort()
        if (classes.length >= 2) {
          setEntity1(classes[0])
          setEntity2(classes[1])
        }
      } else if (comparisonLevel === "child") {
        const uniqueChildren = [...new Set(children.map((c) => c.id))]
        if (uniqueChildren.length >= 2) {
          setEntity1(uniqueChildren[0])
          setEntity2(uniqueChildren[1])
        }
      } else if (comparisonLevel === "center") {
        const centers = [...new Set(children.map((c) => c.centerId))].sort()
        if (centers.length >= 2) {
          setEntity1(centers[0])
          setEntity2(centers[1])
        }
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
          setChildEventsData(null)
        } else if (comparisonLevel === "center") {
          comparisonData = await fetchCenterComparison({
            ...filters,
            centerId1: entity1,
            centerId2: entity2,
          })
          setChildEventsData(null)
        } else {
          // Child comparison: use the dedicated endpoint and map to ReportSummaryItem[]
          const childComparison = await fetchChildComparison({
            ...filters,
            childId1: entity1,
            childId2: entity2,
          })

          comparisonData = childComparison.map((c) => ({
            id: c.childId,
            averageNapDuration: c.averageNapDuration,
            totalIncidents: c.totalIncidents,
            totalMedications: c.totalMedications,
            totalNapDuration: c.totalNapDuration,
          }))

          setChildEventsData(
            childComparison.map((c) => ({
              childId: c.childId,
              healthEvents: c.healthEvents.map((e) => ({ type: e.type })),
            }))
          )
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
    <motion.div
      className="space-y-6"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      layout
    >
      <motion.div variants={sectionVariants} layout>
        <Header />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <motion.div
          className="lg:col-span-1"
          variants={sectionVariants}
          layout
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.995 }}
        >
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
        </motion.div>

        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={JSON.stringify({
                comparisonLevel,
                entity1,
                entity2,
                selectedMetric,
                viewType,
                filters: considerDateRange
                  ? { startDate: dateRange.startDate, endDate: dateRange.endDate, useStartDate, useEndDate }
                  : null,
              })}
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              layout
            >
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
                comparisonLevel={comparisonLevel}
              />
            </motion.div>
          </AnimatePresence>

          {comparisonLevel === "child" && entity1 && entity2 && childEventsData && (
            <AnimatePresence mode="wait">
              <motion.div
                key={`child-events-${entity1}-${entity2}-${considerDateRange ? `${dateRange.startDate}-${dateRange.endDate}` : "all"}`}
                variants={sectionVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                layout
              >
                <ChildEventsChart childrenData={childEventsData} getLabel={getLabel} />
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </motion.div>
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
