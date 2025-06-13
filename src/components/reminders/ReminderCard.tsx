
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { MedicationReminder } from "@/lib/types";
import { Pill, Clock, AlertTriangle, CheckCircle, Edit3, Trash2, BotMessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ReminderCardProps {
  reminder: MedicationReminder;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

// This component is no longer used directly on the main reminders page after the redesign to a table view.
// It's kept here for potential future use or if a card-based view is desired elsewhere.
export function ReminderCard({ reminder, onEdit, onDelete }: ReminderCardProps) {
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2">
            <Pill className="text-primary h-6 w-6" />
            {reminder.name}
          </CardTitle>
          {reminder.isGenerated && (
            <Badge variant="outline" className="text-xs border-accent text-accent flex items-center gap-1">
              <BotMessageSquare className="h-3 w-3" />
              AI Gen
            </Badge>
          )}
        </div>
        <CardDescription>{reminder.dosage}</CardDescription>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <Clock className="h-5 w-5 mt-0.5 shrink-0" />
          <p>{reminder.timings}</p>
        </div>
        {/* Placeholder for next notification time or status */}
        <div className="mt-3 flex items-center gap-2 text-xs">
          {/* Example status. This would be dynamic. */}
          {Math.random() > 0.5 ? (
             <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
             <AlertTriangle className="h-4 w-4 text-orange-500" />
          )}
          <span className={Math.random() > 0.5 ? "text-green-600" : "text-orange-600"}>
            {Math.random() > 0.5 ? "Next: Today, 8:00 PM" : "Missed: Today, 8:00 AM"}
          </span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2 border-t pt-4">
        <Button variant="outline" size="sm" onClick={() => onEdit(reminder.id)}>
          <Edit3 className="h-4 w-4 mr-1" /> Edit
        </Button>
        <Button variant="destructive" size="sm" onClick={() => onDelete(reminder.id)}>
          <Trash2 className="h-4 w-4 mr-1" /> Delete
        </Button>
      </CardFooter>
    </Card>
  );
}

