
import React from "react";
import { Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyContactsStateProps {
  onOpenImportModal: () => void;
}

export const EmptyContactsState: React.FC<EmptyContactsStateProps> = ({ 
  onOpenImportModal 
}) => {
  return (
    <div className="text-center py-12 px-4 bg-muted/20 rounded-lg border border-dashed border-muted-foreground/30">
      <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium mb-2">No LinkedIn connections found</h3>
      <p className="text-muted-foreground mb-4">
        Click the button below to load your LinkedIn connections
      </p>
      <Button 
        size="default" 
        onClick={onOpenImportModal}
        className="mx-auto"
      >
        <Plus className="h-4 w-4 mr-2" /> Load LinkedIn Connections
      </Button>
    </div>
  );
};
