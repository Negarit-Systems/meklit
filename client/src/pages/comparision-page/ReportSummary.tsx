"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Filter, BarChart3, Calendar, Building2, Users, TrendingUp, Clock, AlertTriangle } from "lucide-react"
import { fetchReportSummary, type ReportSummaryItem, fetchChildren } from "@/services/apiComparsion"

export function ReportSummary() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<ReportSummaryItem[]>([])
  const [groupBy, setGroupBy] = useState<"center" | "class">("class")
  const [centers, setCenters] = useState<string[]>([])
  const [selectedCenter, setSelectedCenter] = useState<string>("")
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  })

  useEffect(() => {
    const getCenters = async () => {
      const children = await fetchChildren()
      const uniqueCenters = [...new Set(children.map((c) => c.centerId))].sort()
      setCenters(uniqueCenters)
      if (uniqueCenters.length > 0) {
        setSelectedCenter(uniqueCenters[0])
      }
    }
    getCenters()
  }, [])

  const handleFetchSummary = async () => {
    setLoading(true)
    setError(null)
    try {
      const filters: {
        startDate: string
        endDate: string
        centerId?: string
        groupBy: "center" | "class"
      } = {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        groupBy,
      }
      if (selectedCenter) {
        filters.centerId = selectedCenter
      }
      const summaryData = await fetchReportSummary(filters)
      setData(summaryData)
    } catch (err) {
      console.error("Error fetching report summary:", err)
      setError("Failed to fetch report summary.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-50/50 to-blue-50/50 dark:from-green-900/20 dark:to-blue-900/20 border border-green-100 dark:border-blue-900/30 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <BarChart3 className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 dark:from-green-400 dark:to-blue-400 text-transparent bg-clip-text">
            Report Summary
          </h2>
        </div>
        <p className="text-muted-foreground leading-relaxed">
          Get a comprehensive summary of childcare data grouped by class or center.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-500">
            <Filter className="h-5 w-5" />
            Filter Options
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-6">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Users className="h-4 w-4 text-green-500" />
                Group By
              </label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between h-11 bg-background/70 dark:bg-background/50 border-border/50 hover:bg-muted/50"
                  >
                    <span className="flex items-center gap-2">
                      {groupBy === "class" ? (
                        <>
                          <Users className="h-4 w-4" />
                          Class
                        </>
                      ) : (
                        <>
                          <Building2 className="h-4 w-4" />
                          Center
                        </>
                      )}
                    </span>
                    <Filter className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full bg-card border-border/50">
                  <DropdownMenuItem onSelect={() => setGroupBy("class")} className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Class
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setGroupBy("center")} className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Center
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Building2 className="h-4 w-4 text-green-500" />
                Center
              </label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between h-11 bg-background/70 dark:bg-background/50 border-border/50 hover:bg-muted/50"
                  >
                    <span className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      {selectedCenter || "Select Center"}
                    </span>
                    <Filter className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full max-h-60 overflow-y-auto bg-card border-border/50">
                  {centers.map((center) => (
                    <DropdownMenuItem
                      key={center}
                      onSelect={() => setSelectedCenter(center)}
                      className="flex items-center gap-2"
                    >
                      <Building2 className="h-4 w-4" />
                      {center}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-2 md:col-span-1 lg:col-span-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Calendar className="h-4 w-4 text-green-500" />
                Date Range
              </label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange((prev) => ({ ...prev, startDate: e.target.value }))}
                  className="h-11 bg-background/70 dark:bg-background/50 border-border/50"
                />
                <Input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange((prev) => ({ ...prev, endDate: e.target.value }))}
                  className="h-11 bg-background/70 dark:bg-background/50 border-border/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground opacity-0">Action</label>
              <Button
                onClick={handleFetchSummary}
                disabled={loading}
                className="w-full h-11 bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Loading...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Get Summary
                  </div>
                )}
              </Button>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
              <p className="text-red-700 dark:text-red-300 font-medium">{error}</p>
            </div>
          )}

          <div className="border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        {groupBy === "class" ? (
                          <>
                            <Users className="h-4 w-4 text-green-500" />
                            Class ID
                          </>
                        ) : (
                          <>
                            <Building2 className="h-4 w-4 text-green-500" />
                            Center ID
                          </>
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-green-500" />
                        Avg Nap Duration (mins)
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-green-500" />
                        Total Incidents
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-border">
                  {data.length === 0 && !loading ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center text-muted-foreground">
                        <div className="flex flex-col items-center gap-3">
                          <BarChart3 className="h-12 w-12 text-muted-foreground/50" />
                          <p className="text-lg font-medium">No data available</p>
                          <p className="text-sm">Try adjusting your filters and date range</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    data.map((item) => (
                      <tr key={item.id} className="hover:bg-muted/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span className="text-sm font-medium text-foreground">{item.id}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-foreground">
                              {item.averageNapDuration.toFixed(1)}
                            </span>
                            <span className="text-xs text-muted-foreground">minutes</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                item.totalIncidents === 0
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
                                  : item.totalIncidents <= 2
                                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300"
                                    : "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300"
                              }`}
                            >
                              {item.totalIncidents}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
