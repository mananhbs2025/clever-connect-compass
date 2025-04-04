
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
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
  user_id?: string;
}

const ContactsPage = () => {
  const { user } = useAuth();
  const [showImportModal, setShowImportModal] = useState(false);
  const [totalConnections, setTotalConnections] = useState<number>(0);
  const [isAssigningConnections, setIsAssigningConnections] = useState(false);

  // Assign connections to the current user
  const assignConnectionsToUser = async () => {
    if (!user) return;
    
    try {
      setIsAssigningConnections(true);
      
      console.log("Assigning connections to user", user.id);
      const { error, count } = await supabase
        .from("User_Connections")
        .update({ user_id: user.id })
        .is("user_id", null)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.error("Error assigning connections:", error);
        toast.error("Failed to assign connections to your account");
        return;
      }
      
      console.log(`Assigned ${count} connections to user ${user.id}`);
      if (count > 0) {
        toast.success(`Associated ${count} connections with your account`);
        refetchConnections();
      }
    } catch (error) {
      console.error("Error in assignConnectionsToUser:", error);
    } finally {
      setIsAssigningConnections(false);
    }
  };

  // Fetch User_Connections table data - using * to fetch all columns
  const {
    data: connections,
    isLoading: isLoadingConnections,
    error: connectionsError,
    refetch: refetchConnections
  } = useQuery({
    queryKey: ["userConnections", user?.id],
    queryFn: async () => {
      console.log("Fetching user connections for user", user?.id);
      
      // This query should return all data from User_Connections for the current user
      const { data, error, count } = await supabase
        .from("User_Connections")
        .select('*', { count: 'exact' })
        .eq("user_id", user?.id);

      if (error) {
        console.error("Error fetching connections:", error);
        throw error;
      }
      
      console.log("Connections query response:", { data, count, userId: user?.id });
      return data as Connection[];
    },
    enabled: !!user, // Only run query when user is authenticated
  });

  // Check for unassigned connections when user logs in
  useEffect(() => {
    if (user && (connections === undefined || connections?.length === 0)) {
      assignConnectionsToUser();
    }
  }, [user, connections]);

  // Get total count of connections
  useEffect(() => {
    if (connections) {
      console.log("Setting total connections:", connections.length);
      setTotalConnections(connections.length);
    }
  }, [connections]);

  // Handle errors
  useEffect(() => {
    if (connectionsError) {
      toast.error("Failed to load connections");
      console.error("Connections error:", connectionsError);
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
            <CardTitle>LinkedIn Connections</CardTitle>
            <CardDescription>View and manage all your LinkedIn connections</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingConnections || isAssigningConnections ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : connections && connections.length > 0 ? (
              <ContactsList connections={connections} />
            ) : (
              <EmptyContactsState onOpenImportModal={() => {
                assignConnectionsToUser();
                setShowImportModal(true);
              }} />
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
