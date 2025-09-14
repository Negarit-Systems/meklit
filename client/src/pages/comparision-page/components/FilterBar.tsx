import type React from "react"
import {
  Filter,
  BarChart3,
  Table2,
  Calendar,
  Users,
  Building2,
  GraduationCap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

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
    icon: <BarChart3 className="h-4 w-4" />,
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

interface FilterBarProps {
  comparisonLevel: "child" | "class" | "center"
  setComparisonLevel: (level: "child" | "class" | "center") => void
  entity1: string | null
  setEntity1: (entity: string | null) => void
  entity2: string | null
  setEntity2: (entity: string | null) => void
  selectedMetric: string
  setSelectedMetric: (metric: string) => void
  viewType: "aggregate" | "table"
  setViewType: (view: "aggregate" | "table") => void
  dateRange: { startDate: string; endDate: string }
  setDateRange: (range: { startDate: string; endDate: string }) => void
  considerDateRange: boolean
  setConsiderDateRange: (consider: boolean) => void
  useStartDate: boolean
  setUseStartDate: (v: boolean) => void
  useEndDate: boolean
  setUseEndDate: (v: boolean) => void
  selectedCenter: string
  setSelectedCenter: (center: string) => void
  entities: { value: string; label: string }[]
  uniqueCenters: string[]
  getLabel: (id: string) => string
}

export function FilterBar({
  comparisonLevel,
  setComparisonLevel,
  entity1,
  setEntity1,
  entity2,
  setEntity2,
  selectedMetric,
  setSelectedMetric,
  viewType,
  setViewType,
  dateRange,
  setDateRange,
  considerDateRange,
  setConsiderDateRange,
  useStartDate,
  setUseStartDate,
  useEndDate,
  setUseEndDate,
  selectedCenter,
  setSelectedCenter,
  entities,
  uniqueCenters,
  getLabel,
}: FilterBarProps) {
  const metricObj = metrics.find((m) => m.value === selectedMetric)!

  const getComparisonIcon = () => {
    const iconClass = "h-5 w-5 text-green-500"
    switch (comparisonLevel) {
      case "child":
        return <Users className={iconClass} />
      case "class":
        return <GraduationCap className={iconClass} />
      case "center":
        return <Building2 className={iconClass} />
      default:
        return <Users className={iconClass} />
    }
  }

  return (
    <Card className="sticky top-6 bg-card/50 dark:bg-card/20 border-border/50">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-2 text-green-500">
          <Filter className="h-5 w-5" />
          <span>Comparison Filters</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Comparison Level */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground flex items-center space-x-2">
            {getComparisonIcon()}
            <span>Comparison Level</span>
          </label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between h-10 bg-background/70 dark:bg-background/50 border-border/50 hover:bg-muted/50"
              >
                <span className="flex items-center space-x-2">
                  {getComparisonIcon()}
                  <span>{comparisonLevel.charAt(0).toUpperCase() + comparisonLevel.slice(1)}s</span>
                </span>
                <Filter className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-full bg-card border-border/50">
              <DropdownMenuItem onSelect={() => setComparisonLevel("child")}>
                <Users className="h-4 w-4 mr-2 text-green-500" />
                Children
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setComparisonLevel("class")}>
                <GraduationCap className="h-4 w-4 mr-2 text-green-500" />
                Classes
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setComparisonLevel("center")}>
                <Building2 className="h-4 w-4 mr-2 text-green-500" />
                Centers
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Center Selection for Class Comparison */}
        {comparisonLevel === "class" && metricObj.source === "health" && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center space-x-2">
              <Building2 className="h-4 w-4 text-green-500" />
              <span>Center</span>
            </label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between h-10 bg-background/70 dark:bg-background/50 border-border/50 hover:bg-muted/50"
                >
                  {selectedCenter || "Select Center"}
                  <Filter className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-full bg-card border-border/50">
                {uniqueCenters.map((ce) => (
                  <DropdownMenuItem key={ce} onSelect={() => setSelectedCenter(ce)}>
                    <Building2 className="h-4 w-4 mr-2 text-green-500" />
                    {ce}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        <Separator />

        {/* Entity Selection */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Entity 1</label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between h-10 bg-background/70 dark:bg-background/50 border-border/50 hover:bg-muted/50"
                >
                  <span className="truncate">{entity1 ? getLabel(entity1) : "Select Entity 1"}</span>
                  <Filter className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-full max-h-48 overflow-y-auto bg-card border-border/50"
              >
                {entities.map((ent) => (
                  <DropdownMenuItem
                    key={ent.value}
                    onSelect={() => setEntity1(ent.value)}
                    disabled={entity2 === ent.value}
                  >
                    {ent.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Entity 2</label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between h-10 bg-background/70 dark:bg-background/50 border-border/50 hover:bg-muted/50"
                >
                  <span className="truncate">{entity2 ? getLabel(entity2) : "Select Entity 2"}</span>
                  <Filter className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-full max-h-48 overflow-y-auto bg-card border-border/50"
              >
                {entities.map((ent) => (
                  <DropdownMenuItem
                    key={ent.value}
                    onSelect={() => setEntity2(ent.value)}
                    disabled={entity1 === ent.value}
                  >
                    {ent.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <Separator />

        {/* Metric Selection - hidden for children; child comparison shows all 4 metrics */}
        {comparisonLevel !== "child" && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Metric</label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between h-10 bg-background/70 dark:bg-background/50 border-border/50 hover:bg-muted/50"
                >
                  <span className="flex items-center space-x-2">
                    {metricObj.icon}
                    <span>{metricObj.label}</span>
                  </span>
                  <Filter className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-full bg-card border-border/50">
                {metrics.map((m) => (
                  <DropdownMenuItem key={m.value} onSelect={() => setSelectedMetric(m.value)}>
                    <span className="flex items-center space-x-2">
                      {m.icon}
                      <span>{m.label}</span>
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {/* View Type Toggle */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">View Type</label>
          <div className="flex gap-2">
            <Button
              variant={viewType === "aggregate" ? "default" : "outline"}
              onClick={() => setViewType("aggregate")}
              className="flex-1 h-10 bg-green-500 text-white hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
              size="sm"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Chart
            </Button>
            <Button
              variant={viewType === "table" ? "default" : "outline"}
              onClick={() => setViewType("table")}
              className="flex-1 h-10 bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
              size="sm"
            >
              <Table2 className="h-4 w-4 mr-2" />
              Table
            </Button>
          </div>
        </div>

        <Separator />

        {/* Date Range */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-green-500" />
            <span>Date Range</span>
          </label>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Apply to requests</span>
            <Button
              onClick={() => setConsiderDateRange(!considerDateRange)}
              variant={considerDateRange ? "default" : "outline"}
              className="h-8 px-3"
              size="sm"
            >
              {considerDateRange ? "On" : "Off"}
            </Button>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={useStartDate}
                onChange={(e) => setUseStartDate(e.target.checked)}
                disabled={!considerDateRange}
              />
              <Input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                className="h-10 bg-background/70 dark:bg-background/50 border-border/50"
                disabled={!considerDateRange}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={useEndDate}
                onChange={(e) => setUseEndDate(e.target.checked)}
                disabled={!considerDateRange}
              />
              <Input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                className="h-10 bg-background/70 dark:bg-background/50 border-border/50"
                disabled={!considerDateRange}
              />
            </div>
          </div>
          <Button
            onClick={() => setConsiderDateRange(!considerDateRange)}
            variant={considerDateRange ? "default" : "outline"}
            className="w-full h-10"
          >
            {considerDateRange ? "Ignore Date Range" : "Consider Date Range"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
