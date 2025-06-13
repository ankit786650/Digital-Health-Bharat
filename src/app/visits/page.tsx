"use client";

import { useState, useEffect, useRef } from "react";
import { AddVisitForm } from "@/components/visits/AddVisitForm";
import type { Visit } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Plus, Stethoscope, Loader2, Pencil, User, ClipboardList, Calendar, Clock, MapPin, Trash2 } from "lucide-react"; 
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from "date-fns";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

// Patch Visit type for UI: allow appointmentType, location, duration
// @ts-ignore
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
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Medical Appointments</h1>
          <p className="text-muted-foreground">
            Track and manage your healthcare appointments in one place.
          </p>
        </div>
        <Button 
          onClick={() => setShowAddForm(true)} 
          disabled={isLoading}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Appointment
        </Button>
      </div>

      {/* Add Appointment Dialog */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="max-w-2xl">
          <DialogTitle>Schedule New Appointment</DialogTitle>
          <ScrollArea className="max-h-[70vh] pr-2">
            {/* Patch for AddVisitForm props: allow initialValues and fields as any to suppress TS error
            @ts-expect-error: UI prop compatibility */}
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
            <DialogTitle>Appointment Follow-Up</DialogTitle>
            <div className="mb-4 mt-2 text-left flex flex-col gap-1 items-center w-full">
              <div className="font-semibold text-lg text-foreground flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                {followUpData.visit.doctorName?.trim() ? followUpData.visit.doctorName : "Doctor"}
              </div>
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <Stethoscope className="h-4 w-4" />
                {followUpData.visit.specialization?.trim() ? followUpData.visit.specialization : "Specialty"}
              </div>
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <ClipboardList className="h-4 w-4" />
                {followUpData.visit.appointmentType?.trim() ? followUpData.visit.appointmentType : "Appointment"}
              </div>
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <span className="font-medium">
                  {followUpData.visit.appointmentDate ? format(parseISO(followUpData.visit.appointmentDate), "MMMM d, yyyy") : "Date"}
                </span>
              </div>
            </div>
            <div className="mt-2 mb-4 text-lg font-medium">
              Did you visit the doctor for your appointment?
            </div>
            <div className="flex justify-center gap-3 mb-4">
              <Button
                variant="default"
                onClick={() => {
                  setShowFollowUp(false);
                  localStorage.removeItem("followUpVisit");
                  toast({ title: "Thank you!", description: "Glad you made it to your appointment." });
                }}
              >
                ✓ Yes, I did
              </Button>
              <Button
                variant="outline"
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
            <DialogTitle>Missed Appointment</DialogTitle>
            <div className="mt-2 mb-4 text-lg font-medium">
              Would you like to reschedule your appointment?
            </div>
            <div className="flex justify-center gap-3 mb-2">
              <Button
                variant="default"
                onClick={() => {
                  setShowReschedule(false);
                  setRescheduleInitial(rescheduleData.current);
                  setShowAddForm(true);
                }}
              >
                Yes, Reschedule
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowReschedule(false)}
              >
                No, Dismiss
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Appointment Modal */}
      {showEditModal && editAppointment && (
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="max-w-2xl">
            <DialogTitle>Edit Appointment</DialogTitle>
            <ScrollArea className="max-h-[70vh] pr-2">
              {/* Patch for AddVisitForm edit: allow initialValues as any */}
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
          <DialogContent>
            <DialogTitle>Delete Appointment</DialogTitle>
            <div className="mb-4">Are you sure you want to delete this appointment? This action cannot be undone.</div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeleteVisitId(null)}>Cancel</Button>
              <Button variant="destructive" onClick={() => handleDeleteVisit(deleteVisitId!)}>Delete</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Recent Appointments</h2>
            <p className="text-sm text-muted-foreground">{visits.length} total</p>
          </div>

          {visits.length === 0 ? (
            <Card className="text-center py-12">
              <Stethoscope className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No appointments recorded</h3>
              <p className="text-muted-foreground mb-4">Add your first appointment to get started</p>
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Appointment
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visits.map((visit) => {
                const badge = getAppointmentTypeBadge((visit as any).appointmentType || '');
                return (
                  <Card key={visit.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            {visit.doctorName || "Unnamed Appointment"}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {visit.specialization || "General Consultation"}
                          </p>
                        </div>
                        <Badge variant={badge.variant as any}>
                          {badge.label}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {visit.date ? format(parseISO(visit.date), "PPP") : "No date set"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {(visit as any).duration || "Duration not specified"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
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
                    <CardFooter className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary"
                        disabled={isOlderThan3Months(visit.date)}
                        onClick={() => {
                          setEditAppointment(visit as Visit);
                          setShowEditModal(true);
                        }}
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 border border-red-200 hover:border-[3px] hover:border-transparent hover:bg-gradient-to-r hover:from-red-400/30 hover:to-red-600/20 transition-all duration-200"
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