import React from "react";
import { format } from "date-fns";
import { PhoneCall, MailPlus } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Connection {
  "First Name": string;
  "Last Name": string;
  "Email Address": string;
  "Connected On": string;
  Company: string;
  Position: string;
  Location: string;
  URL: string;
  user_id?: string;
}

interface ConnectionsListProps {
  connections: Connection[];
}

export const ConnectionsList: React.FC<ConnectionsListProps> = ({ connections }) => {
  // Format connection date
  const formatConnectionDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    
    // Try to create a valid date from the connection date string
    const date = new Date(dateString);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      // For LinkedIn dates that might come in a different format
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      
      // Check if the string matches a format like "Mar 15, 2023"
      const parts = dateString.split(" ");
      if (parts.length >= 2) {
        return dateString; // Return the original string if it's already formatted
      }
      
      return dateString;
    }
    
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return format(date, "MMM d, yyyy");
  };

  // Get initials for avatar
  const getInitials = (firstName: string, lastName: string) => {
    return (firstName?.[0] || "") + (lastName?.[0] || "");
  };

  return (
    <ScrollArea className="h-[60vh]">
      <Table>
        <TableHeader className="sticky top-0 bg-white">
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Position</TableHead>
            <TableHead>Location</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {connections.map((connection, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">
                <div className="flex items-center">
                  <Avatar className="mr-3 h-9 w-9">
                    <AvatarFallback>
                      {getInitials(connection["First Name"], connection["Last Name"])}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">
                      {connection["First Name"]} {connection["Last Name"]}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {connection["Email Address"] || "No email"}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>{connection.Company || "—"}</TableCell>
              <TableCell>{connection.Position || "—"}</TableCell>
              <TableCell>{connection.Location || "Unknown"}</TableCell>
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
    </ScrollArea>
  );
};
