
import React from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, MailPlus, PhoneCall, Plus, User } from "lucide-react";
import { format } from "date-fns";

interface Contact {
  id: string;
  name: string;
  email: string | null;
  status: string | null;
  last_contact: string | null;
}

interface ContactsTableProps {
  contacts: Contact[] | undefined;
  isLoading: boolean;
  onAddContact: () => void;
  formatLastContact: (dateString: string | null) => string;
}

export const ContactsTable: React.FC<ContactsTableProps> = ({ 
  contacts, 
  isLoading, 
  onAddContact,
  formatLastContact
}) => {
  return (
    <>
      {isLoading ? (
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
            onClick={onAddContact}
          >
            <Plus className="h-4 w-4 mr-1" /> Add your first contact
          </Button>
        </div>
      )}
    </>
  );
};
