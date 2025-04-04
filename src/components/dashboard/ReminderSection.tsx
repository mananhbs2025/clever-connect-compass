
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle, Calendar, Trash2, Clock } from "lucide-react";

interface ReminderSectionProps {
  connections: any[];
}

export const ReminderSection: React.FC<ReminderSectionProps> = ({ connections }) => {
  const [reminders, setReminders] = useState([
    {
      id: 1,
      connection: "Sarah Johnson",
      task: "Follow up on project proposal",
      date: "2025-04-10",
    },
    {
      id: 2,
      connection: "Michael Chen",
      task: "Schedule coffee meeting",
      date: "2025-04-15",
    },
  ]);
  
  const [newReminder, setNewReminder] = useState({
    connection: "",
    task: "",
    date: new Date().toISOString().split('T')[0],
  });

  const handleAddReminder = () => {
    if (newReminder.connection && newReminder.task) {
      setReminders([
        ...reminders,
        {
          id: Date.now(),
          connection: newReminder.connection,
          task: newReminder.task,
          date: newReminder.date,
        },
      ]);
      
      setNewReminder({
        connection: "",
        task: "",
        date: new Date().toISOString().split('T')[0],
      });
    }
  };

  const handleRemoveReminder = (id: number) => {
    setReminders(reminders.filter(reminder => reminder.id !== id));
  };

  const connectionNames = connections.map(
    conn => `${conn["First Name"]} ${conn["Last Name"]}`
  );

  return (
    <div className="space-y-4">
      <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 mb-4">
        <h3 className="text-purple-800 font-medium mb-3">Add New Reminder</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="text-sm text-purple-700 mb-1 block">Connection</label>
            <Input
              list="connections"
              value={newReminder.connection}
              onChange={(e) => setNewReminder({...newReminder, connection: e.target.value})}
              placeholder="Select or type a name"
              className="border-purple-200 focus:border-purple-400 focus:ring-purple-400"
            />
            <datalist id="connections">
              {connectionNames.map((name, i) => (
                <option key={i} value={name} />
              ))}
            </datalist>
          </div>
          
          <div>
            <label className="text-sm text-purple-700 mb-1 block">Reminder</label>
            <Input
              value={newReminder.task}
              onChange={(e) => setNewReminder({...newReminder, task: e.target.value})}
              placeholder="What to follow up on"
              className="border-purple-200 focus:border-purple-400 focus:ring-purple-400"
            />
          </div>
          
          <div>
            <label className="text-sm text-purple-700 mb-1 block">Date</label>
            <Input
              type="date"
              value={newReminder.date}
              onChange={(e) => setNewReminder({...newReminder, date: e.target.value})}
              className="border-purple-200 focus:border-purple-400 focus:ring-purple-400"
            />
          </div>
          
          <div className="flex items-end">
            <Button 
              onClick={handleAddReminder} 
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Reminder
            </Button>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-purple-800 font-medium mb-3">Your Reminders</h3>
        
        {reminders.length === 0 ? (
          <div className="text-center py-8 bg-white border border-purple-200 rounded-lg">
            <Calendar className="h-10 w-10 mx-auto mb-2 text-purple-300" />
            <p className="text-purple-600">No reminders scheduled</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reminders.map((reminder) => (
              <Card key={reminder.id} className="border-purple-200 hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <div className="bg-purple-100 p-2 rounded-full">
                      <Clock className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-purple-900">{reminder.connection}</p>
                      <p className="text-purple-700">{reminder.task}</p>
                      <p className="text-xs text-purple-500">
                        <Calendar className="h-3 w-3 inline mr-1" />
                        {new Date(reminder.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleRemoveReminder(reminder.id)}
                    className="text-purple-600 hover:text-purple-800 hover:bg-purple-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
