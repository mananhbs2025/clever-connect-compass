
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface DashboardHeaderProps {
  userName: string | undefined;
  userEmail: string | undefined;
  onAddContact: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  userName, 
  userEmail, 
  onAddContact 
}) => {
  return (
    <div className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome, {userName || userEmail?.split("@")[0]}
          </h1>
          <p className="text-sm text-gray-500">
            Your personal CRM dashboard
          </p>
        </div>
        <Button className="flex items-center gap-2" onClick={onAddContact}>
          <Plus size={16} />
          <span>Add Contact</span>
        </Button>
      </div>
    </div>
  );
};
