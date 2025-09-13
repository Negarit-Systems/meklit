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
}

const ChartCard: React.FC<ChartCardProps> = ({
  data,
  title,
  icon,
  description,
  showDetailsButton,
  onDetailsClick,
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
        ) : (
          <div className="space-y-3">
            {data.map((item, index) => (
              <div key={index} className="space-y-1">
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
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ChartCard;