
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { parseCSV, ContactData } from "@/utils/csv-parser";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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
    <div className="min-h-screen bg-gray-50 p-4">
      <Card className="max-w-6xl mx-auto">
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
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Your Connections</h3>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline"
                      onClick={() => window.location.href = "/connections"}
                    >
                      View All Connections
                    </Button>
                    
                    <label className="cursor-pointer">
                      <Button variant="secondary">
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
                  <div className="border rounded-lg overflow-hidden">
                    <div className="max-h-96 overflow-y-auto">
                      <Table>
                        <TableHeader className="bg-muted/50 sticky top-0">
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Company</TableHead>
                            <TableHead>Position</TableHead>
                            <TableHead>Location</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {connections.slice(0, 5).map((connection, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">
                                {connection["First Name"]} {connection["Last Name"]}
                              </TableCell>
                              <TableCell>{connection["Email Address"]}</TableCell>
                              <TableCell>{connection.Company}</TableCell>
                              <TableCell>{connection.Position}</TableCell>
                              <TableCell>{connection.Location || "Unknown"}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    
                    {connections.length > 5 && (
                      <div className="p-4 bg-gray-50 text-center border-t">
                        <p className="text-sm text-muted-foreground">
                          Showing 5 of {connections.length} connections
                        </p>
                        <Button 
                          variant="link" 
                          onClick={() => window.location.href = "/connections"}
                          className="mt-1"
                        >
                          View all connections
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">Loading your connections...</p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
