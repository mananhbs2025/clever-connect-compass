
import React from "react";
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
  MailPlus,
  PhoneCall,
  Plus,
  User,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Mock data for the CRM dashboard
  const recentContacts = [
    {
      id: 1,
      name: "Sarah Johnson",
      email: "sarah.j@example.com",
      status: "Active",
      lastContact: "2 days ago",
    },
    {
      id: 2,
      name: "Michael Chen",
      email: "michael.c@example.com",
      status: "New Lead",
      lastContact: "1 week ago",
    },
    {
      id: 3,
      name: "Emma Wilson",
      email: "emma.w@example.com",
      status: "Following Up",
      lastContact: "Yesterday",
    },
  ];

  const upcomingActivities = [
    {
      id: 1,
      type: "Call",
      contact: "David Miller",
      date: "Today, 3:30 PM",
    },
    {
      id: 2,
      type: "Email",
      contact: "Lisa Taylor",
      date: "Tomorrow, 10:00 AM",
    },
    {
      id: 3,
      type: "Meeting",
      contact: "Robert Brown",
      date: "Apr 7, 2:00 PM",
    },
  ];

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
          <Button className="flex items-center gap-2">
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
                    <h3 className="text-2xl font-bold">128</h3>
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
                    <h3 className="text-2xl font-bold">16</h3>
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
                      Recent Activity
                    </p>
                    <h3 className="text-2xl font-bold">24</h3>
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
                    {recentContacts.map((contact) => (
                      <TableRow key={contact.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                              <User className="h-4 w-4 text-gray-500" />
                            </div>
                            <div>
                              <div>{contact.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {contact.email}
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
                            {contact.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{contact.lastContact}</TableCell>
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
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Activities */}
          <div className="lg:col-span-1">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Upcoming Activities</CardTitle>
                <CardDescription>
                  Your scheduled activities for the week
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingActivities.map((activity) => (
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
                          {activity.type} with {activity.contact}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {activity.date}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
