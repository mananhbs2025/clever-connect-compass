
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { parseCSV } from "@/utils/csv-parser";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, FileSpreadsheet, UserPlus } from "lucide-react";

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
      if (data && data > 0) {
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Import Contacts</DialogTitle>
          <DialogDescription>
            Import your connections or upload a CSV file to get started
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="border rounded-md p-6 bg-muted/10 shadow-sm">
            <div className="flex items-start mb-4">
              <UserPlus className="h-8 w-8 text-primary mr-4" />
              <div>
                <h3 className="text-base font-medium mb-1">Import LinkedIn Connections</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Quickly add your connections to your contact list
                </p>
              </div>
            </div>
            <Button 
              onClick={handleConnectionImport} 
              className="w-full"
              disabled={isConnecting}
              size="lg"
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
          
          <div className="border rounded-md p-6 bg-muted/10 shadow-sm">
            <div className="flex items-start mb-4">
              <FileSpreadsheet className="h-8 w-8 text-primary mr-4" />
              <div>
                <h3 className="text-base font-medium mb-1">Import from CSV file</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Upload a CSV file with your contacts information
                </p>
              </div>
            </div>
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
              size="lg"
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
