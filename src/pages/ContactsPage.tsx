
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase, from } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ContactImportModal } from "@/components/ContactImportModal";
import { ContactsHeader } from "@/components/contacts/ContactsHeader";
import { ContactsList } from "@/components/contacts/ContactsList";
import { EmptyContactsState } from "@/components/contacts/EmptyContactsState";

interface Connection {
  "First Name": string;
  "Last Name": string;
  "Email Address": string;
  "Connected On": string;
  Company: string;
  Position: string;
  URL: string;
}

const ContactsPage = () => {
  const { user } = useAuth();
  const [showImportModal, setShowImportModal] = useState(false);
  const [totalConnections, setTotalConnections] = useState<number>(0);

  // Fetch directly from User_Connections table
  const {
    data: connections,
    isLoading: isLoadingConnections,
    error: connectionsError,
    refetch: refetchConnections
  } = useQuery({
    queryKey: ["userConnections"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("User_Connections")
        .select("*")
        .order("First Name", { ascending: true });

      if (error) {
        throw error;
      }
      return data as Connection[];
    },
  });

  // Get total count of connections
  useEffect(() => {
    if (connections) {
      setTotalConnections(connections.length);
    }
  }, [connections]);

  // Handle errors
  useEffect(() => {
    if (connectionsError) {
      toast.error("Failed to load connections");
      console.error(connectionsError);
    }
  }, [connectionsError]);

  // Handle successful import to refresh the connections list
  const handleImportSuccess = () => {
    refetchConnections();
    toast.success("Connections refreshed successfully");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <ContactsHeader 
        totalContacts={totalConnections} 
        onOpenImportModal={() => setShowImportModal(true)} 
      />

      {/* Contact List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Contact Directory</CardTitle>
            <CardDescription>View and manage all your LinkedIn connections</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingConnections ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : connections && connections.length > 0 ? (
              <ContactsList connections={connections} />
            ) : (
              <EmptyContactsState onOpenImportModal={() => setShowImportModal(true)} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Import Contacts Modal */}
      <ContactImportModal 
        isOpen={showImportModal} 
        onClose={() => setShowImportModal(false)}
        onImportSuccess={handleImportSuccess}
      />
    </div>
  );
};

export default ContactsPage;
