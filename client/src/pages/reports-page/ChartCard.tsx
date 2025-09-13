import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import type { ChartData } from "./types";

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
            <Button variant="ghost" size="sm" onClick={onDetailsClick} className="flex-1 sm:flex-none">
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
          <div className="h-full flex flex-col">
            {/* Full-size Pie Chart */}
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="relative w-full h-full max-w-sm max-h-sm">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  {/* Background circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="hsl(var(--muted))"
                    opacity="0.1"
                  />
                  {/* Pie slices */}
                  {data.map((item, index) => {
                    const total = data.reduce((sum, d) => sum + d.value, 0);
                    const percentage = (item.value / total) * 100;
                    const angle = (percentage / 100) * 360;
                    const prevAngle = data.slice(0, index).reduce((sum, d) => sum + (d.value / total) * 360, 0);
                    
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
                    
                    // Calculate path for pie slice
                    const startAngle = prevAngle - 90; // Start from top
                    const endAngle = startAngle + angle;
                    
                    const startAngleRad = (startAngle * Math.PI) / 180;
                    const endAngleRad = (endAngle * Math.PI) / 180;
                    
                    const x1 = 50 + 40 * Math.cos(startAngleRad);
                    const y1 = 50 + 40 * Math.sin(startAngleRad);
                    const x2 = 50 + 40 * Math.cos(endAngleRad);
                    const y2 = 50 + 40 * Math.sin(endAngleRad);
                    
                    const largeArcFlag = angle > 180 ? 1 : 0;
                    
                    const pathData = [
                      `M 50 50`,
                      `L ${x1} ${y1}`,
                      `A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                      `Z`
                    ].join(' ');
                    
                    return (
                      <path
                        key={index}
                        d={pathData}
                        fill={colors[index % colors.length]}
                        className="transition-all duration-1500 ease-out drop-shadow-sm"
                        style={{
                          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                        }}
                      />
                    );
                  })}
                </svg>
                {/* Center content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-4xl font-bold text-foreground">
                    {data.reduce((sum, d) => sum + d.value, 0)}
                  </div>
                  <div className="text-sm text-foreground/70 font-medium">Actions</div>
                </div>
              </div>
            </div>
            
            {/* Compact Legend */}
            <div className="grid grid-cols-2 gap-2 p-4 pt-0">
              {data.map((item, index) => {
                const total = data.reduce((sum, d) => sum + d.value, 0);
                const percentage = ((item.value / total) * 100).toFixed(1);
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
                      <div className="font-medium text-xs truncate">{item.name}</div>
                      <div className="text-xs text-muted-foreground">{percentage}%</div>
                    </div>
                    <div className="text-xs font-bold">{item.value}</div>
                  </div>
                );
              })}
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