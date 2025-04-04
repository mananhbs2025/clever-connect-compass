
import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyContactsStateProps {
  onOpenImportModal: () => void;
}

export const EmptyContactsState: React.FC<EmptyContactsStateProps> = ({ 
  onOpenImportModal 
}) => {
  return (
    <div className="text-center py-8 text-muted-foreground">
      <p>No contacts found</p>
      <Button 
        variant="outline" 
        size="sm" 
        className="mt-2"
        onClick={onOpenImportModal}
      >
        <Plus className="h-4 w-4 mr-1" /> Import your first contacts
      </Button>
    </div>
  );
};
