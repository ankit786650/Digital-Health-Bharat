import React, { useState } from "react";
import { Bell } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export interface Notification {
  id: string;
  message: string;
  read?: boolean;
  timestamp?: string;
}

export function NotificationPopover({ notifications = [] }: { notifications?: Notification[] }) {
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notification[]>(notifications);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);
  const [pendingNotifId, setPendingNotifId] = useState<string | null>(null);
  const [wellDone, setWellDone] = useState(false);

  const markAllRead = () => {
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Simulate notification triggers (for demo)
  React.useEffect(() => {
    // Only add demo notifications if none exist
    if (notifs.length === 0) {
      setTimeout(() => {
        setNotifs((prev) => [
          ...prev,
          {
            id: "appt-1hr",
            message: "Your appointment is going to start in 60 mins",
            read: false,
            timestamp: new Date(Date.now() + 60 * 60 * 1000).toLocaleTimeString(),
          },
        ]);
      }, 1000);
      setTimeout(() => {
        setNotifs((prev) => [
          ...prev,
          {
            id: "appt-check",
            message: "You attended the appointment or not?",
            read: false,
            timestamp: new Date(Date.now() + 75 * 60 * 1000).toLocaleTimeString(),
          },
        ]);
      }, 3000);
    }
  }, []);

  const handleResponse = (notifId: string, attended: boolean) => {
    setPendingNotifId(null);
    setShowConfirm(false);
    setShowReschedule(false);
    setWellDone(false);
    setNotifs((prev) => prev.map((n) => n.id === notifId ? { ...n, read: true } : n));
    if (attended) {
      setWellDone(true);
    } else {
      setShowReschedule(true);
    }
  };

  const handleNotifClick = (notif: Notification) => {
    if (notif.id === "appt-check") {
      setPendingNotifId(notif.id);
      setShowConfirm(true);
    }
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-6 w-6" />
            {notifs.some((n) => !n.read) && (
              <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0 rounded-xl shadow-lg">
          <div className="flex items-center justify-between px-4 py-2 border-b">
            <span className="font-semibold text-base">Notifications</span>
            <Button variant="link" size="sm" onClick={markAllRead} className="text-xs">Mark all as read</Button>
          </div>
          <div className="max-h-72 overflow-y-auto divide-y">
            {notifs.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground text-sm">No notifications</div>
            ) : (
              notifs.map((notif) => (
                <div
                  key={notif.id}
                  className={`px-4 py-3 text-sm flex flex-col gap-1 cursor-pointer ${notif.read ? "bg-white" : "bg-blue-50"}`}
                  onClick={() => handleNotifClick(notif)}
                >
                  <span className={notif.read ? "text-gray-700" : "font-semibold text-blue-900"}>{notif.message}</span>
                  {notif.timestamp && (
                    <span className="text-xs text-gray-400">{notif.timestamp}</span>
                  )}
                  {notif.id === "appt-check" && !notif.read && (
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" onClick={() => handleResponse(notif.id, true)}>Yes</Button>
                      <Button size="sm" variant="outline" onClick={() => handleResponse(notif.id, false)}>No</Button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </PopoverContent>
      </Popover>
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <div className="text-lg font-semibold mb-2">Did you attend the appointment?</div>
          <div className="flex gap-4 justify-center mt-4">
            <Button onClick={() => handleResponse(pendingNotifId!, true)}>Yes</Button>
            <Button variant="outline" onClick={() => handleResponse(pendingNotifId!, false)}>No</Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={wellDone} onOpenChange={setWellDone}>
        <DialogContent>
          <div className="text-lg font-semibold text-green-700">Well done!</div>
        </DialogContent>
      </Dialog>
      <Dialog open={showReschedule} onOpenChange={setShowReschedule}>
        <DialogContent>
          <div className="text-lg font-semibold mb-2">Would you like to schedule a new appointment?</div>
          <Button className="mt-4">Schedule New Appointment</Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
