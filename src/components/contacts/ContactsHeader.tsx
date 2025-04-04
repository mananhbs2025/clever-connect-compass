
import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ContactsHeaderProps {
  totalContacts: number;
  onOpenImportModal: () => void;
}

export const ContactsHeader: React.FC<ContactsHeaderProps> = ({
  totalContacts,
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
            <h1 className="text-2xl font-bold text-gray-900">All Contacts</h1>
            <p className="text-sm text-gray-500">
              {totalContacts} contacts in your network
            </p>
          </div>
        </div>
        <Button onClick={onOpenImportModal}>
          <Plus className="h-4 w-4 mr-2" /> Import Contacts
        </Button>
      </div>
    </div>
  );
};
