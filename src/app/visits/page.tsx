"use client";

import { useState, useEffect, useRef } from "react";
import { AddVisitForm } from "@/components/visits/AddVisitForm";
import type { Visit } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Plus, Stethoscope, Loader2, Pencil, User, ClipboardList, Calendar, Clock, MapPin, Trash2 } from "lucide-react"; 
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from "date-fns";
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const initialVisits = [
  {
    id: "sample-1",
    date: "2024-08-01",
    doctorName: "Dr. Sample Demo",
    appointmentType: "Follow-up",
    specialization: "Cardiology",
    notes: "Sample appointment for demonstration.",
    location: "Room 101",
    duration: "30 min"
  },
  {
    id: "1",
    date: "2024-07-15",
    doctorName: "Dr. Priya Sharma",
    appointmentType: "Routine Checkup",
    specialization: "Psychiatry",
    notes: "Patient reported improved sleep patterns and reduced anxiety levels. Continue current medication regimen.",
    location: "Room 201",
    duration: "45 min"
  },
  {
    id: "2",
    date: "2024-06-20",
    doctorName: "Dr. Vikram Singh",
    appointmentType: "Initial Consultation",
    specialization: "General Practice",
    notes: "Blood pressure within normal range. Continue with current medication.",
    location: "Room 305",
    duration: "30 min"
  },
  {
    id: "3",
    date: "2024-05-10",
    doctorName: "Dr. Priya Sharma",
    appointmentType: "Follow-up",
    specialization: "Psychiatry",
    notes: "Patient reported mild headaches. Adjusted medication dosage. Follow up in 2 weeks.",
    location: "Room 201",
    duration: "20 min"
  },
  {
    id: "4",
    date: "2024-04-05",
    doctorName: "Dr. Vikram Singh",
    appointmentType: "Initial Consultation",
    specialization: "General Practice",
    notes: "Initial consultation. Prescribed medication for anxiety and sleep issues.",
    location: "Room 305",
    duration: "40 min"
  }
];

const getDoctorInitials = (name: string) => {
  if (!name) return "DR";
  const parts = name.split(" ");
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
};

const getSpecialtyColor = (specialty: string) => {
  if (!specialty) return "bg-gray-100";
  const spec = specialty.toLowerCase();
  if (spec.includes("cardio")) return "bg-red-100 text-red-800";
  if (spec.includes("psych")) return "bg-purple-100 text-purple-800";
  if (spec.includes("general")) return "bg-blue-100 text-blue-800";
  return "bg-gray-100 text-gray-800";
};

export default function VisitsPage() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [followUpData, setFollowUpData] = useState<null | { visit: any }>(null);
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);
  const [rescheduleInitial, setRescheduleInitial] = useState<any>(null);
  const rescheduleData = useRef<any>(null);
  const [editAppointment, setEditAppointment] = useState<Visit | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleteVisitId, setDeleteVisitId] = useState<string | null>(null);

  useEffect(() => {
    const storedVisits = localStorage.getItem("meditrack_visits");
    if (storedVisits) {
      setVisits(
        JSON.parse(storedVisits).sort((a: Visit, b: Visit) => new Date(b.date).getTime() - new Date(a.date).getTime())
      );
    } else {
      setVisits(initialVisits.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem("meditrack_visits", JSON.stringify(visits));
    }
  }, [visits, isLoading]);

  const handleAddVisit = (newVisit: any) => {
    const visitWithId = {
      ...newVisit,
      id: `visit-${Date.now()}`,
      attachedDocuments: newVisit.documents || [],
      date: newVisit.appointmentDate || "",
    };
    setVisits((prev) => [visitWithId, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    toast({
      title: "Appointment Logged",
      description: `Appointment with ${visitWithId.doctor} on ${visitWithId.appointmentDate} at ${visitWithId.appointmentTime} has been recorded.`
    });
    setShowAddForm(false);

    if (!visitWithId.appointmentDate || !visitWithId.appointmentTime) {
      toast({ title: "Error", description: "Appointment date and time are required for follow-up.", variant: "destructive" });
      return;
    }
    const appointmentDateTime = new Date(`${visitWithId.appointmentDate}T${visitWithId.appointmentTime}`);
    if (isNaN(appointmentDateTime.getTime())) {
      toast({ title: "Error", description: "Invalid appointment date or time.", variant: "destructive" });
      return;
    }

    const followUpTime = appointmentDateTime.getTime() + 60 * 60 * 1000;
    localStorage.setItem("followUpVisit", JSON.stringify({ visit: visitWithId, followUpTime }));

    const msUntilFollowUp = followUpTime - Date.now();
    if (msUntilFollowUp > 0) {
      setTimeout(() => {
        setFollowUpData({ visit: visitWithId });
        setShowFollowUp(true);
      }, msUntilFollowUp);
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem("followUpVisit");
    if (stored) {
      const { visit, followUpTime } = JSON.parse(stored);
      const msUntilFollowUp = followUpTime - Date.now();
      if (msUntilFollowUp > 0) {
        setTimeout(() => {
          setFollowUpData({ visit });
          setShowFollowUp(true);
        }, msUntilFollowUp);
      } else if (msUntilFollowUp <= 0 && !showFollowUp) {
        setFollowUpData({ visit });
        setShowFollowUp(true);
      }
    }
  }, []);

  const handleEditVisit = (updated: any) => {
    setVisits((prev) =>
      prev.map((v) =>
        v.id === editAppointment?.id
          ? { ...v, ...updated, date: updated.appointmentDate }
          : v
      )
    );
    setShowEditModal(false);
    setEditAppointment(null);
    toast({ title: "Appointment updated successfully." });
    setTimeout(() => {
      localStorage.setItem(
        "meditrack_visits",
        JSON.stringify(
          visits.map((v) =>
            v.id === editAppointment?.id
              ? { ...v, ...updated, date: updated.appointmentDate }
              : v
          )
        )
      );
    }, 0);
  };

  const handleDeleteVisit = (id: string) => {
    setVisits((prev) => prev.filter((v) => v.id !== id));
    setDeleteVisitId(null);
    toast({ title: "Appointment Deleted", description: "The appointment has been removed.", variant: "destructive" });
  };

  const isOlderThan3Months = (date: string) => {
    if (!date) return false;
    const d = new Date(date);
    const now = new Date();
    return now.getTime() - d.getTime() > 90 * 24 * 60 * 60 * 1000;
  };

  const getAppointmentTypeBadge = (type: string) => {
    if (!type) return { variant: "secondary", label: "—" };
    const t = type.toLowerCase();
    if (t.includes("follow")) return { variant: "default", label: type };
    if (t.includes("initial") || t.includes("new")) return { variant: "outline", label: type };
    if (t.includes("routine")) return { variant: "secondary", label: type };
    return { variant: "secondary", label: type };
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Medical Appointments</h1>
          <p className="text-muted-foreground">
            Track and manage your healthcare appointments in one place
          </p>
        </div>
        <Button 
          onClick={() => setShowAddForm(true)} 
          className="gap-2 shadow-sm hover:shadow-md transition-shadow"
          size="lg"
        >
          <Plus className="h-4 w-4" />
          Add Appointment
        </Button>
      </div>

      {/* Add Appointment Dialog */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Schedule New Appointment</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh] pr-2">
            <AddVisitForm 
              onAddVisit={handleAddVisit} 
              onCancel={() => {
                setShowAddForm(false);
                setRescheduleInitial(null);
              }}
              initialValues={rescheduleInitial}
              fields={{
                patientName: true,
                appointmentType: true,
                appointmentDate: true,
                appointmentTime: true,
                doctorName: true,
                specialization: true,
                location: true,
                duration: true,
                notes: true,
                documents: true,
                reminder: true,
                enableNotifications: true
              }}
            />
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Follow-Up Modal */}
      {showFollowUp && followUpData && (
        <Dialog open={showFollowUp} onOpenChange={setShowFollowUp}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center">Appointment Follow-Up</DialogTitle>
            </DialogHeader>
            <div className="mb-6 mt-2 text-center flex flex-col gap-1 items-center w-full">
              <Avatar className="h-16 w-16 mb-3">
                <AvatarImage src="" />
                <AvatarFallback className="bg-blue-100 text-blue-800 text-lg font-medium">
                  {getDoctorInitials(followUpData.visit.doctorName)}
                </AvatarFallback>
              </Avatar>
              <div className="font-semibold text-lg text-foreground">
                {followUpData.visit.doctorName?.trim() ? followUpData.visit.doctorName : "Doctor"}
              </div>
              <Badge variant="secondary" className="mt-1">
                <Stethoscope className="h-3 w-3 mr-1.5" />
                {followUpData.visit.specialization?.trim() ? followUpData.visit.specialization : "Specialty"}
              </Badge>
              <div className="text-sm text-muted-foreground mt-2">
                <Calendar className="h-4 w-4 inline mr-1.5" />
                {followUpData.visit.appointmentDate ? format(parseISO(followUpData.visit.appointmentDate), "MMMM d, yyyy") : "Date"}
              </div>
            </div>
            <div className="mt-4 mb-6 text-center">
              <p className="text-lg font-medium mb-2">Did you attend your appointment?</p>
              <p className="text-sm text-muted-foreground">We'd like to confirm your visit status</p>
            </div>
            <div className="flex justify-center gap-4">
              <Button
                variant="default"
                className="min-w-[120px]"
                onClick={() => {
                  setShowFollowUp(false);
                  localStorage.removeItem("followUpVisit");
                  toast({ title: "Thank you!", description: "Glad you made it to your appointment." });
                }}
              >
                ✓ Yes, I attended
              </Button>
              <Button
                variant="outline"
                className="min-w-[120px]"
                onClick={() => {
                  setShowFollowUp(false);
                  setShowReschedule(true);
                  rescheduleData.current = followUpData.visit;
                }}
              >
                ✗ No, I missed it
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Reschedule Modal */}
      {showReschedule && (
        <Dialog open={showReschedule} onOpenChange={setShowReschedule}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center">Missed Appointment</DialogTitle>
            </DialogHeader>
            <div className="mt-2 mb-6 text-center">
              <p className="text-lg font-medium mb-2">Would you like to reschedule?</p>
              <p className="text-sm text-muted-foreground">We can help you book a new appointment</p>
            </div>
            <div className="flex justify-center gap-4">
              <Button
                variant="default"
                className="min-w-[120px]"
                onClick={() => {
                  setShowReschedule(false);
                  setRescheduleInitial(rescheduleData.current);
                  setShowAddForm(true);
                }}
              >
                Reschedule
              </Button>
              <Button
                variant="outline"
                className="min-w-[120px]"
                onClick={() => setShowReschedule(false)}
              >
                Dismiss
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Appointment Modal */}
      {showEditModal && editAppointment && (
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl">Edit Appointment</DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[70vh] pr-2">
              <AddVisitForm
                onAddVisit={handleEditVisit}
                onCancel={() => setShowEditModal(false)}
                initialValues={editAppointment}
                fields={{
                  patientName: true,
                  appointmentType: true,
                  appointmentDate: true,
                  appointmentTime: true,
                  doctorName: true,
                  specialization: true,
                  location: true,
                  duration: true,
                  notes: true,
                  documents: true,
                  reminder: true,
                  enableNotifications: true
                }}
              />
            </ScrollArea>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteVisitId && (
        <Dialog open={!!deleteVisitId} onOpenChange={() => setDeleteVisitId(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center">Delete Appointment</DialogTitle>
            </DialogHeader>
            <div className="text-center mb-6">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <p className="mb-2 font-medium">Are you sure you want to delete this appointment?</p>
              <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
            </div>
            <div className="flex justify-center gap-3">
              <Button variant="outline" onClick={() => setDeleteVisitId(null)} className="min-w-[100px]">Cancel</Button>
              <Button variant="destructive" onClick={() => handleDeleteVisit(deleteVisitId!)} className="min-w-[100px]">Delete</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-16" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Your Appointments</h2>
            <p className="text-sm text-muted-foreground">
              {visits.length} {visits.length === 1 ? "appointment" : "appointments"} total
            </p>
          </div>

          {visits.length === 0 ? (
            <Card className="text-center py-12 border-dashed hover:border-solid transition-all">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 mb-4">
                <Stethoscope className="h-6 w-6 text-gray-500" />
              </div>
              <h3 className="text-lg font-medium mb-2">No appointments recorded</h3>
              <p className="text-muted-foreground mb-6">Add your first appointment to get started</p>
              <Button onClick={() => setShowAddForm(true)} className="shadow-sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Appointment
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visits.map((visit) => {
                const badge = getAppointmentTypeBadge((visit as any).appointmentType || '');
                const isUpcoming = visit.date && new Date(visit.date) > new Date();
                
                return (
                  <Card 
                    key={visit.id} 
                    className={cn(
                      "hover:shadow-lg transition-shadow border",
                      isUpcoming ? "border-blue-200" : "border-gray-200"
                    )}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-10 w-10 mt-1">
                            <AvatarImage src="" />
                            <AvatarFallback className={cn(
                              "text-sm font-medium",
                              getSpecialtyColor(visit.specialization)
                            )}>
                              {getDoctorInitials(visit.doctorName)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg line-clamp-1">
                              {visit.doctorName || "Unnamed Appointment"}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {visit.specialization || "General Consultation"}
                            </p>
                          </div>
                        </div>
                        <Badge variant={badge.variant as any} className="shrink-0">
                          {badge.label}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="text-sm">
                          {visit.date ? format(parseISO(visit.date), "PPP") : "No date set"}
                        </span>
                        {isUpcoming && (
                          <Badge variant="outline" className="ml-auto text-xs py-0.5 px-2">
                            Upcoming
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="text-sm">
                          {(visit as any).duration || "Duration not specified"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="text-sm line-clamp-1">
                          {(visit as any).location || "Location not specified"}
                        </span>
                      </div>
                      {visit.notes && (
                        <>
                          <Separator className="my-2" />
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">Notes:</p>
                            <p className="text-sm line-clamp-3">{visit.notes}</p>
                          </div>
                        </>
                      )}
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2 pt-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary hover:bg-blue-50"
                        onClick={() => {
                          setEditAppointment(visit as Visit);
                          setShowEditModal(true);
                        }}
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => setDeleteVisitId(visit.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}