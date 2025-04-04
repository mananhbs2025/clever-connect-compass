
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase, from } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Loader2, ArrowLeft, User, PhoneCall, MailPlus, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { ContactImportModal } from "@/components/ContactImportModal";

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

  // Handle errors
  React.useEffect(() => {
    if (error) {
      toast.error("Failed to load contacts");
      console.error(error);
    }
  }, [error]);

  // Format last contact date
  const formatLastContact = (dateString: string | null) => {
    if (!dateString) return "Never";
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return format(date, "MMM d, yyyy");
  };

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Handle successful import to refresh the contacts list
  const handleImportSuccess = () => {
    refetchContacts();
    toast.success("Contacts imported successfully");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
                {contacts?.length || 0} contacts in your network
              </p>
            </div>
          </div>
          <Button onClick={() => setShowImportModal(true)}>
            <Plus className="h-4 w-4 mr-2" /> Import Contacts
          </Button>
        </div>
      </div>

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
              <ScrollArea className="h-[60vh]">
                <Table>
                  <TableHeader className="sticky top-0 bg-white">
                    <TableRow>
                      <TableHead>Contact</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Contact</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contacts.map((contact) => (
                      <TableRow key={contact.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <Avatar className="mr-3 h-9 w-9">
                              <AvatarFallback>
                                {getInitials(contact.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{contact.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {contact.email || "No email"}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              contact.status === "Active"
                                ? "default"
                                : contact.status === "New Lead"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {contact.status || "New Lead"}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatLastContact(contact.last_contact)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0"
                            >
                              <PhoneCall className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0"
                            >
                              <MailPlus className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No contacts found</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => setShowImportModal(true)}
                >
                  <Plus className="h-4 w-4 mr-1" /> Import your first contacts
                </Button>
              </div>
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
