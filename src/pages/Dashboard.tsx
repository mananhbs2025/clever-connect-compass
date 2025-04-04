
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, Upload, Network, Bell, MessageSquare, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { parseCSV } from "@/utils/csv-parser";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { NetworkVisualizer } from "@/components/dashboard/NetworkVisualizer";
import { ReminderSection } from "@/components/dashboard/ReminderSection";
import { FloatingChatbot } from "@/components/dashboard/FloatingChatbot";
import { ConnectionsList } from "@/components/connections/ConnectionsList";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [hasConnections, setHasConnections] = useState<boolean | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [connections, setConnections] = useState<any[]>([]);
  const [showChatbot, setShowChatbot] = useState(false);

  // Check if user has connections and fetch them
  useEffect(() => {
    const checkAndFetchConnections = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('User_Connections')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);

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
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
      
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

        <div className="space-y-8">
          {/* Recent Connections Section */}
          <section>
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-purple-800">Recent Connections</h2>
              <p className="text-sm text-purple-600">Your 10 most recent connections</p>
            </div>

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
                
                <Card className="border-purple-100 shadow-sm overflow-hidden">
                  <ConnectionsList connections={connections} />
                </Card>
              </div>
            )}
          </section>

          {/* Network Visualization Section */}
          <section>
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-purple-800">Network Visualization</h2>
              <p className="text-sm text-purple-600">Visual representation of your connections</p>
            </div>
            <Card className="border-purple-100 shadow-sm">
              <CardContent className="p-6">
                <NetworkVisualizer connections={connections} />
              </CardContent>
            </Card>
          </section>

          {/* Reminders Section */}
          <section>
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-purple-800">Reminders</h2>
              <p className="text-sm text-purple-600">Stay in touch with your network</p>
            </div>
            <Card className="border-purple-100 shadow-sm">
              <CardContent className="p-6">
                <ReminderSection connections={connections} />
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
      
      {/* Floating Chatbot Button */}
      {!showChatbot && (
        <Button 
          onClick={() => setShowChatbot(true)}
          className="fixed bottom-4 right-4 h-12 w-12 rounded-full bg-purple-600 hover:bg-purple-700 text-white shadow-lg p-0 flex items-center justify-center"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      )}
      
      {/* Floating Chatbot */}
      {showChatbot && (
        <FloatingChatbot 
          connections={connections} 
          onClose={() => setShowChatbot(false)} 
        />
      )}
    </div>
  );
};

export default Dashboard;
