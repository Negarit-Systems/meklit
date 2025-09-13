import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { TableColumn } from "./types";

interface TableCardProps {
  data: any[];
  title: string;
  icon: React.ReactNode;
  columns: TableColumn[];
}

const TableCard: React.FC<TableCardProps> = ({ data, title, icon, columns }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(data.length / itemsPerPage);
  
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = data.slice(startIndex, endIndex);

  const goToNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <Card className="h-full flex flex-col border-0 shadow-lg bg-gradient-to-br from-background via-background to-muted/20">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6 bg-gradient-to-r from-primary/5 to-secondary/5 border-b border-border/50">
        <div className="flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-white shadow-lg">
            {icon}
          </div>
          <div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              {title}
            </CardTitle>
            <p className="text-sm text-muted-foreground font-medium">
              {data.length} total records
            </p>
          </div>
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
                Check back later for updates
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-3">
              {currentData.map((item, index) => (
                <div
                  key={startIndex + index}
                  className="group p-3 sm:p-5 border border-border/50 rounded-2xl bg-gradient-to-r from-card to-card/80 hover:from-primary/5 hover:to-secondary/5 transition-all duration-300 hover:shadow-xl hover:border-primary/30 hover:-translate-y-1"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-6">
                    {columns.map((column, colIndex) => (
                      <div key={colIndex} className="space-y-1 sm:space-y-2">
                        <span className="text-xs font-bold text-primary/80 uppercase tracking-widest">
                          {column.label}
                        </span>
                        <div className="text-sm font-semibold text-foreground">
                          {column.render
                            ? column.render(item[column.key], item)
                            : item[column.key]}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-6 border-t border-border/50 bg-gradient-to-r from-muted/20 to-transparent -mx-6 px-6 -mb-6 pb-6">
                <div className="text-sm font-medium text-muted-foreground">
                  Showing {startIndex + 1}-{Math.min(endIndex, data.length)} of {data.length}
                </div>
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToPrevPage}
                    disabled={currentPage === 0}
                    className="h-9 w-9 p-0 rounded-full border-primary/20 hover:border-primary hover:bg-primary/10 transition-all duration-200"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages - 1}
                    className="h-9 w-9 p-0 rounded-full border-primary/20 hover:border-primary hover:bg-primary/10 transition-all duration-200"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default TableCard;
