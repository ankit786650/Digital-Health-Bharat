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
  Clock,
  CalendarDays,
  Syringe,
  Tablet,
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

export default function RemindersPage() {
  const [reminders, setReminders] = useState<MedicationReminder[]>([]);
  const [showAddManualForm, setShowAddManualForm] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [reminderToDelete, setReminderToDelete] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedReminders, setSelectedReminders] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const storedReminders = localStorage.getItem("mediminder_reminders");
    if (storedReminders) {
      setReminders(JSON.parse(storedReminders));
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem("mediminder_reminders", JSON.stringify(reminders));
    }
  }, [reminders, isLoading]);

  const handleAddReminder = (newReminder: MedicationReminder) => {
    setReminders((prev) => 
      [newReminder, ...prev].sort((a,b) => 
        (new Date(b.startDate || 0).getTime() - new Date(a.startDate || 0).getTime())
      )
    );
    toast({ 
      title: "Reminder Added", 
      description: `${newReminder.name} has been added to your reminders.`,
      variant: "default",
    });
    setShowAddManualForm(false);
    setShowUploadForm(false);
  };

  const handleGeneratedReminders = (generatedReminders: MedicationReminder[]) => {
    setReminders((prev) => 
      [...generatedReminders, ...prev].sort((a,b) => 
        (new Date(b.startDate || 0).getTime() - new Date(a.startDate || 0).getTime())
      )
    );
    toast({ 
      title: "Reminders Generated", 
      description: `${generatedReminders.length} reminder(s) added from prescription.`,
      variant: "default",
    });
    setShowUploadForm(false);
    setShowAddManualForm(false);
  };

  const handleDeleteReminder = (id: string) => {
    const reminder = reminders.find(r => r.id === id);
    setReminders((prev) => prev.filter((r) => r.id !== id));
    toast({ 
      title: "Reminder Deleted", 
      description: `Reminder for ${reminder?.name} has been removed.`,
      variant: "destructive",
    });
    setReminderToDelete(null);
  };

  const handleEditReminder = (id: string) => {
    const reminderToEdit = reminders.find(r => r.id === id);
    if (reminderToEdit && !reminderToEdit.isGenerated) {
      toast({ 
        title: "Edit Reminder", 
        description: `Editing reminder for ${reminderToEdit.name}.`,
      });
    } else {
      toast({ 
        title: "Edit Not Supported", 
        description: "Editing AI-generated reminders is not currently supported.",
        variant: "destructive",
      });
    }
  };
  
  const handleCancelAddForm = () => {
    setShowAddManualForm(false);
    setShowUploadForm(false);
  }

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedReminders([]);
    } else {
      setSelectedReminders(reminders.map(r => r.id));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectReminder = (id: string) => {
    setSelectedReminders((prev) =>
      prev.includes(id) ? prev.filter(rid => rid !== id) : [...prev, id]
    );
  };

  const handleDeleteSelected = () => {
    setReminders(reminders.filter(r => !selectedReminders.includes(r.id)));
    setSelectedReminders([]);
    setSelectAll(false);
    toast({
      title: "Reminders Deleted",
      description: `${selectedReminders.length} reminder(s) deleted.`,
      variant: "destructive",
    });
  };

  const getStatusBadge = (reminder: MedicationReminder) : JSX.Element => {
    const statusMap = {
      active: { label: "Active", classes: "bg-emerald-50 text-emerald-700 border-emerald-200" },
      paused: { label: "Paused", classes: "bg-amber-50 text-amber-700 border-amber-200" },
      completed: { label: "Completed", classes: "bg-blue-50 text-blue-700 border-blue-200" },
      expired: { label: "Expired", classes: "bg-gray-100 text-gray-700 border-gray-300" },
    };

    // Simple logic to determine status - in a real app this would be more sophisticated
    let status: keyof typeof statusMap = 'active';
    if (reminder.endDate && new Date(reminder.endDate) < new Date()) {
      status = 'expired';
    } else if (Math.random() > 0.8) { // Just for demo - random status
      status = 'paused';
    } else if (Math.random() > 0.9) {
      status = 'completed';
    }

    return (
      <Badge variant="outline" className={cn("text-xs font-medium", statusMap[status].classes)}>
        {statusMap[status].label}
      </Badge>
    );
  }

  const getNextReminderTime = (reminder: MedicationReminder): string => {
    if (reminder.specificTimes && reminder.specificTimes.length > 0) {
      const firstTime = reminder.specificTimes[0];
      if (firstTime.match(/^\d{2}:\d{2}$/)) {
        const [hours, minutes] = firstTime.split(':');
        const date = new Date();
        date.setHours(parseInt(hours), parseInt(minutes));
        return format(date, "h:mm a");
      }
      return firstTime;
    }
    return "No time set";
  }

  const getDosageIcon = (dosageForm?: string) => {
    if (!dosageForm) return <Pill className="h-4 w-4 text-muted-foreground" />;
    
    const form = dosageForm.toLowerCase();
    if (form.includes('tablet') || form.includes('pill')) return <Tablet className="h-4 w-4 text-muted-foreground" />;
    if (form.includes('injection') || form.includes('syringe')) return <Syringe className="h-4 w-4 text-muted-foreground" />;
    return <Pill className="h-4 w-4 text-muted-foreground" />;
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <ListChecks className="text-primary h-8 w-8" />
            Medication Reminders
          </h1>
          <p className="text-muted-foreground">
            Manage your medication schedule and never miss a dose
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button 
            onClick={() => { setShowUploadForm(true); setShowAddManualForm(false); }} 
            variant="outline"  
            disabled={showAddManualForm || showUploadForm || isLoading}
            className="border-primary/50 text-primary hover:bg-primary/5 hover:text-primary gap-2"
          >
            <ScanLine className="h-4 w-4" /> 
            <span>Scan Prescription</span>
          </Button>
          <Button 
            onClick={() => { setShowAddManualForm(true); setShowUploadForm(false); }} 
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2" 
            disabled={showAddManualForm || showUploadForm || isLoading}
          >
            <PlusCircle className="h-4 w-4" />
            <span>Add Reminder</span>
          </Button>
        </div>
      </div>

      {(showAddManualForm || showUploadForm) && (
        <div className="space-y-6">
          <Separator className="my-4"/>
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">
                {showAddManualForm ? "Add New Reminder" : "Upload Prescription"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {showAddManualForm ? (
                <AddReminderForm 
                  onAddReminder={handleAddReminder} 
                  onCancel={handleCancelAddForm} 
                />
              ) : (
                <PrescriptionUploadForm
                  onRemindersGenerated={handleGeneratedReminders}
                  onCancel={handleCancelAddForm}
                />
              )}
            </CardContent>
          </Card>
          <Separator className="my-4"/>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight">Your Reminders</h2>
          <div className="text-sm text-muted-foreground">
            {reminders.length > 0 && `${reminders.length} medication${reminders.length !== 1 ? 's' : ''}`}
          </div>
        </div>

        {isLoading ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 text-muted-foreground animate-spin mb-4" />
              <p className="text-muted-foreground">Loading your reminders...</p>
            </CardContent>
          </Card>
        ) : reminders.length === 0 && !showAddManualForm && !showUploadForm ? (
          <EmptyState
            icon={<Pill className="h-10 w-10 text-muted-foreground" />}
            title="No reminders yet"
            description="Get started by adding a new medication reminder."
            actions={
              <>
                <Button 
                  onClick={() => setShowAddManualForm(true)}
                  className="gap-2"
                >
                  <PlusCircle className="h-4 w-4" />
                  Add Reminder
                </Button>
                <Button 
                  onClick={() => setShowUploadForm(true)}
                  variant="outline"
                  className="gap-2"
                >
                  <ScanLine className="h-4 w-4" />
                  Scan Prescription
                </Button>
              </>
            }
          />
        ) : (
          reminders.length > 0 && !showAddManualForm && !showUploadForm && (
            <div className="rounded-lg border border-muted overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 bg-muted/30 border-b">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="accent-primary h-4 w-4 rounded border"
                    aria-label="Select all reminders"
                  />
                  <span className="text-sm">Select All</span>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteSelected}
                  disabled={selectedReminders.length === 0}
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" /> Delete Selected
                </Button>
              </div>
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow className="hover:bg-muted/50">
                    <TableHead className="w-8">
                      {/* Checkbox for select all in header (hidden, handled above) */}
                    </TableHead>
                    <TableHead className="w-[200px]">Medication</TableHead>
                    <TableHead>Dosage</TableHead>
                    <TableHead>Schedule</TableHead>
                    <TableHead>Next Dose</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reminders.map((reminder) => (
                    <TableRow key={reminder.id} className="hover:bg-muted/10">
                      <TableCell className="w-8">
                        <input
                          type="checkbox"
                          checked={selectedReminders.includes(reminder.id)}
                          onChange={() => handleSelectReminder(reminder.id)}
                          className="accent-primary h-4 w-4 rounded border"
                          aria-label={`Select reminder ${reminder.name}`}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          {getDosageIcon(reminder.dosageForm)}
                          <span>{reminder.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">
                            {reminder.dosage} {reminder.dosageForm && `(${reminder.dosageForm})`}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{reminder.timings}</span>
                        </div>
                        {reminder.startDate && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <CalendarDays className="h-3 w-3" />
                            <span>
                              {format(parseISO(reminder.startDate), "MMM d, yyyy")}
                              {/* {reminder.endDate && ` - ${format(parseISO(reminder.endDate), "MMM d, yyyy")}`} */}
                            </span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-muted-foreground">
                          {getNextReminderTime(reminder)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(reminder)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                            onClick={() => handleEditReminder(reminder.id)}
                          >
                            <FilePenLine className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => setReminderToDelete(reminder.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )
        )}
      </div>

      <AlertDialog
        open={!!reminderToDelete}
        onOpenChange={() => setReminderToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the reminder for{" "}
              <span className="font-medium text-foreground">
                {reminders.find((r) => r.id === reminderToDelete)?.name}
              </span>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => reminderToDelete && handleDeleteReminder(reminderToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Reminder
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}