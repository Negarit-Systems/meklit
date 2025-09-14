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
}

const getColor = (index: number) => {
  const colors = [
    "rgba(234, 88, 12, 0.8)",
    "rgba(249, 115, 22, 0.8)",
    "rgba(75, 85, 99, 0.8)",
    "rgba(190, 18, 60, 0.8)",
    "rgba(254, 252, 232, 0.8)",
  ]
  return colors[index % colors.length]
}

const getBorderColor = (index: number) => {
  const colors = [
    "rgba(234, 88, 12, 1)",
    "rgba(249, 115, 22, 1)",
    "rgba(75, 85, 99, 1)",
    "rgba(190, 18, 60, 1)",
    "rgba(254, 252, 232, 1)",
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

    if (viewType === "table") {
      return (
        <div className="overflow-hidden rounded-lg border border-border">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Entity</th>
                  {selectedMetric === "both" ? (
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
                    {selectedMetric === "averageNapDuration" && (
                      <td className="px-6 py-4 text-card-foreground">
                        <Badge variant="secondary">{item.averageNapDuration.toFixed(2)} min</Badge>
                      </td>
                    )}
                    {selectedMetric === "totalIncidents" && (
                      <td className="px-6 py-4 text-card-foreground">
                        <Badge variant="outline">{item.totalIncidents}</Badge>
                      </td>
                    )}
                    {selectedMetric === "both" && (
                      <>
                        <td className="px-6 py-4 text-card-foreground">
                          <Badge variant="secondary">{item.averageNapDuration.toFixed(2)} min</Badge>
                        </td>
                        <td className="px-6 py-4 text-card-foreground">
                          <Badge variant="outline">{item.totalIncidents}</Badge>
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
      return [
        {
          label: metricObj.label,
          data: data.map((item) => item[selectedMetric as keyof ReportSummaryItem]),
          backgroundColor: data.map((_, idx) => getColor(idx)),
          borderColor: data.map((_, idx) => getBorderColor(idx)),
          borderWidth: 2,
        },
      ]
    }

    const chartData = {
      labels,
      datasets: datasets(),
    }

    const ChartComponent = viewType === "aggregate" ? BarChart : LineChart

    return (
      <div className="h-96">
        <AnimatePresence mode="wait">
          <motion.div
            key={JSON.stringify({ labels, selectedMetric, viewType, values: chartData.datasets.map(d => d.data) })}
            initial={{ rotate: -12, opacity: 0, scale: 0.975 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 12, opacity: 0, scale: 0.975 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
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
                    text: `${metricObj.label} Comparison`,
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
