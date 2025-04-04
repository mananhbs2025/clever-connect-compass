
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, Upload, Network, Bell, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { parseCSV } from "@/utils/csv-parser";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NetworkVisualizer } from "@/components/dashboard/NetworkVisualizer";
import { ReminderSection } from "@/components/dashboard/ReminderSection";
import { ChatbotSection } from "@/components/dashboard/ChatbotSection";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [hasConnections, setHasConnections] = useState<boolean | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [connections, setConnections] = useState<any[]>([]);

  // Check if user has connections and fetch them
  useEffect(() => {
    const checkAndFetchConnections = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('User_Connections')
          .select('*')
          .eq('user_id', user.id);

        if (error) throw error;
        
        setConnections(data || []);
        setHasConnections(data && data.length > 0);
      } catch (error) {
        console.error("Error checking connections:", error);
        setHasConnections(false);
      }
    };

    checkAndFetchConnections();
  }, [user]);

  const handleLogout = async () => {
    await logout();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    try {
      setIsUploading(true);
      toast.info("Processing your connections...");

      // Parse the CSV file
      const connections = await parseCSV(file);
      
      // Format connections for the database
      const connectionsToInsert = connections.map(connection => ({
        "First Name": connection.firstName || "",
        "Last Name": connection.lastName || "",
        "Email Address": connection.email || "",
        "Company": connection.company || "",
        "Position": connection.position || "",
        "Connected On": connection.connectedOn || new Date().toISOString().split('T')[0],
        "Location": connection.location || "",
        "URL": connection.profileUrl || "",
        "user_id": user.id
      }));

      // Insert connections into the database
      const { data, error } = await supabase
        .from('User_Connections')
        .insert(connectionsToInsert);

      if (error) {
        console.error("Upload error:", error);
        throw error;
      }
      
      toast.success(`Successfully imported ${connectionsToInsert.length} connections`);
      
      // Refresh connections after upload
      const { data: newConnections, error: fetchError } = await supabase
        .from('User_Connections')
        .select('*')
        .eq('user_id', user.id);
      
      if (fetchError) throw fetchError;
      
      setConnections(newConnections || []);
      setHasConnections(true);
    } catch (error) {
      console.error("Error uploading connections:", error);
      toast.error("Failed to import connections");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-purple-800">Nubble</h1>
            <p className="text-sm text-purple-600">Network Visualizer</p>
          </div>
          <Button variant="ghost" onClick={handleLogout} className="text-purple-700 hover:bg-purple-50">
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </header>

        <Tabs defaultValue="connections" className="mb-8">
          <TabsList className="w-full mb-6">
            <TabsTrigger value="connections">
              <Network className="h-4 w-4 mr-2" />
              Connections
            </TabsTrigger>
            <TabsTrigger value="visualizer">
              <Network className="h-4 w-4 mr-2" />
              Visualizer
            </TabsTrigger>
            <TabsTrigger value="reminders">
              <Bell className="h-4 w-4 mr-2" />
              Reminders
            </TabsTrigger>
            <TabsTrigger value="chatbot">
              <MessageSquare className="h-4 w-4 mr-2" />
              Chatbot
            </TabsTrigger>
          </TabsList>

          <TabsContent value="connections" className="mt-0">
            {hasConnections === false && (
              <Card className="border border-purple-100 rounded-lg bg-white shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-purple-800">Import Your Connections</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-purple-100 border-dashed rounded-lg cursor-pointer bg-purple-50 hover:bg-purple-100 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-2 text-purple-500" />
                        <p className="mb-1 text-sm text-purple-700">
                          <span className="font-medium">Click to upload</span>
                        </p>
                        <p className="text-xs text-purple-600">CSV files only</p>
                      </div>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept=".csv" 
                        onChange={handleFileUpload}
                        disabled={isUploading}
                      />
                    </label>
                  </div>
                  {isUploading && (
                    <p className="text-sm text-center mt-3 text-purple-600">
                      Processing...
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
            
            {hasConnections === true && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-purple-800">Your Connections</h3>
                  <label className="cursor-pointer">
                    <Button variant="outline" className="border-purple-200 text-purple-700 hover:bg-purple-50">
                      <Upload className="h-4 w-4 mr-2" />
                      Import More
                      <input 
                        type="file" 
                        className="hidden" 
                        accept=".csv" 
                        onChange={handleFileUpload}
                        disabled={isUploading}
                      />
                    </Button>
                  </label>
                </div>
                
                {connections.length > 0 ? (
                  <Card className="border-purple-100 shadow-sm overflow-hidden">
                    <div className="max-h-[60vh] overflow-y-auto">
                      <Table>
                        <TableHeader className="bg-purple-50 sticky top-0">
                          <TableRow>
                            <TableHead className="text-purple-800">Name</TableHead>
                            <TableHead className="text-purple-800">Company</TableHead>
                            <TableHead className="text-purple-800">Location</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {connections.map((connection, index) => (
                            <TableRow key={index} className="hover:bg-purple-50">
                              <TableCell className="font-medium text-purple-800">
                                {connection["First Name"]} {connection["Last Name"]}
                              </TableCell>
                              <TableCell className="text-purple-700">{connection.Company || "—"}</TableCell>
                              <TableCell className="text-purple-700">{connection.Location || "—"}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </Card>
                ) : (
                  <p className="text-purple-600 text-center py-8">Loading your connections...</p>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="visualizer" className="mt-0">
            <Card className="border-purple-100 shadow-sm">
              <CardContent className="p-6">
                <NetworkVisualizer connections={connections} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reminders" className="mt-0">
            <Card className="border-purple-100 shadow-sm">
              <CardContent className="p-6">
                <ReminderSection connections={connections} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chatbot" className="mt-0">
            <Card className="border-purple-100 shadow-sm">
              <CardContent className="p-6">
                <ChatbotSection connections={connections} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
