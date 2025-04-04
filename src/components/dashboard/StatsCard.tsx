
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: number | null;
  icon: React.ReactNode;
  isLoading: boolean;
}

export const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  icon, 
  isLoading 
}) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              {title}
            </p>
            {isLoading ? (
              <div className="flex items-center mt-1">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                <span>Loading...</span>
              </div>
            ) : (
              <h3 className="text-2xl font-bold">{value || 0}</h3>
            )}
          </div>
          <div className="p-2 bg-primary/10 rounded-full">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
