import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { parseCSV } from "@/utils/csv-parser";

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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Contacts</DialogTitle>
          <DialogDescription>
            Upload a CSV file to import your contacts
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <Input 
            type="file" 
            accept=".csv" 
            onChange={handleFileChange} 
            className="w-full"
          />
          
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => {
                // Placeholder for LinkedIn connection
                toast.info("LinkedIn connection coming soon");
              }}
            >
              Connect LinkedIn
            </Button>
            
            <Button 
              onClick={handleUpload} 
              disabled={!selectedFile}
            >
              Upload Contacts
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
