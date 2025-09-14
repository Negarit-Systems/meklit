import { motion } from "framer-motion";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Calendar, BarChart, PieChart, X } from "lucide-react";
import { Doughnut, Bar } from "react-chartjs-2";
import { format, isValid } from "date-fns";
import type { TrendData, StaffPerformance, IncidentFrequency } from "@/services/apiService";

const chartColors = {
  blue: "rgb(75, 192, 192)",
  red: "rgb(255, 99, 132)",
  yellow: "rgb(255, 205, 86)",
  green: "rgb(54, 162, 235)",
  purple: "rgb(153, 102, 255)",
};

export interface ChartSectionProps {
  loading: boolean;
  error: Error | null | undefined;
  filters: { dataTypes: string[] };
  trendData: TrendData[];
  staffData: StaffPerformance[];
  incidentData: IncidentFrequency[];
}

export function ChartSection({ loading, error, filters, trendData, staffData, incidentData }: ChartSectionProps) {
  const safeStaffData = Array.isArray(staffData) ? staffData : [];
  const staffChartData = {
    labels: safeStaffData.map((item) => item.staffId),
    datasets: [
      {
        label: "Total Logs",
        data: safeStaffData.map((item) => item.totalLogs),
        backgroundColor: safeStaffData.map(() => chartColors.green),
        borderColor: safeStaffData.map(() => "rgb(54, 162, 235, 1)"),
        borderWidth: 1,
      },
    ],
  };

  const incidentDoughnutData = {
    labels: incidentData.map((item) => item.type),
    datasets: [
      {
        data: incidentData.map((item) => item.count),
        backgroundColor: [chartColors.blue, chartColors.red, chartColors.yellow, chartColors.purple],
        hoverBackgroundColor: [chartColors.blue, chartColors.red, chartColors.yellow, chartColors.purple],
        borderWidth: 2,
      },
    ],
  };

  const showDailyLogs = filters.dataTypes.includes("Daily Logs");
  const showHealthRecords = filters.dataTypes.includes("Health Records");
  const showStaffPerformance = filters.dataTypes.includes("Staff Performance");

  const hasData =
    (showDailyLogs && trendData.length > 0) ||
    (showStaffPerformance && staffData.length > 0) ||
    (showHealthRecords && incidentData.length > 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center gap-3 text-muted-foreground">
          <div className="h-3 w-3 rounded-full bg-blue-400" />
          <span>Loading…</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-red-600 bg-card rounded-lg p-4 shadow-md">
        <X className="h-12 w-12 mb-4" />
        <p>Error fetching data: {error.message}. Please try again.</p>
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="flex items-center justify-center h-96 text-muted-foreground bg-card rounded-lg p-4 shadow-md">
        No data available for the selected filters.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {showDailyLogs && trendData.length > 0 && (
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-green-500">
                <Calendar className="h-6 w-6 mr-2" />
                Daily Logs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-h-96 overflow-y-auto pr-2">
                {trendData.map((log, index) => {
                  let date: Date | null = null;
                  const isFsTimestamp = (d: unknown): d is { _seconds: number } =>
                    typeof d === "object" && d !== null && "_seconds" in (d as Record<string, unknown>);
                  if (isFsTimestamp(log.date)) {
                    date = new Date(log.date._seconds * 1000);
                  } else if (typeof log.date === "string") {
                    const parsed = new Date(log.date);
                    date = isValid(parsed) ? parsed : null;
                  }

                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <Card className="h-52 flex flex-col"> {/* fixed equal height */}
                        <CardHeader>
                          <p className="font-semibold text-blue-500">
                            {date && isValid(date) ? format(date, "MMM dd, yyyy") : "Invalid Date"}
                          </p>
                        </CardHeader>

                        <CardContent className="flex-1 min-h-0 overflow-y-auto text-sm text-muted-foreground space-y-1">
                          {/* Nap info */}
                          {log.napCount > 0 && (
                            <p>
                              <strong>Nap:</strong>{" "}
                              {`${log.napCount} (${log.averageNapDuration?.toFixed(0)} min avg)`}
                            </p>
                          )}

                          {/* Meal info */}
                          {log.totalMeals > 0 && (
                            <div>
                              <strong>Meals:</strong>
                              <ul className="list-disc list-inside ml-5">
                                {Object.entries(log.mealStatusCounts).map(([status, count]) => (
                                  <li key={status}>
                                    {status} ({count})
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Mood info */}
                          {log.totalMoods > 0 && (
                            <div>
                              <strong>Moods:</strong>
                              <ul className="list-disc list-inside ml-5">
                                {Object.entries(log.moodCounts).map(([mood, count]) => (
                                  <li key={mood}>
                                    {mood} ({count})
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Other info */}
                          {log.otherTypeCounts &&
                            Object.keys(log.otherTypeCounts).length > 0 && (
                              <div>
                                <strong>Other:</strong>
                                <ul className="list-disc list-inside ml-5">
                                  {Object.entries(log.otherTypeCounts).map(([type, count]) => (
                                    <li key={type}>
                                      {type} ({count})
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {showStaffPerformance && staffData.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-green-500">
                <BarChart className="h-6 w-6 mr-2" />
                Staff Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <Bar data={staffChartData} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {showHealthRecords && incidentData.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-blue-500">
                <PieChart className="h-6 w-6 mr-2" />
                Incident Frequency
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96 flex items-center justify-center">
                <Doughnut data={incidentDoughnutData} options={{ responsive: true, maintainAspectRatio: false, cutout: "70%" }} />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
