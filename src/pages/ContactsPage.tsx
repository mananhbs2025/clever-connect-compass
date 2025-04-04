
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ContactsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Contacts</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This page has been deprecated.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContactsPage;
