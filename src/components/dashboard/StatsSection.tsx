
import React from "react";
import { StatsCard } from "./StatsCard";
import { Calendar, PhoneCall, Users } from "lucide-react";

interface StatsProps {
  totalContacts: number | null;
  pendingFollowups: number | null;
  recentActivities: number | null;
  isLoading: boolean;
}

export const StatsSection: React.FC<StatsProps> = ({ 
  totalContacts, 
  pendingFollowups, 
  recentActivities, 
  isLoading 
}) => {
  return (
    <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatsCard
        title="Total Contacts"
        value={totalContacts}
        isLoading={isLoading}
        icon={<Users className="h-5 w-5 text-primary" />}
        linkTo="/contacts"
      />
      <StatsCard
        title="Pending Follow-ups"
        value={pendingFollowups}
        isLoading={isLoading}
        icon={<PhoneCall className="h-5 w-5 text-yellow-600" />}
      />
      <StatsCard
        title="Activities"
        value={recentActivities}
        isLoading={isLoading}
        icon={<Calendar className="h-5 w-5 text-blue-600" />}
      />
    </div>
  );
};
