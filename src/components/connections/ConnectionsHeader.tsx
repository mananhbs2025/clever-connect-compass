
import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ConnectionsHeaderProps {
  totalConnections: number;
  onOpenImportModal: () => void;
}

export const ConnectionsHeader: React.FC<ConnectionsHeaderProps> = ({
  totalConnections,
  onOpenImportModal,
}) => {
  return (
    <div className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link to="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">LinkedIn Connections</h1>
            <p className="text-sm text-gray-500">
              {totalConnections > 0
                ? `${totalConnections} connections loaded`
                : "No connections loaded - Please check database connection"}
            </p>
          </div>
        </div>
        {totalConnections === 0 && (
          <Button onClick={onOpenImportModal}>
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh Connections
          </Button>
        )}
      </div>
    </div>
  );
};
