import { Bar as BarChart, Line as LineChart } from "react-chartjs-2"
import { AnimatePresence, motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Filter, BarChart3 } from "lucide-react"
import type { ReportSummaryItem } from "@/services/apiComparsion"

interface VisualizationProps {
  loading: boolean
  error: string | null
  entity1: string | null
  entity2: string | null
  data: ReportSummaryItem[] | null
  viewType: "aggregate" | "table"
  selectedMetric: string
  getLabel: (id: string) => string
  metricObj: {
    value: string
    label: string
    source: "daily" | "health"
    aggType: "average" | "total"
    icon: React.ReactNode
  }
  comparisonLevel: "child" | "class" | "center"
}

const getColor = (index: number) => {
  // Distinct, more vibrant palette for up to 4 metrics/entities
  const colors = [
    "rgba(16, 185, 129, 0.8)", // emerald
    "rgba(59, 130, 246, 0.8)", // blue
    "rgba(234, 88, 12, 0.8)",  // orange
    "rgba(217, 70, 239, 0.8)", // fuchsia
    "rgba(75, 85, 99, 0.8)",   // gray fallback
  ]
  return colors[index % colors.length]
}

const getBorderColor = (index: number) => {
  const colors = [
    "rgba(16, 185, 129, 1)", // emerald
    "rgba(59, 130, 246, 1)", // blue
    "rgba(234, 88, 12, 1)",  // orange
    "rgba(217, 70, 239, 1)", // fuchsia
    "rgba(75, 85, 99, 1)",   // gray fallback
  ]
  return colors[index % colors.length]
}

export function Visualization({
  loading,
  error,
  entity1,
  entity2,
  data,
  viewType,
  selectedMetric,
  getLabel,
  metricObj,
  comparisonLevel,
}: VisualizationProps) {
  const renderVisualizationContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading comparison data...</p>
        </div>
      )
    }
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="text-destructive text-center">
            <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="font-medium">Error Loading Data</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </div>
      )
    }
    if (!entity1 || !entity2 || !data) {
      return (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="text-muted-foreground text-center">
            <Filter className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="font-medium">Ready to Compare</p>
            <p className="text-sm">Select two entities to begin comparison</p>
          </div>
        </div>
      )
    }

    // For child comparison, show a richer table with all four metrics side-by-side
    if (viewType === "table") {
      return (
        <div className="overflow-hidden rounded-lg border border-border">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Entity</th>
                  {comparisonLevel === "child" ? (
                    <>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Avg Nap Duration</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Total Incidents</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Total Medications</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Total Nap Duration</th>
                    </>
                  ) : selectedMetric === "both" ? (
                    <>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Avg Nap Duration</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Total Incidents</th>
                    </>
                  ) : (
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">{metricObj.label}</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {data.map((item, index) => (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-card-foreground">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getBorderColor(index) }} />
                        {getLabel(item.id)}
                      </div>
                    </td>
                    {comparisonLevel !== "child" && selectedMetric === "averageNapDuration" && (
                      <td className="px-6 py-4 text-card-foreground">
                        <Badge variant="secondary">{item.averageNapDuration.toFixed(2)} min</Badge>
                      </td>
                    )}
                    {comparisonLevel !== "child" && selectedMetric === "totalIncidents" && (
                      <td className="px-6 py-4 text-card-foreground">
                        <Badge variant="outline">{item.totalIncidents}</Badge>
                      </td>
                    )}
                    {comparisonLevel !== "child" && selectedMetric === "totalMedications" && (
                      <td className="px-6 py-4 text-card-foreground">
                        <Badge variant="outline">{item.totalMedications ?? 0}</Badge>
                      </td>
                    )}
                    {comparisonLevel !== "child" && selectedMetric === "totalNapDuration" && (
                      <td className="px-6 py-4 text-card-foreground">
                        <Badge variant="secondary">{item.totalNapDuration ?? 0} min</Badge>
                      </td>
                    )}
                    {comparisonLevel !== "child" && selectedMetric === "both" && (
                      <>
                        <td className="px-6 py-4 text-card-foreground">
                          <Badge variant="secondary">{item.averageNapDuration.toFixed(2)} min</Badge>
                        </td>
                        <td className="px-6 py-4 text-card-foreground">
                          <Badge variant="outline">{item.totalIncidents}</Badge>
                        </td>
                      </>
                    )}
                    {comparisonLevel === "child" && (
                      <>
                        <td className="px-6 py-4 text-card-foreground">
                          <Badge variant="secondary">{item.averageNapDuration.toFixed(2)} Hrs </Badge>
                        </td>
                        <td className="px-6 py-4 text-card-foreground">
                          <Badge variant="outline">{item.totalIncidents}</Badge>
                        </td>
                        <td className="px-6 py-4 text-card-foreground">
                          <Badge variant="outline">{item.totalMedications ?? 0}</Badge>
                        </td>
                        <td className="px-6 py-4 text-card-foreground">
                          <Badge variant="secondary">{item.totalNapDuration ?? 0} Hrs </Badge>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )
    }

  const labels = data.map((item) => getLabel(item.id))

    const datasets = () => {
      if (selectedMetric === "both") {
        return [
          {
            label: "Average Nap Duration",
            data: data.map((item) => item.averageNapDuration),
            backgroundColor: data.map(() => getColor(0)),
            borderColor: data.map(() => getBorderColor(0)),
            borderWidth: 2,
          },
          {
            label: "Total Incidents",
            data: data.map((item) => item.totalIncidents),
            backgroundColor: data.map(() => getColor(1)),
            borderColor: data.map(() => getBorderColor(1)),
            borderWidth: 2,
          },
        ]
      }
      // Single metric mode; ensure numbers (fallback to 0 for optional child-only metrics)
      const values = data.map((item) => Number(item[selectedMetric as keyof ReportSummaryItem] ?? 0))
      return [
        {
          label: metricObj.label,
          data: values,
          backgroundColor: data.map((_, idx) => getColor(idx)),
          borderColor: data.map((_, idx) => getBorderColor(idx)),
          borderWidth: 2,
        },
      ]
    }

    const chartData = {
      labels,
      datasets: comparisonLevel === "child"
        ? [
            {
              label: "Average Nap Duration",
              data: data.map((item) => item.averageNapDuration),
              backgroundColor: data.map(() => getColor(0)),
              borderColor: data.map(() => getBorderColor(0)),
              borderWidth: 2,
            },
            {
              label: "Total Incidents",
              data: data.map((item) => item.totalIncidents),
              backgroundColor: data.map(() => getColor(1)),
              borderColor: data.map(() => getBorderColor(1)),
              borderWidth: 2,
            },
            {
              label: "Total Medications",
              data: data.map((item) => item.totalMedications ?? 0),
              backgroundColor: data.map(() => getColor(2)),
              borderColor: data.map(() => getBorderColor(2)),
              borderWidth: 2,
            },
            {
              label: "Total Nap Duration",
              data: data.map((item) => item.totalNapDuration ?? 0),
              backgroundColor: data.map(() => getColor(3)),
              borderColor: data.map(() => getBorderColor(3)),
              borderWidth: 2,
            },
          ]
        : datasets(),
    }

    const ChartComponent = viewType === "aggregate" ? BarChart : LineChart

    return (
      <div className="h-96">
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
            className="h-full"
          >
            <ChartComponent
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "top",
                    labels: {
                      usePointStyle: true,
                      padding: 20,
                      font: {
                        size: 12,
                        weight: 500,
                      },
                    },
                  },
                  title: {
                    display: true,
                    text: comparisonLevel === "child" ? "Child Metrics Comparison" : `${metricObj.label} Comparison`,
                    font: {
                      size: 16,
                      weight: "bold",
                    },
                    padding: 20,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      color: "rgba(0, 0, 0, 0.1)",
                    },
                    ticks: {
                      font: {
                        size: 11,
                      },
                    },
                  },
                  x: {
                    grid: {
                      display: false,
                    },
                    ticks: {
                      font: {
                        size: 11,
                      },
                    },
                  },
                },
              }}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <span>Comparison Visualization</span>
          </CardTitle>
          {entity1 && entity2 && (
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-xs">
                {getLabel(entity1)}
              </Badge>
              <span className="text-muted-foreground">vs</span>
              <Badge variant="secondary" className="text-xs">
                {getLabel(entity2)}
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">{renderVisualizationContent()}</CardContent>
    </Card>
  )
}
