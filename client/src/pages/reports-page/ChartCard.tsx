import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import type { ChartData } from "./types";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

interface ChartCardProps {
  data: ChartData[];
  title: string;
  icon: React.ReactNode;
  description?: string;
  showDetailsButton?: boolean;
  onDetailsClick?: () => void;
  showBreakdown?: boolean;
  chartType?: 'bar' | 'pie';
}

const ChartCard: React.FC<ChartCardProps> = ({
  data,
  title,
  icon,
  description,
  showDetailsButton,
  onDetailsClick,
  showBreakdown = false,
  chartType = 'bar',
}) => {
  const maxValue = Math.max(...data.map((d) => d.value));
  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  
  // Chart.js data for pie chart
  const pieChartData = {
    labels: data.map((item) => item.name),
    datasets: [
      {
        data: data.map((item) => item.value),
        backgroundColor: [
          'hsl(210, 100%, 50%)', // Sky Blue
          'hsl(120, 60%, 50%)',  // Forest Green
          'hsl(30, 80%, 60%)',   // Warm Orange
          'hsl(280, 60%, 60%)',  // Soft Purple
          'hsl(0, 70%, 60%)',    // Rose Red
          'hsl(60, 70%, 60%)',   // Soft Yellow
          'hsl(180, 60%, 50%)',  // Ocean Teal
          'hsl(320, 60%, 60%)',  // Pink
        ],
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 pb-2">
        <div className="flex-1">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {description && (
            <CardDescription className="text-xs">
              {description}
            </CardDescription>
          )}
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {icon}
          {showDetailsButton && onDetailsClick && (
            <Button size="sm" onClick={onDetailsClick} className="flex-1 sm:flex-none">
              <TrendingUp className="h-3 w-3 mr-1" />
              Details
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-muted-foreground text-sm">
              No data available
            </div>
          </div>
        ) : chartType === 'pie' ? (
          <div className="space-y-4 relative">
            {/* Custom Legend - Two Columns Above Chart */}
            <div className="grid grid-cols-2 gap-2">
              {data.map((item, index) => {
                const colors = [
                  'hsl(210, 100%, 50%)', // Sky Blue
                  'hsl(120, 60%, 50%)',  // Forest Green
                  'hsl(30, 80%, 60%)',   // Warm Orange
                  'hsl(280, 60%, 60%)',  // Soft Purple
                  'hsl(0, 70%, 60%)',    // Rose Red
                  'hsl(60, 70%, 60%)',   // Soft Yellow
                  'hsl(180, 60%, 50%)',  // Ocean Teal
                  'hsl(320, 60%, 60%)',  // Pink
                ];
                
                return (
                  <div key={index} className="flex items-center space-x-2 p-2 rounded bg-muted/20">
                    <div 
                      className="w-3 h-3 rounded-full shadow-sm flex-shrink-0" 
                      style={{ backgroundColor: colors[index % colors.length] }}
                    />
                    <div className="min-w-0 flex-1">
                      <div 
                        className="font-medium text-xs truncate cursor-help relative" 
                        onMouseEnter={(e) => {
                          setHoveredLabel(item.name);
                          const rect = e.currentTarget.getBoundingClientRect();
                          setTooltipPosition({
                            x: rect.left + rect.width / 2,
                            y: rect.top - 10
                          });
                        }}
                        onMouseLeave={() => setHoveredLabel(null)}
                      >
                        {item.name}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Custom Tooltip */}
            {hoveredLabel && (
              <div 
                className="fixed z-50 bg-background border border-border rounded-lg shadow-lg px-3 py-2 text-sm font-medium pointer-events-none"
                style={{
                  left: `${tooltipPosition.x}px`,
                  top: `${tooltipPosition.y}px`,
                  transform: 'translate(-50%, -100%)'
                }}
              >
                {hoveredLabel}
              </div>
            )}
            
            {/* Pie Chart */}
            <div className="h-80 flex items-center justify-center">
              <Doughnut 
                data={pieChartData} 
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false, 
                  cutout: "70%",
                  plugins: {
                    legend: {
                      display: false
                    },
                    tooltip: {
                      backgroundColor: 'hsl(var(--background))',
                      titleColor: 'hsl(var(--foreground))',
                      bodyColor: 'hsl(var(--foreground))',
                      borderColor: 'hsl(var(--border))',
                      borderWidth: 1,
                      callbacks: {
                        label: function(context) {
                          const label = context.label || '';
                          const value = context.parsed;
                          const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                          const percentage = ((value / total) * 100).toFixed(1);
                          return `${label}: ${value} (${percentage}%)`;
                        }
                      }
                    }
                  }
                }} 
              />
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {data.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground truncate">
                    {item.name}
                  </span>
                  <span className="font-medium">{item.value}</span>
                </div>
                <div className="w-full bg-secondary/20 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      item.color || "bg-primary"
                    }`}
                    style={{
                      width: `${
                        maxValue > 0 ? (item.value / maxValue) * 100 : 0
                      }%`,
                    }}
                  />
                </div>
                {showBreakdown && (item.incidents !== undefined || item.medications !== undefined) && (
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    {item.incidents !== undefined && (
                      <span className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        {item.incidents} incidents
                      </span>
                    )}
                    {item.medications !== undefined && (
                      <span className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        {item.medications} medications
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ChartCard;