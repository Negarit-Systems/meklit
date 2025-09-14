import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PieChart as PieChartIcon } from "lucide-react"
import { Doughnut } from "react-chartjs-2"
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js"

ChartJS.register(ArcElement, Tooltip, Legend)

export interface HealthEventItem {
  type: string
}

export interface ChildEventsInput {
  childId: string
  healthEvents: HealthEventItem[]
}

interface ChildEventsChartProps {
  childrenData: ChildEventsInput[]
  getLabel: (id: string) => string
}

const palette = [
  "rgba(16, 185, 129, 0.8)", // emerald
  "rgba(59, 130, 246, 0.8)", // blue
  "rgba(234, 88, 12, 0.8)",  // orange
  "rgba(217, 70, 239, 0.8)", // fuchsia
  "rgba(245, 158, 11, 0.8)", // amber
  "rgba(14, 165, 233, 0.8)", // sky
  "rgba(132, 204, 22, 0.8)", // lime
]

const paletteBorder = palette.map((c) => c.replace("0.8", "1"))

function buildCounts(events: HealthEventItem[]): Record<string, number> {
  return events.reduce((acc, e) => {
    acc[e.type] = (acc[e.type] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)
}

export function ChildEventsChart({ childrenData, getLabel }: ChildEventsChartProps) {
  // Union of event types across both children to keep labels consistent
  const allTypes = Array.from(
    new Set(childrenData.flatMap((c) => c.healthEvents.map((e) => e.type)))
  )

  const charts = childrenData.map((c) => {
    const counts = buildCounts(c.healthEvents)
    const data = allTypes.map((t) => counts[t] ?? 0)
    return {
      childId: c.childId,
      data: {
        labels: allTypes,
        datasets: [
          {
            label: "Events",
            data,
            backgroundColor: allTypes.map((_, i) => palette[i % palette.length]),
            borderColor: allTypes.map((_, i) => paletteBorder[i % paletteBorder.length]),
            borderWidth: 1,
          },
        ],
      },
    }
  })

  const noEvents = allTypes.length === 0

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-2">
          <PieChartIcon className="h-5 w-5 text-primary" />
          <span>Health Events Distribution</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {noEvents ? (
          <div className="text-sm text-muted-foreground">No health events in the selected range.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {charts.map((chart) => (
              <div key={chart.childId} className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">{getLabel(chart.childId)}</Badge>
                </div>
                <div className="h-64">
                  <Doughnut
                    data={chart.data}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: "bottom" as const,
                          labels: {
                            usePointStyle: true,
                            padding: 16,
                          },
                        },
                      },
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default ChildEventsChart
