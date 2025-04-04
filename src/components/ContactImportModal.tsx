
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { parseCSV } from "@/utils/csv-parser";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface ContactImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess?: () => void; // Add callback for successful import
}

export const ContactImportModal: React.FC<ContactImportModalProps> = ({ 
  isOpen, 
  onClose,
  onImportSuccess 
}) => {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setSelectedFile(file || null);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a CSV file");
      return;
    }

    try {
      setIsImporting(true);
      // Parse CSV
      const contacts = await parseCSV(selectedFile);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      const userId = user.id;
      const fileName = `${userId}/contacts_${Date.now()}.csv`;
      const { error: uploadError } = await supabase.storage
        .from('contact_uploads')
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      // Bulk insert contacts
      const contactsToInsert = contacts.map(contact => ({
        name: contact.name || '',
        email: contact.email || null,
        user_id: userId,
        status: 'New Lead',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      const { error: insertError } = await supabase
        .from('contacts')
        .insert(contactsToInsert);

      if (insertError) throw insertError;

      toast.success(`Imported ${contactsToInsert.length} contacts`);
      
      // Call the success callback to trigger data refetch
      if (onImportSuccess) {
        onImportSuccess();
      }
      
      onClose();
    } catch (error) {
      console.error('Contact import error:', error);
      toast.error("Failed to import contacts. Please check your CSV file.");
    } finally {
      setIsImporting(false);
    }
  };

  const handleConnectionImport = async () => {
    if (!user) {
      toast.error("You must be logged in to import connections");
      return;
    }

    try {
      setIsConnecting(true);
      
      // Call the SQL function to import connections
      const { data, error } = await supabase.rpc(
        'import_user_connections_to_contacts',
        { user_id_param: user.id }
      );

      if (error) throw error;

      // Check how many contacts were imported
      if (data > 0) {
        toast.success(`Successfully imported ${data} connections`);
        
        // Refresh contacts list
        if (onImportSuccess) {
          onImportSuccess();
        }
        
        onClose();
      } else {
        toast.info("No new connections to import");
      }
    } catch (error) {
      console.error('Connection import error:', error);
      toast.error("Failed to import connections");
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Contacts</DialogTitle>
          <DialogDescription>
            Upload a CSV file or import your connections directly
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="border rounded-md p-4 bg-muted/30">
            <h3 className="text-sm font-medium mb-2">Import from LinkedIn Connections</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Import your connections that were previously uploaded
            </p>
            <Button 
              onClick={handleConnectionImport} 
              className="w-full"
              disabled={isConnecting}
            >
              {isConnecting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                "Import Connections"
              )}
            </Button>
          </div>
          
          <div className="border rounded-md p-4 bg-muted/30">
            <h3 className="text-sm font-medium mb-2">Import from CSV file</h3>
            <Input 
              type="file" 
              accept=".csv" 
              onChange={handleFileChange} 
              className="w-full mb-4"
            />
            <Button 
              onClick={handleUpload} 
              className="w-full"
              disabled={!selectedFile || isImporting}
            >
              {isImporting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Upload CSV"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
