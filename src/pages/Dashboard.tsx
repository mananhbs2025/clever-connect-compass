
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ContactImportModal } from "@/components/ContactImportModal";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { supabase, from } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Import our new components
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatsSection } from "@/components/dashboard/StatsSection";
import { ContactsTable } from "@/components/dashboard/ContactsTable";
import { ActivitiesList } from "@/components/dashboard/ActivitiesList";

// Types for our data
interface Contact {
  id: string;
  name: string;
  email: string | null;
  status: string | null;
  last_contact: string | null;
}

interface Activity {
  id: string;
  type: string;
  contact_name: string;
  scheduled_date: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [showImportModal, setShowImportModal] = useState(false);

  // Fetch contacts from Supabase
  const {
    data: contacts,
    isLoading: isContactsLoading,
    error: contactsError,
    refetch: refetchContacts,
  } = useQuery({
    queryKey: ["contacts"],
    queryFn: async () => {
      const { data, error } = await from.contacts()
        .select("*")
        .order("created_at", { ascending: false })
        .limit(3);

      if (error) {
        throw error;
      }
      return data as Contact[];
    },
  });

  // Fetch activities from Supabase
  const {
    data: activities,
    isLoading: isActivitiesLoading,
    error: activitiesError,
  } = useQuery({
    queryKey: ["activities"],
    queryFn: async () => {
      const { data, error } = await from.activities()
        .select("*")
        .order("scheduled_date", { ascending: true })
        .limit(3);

      if (error) {
        throw error;
      }
      return data as Activity[];
    },
  });

  // Fetch counts for statistics
  const {
    data: stats,
    isLoading: isStatsLoading,
    error: statsError,
  } = useQuery({
    queryKey: ["contactStats"],
    queryFn: async () => {
      const totalContactsQuery = from.contacts().select("id", { count: "exact", head: true });
      const pendingFollowupsQuery = from.contacts().select("id", { count: "exact", head: true }).eq("status", "Following Up");
      const recentActivitiesQuery = from.activities().select("id", { count: "exact", head: true });

      const [totalContactsResult, pendingFollowupsResult, recentActivitiesResult] = await Promise.all([
        totalContactsQuery,
        pendingFollowupsQuery,
        recentActivitiesQuery
      ]);

      if (totalContactsResult.error || pendingFollowupsResult.error || recentActivitiesResult.error) {
        throw new Error("Failed to fetch statistics");
      }

      return {
        totalContacts: totalContactsResult.count || 0,
        pendingFollowups: pendingFollowupsResult.count || 0,
        recentActivities: recentActivitiesResult.count || 0,
      };
    },
  });

  // Handle errors
  useEffect(() => {
    if (contactsError) {
      toast.error("Failed to load contacts");
      console.error(contactsError);
    }
    if (activitiesError) {
      toast.error("Failed to load activities");
      console.error(activitiesError);
    }
    if (statsError) {
      toast.error("Failed to load statistics");
      console.error(statsError);
    }
  }, [contactsError, activitiesError, statsError]);

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

  // Handler for adding a new contact
  const handleAddContact = () => {
    // To be implemented - show modal or navigate to add contact form
    toast.info("Add contact functionality coming soon");
  };

  // Check if user has no contacts and show import modal
  useEffect(() => {
    if (contacts && contacts.length === 0) {
      setShowImportModal(true);
    }
  }, [contacts]);

  // Handler for successful import
  const handleImportSuccess = () => {
    refetchContacts();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <DashboardHeader 
        userName={user?.user_metadata?.name} 
        userEmail={user?.email} 
        onAddContact={handleAddContact} 
      />

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Stats Cards */}
          <StatsSection 
            totalContacts={stats?.totalContacts}
            pendingFollowups={stats?.pendingFollowups}
            recentActivities={stats?.recentActivities}
            isLoading={isStatsLoading}
          />

          {/* Recent Contacts */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Contacts</CardTitle>
                  <Button
                    variant="ghost"
                    className="text-sm text-primary flex items-center"
                  >
                    View All <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
                <CardDescription>
                  Your most recently updated contacts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ContactsTable 
                  contacts={contacts}
                  isLoading={isContactsLoading}
                  onAddContact={handleAddContact}
                  formatLastContact={formatLastContact}
                />
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Activities */}
          <div className="lg:col-span-1">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Upcoming Activities</CardTitle>
                <CardDescription>
                  Your scheduled activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ActivitiesList 
                  activities={activities}
                  isLoading={isActivitiesLoading}
                />
              </CardContent>
            </Card>
          </div>
        </div>
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

export default Dashboard;
