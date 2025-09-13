import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BarChart3, RefreshCw } from "lucide-react";
import { apiClient } from "@/lib/axios";

interface ComparativeData {
  group: string;
  totalLogs: number;
  mealStatuses: {
    "Ate all": number;
    "Ate half": number;
    "Ate little": number;
    "Refused": number;
  };
  engagementLevels: {
    "Low": number;
    "Moderate": number;
    "High": number;
  };
  moodCounts: {
    "Excited": number;
    "Calm": number;
    "Happy": number;
    "Cranky": number;
  };
  mealCount: number;
  napCount: number;
  averageSleepDuration: number;
}

interface ComparativeAnalysisProps {
  startDate: string;
  endDate: string;
}

const ComparativeAnalysis: React.FC<ComparativeAnalysisProps> = ({
  startDate,
  endDate,
}) => {
  const [groupBy, setGroupBy] = useState<"classId" | "childId">("classId");
  const [data, setData] = useState<ComparativeData[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchComparativeData = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get("/daily-logs/comparative", {
        params: {
          startDate,
          endDate,
          groupBy,
        },
      });
      
      if (response.data.success) {
        setData(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching comparative data:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (startDate && endDate) {
      fetchComparativeData();
    }
  }, [startDate, endDate, groupBy]);

  const getTotalRecords = () => {
    return data.reduce((sum, item) => sum + item.totalLogs, 0);
  };

  const getMealStatusPercentage = (status: string) => {
    const total = data.reduce((sum, item) => {
      const mealStatuses = item.mealStatuses || {};
      return sum + (mealStatuses[status as keyof typeof mealStatuses] || 0);
    }, 0);
    const totalMeals = data.reduce((sum, item) => sum + (item.mealCount || 0), 0);
    return totalMeals > 0 ? ((total / totalMeals) * 100).toFixed(1) : "0";
  };

  const getMealStatusCount = (status: string) => {
    return data.reduce((sum, item) => {
      const mealStatuses = item.mealStatuses || {};
      return sum + (mealStatuses[status as keyof typeof mealStatuses] || 0);
    }, 0);
  };

  const getEngagementPercentage = (level: string) => {
    const total = data.reduce((sum, item) => {
      const engagementLevels = item.engagementLevels || {};
      return sum + (engagementLevels[level as keyof typeof engagementLevels] || 0);
    }, 0);
    const totalEngagement = data.reduce((sum, item) => {
      const engagementLevels = item.engagementLevels || {};
      return sum + (engagementLevels.Low || 0) + (engagementLevels.Moderate || 0) + (engagementLevels.High || 0);
    }, 0);
    return totalEngagement > 0 ? ((total / totalEngagement) * 100).toFixed(1) : "0";
  };

  const getEngagementCount = (level: string) => {
    return data.reduce((sum, item) => {
      const engagementLevels = item.engagementLevels || {};
      return sum + (engagementLevels[level as keyof typeof engagementLevels] || 0);
    }, 0);
  };

  const getMoodPercentage = (mood: string) => {
    const total = data.reduce((sum, item) => {
      const moodCounts = item.moodCounts || {};
      return sum + (moodCounts[mood as keyof typeof moodCounts] || 0);
    }, 0);
    const totalMoods = data.reduce((sum, item) => {
      const moodCounts = item.moodCounts || {};
      return sum + (moodCounts.Excited || 0) + (moodCounts.Calm || 0) + (moodCounts.Happy || 0) + (moodCounts.Cranky || 0);
    }, 0);
    return totalMoods > 0 ? ((total / totalMoods) * 100).toFixed(1) : "0";
  };

  const getMoodCount = (mood: string) => {
    return data.reduce((sum, item) => {
      const moodCounts = item.moodCounts || {};
      return sum + (moodCounts[mood as keyof typeof moodCounts] || 0);
    }, 0);
  };

  return (
    <Card className="h-full flex flex-col border-0 shadow-lg bg-gradient-to-br from-background via-background to-muted/20">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6 bg-gradient-to-r from-primary/5 to-secondary/5 border-b border-border/50">
        <div className="flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-white shadow-lg">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Comparative Analysis
            </CardTitle>
            <p className="text-sm text-muted-foreground font-medium">
              {getTotalRecords()} total records • {data.length} {groupBy === 'classId' ? 'classes' : 'children'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={groupBy} onValueChange={(value: "classId" | "childId") => setGroupBy(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="classId">By Class</SelectItem>
              <SelectItem value="childId">By Child</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchComparativeData}
            disabled={loading}
            className="h-9"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col pt-6">
        {data.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center p-8 rounded-2xl bg-muted/30 border-2 border-dashed border-muted-foreground/30">
              <div className="text-muted-foreground text-base mb-2 font-medium">
                No data available
              </div>
              <div className="text-sm text-muted-foreground/70">
                Select a group by option and refresh
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Meal Status Analysis */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground">Meal Status</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {["Ate all", "Ate half", "Ate little", "Refused"].map((status) => {
                  const count = getMealStatusCount(status);
                  const percentage = getMealStatusPercentage(status);
                  return (
                    <div key={status} className="p-4 border rounded-xl bg-gradient-to-r from-card to-card/80">
                      <div className="text-sm font-medium text-muted-foreground mb-1">{status}</div>
                      <div className="text-2xl font-bold text-primary">{count}</div>
                      <div className="text-xs text-muted-foreground">{percentage}% of meals</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Engagement Levels */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground">Engagement Levels</h3>
              <div className="grid grid-cols-3 gap-4">
                {["Low", "Moderate", "High"].map((level) => {
                  const count = getEngagementCount(level);
                  const percentage = getEngagementPercentage(level);
                  return (
                    <div key={level} className="p-4 border rounded-xl bg-gradient-to-r from-card to-card/80">
                      <div className="text-sm font-medium text-muted-foreground mb-1">{level}</div>
                      <div className="text-2xl font-bold text-secondary">{count}</div>
                      <div className="text-xs text-muted-foreground">{percentage}% of engagement</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Mood Counts */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground">Mood Distribution</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {["Excited", "Calm", "Happy", "Cranky"].map((mood) => {
                  const count = getMoodCount(mood);
                  const percentage = getMoodPercentage(mood);
                  return (
                    <div key={mood} className="p-4 border rounded-xl bg-gradient-to-r from-card to-card/80">
                      <div className="text-sm font-medium text-muted-foreground mb-1">{mood}</div>
                      <div className="text-2xl font-bold text-accent-foreground">{count}</div>
                      <div className="text-xs text-muted-foreground">{percentage}% of moods</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Additional Stats */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground">Additional Statistics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-xl bg-gradient-to-r from-card to-card/80">
                  <div className="text-sm font-medium text-muted-foreground mb-1">Total Meals</div>
                  <div className="text-2xl font-bold text-primary">
                    {data.reduce((sum, item) => sum + item.mealCount, 0)}
                  </div>
                </div>
                <div className="p-4 border rounded-xl bg-gradient-to-r from-card to-card/80">
                  <div className="text-sm font-medium text-muted-foreground mb-1">Total Naps</div>
                  <div className="text-2xl font-bold text-secondary">
                    {data.reduce((sum, item) => sum + item.napCount, 0)}
                  </div>
                </div>
                <div className="p-4 border rounded-xl bg-gradient-to-r from-card to-card/80">
                  <div className="text-sm font-medium text-muted-foreground mb-1">Avg Sleep Duration</div>
                  <div className="text-2xl font-bold text-accent-foreground">
                    {(() => {
                      const validDurations = data.filter(item => item.averageSleepDuration && item.averageSleepDuration > 0);
                      return validDurations.length > 0 
                        ? (validDurations.reduce((sum, item) => sum + item.averageSleepDuration, 0) / validDurations.length).toFixed(1)
                        : "0";
                    })()} min
                  </div>
                </div>
              </div>
            </div>

            {/* Individual Group Breakdown */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground">
                Individual {groupBy === 'classId' ? 'Class' : 'Child'} Breakdown
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {data.map((item, index) => (
                  <div key={index} className="p-4 border rounded-xl bg-gradient-to-r from-card to-card/80">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-foreground">
                          {groupBy === 'classId' ? 'Class' : 'Child'}: {item.group}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {item.totalLogs} total logs
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Meals: {item.mealCount}</div>
                        <div className="text-sm text-muted-foreground">Naps: {item.napCount}</div>
                        {item.averageSleepDuration && (
                          <div className="text-sm text-muted-foreground">
                            Sleep: {item.averageSleepDuration} min
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Meal Statuses */}
                      <div>
                        <h5 className="text-sm font-medium text-muted-foreground mb-2">Meal Status</h5>
                        <div className="space-y-1">
                          {Object.keys(item.mealStatuses || {}).length > 0 ? (
                            Object.entries(item.mealStatuses).map(([status, count]) => (
                              <div key={status} className="flex justify-between text-sm">
                                <span>{status}:</span>
                                <span className="font-medium">{count}</span>
                              </div>
                            ))
                          ) : (
                            <div className="text-sm text-muted-foreground">No meal data</div>
                          )}
                        </div>
                      </div>

                      {/* Engagement Levels */}
                      <div>
                        <h5 className="text-sm font-medium text-muted-foreground mb-2">Engagement</h5>
                        <div className="space-y-1">
                          {Object.keys(item.engagementLevels || {}).length > 0 ? (
                            Object.entries(item.engagementLevels).map(([level, count]) => (
                              <div key={level} className="flex justify-between text-sm">
                                <span>{level}:</span>
                                <span className="font-medium">{count}</span>
                              </div>
                            ))
                          ) : (
                            <div className="text-sm text-muted-foreground">No engagement data</div>
                          )}
                        </div>
                      </div>

                      {/* Mood Counts */}
                      <div>
                        <h5 className="text-sm font-medium text-muted-foreground mb-2">Mood</h5>
                        <div className="space-y-1">
                          {Object.keys(item.moodCounts || {}).length > 0 ? (
                            Object.entries(item.moodCounts).map(([mood, count]) => (
                              <div key={mood} className="flex justify-between text-sm">
                                <span>{mood}:</span>
                                <span className="font-medium">{count}</span>
                              </div>
                            ))
                          ) : (
                            <div className="text-sm text-muted-foreground">No mood data</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ComparativeAnalysis;
