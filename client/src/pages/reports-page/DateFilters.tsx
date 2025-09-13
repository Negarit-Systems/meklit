import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RefreshCw } from "lucide-react";
import type { DateRange } from "./types";

interface DateFiltersProps {
  dateRange: DateRange;
  onDateRangeChange: (dateRange: DateRange) => void;
  onApplyFilters: () => void;
}

const DateFilters: React.FC<DateFiltersProps> = ({
  dateRange,
  onDateRangeChange,
  onApplyFilters,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Filters</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-end">
            <div className="flex-1">
              <label className="text-sm font-medium">Start Date</label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) =>
                  onDateRangeChange({
                    ...dateRange,
                    startDate: e.target.value,
                  })
                }
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium">End Date</label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) =>
                  onDateRangeChange({ ...dateRange, endDate: e.target.value })
                }
                className="w-full p-2 border rounded-md"
              />
            </div>
          </div>
          <Button onClick={onApplyFilters} className="w-full sm:w-auto sm:self-end">
            <RefreshCw className="h-4 w-4 mr-2" />
            Apply Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DateFilters;