
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ConnectionsList } from "@/components/connections/ConnectionsList";

interface Connection {
  "First Name": string;
  "Last Name": string;
  "Email Address": string;
  Company: string;
  Position: string;
  "Connected On": string;
  Location: string;
  URL: string;
}

const ConnectionsPage = () => {
  const { user } = useAuth();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchConnections = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('User_Connections')
          .select('*')
          .eq('user_id', user.id);

        if (error) throw error;
        console.log("Fetched connections:", data);
        
        // Ensure all connections have the Location property
        const connectionsWithLocation = data?.map(conn => ({
          ...conn,
          // If Location is undefined or null, provide an empty string
          Location: conn.Location || ""
        })) || [];
        
        setConnections(connectionsWithLocation);
      } catch (error) {
        console.error("Error fetching connections:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConnections();
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <Card className="max-w-6xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => window.location.href = "/dashboard"}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <CardTitle>Your Connections</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading your connections...</p>
          ) : connections.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-lg font-medium">No connections found</p>
              <p className="text-sm text-muted-foreground mt-1">
                Return to the dashboard to import your connections
              </p>
              <Button
                className="mt-4"
                onClick={() => window.location.href = "/dashboard"}
              >
                Back to Dashboard
              </Button>
            </div>
          ) : (
            <ConnectionsList connections={connections} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ConnectionsPage;
