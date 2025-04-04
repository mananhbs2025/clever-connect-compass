
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
      console.log("Parsed connections:", connections);

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

      console.log("Upload success:", data);
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
      toast.error("Failed to import connections. Error: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 p-4">
      <div className="max-w-6xl mx-auto">
        <header className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-purple-800">Nubble</h1>
            <p className="text-purple-600 text-sm">Network Visualizer</p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2 border-purple-300 text-purple-700 hover:bg-purple-100">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </header>

        <Card className="border-purple-200 shadow-md mb-6">
          <CardHeader className="border-b border-purple-100 bg-purple-50">
            <CardTitle className="text-xl text-purple-800">Welcome to your Dashboard</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <p className="text-purple-700 mb-4">
              Hello, {user?.user_metadata?.name || user?.email?.split('@')[0]}! 
              Your network is ready to explore.
            </p>
            
            <div className="p-4 bg-purple-100 rounded-md text-purple-800">
              <p className="font-medium">Your User ID: {user?.id}</p>
              <p className="text-sm text-purple-600 mt-1">Email: {user?.email}</p>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="connections" className="mb-6">
          <TabsList className="w-full bg-purple-100 border border-purple-200 p-1 mb-4">
            <TabsTrigger value="connections" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              <Network className="h-4 w-4 mr-2" />
              Connections
            </TabsTrigger>
            <TabsTrigger value="visualizer" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              <Network className="h-4 w-4 mr-2" />
              Network Visualizer
            </TabsTrigger>
            <TabsTrigger value="reminders" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              <Bell className="h-4 w-4 mr-2" />
              Reminders
            </TabsTrigger>
            <TabsTrigger value="chatbot" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              <MessageSquare className="h-4 w-4 mr-2" />
              Chatbot
            </TabsTrigger>
          </TabsList>

          <TabsContent value="connections" className="mt-0">
            {hasConnections === false && (
              <div className="border border-purple-200 rounded-lg p-6 bg-white shadow-sm">
                <h3 className="text-lg font-medium mb-2 text-purple-800">Import Your Connections</h3>
                <p className="text-sm text-purple-600 mb-4">
                  Upload a CSV file with your connections to get started.
                </p>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-purple-200 border-dashed rounded-lg cursor-pointer bg-purple-50 hover:bg-purple-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-2 text-purple-500" />
                      <p className="mb-2 text-sm text-purple-700">
                        <span className="font-semibold">Click to upload</span> or drag and drop
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
                    Uploading and processing your connections...
                  </p>
                )}
              </div>
            )}
            
            {hasConnections === true && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-purple-800">Your Connections</h3>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline"
                      onClick={() => window.location.href = "/connections"}
                      className="border-purple-300 text-purple-700 hover:bg-purple-100"
                    >
                      View All Connections
                    </Button>
                    
                    <label className="cursor-pointer">
                      <Button variant="secondary" className="bg-purple-200 text-purple-800 hover:bg-purple-300">
                        <Upload className="h-4 w-4 mr-2" />
                        Import More
                      </Button>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept=".csv" 
                        onChange={handleFileUpload}
                        disabled={isUploading}
                      />
                    </label>
                  </div>
                </div>
                
                {connections.length > 0 ? (
                  <Card className="border-purple-200 shadow-sm overflow-hidden">
                    <div className="max-h-96 overflow-y-auto">
                      <Table>
                        <TableHeader className="bg-purple-100 sticky top-0">
                          <TableRow>
                            <TableHead className="text-purple-800">Name</TableHead>
                            <TableHead className="text-purple-800">Email</TableHead>
                            <TableHead className="text-purple-800">Company</TableHead>
                            <TableHead className="text-purple-800">Position</TableHead>
                            <TableHead className="text-purple-800">Location</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {connections.slice(0, 5).map((connection, index) => (
                            <TableRow key={index} className="hover:bg-purple-50">
                              <TableCell className="font-medium text-purple-800">
                                {connection["First Name"]} {connection["Last Name"]}
                              </TableCell>
                              <TableCell className="text-purple-700">{connection["Email Address"]}</TableCell>
                              <TableCell className="text-purple-700">{connection.Company}</TableCell>
                              <TableCell className="text-purple-700">{connection.Position}</TableCell>
                              <TableCell className="text-purple-700">{connection.Location || "Unknown"}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    
                    {connections.length > 5 && (
                      <div className="p-4 bg-purple-50 text-center border-t border-purple-100">
                        <p className="text-sm text-purple-600">
                          Showing 5 of {connections.length} connections
                        </p>
                        <Button 
                          variant="link" 
                          onClick={() => window.location.href = "/connections"}
                          className="mt-1 text-purple-700"
                        >
                          View all connections
                        </Button>
                      </div>
                    )}
                  </Card>
                ) : (
                  <p className="text-purple-600 text-center py-8">Loading your connections...</p>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="visualizer" className="mt-0">
            <Card className="border-purple-200 shadow-md">
              <CardHeader className="border-b border-purple-100 bg-purple-50">
                <CardTitle className="text-xl text-purple-800">Network Visualizer</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <NetworkVisualizer connections={connections} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reminders" className="mt-0">
            <Card className="border-purple-200 shadow-md">
              <CardHeader className="border-b border-purple-100 bg-purple-50">
                <CardTitle className="text-xl text-purple-800">Reminders</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <ReminderSection connections={connections} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chatbot" className="mt-0">
            <Card className="border-purple-200 shadow-md">
              <CardHeader className="border-b border-purple-100 bg-purple-50">
                <CardTitle className="text-xl text-purple-800">Network Assistant</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
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
