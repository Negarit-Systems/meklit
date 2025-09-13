import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { TrendFilters, FilteredInsights, DateRange } from "./types";

interface TrendDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  trendFilters: TrendFilters;
  onTrendFiltersChange: (filters: TrendFilters) => void;
  filteredTrendData: any[];
  loadingFilteredData: boolean;
  reportData: any[];
  dateRange: DateRange;
  children: any[];
  onFetchFilteredTrendData: (filters: TrendFilters) => void;
  processFilteredInsights: (data: any[]) => FilteredInsights | null;
}

const TrendDetailsModal: React.FC<TrendDetailsModalProps> = ({
  isOpen,
  onClose,
  trendFilters,
  onTrendFiltersChange,
  filteredTrendData,
  loadingFilteredData,
  reportData,
  dateRange: _dateRange,
  children,
  onFetchFilteredTrendData,
  processFilteredInsights,
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage] = useState(10);

  if (!isOpen) return null;

  const getUniqueCenterIds = () => {
    const centerIds = [...new Set(children.map((child) => child.centerId))];
    return centerIds.sort();
  };

  const getUniqueClassIds = () => {
    const classIds = [...new Set(children.map((child) => child.classId))];
    return classIds.sort();
  };

  const getChildrenForFilters = () => {
    const filtered = children.filter((child) => {
      if (trendFilters.centerId && child.centerId !== trendFilters.centerId)
        return false;
      if (trendFilters.classId && child.classId !== trendFilters.classId)
        return false;
      return true;
    });
    return filtered;
  };

  const hasActiveFilters =
    trendFilters.childId ||
    trendFilters.classId ||
    trendFilters.centerId;
  const dataToShow = hasActiveFilters ? filteredTrendData : reportData;
  const insights = processFilteredInsights(dataToShow);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] sm:max-h-[80vh] overflow-auto">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
          <div className="flex-1">
            <CardTitle className="text-lg sm:text-xl">
              Daily Activity Trends - Detailed View
            </CardTitle>
            <CardDescription className="text-sm">
              Filter and view activity data by child, class, or center
            </CardDescription>
          </div>
          <Button variant="ghost" onClick={onClose} className="self-end sm:self-auto">
            ✕
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-gray-50">
              <div>
                <label className="text-sm font-medium mb-2 block">Center</label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  style={{ backgroundColor: "#f3f4f6", color: "#1f2937" }}
                  value={trendFilters.centerId}
                  onChange={(e) => {
                    const newFilters = {
                      ...trendFilters,
                      centerId: e.target.value,
                      classId: "",
                      childId: "",
                    };
                    onTrendFiltersChange(newFilters);
                    onFetchFilteredTrendData(newFilters);
                  }}
                >
                  <option
                    value=""
                    style={{ backgroundColor: "#f3f4f6", color: "#4b5563" }}
                  >
                    All Centers
                  </option>
                  {getUniqueCenterIds().map((centerId) => (
                    <option
                      key={centerId}
                      value={centerId}
                      style={{
                        backgroundColor: "#f3f4f6",
                        color: "#1f2937",
                      }}
                    >
                      {centerId}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Class</label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  style={{ backgroundColor: "#f3f4f6", color: "#1f2937" }}
                  value={trendFilters.classId}
                  onChange={(e) => {
                    const newFilters = {
                      ...trendFilters,
                      classId: e.target.value,
                      childId: "",
                    };
                    onTrendFiltersChange(newFilters);
                    onFetchFilteredTrendData(newFilters);
                  }}
                >
                  <option
                    value=""
                    style={{ backgroundColor: "#f3f4f6", color: "#4b5563" }}
                  >
                    All Classes
                  </option>
                  {getUniqueClassIds().map((classId) => (
                    <option
                      key={classId}
                      value={classId}
                      style={{
                        backgroundColor: "#f3f4f6",
                        color: "#1f2937",
                      }}
                    >
                      {classId}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Child</label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  style={{ backgroundColor: "#f3f4f6", color: "#1f2937" }}
                  value={trendFilters.childId}
                  onChange={(e) => {
                    const newFilters = {
                      ...trendFilters,
                      childId: e.target.value,
                    };
                    onTrendFiltersChange(newFilters);
                    onFetchFilteredTrendData(newFilters);
                  }}
                >
                  <option
                    value=""
                    style={{ backgroundColor: "#f3f4f6", color: "#4b5563" }}
                  >
                    All Children
                  </option>
                  {getChildrenForFilters().map((child) => (
                    <option
                      key={child.id}
                      value={child.id}
                      style={{
                        backgroundColor: "#f3f4f6",
                        color: "#1f2937",
                      }}
                    >
                      {child.firstName} {child.lastName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const clearedFilters = {
                      childId: "",
                      classId: "",
                      centerId: "",
                    };
                    onTrendFiltersChange(clearedFilters);
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}

            {loadingFilteredData && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
                  <div className="text-sm text-yellow-800">
                    Loading filtered data...
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {!insights ? (
              <div className="text-center py-8 text-muted-foreground">
                {loadingFilteredData ? "Loading insights..." : "No data available"}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 border rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {insights.totalDays}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Days</div>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {insights.totalMeals}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Meals</div>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {insights.totalNaps}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Naps</div>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {insights.totalDiaperChanges}
                    </div>
                    <div className="text-sm text-muted-foreground">Diaper Changes</div>
                  </div>
                </div>

                {insights.avgNapDuration > 0 && (
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">Average Nap Duration</div>
                        <div className="text-sm text-muted-foreground">
                          Based on nap days only
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-purple-600">
                        {insights.avgNapDuration} min
                      </div>
                    </div>
                  </div>
                )}

                {Object.keys(insights.moodCounts).length > 0 && (
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-3">Mood Distribution</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                      {Object.entries(insights.moodCounts).map(([mood, count]) => (
                        <div
                          key={mood}
                          className="text-center p-2 border rounded bg-blue-50"
                        >
                          <div className="text-lg font-semibold text-blue-600">
                            {count as number}
                          </div>
                          <div className="text-sm text-muted-foreground">{mood}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {Object.keys(insights.mealCounts).length > 0 && (
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-3">Meal Status Distribution</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                      {Object.entries(insights.mealCounts).map(([status, count]) => (
                        <div
                          key={status}
                          className="text-center p-2 border rounded bg-green-50"
                        >
                          <div className="text-lg font-semibold text-green-600">
                            {count as number}
                          </div>
                          <div className="text-sm text-muted-foreground">{status}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">Daily Activity Trends</h3>
                    <div className="text-sm text-muted-foreground">
                      {Math.min(
                        currentPage * itemsPerPage + 1,
                        insights.activityTrends.length
                      )}{" "}
                      -{" "}
                      {Math.min(
                        (currentPage + 1) * itemsPerPage,
                        insights.activityTrends.length
                      )}{" "}
                      of {insights.activityTrends.length}
                    </div>
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {insights.activityTrends
                      .slice(
                        currentPage * itemsPerPage,
                        (currentPage + 1) * itemsPerPage
                      )
                      .map((day, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 border rounded"
                        >
                          <div className="font-medium">{day.date}</div>
                          <div className="flex gap-4 text-sm">
                            {day.meals > 0 && (
                              <span className="text-green-600">🍽️ {day.meals}</span>
                            )}
                            {day.moods > 0 && (
                              <span className="text-blue-600">😊 {day.moods}</span>
                            )}
                            {day.naps > 0 && (
                              <span className="text-purple-600">😴 {day.naps}</span>
                            )}
                            {day.diapers > 0 && (
                              <span className="text-orange-600">🧸 {day.diapers}</span>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage(Math.max(0, currentPage - 1))
                      }
                      disabled={currentPage === 0}
                    >
                      ← Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {currentPage + 1} of{" "}
                      {Math.ceil(insights.activityTrends.length / itemsPerPage)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage(
                          Math.min(
                            Math.ceil(
                              insights.activityTrends.length / itemsPerPage
                            ) - 1,
                            currentPage + 1
                          )
                        )
                      }
                      disabled={
                        currentPage >=
                        Math.ceil(insights.activityTrends.length / itemsPerPage) - 1
                      }
                    >
                      Next →
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrendDetailsModal;
