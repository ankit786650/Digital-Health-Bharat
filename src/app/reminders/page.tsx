
"use client";

import { useState, useEffect } from "react";
import { AddReminderForm } from "@/components/reminders/AddReminderForm";
import { PrescriptionUploadForm } from "@/components/reminders/PrescriptionUploadForm";
import type { MedicationReminder } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ListChecks,
  PlusCircle,
  BotMessageSquare,
  FilePenLine,
  Trash2,
  ScanLine,
  Pill,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent } from "@/components/ui/card";

export default function RemindersPage() {
  const [reminders, setReminders] = useState<MedicationReminder[]>([]);
  const [showAddManualForm, setShowAddManualForm] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [reminderToDelete, setReminderToDelete] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Effect to load reminders from local storage
  useEffect(() => {
    const storedReminders = localStorage.getItem("mediminder_reminders");
    if (storedReminders) {
      setReminders(JSON.parse(storedReminders));
    }
    setIsLoading(false);
  }, []);

  // Effect to save reminders to local storage
  useEffect(() => {
    // Only save if not loading to prevent overwriting initial empty state before load
    if (!isLoading) {
      localStorage.setItem("mediminder_reminders", JSON.stringify(reminders));
    }
  }, [reminders, isLoading]);

  const handleAddReminder = (newReminder: MedicationReminder) => {
    setReminders((prev) => [newReminder, ...prev].sort((a,b) => (new Date(b.startDate || 0).getTime()) - (new Date(a.startDate || 0).getTime()))); // Sort by most recent or start date
    toast({ title: "Reminder Added", description: `${newReminder.name} has been added to your reminders.` });
    setShowAddManualForm(false);
    setShowUploadForm(false);
  };

  const handleGeneratedReminders = (generatedReminders: MedicationReminder[]) => {
    setReminders((prev) => [...generatedReminders, ...prev].sort((a,b) => (new Date(b.startDate || 0).getTime()) - (new Date(a.startDate || 0).getTime())));
    toast({ title: "Reminders Generated", description: `${generatedReminders.length} reminder(s) added from prescription.`})
    setShowUploadForm(false);
    setShowAddManualForm(false);
  };

  const handleDeleteReminder = (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
    toast({ title: "Reminder Deleted", description: "The reminder has been removed.", variant: "destructive" });
    setReminderToDelete(null);
  };

  const handleEditReminder = (id: string) => {
    const reminderToEdit = reminders.find(r => r.id === id);
    // Here you would typically open the AddReminderForm pre-filled with reminderToEdit data
    // For now, let's just log and show the form.
    if (reminderToEdit && !reminderToEdit.isGenerated) { // Simple check: only allow editing manually added ones for now
        // setShowAddManualForm(true); // This would need form pre-filling logic
        toast({ title: "Edit Action", description: `Editing reminder for ${reminderToEdit?.name}. (Pre-filling form not implemented)` });
    } else {
        toast({ title: "Edit Action", description: `Editing AI generated reminders is not fully supported yet.` });
    }
  };
  
  const handleCancelAddForm = () => {
    setShowAddManualForm(false);
    setShowUploadForm(false);
  }

  const getStatusBadge = (index: number) : JSX.Element => {
    // Cycle through Active, Snoozed, Inactive for demonstration
    const statusCycle = [
      { label: "Active", classes: "bg-green-100 text-green-700 border-green-300" },
      { label: "Snoozed", classes: "bg-yellow-100 text-yellow-700 border-yellow-300" },
      { label: "Inactive", classes: "bg-red-100 text-red-700 border-red-300" },
    ];
    const currentStatus = statusCycle[index % statusCycle.length];
    return <Badge variant="outline" className={currentStatus.classes}>{currentStatus.label}</Badge>;
  }

  const getNextReminderTime = (reminder: MedicationReminder): string => {
    // Placeholder: In a real app, this would calculate based on reminder.specificTimes, reminder.startDate, etc.
    if (reminder.specificTimes && reminder.specificTimes.length > 0) {
        // Attempt to format the first time if available
        const firstTime = reminder.specificTimes[0];
        if (firstTime.match(/^\d{2}:\d{2}$/)) {
          const [hours, minutes] = firstTime.split(':');
          const date = new Date();
          date.setHours(parseInt(hours), parseInt(minutes));
          // Basic AM/PM formatting
          const ampm = date.getHours() >= 12 ? 'PM' : 'AM';
          const displayHours = date.getHours() % 12 || 12; // Convert 0 to 12 for 12 AM/PM
          const displayMinutes = date.getMinutes().toString().padStart(2, '0');
          return `Today, ${displayHours}:${displayMinutes} ${ampm}`;
        }
        return `Today, ${firstTime}`; // Fallback if not HH:MM
    }
    const times = ["Today, 4:00 PM", "Today, 8:00 AM", "Tomorrow, 9:00 AM", "Today, 6:00 PM", "Tomorrow, 10:00 AM"];
    return times[reminders.indexOf(reminder) % times.length];
  }


  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ListChecks className="text-primary h-8 w-8" />
            Medication Reminders
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage all your medication reminders in one place.
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button 
            onClick={() => { setShowUploadForm(true); setShowAddManualForm(false); }} 
            variant="outline"  
            disabled={showAddManualForm || showUploadForm || isLoading}
            className="border-primary text-primary hover:bg-primary/10 hover:text-primary"
          >
            <ScanLine className="mr-2 h-4 w-4" /> Scan Prescription
          </Button>
          <Button 
            onClick={() => { setShowAddManualForm(true); setShowUploadForm(false); }} 
            className="bg-primary text-primary-foreground hover:bg-primary/90" 
            disabled={showAddManualForm || showUploadForm || isLoading}
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Reminder
          </Button>
        </div>
      </div>

      {(showAddManualForm || showUploadForm) && <Separator className="my-6"/>}

      {showAddManualForm && (
        <div
          id="add-manual"
          className="animate-in fade-in-50 slide-in-from-top-5 duration-300"
        >
          <AddReminderForm onAddReminder={handleAddReminder} onCancel={handleCancelAddForm} />
        </div>
      )}

      {showUploadForm && (
        <div
          id="upload-prescription"
          className="animate-in fade-in-50 slide-in-from-top-5 duration-300"
        >
          <PrescriptionUploadForm
            onRemindersGenerated={handleGeneratedReminders}
            onCancel={handleCancelAddForm}
          />
        </div>
      )}

      {(showAddManualForm || showUploadForm) && <Separator className="my-6"/>}


      <div>
        <h2 className="text-2xl font-semibold mb-6">All Reminders</h2>
        {isLoading ? (
          <Card className="text-center py-10 shadow-sm border-border">
            <CardContent className="flex flex-col items-center justify-center">
              <Loader2 className="h-12 w-12 mx-auto text-muted-foreground mb-4 animate-spin" />
              <p className="text-muted-foreground text-lg font-medium">Loading reminders...</p>
            </CardContent>
          </Card>
        ) : reminders.length === 0 && !showAddManualForm && !showUploadForm ? (
           <Card className="text-center py-10 shadow-sm border-border">
            <CardContent className="flex flex-col items-center justify-center">
              <Pill className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-lg font-medium">No reminders set up yet.</p>
              <p className="text-sm text-muted-foreground mt-1">
                Click "Add New Reminder" or "Scan Prescription" to get started.
              </p>
            </CardContent>
          </Card>
        ) : (
          reminders.length > 0 && !showAddManualForm && !showUploadForm && (
          <Card className="shadow-sm border-border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold text-foreground">MEDICATION</TableHead>
                  <TableHead className="font-semibold text-foreground">DOSAGE</TableHead>
                  <TableHead className="font-semibold text-foreground">FREQUENCY</TableHead>
                  <TableHead className="font-semibold text-foreground">NEXT REMINDER</TableHead>
                  <TableHead className="font-semibold text-foreground">SOURCE</TableHead>
                  <TableHead className="font-semibold text-foreground">STATUS</TableHead>
                  <TableHead className="text-right font-semibold text-foreground">ACTIONS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reminders.map((reminder, index) => (
                  <TableRow key={reminder.id}>
                    <TableCell className="font-medium text-foreground">{reminder.name}</TableCell>
                    <TableCell className="text-muted-foreground">{reminder.dosage} {reminder.dosageForm ? `(${reminder.dosageForm})` : ''}</TableCell>
                    <TableCell className="text-muted-foreground">{reminder.timings}</TableCell>
                    <TableCell className="text-muted-foreground">{getNextReminderTime(reminder)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {reminder.isGenerated ? (
                        <span className="flex items-center gap-1.5">
                          <BotMessageSquare className="h-4 w-4 text-primary" /> OCR Scan
                        </span>
                      ) : (
                        "Manual"
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(index)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-primary" onClick={() => handleEditReminder(reminder.id)}>
                        <FilePenLine className="h-4 w-4" />
                         <span className="sr-only">Edit</span>
                      </Button>
                      <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-destructive" onClick={() => setReminderToDelete(reminder.id)}>
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
          )
        )}
      </div>

      {reminderToDelete && (
        <AlertDialog
          open={!!reminderToDelete}
          onOpenChange={() => setReminderToDelete(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                reminder for "{reminders.find((r) => r.id === reminderToDelete)?.name}".
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setReminderToDelete(null)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => handleDeleteReminder(reminderToDelete!)} // Added non-null assertion
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
