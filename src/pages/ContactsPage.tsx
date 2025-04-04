
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

interface Contact {
  id: string;
  name: string;
  email: string | null;
  status: string | null;
  last_contact: string | null;
}

const ContactsPage = () => {
  const { user } = useAuth();
  const [showImportModal, setShowImportModal] = useState(false);
  const [totalContacts, setTotalContacts] = useState<number>(0);

  // Fetch all contacts from Supabase with a properly defined queryKey
  const {
    data: contacts,
    isLoading,
    error,
    refetch: refetchContacts
  } = useQuery({
    queryKey: ["allContacts"],
    queryFn: async () => {
      const { data, error } = await from.contacts()
        .select("*")
        .order("name", { ascending: true });

      if (error) {
        throw error;
      }
      return data as Contact[];
    },
  });

  // Get total count of contacts
  useEffect(() => {
    if (contacts) {
      setTotalContacts(contacts.length);
    }
  }, [contacts]);

  // Auto-show import modal if no contacts
  useEffect(() => {
    if (contacts && contacts.length === 0) {
      setShowImportModal(true);
    }
  }, [contacts]);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error("Failed to load contacts");
      console.error(error);
    }
  }, [error]);

  // Handle successful import to refresh the contacts list
  const handleImportSuccess = () => {
    refetchContacts();
    toast.success("Contacts imported successfully");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <ContactsHeader 
        totalContacts={totalContacts} 
        onOpenImportModal={() => setShowImportModal(true)} 
      />

      {/* Contact List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Contact Directory</CardTitle>
            <CardDescription>View and manage all your contacts</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : contacts && contacts.length > 0 ? (
              <ContactsList contacts={contacts} />
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
