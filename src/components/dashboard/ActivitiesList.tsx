
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, MailPlus, PhoneCall, Plus, Users } from "lucide-react";
import { isToday, isTomorrow, format } from "date-fns";

interface Activity {
  id: string;
  type: string;
  contact_name: string;
  scheduled_date: string;
}

interface ActivitiesListProps {
  activities: Activity[] | undefined;
  isLoading: boolean;
}

export const ActivitiesList: React.FC<ActivitiesListProps> = ({ 
  activities, 
  isLoading 
}) => {
  // Format date for display
  const formatActivityDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) {
      return `Today, ${format(date, "h:mm a")}`;
    } else if (isTomorrow(date)) {
      return `Tomorrow, ${format(date, "h:mm a")}`;
    } else {
      return format(date, "MMM d, h:mm a");
    }
  };

  return (
    <>
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : activities && activities.length > 0 ? (
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
            >
              <div
                className={`p-2 rounded-full mr-3 ${
                  activity.type === "Call"
                    ? "bg-green-100"
                    : activity.type === "Email"
                    ? "bg-blue-100"
                    : "bg-purple-100"
                }`}
              >
                {activity.type === "Call" ? (
                  <PhoneCall
                    className="h-4 w-4 text-green-600"
                    strokeWidth={2}
                  />
                ) : activity.type === "Email" ? (
                  <MailPlus
                    className="h-4 w-4 text-blue-600"
                    strokeWidth={2}
                  />
                ) : (
                  <Users
                    className="h-4 w-4 text-purple-600"
                    strokeWidth={2}
                  />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {activity.type} with {activity.contact_name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatActivityDate(activity.scheduled_date)}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <p>No activities scheduled</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2"
          >
            <Plus className="h-4 w-4 mr-1" /> Schedule an activity
          </Button>
        </div>
      )}
    </>
  );
};
