
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  ChevronRight,
  Loader2,
  MailPlus,
  PhoneCall,
  Plus,
  User,
  Users,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { format, isToday, isTomorrow } from "date-fns";

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

  // Fetch contacts from Supabase
  const {
    data: contacts,
    isLoading: isContactsLoading,
    error: contactsError,
  } = useQuery({
    queryKey: ["contacts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contacts")
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
      const { data, error } = await supabase
        .from("activities")
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
      const [totalContactsResult, pendingFollowupsResult, recentActivitiesResult] = await Promise.all([
        supabase.from("contacts").select("id", { count: "exact", head: true }),
        supabase.from("contacts").select("id", { count: "exact", head: true }).eq("status", "Following Up"),
        supabase.from("activities").select("id", { count: "exact", head: true }),
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

  // Format date for display
  const formatActivityDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) {
      return `Today, ${format(date, "h:mm a")}`;
    } else if (isTomorrow(date)) {
      return `Tomorrow, ${format(date, "h:mm a")}`;
    } else {
      return format(date, "MMM d, h:mm a");
    }
  };

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome, {user?.user_metadata?.name || user?.email?.split("@")[0]}
            </h1>
            <p className="text-sm text-gray-500">
              Your personal CRM dashboard
            </p>
          </div>
          <Button className="flex items-center gap-2" onClick={handleAddContact}>
            <Plus size={16} />
            <span>Add Contact</span>
          </Button>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Stats Cards */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Total Contacts
                    </p>
                    {isStatsLoading ? (
                      <div className="flex items-center mt-1">
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        <span>Loading...</span>
                      </div>
                    ) : (
                      <h3 className="text-2xl font-bold">{stats?.totalContacts || 0}</h3>
                    )}
                  </div>
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Pending Follow-ups
                    </p>
                    {isStatsLoading ? (
                      <div className="flex items-center mt-1">
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        <span>Loading...</span>
                      </div>
                    ) : (
                      <h3 className="text-2xl font-bold">{stats?.pendingFollowups || 0}</h3>
                    )}
                  </div>
                  <div className="p-2 bg-yellow-100 rounded-full">
                    <PhoneCall className="h-5 w-5 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Activities
                    </p>
                    {isStatsLoading ? (
                      <div className="flex items-center mt-1">
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        <span>Loading...</span>
                      </div>
                    ) : (
                      <h3 className="text-2xl font-bold">{stats?.recentActivities || 0}</h3>
                    )}
                  </div>
                  <div className="p-2 bg-blue-100 rounded-full">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

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
                {isContactsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : contacts && contacts.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
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
                              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                                <User className="h-4 w-4 text-gray-500" />
                              </div>
                              <div>
                                <div>{contact.name}</div>
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
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No contacts found</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={handleAddContact}
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add your first contact
                    </Button>
                  </div>
                )}
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
                {isActivitiesLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : activities && activities.length > 0 ? (
                  <div className="space-y-4">
                    {activities.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-start p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                      >
                        <div
                          className={`p-2 rounded-full mr-3 ${
                            activity.type === "Call"
                              ? "bg-green-100"
                              : activity.type === "Email"
                              ? "bg-blue-100"
                              : "bg-purple-100"
                          }`}
                        >
                          {activity.type === "Call" ? (
                            <PhoneCall
                              className="h-4 w-4 text-green-600"
                              strokeWidth={2}
                            />
                          ) : activity.type === "Email" ? (
                            <MailPlus
                              className="h-4 w-4 text-blue-600"
                              strokeWidth={2}
                            />
                          ) : (
                            <Users
                              className="h-4 w-4 text-purple-600"
                              strokeWidth={2}
                            />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {activity.type} with {activity.contact_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatActivityDate(activity.scheduled_date)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No activities scheduled</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                    >
                      <Plus className="h-4 w-4 mr-1" /> Schedule an activity
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
