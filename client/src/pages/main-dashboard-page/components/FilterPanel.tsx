import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Filter, Calendar, X } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import type { Child } from "@/services/apiService";

export interface FilterState {
  centerId: string;
  classId: string;
  childId: string;
  dateRange: [Date | undefined, Date | undefined];
  dataTypes: string[];
  isFilterOpen: boolean;
}

interface FilterPanelProps {
  isMdUp: boolean;
  filters: FilterState;
  centers: string[];
  classes: string[];
  filteredChildren: Child[];
  loadingChildren: boolean;
  onToggle: () => void;
  onChange: (newFilters: Partial<FilterState>) => void;
  onReset: () => void;
}

export function FilterPanel({
  isMdUp,
  filters,
  centers,
  classes,
  filteredChildren,
  loadingChildren,
  onToggle,
  onChange,
  onReset,
}: FilterPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "bg-card border border-border rounded-xl p-6 shadow-md transition-all duration-300",
        isMdUp ? "min-h-[calc(100vh-4rem)] sticky top-8" : "z-[100] w-full max-w-md max-h-[calc(100vh-2rem)] overflow-y-auto"
      )}
    >
      <div className="flex items-center justify-between mb-6 pb-4 border-b">
        <h2 className="text-xl font-bold text-green-500 flex items-center">
          <Filter className="h-6 w-6 mr-2" /> Filters
        </h2>
        <Button variant="ghost" size="sm" onClick={onToggle} className="ml-2 p-1">
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Center</label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between bg-background/70 dark:bg-background/50">
                {filters.centerId || "All Centers"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] bg-card border border-border z-[150]">
              <DropdownMenuItem onSelect={() => onChange({ centerId: "" })}>All Centers</DropdownMenuItem>
              {centers.map((center) => (
                <DropdownMenuItem key={center} onSelect={() => onChange({ centerId: center })}>
                  {center}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Class</label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between bg-background/70 dark:bg-background/50"
                disabled={classes.length === 0}
              >
                {filters.classId || "All Classes"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] bg-card border border-border z-[150]">
              <DropdownMenuItem onSelect={() => onChange({ classId: "" })}>All Classes</DropdownMenuItem>
              {classes.map((classId) => (
                <DropdownMenuItem key={classId} onSelect={() => onChange({ classId })}>
                  {classId}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Child</label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between bg-background/70 dark:bg-background/50"
                disabled={loadingChildren || filteredChildren.length === 0}
              >
                {loadingChildren
                  ? "Loading..."
                  : filters.childId
                  ? `${filteredChildren.find((c) => c.id === filters.childId)?.firstName} ${
                      filteredChildren.find((c) => c.id === filters.childId)?.lastName
                    }`
                  : "All Children"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] bg-card border border-border z-[150]">
              <DropdownMenuItem onSelect={() => onChange({ childId: "" })}>All Children</DropdownMenuItem>
              {filteredChildren.map((child: Child) => (
                <DropdownMenuItem key={child.id} onSelect={() => onChange({ childId: child.id })}>
                  {child.firstName} {child.lastName}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Start Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-between bg-background/70 dark:bg-background/50">
                  <span className="flex items-center justify-between w-full">
                    <span>{filters.dateRange[0] ? format(filters.dateRange[0], "PPP") : "Select Start Date"}</span>
                    <Calendar className="h-4 w-4 opacity-50" />
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-card border border-border z-[150]">
                <DayPicker
                  className="bg-card text-foreground"
                  mode="single"
                  selected={filters.dateRange[0]}
                  onSelect={(date) => onChange({ dateRange: [date, filters.dateRange[1]] })}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">End Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-between bg-background/70 dark:bg-background/50">
                  <span className="flex items-center justify-between w-full">
                    <span>{filters.dateRange[1] ? format(filters.dateRange[1], "PPP") : "Select End Date"}</span>
                    <Calendar className="h-4 w-4 opacity-50" />
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-card border border-border z-[150]">
                <DayPicker
                  className="bg-card text-foreground"
                  mode="single"
                  selected={filters.dateRange[1]}
                  onSelect={(date) => onChange({ dateRange: [filters.dateRange[0], date] })}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Data Types</label>
          <div className="space-y-2">
            {["Daily Logs", "Health Records", "Staff Performance"].map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={type}
                  checked={filters.dataTypes.includes(type)}
                  onChange={(e) => {
                    const newTypes = e.target.checked
                      ? [...filters.dataTypes, type]
                      : filters.dataTypes.filter((dt) => dt !== type);
                    onChange({ dataTypes: newTypes });
                  }}
                  className="h-4 w-4 text-blue-600 bg-background border border-border rounded focus:ring-2 focus:ring-ring focus:ring-offset-0"
                />
                <label htmlFor={type} className="text-sm font-medium text-foreground">
                  {type}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="ghost" onClick={onReset} className="text-sm text-muted-foreground">
            Reset Filters
          </Button>
        </div>
      </div>
    </motion.div>
  );
}