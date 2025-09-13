import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { TableColumn } from "./types";

interface TableCardProps {
  data: any[];
  title: string;
  icon: React.ReactNode;
  columns: TableColumn[];
}

const TableCard: React.FC<TableCardProps> = ({ data, title, icon, columns }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        {data.slice(0, 10).map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 border rounded-lg"
          >
            {columns.map((column, colIndex) => (
              <div key={colIndex} className="flex-1">
                <span className="text-xs text-muted-foreground">
                  {column.label}
                </span>
                <div className="font-medium">
                  {column.render
                    ? column.render(item[column.key], item)
                    : item[column.key]}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export default TableCard;
