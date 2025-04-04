
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut } from "lucide-react";

const Dashboard = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
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
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Hello, {user?.user_metadata?.name || user?.email?.split('@')[0]}! 
              Your account is ready to use.
            </p>
            
            <div className="p-4 bg-primary/5 rounded-md">
              <p className="font-medium">Your User ID: {user?.id}</p>
              <p className="text-sm text-muted-foreground mt-1">Email: {user?.email}</p>
            </div>
            
            <div className="border-t pt-4 mt-4">
              <h3 className="font-medium mb-2">What's Next?</h3>
              <p className="text-sm text-muted-foreground">
                This is your new dashboard. You can start building your application from here.
                All previous functionality has been removed as requested.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
