import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface IncidentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  incidentData: Array<{
    type: string;
    count: number;
    medications?: Record<string, number>;
    incidents?: Record<string, number>;
  }>;
}

const IncidentDetailsModal: React.FC<IncidentDetailsModalProps> = ({
  isOpen,
  onClose,
  incidentData,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <Card className="w-full max-w-4xl max-h-[80vh] overflow-auto">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
          <div className="flex-1">
            <CardTitle className="text-lg sm:text-xl">
              Incident and Medication Details
            </CardTitle>
            <CardDescription className="text-sm">
              Detailed breakdown of incidents and medications administered
            </CardDescription>
          </div>
          <Button variant="ghost" onClick={onClose} className="self-end sm:self-auto">
            ✕
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {incidentData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No incident data available
            </div>
          ) : (
            incidentData.map((item, _) => (
              <div key={item.type} className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-3 text-lg">{item.type}</h3>
                <div className="space-y-2">
                  {(item.medications || item.incidents) &&
                    Object.entries(item.medications || item.incidents || {}).map(
                      ([key, count]) => (
                        <div key={key} className="flex justify-between border-b py-1">
                          <span className="text-sm">{key}</span>
                          <span className="font-medium">{count}</span>
                        </div>
                      )
                    )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default IncidentDetailsModal;