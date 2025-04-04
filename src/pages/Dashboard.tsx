
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { parseCSV, ContactData } from "@/utils/csv-parser";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [hasConnections, setHasConnections] = useState<boolean | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Check if user has connections
  useEffect(() => {
    const checkConnections = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('User_Connections')
          .select('*')
          .eq('user_id', user.id)
          .limit(1);

        if (error) throw error;
        setHasConnections(data && data.length > 0);
      } catch (error) {
        console.error("Error checking connections:", error);
        setHasConnections(false);
      }
    };

    checkConnections();
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
        "URL": connection.profileUrl || "",
        "user_id": user.id
      }));

      // Insert connections into the database
      const { error } = await supabase
        .from('User_Connections')
        .insert(connectionsToInsert);

      if (error) throw error;

      toast.success(`Successfully imported ${connectionsToInsert.length} connections`);
      setHasConnections(true);
    } catch (error) {
      console.error("Error uploading connections:", error);
      toast.error("Failed to import connections. Please check your CSV format.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl">Welcome to your Dashboard</CardTitle>
            <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <p className="text-muted-foreground">
              Hello, {user?.user_metadata?.name || user?.email?.split('@')[0]}! 
              Your account is ready to use.
            </p>
            
            <div className="p-4 bg-primary/5 rounded-md">
              <p className="font-medium">Your User ID: {user?.id}</p>
              <p className="text-sm text-muted-foreground mt-1">Email: {user?.email}</p>
            </div>
            
            {hasConnections === false && (
              <div className="border rounded-lg p-6 bg-white shadow-sm">
                <h3 className="text-lg font-medium mb-2">Import Your Connections</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Upload a CSV file with your connections to get started.
                </p>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-2 text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">CSV files only</p>
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
                  <p className="text-sm text-center mt-3 text-primary">
                    Uploading and processing your connections...
                  </p>
                )}
              </div>
            )}
            
            {hasConnections === true && (
              <div className="border-t pt-4 mt-4">
                <h3 className="font-medium mb-2">Your Connections</h3>
                <p className="text-sm text-muted-foreground">
                  You have successfully imported your connections.
                </p>
                <Button 
                  className="mt-4" 
                  variant="secondary"
                  onClick={() => window.location.href = "/connections"}
                >
                  View Connections
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
