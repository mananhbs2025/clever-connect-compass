
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

interface StatsCardProps {
  title: string;
  value: number | null;
  icon: React.ReactNode;
  isLoading: boolean;
  linkTo?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  icon, 
  isLoading,
  linkTo
}) => {
  const CardWrapper = ({ children }: { children: React.ReactNode }) => {
    if (linkTo) {
      return (
        <Link to={linkTo} className="block">
          <Card className="transition-all hover:shadow-md cursor-pointer">
            {children}
          </Card>
        </Link>
      );
    }
    return <Card>{children}</Card>;
  };

  return (
    <CardWrapper>
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
    </CardWrapper>
  );
};
