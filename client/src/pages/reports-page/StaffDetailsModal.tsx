import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { StaffPerformanceDetail } from "./types";

interface StaffDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffPerformanceDetails: StaffPerformanceDetail[];
  getColor: (index: number) => string;
}

const StaffDetailsModal: React.FC<StaffDetailsModalProps> = ({
  isOpen,
  onClose,
  staffPerformanceDetails,
  getColor,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] sm:max-h-[80vh] overflow-auto">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
          <div className="flex-1">
            <CardTitle className="text-lg sm:text-xl">
              Staff Performance - Detailed View
            </CardTitle>
            <CardDescription className="text-sm">
              Breakdown of logs by type for each staff member
            </CardDescription>
          </div>
          <Button variant="ghost" onClick={onClose} className="self-end sm:self-auto">
            ✕
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {staffPerformanceDetails.map((staff, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 space-y-2 sm:space-y-0">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-4 h-4 rounded-full ${getColor(index)}`}
                    />
                    <h3 className="text-lg font-semibold">{staff.staffId}</h3>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-2xl font-bold">{staff.totalLogs}</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      total logs
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {Object.entries(staff.logsByType).map(([type, count]) => (
                    <div
                      key={type}
                      className="text-center p-2 border rounded bg-gray-50"
                    >
                      <div className="text-sm text-muted-foreground">{type}</div>
                      <div className="text-lg font-semibold">{count as number}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffDetailsModal;
