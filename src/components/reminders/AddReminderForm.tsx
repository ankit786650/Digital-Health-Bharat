
"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { MedicationReminder } from "@/lib/types";
import { Pill, X, Clock, Plus, CalendarIcon, Save, Ban } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const reminderFormSchema = z.object({
  name: z.string().min(2, "Medication name must be at least 2 characters."),
  dosage: z.string().min(1, "Dosage is required (e.g., 250mg, 1 tablet)."),
  dosageForm: z.enum(["tablet", "capsule", "syrup", "injection", "ointment", "drops", "patch", "inhaler", "other"], {
    required_error: "Dosage form is required.",
  }),
  timings: z.string().min(1, "Frequency is required."), // This maps to frequency e.g. "Once a day"
  specificTimes: z.array(z.object({ value: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format. Use HH:MM.") })).min(1, "At least one timing is required."),
  startDate: z.date({ required_error: "Start date is required."}),
  durationUnit: z.enum(["days", "weeks", "months", "no_end_date"]),
  durationValue: z.coerce.number().optional(),
  instructions: z.string().optional(),
  refillReminderEnabled: z.boolean().default(false).optional(),
  refillDaysBeforeEmpty: z.coerce.number().optional(),
  medicationShape: z.enum(["round", "oval", "oblong", "square", "diamond", "triangle", "other"]).optional(),
}).refine(data => {
  if (data.durationUnit !== 'no_end_date' && (data.durationValue === undefined || data.durationValue <= 0)) {
    return false;
  }
  return true;
}, {
  message: "Duration value is required and must be positive if an end date is set.",
  path: ["durationValue"],
}).refine(data => {
  if (data.refillReminderEnabled && (data.refillDaysBeforeEmpty === undefined || data.refillDaysBeforeEmpty <=0)) {
    return false;
  }
  return true;
}, {
  message: "Days before empty is required and must be positive if refill reminder is enabled.",
  path: ["refillDaysBeforeEmpty"],
});

type ReminderFormValues = z.infer<typeof reminderFormSchema>;

interface AddReminderFormProps {
  onAddReminder: (reminder: MedicationReminder) => void;
  onCancel: () => void;
}

export function AddReminderForm({ onAddReminder, onCancel }: AddReminderFormProps) {
  const form = useForm<ReminderFormValues>({
    resolver: zodResolver(reminderFormSchema),
    defaultValues: {
      name: "",
      dosage: "",
      // dosageForm: undefined, // Let placeholder show
      timings: "Once a day", // Default frequency
      specificTimes: [{ value: "09:00" }],
      startDate: new Date(),
      durationUnit: "no_end_date",
      durationValue: undefined,
      instructions: "",
      refillReminderEnabled: false,
      refillDaysBeforeEmpty: undefined,
      // medicationShape: undefined, // Let placeholder show
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "specificTimes",
  });

  const watchDurationUnit = form.watch("durationUnit");
  const watchRefillEnabled = form.watch("refillReminderEnabled");

  function onSubmit(data: ReminderFormValues) {
    const newReminder: MedicationReminder = {
      id: `manual-${Date.now()}`,
      name: data.name,
      dosage: data.dosage,
      dosageForm: data.dosageForm,
      timings: data.timings, // This is the frequency string
      specificTimes: data.specificTimes.map(st => st.value),
      startDate: data.startDate ? format(data.startDate, "yyyy-MM-dd") : undefined,
      durationUnit: data.durationUnit,
      durationValue: data.durationUnit === 'no_end_date' ? undefined : data.durationValue,
      instructions: data.instructions,
      refillReminderEnabled: data.refillReminderEnabled,
      refillDaysBeforeEmpty: data.refillReminderEnabled ? data.refillDaysBeforeEmpty : undefined,
      medicationShape: data.medicationShape,
      isGenerated: false,
    };
    onAddReminder(newReminder);
    form.reset();
    // onCancel(); // Optionally close form on successful submission
  }

  return (
    <Card className="w-full shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2 text-xl"><Pill className="text-primary h-5 w-5" />Add New Reminder</CardTitle>
          {/* <CardDescription>Enter medication details to set up a reminder.</CardDescription> */}
        </div>
        <Button variant="ghost" size="icon-sm" onClick={onCancel} aria-label="Close form">
            <X className="h-5 w-5" />
        </Button>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Medication Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Amoxicillin" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dosage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dosage</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 250mg, 1 tablet" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dosageForm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dosage Form</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select dosage form" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="tablet">Tablet</SelectItem>
                      <SelectItem value="capsule">Capsule</SelectItem>
                      <SelectItem value="syrup">Syrup</SelectItem>
                      <SelectItem value="injection">Injection</SelectItem>
                      <SelectItem value="ointment">Ointment</SelectItem>
                      <SelectItem value="drops">Drops</SelectItem>
                      <SelectItem value="patch">Patch</SelectItem>
                      <SelectItem value="inhaler">Inhaler</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="timings" // This field name maps to 'frequency' in the UI
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Frequency</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Once a day">Once a day</SelectItem>
                      <SelectItem value="Twice a day">Twice a day</SelectItem>
                      <SelectItem value="Thrice a day">Thrice a day</SelectItem>
                      <SelectItem value="Every 4 hours">Every 4 hours</SelectItem>
                      <SelectItem value="Every 6 hours">Every 6 hours</SelectItem>
                      <SelectItem value="Every 8 hours">Every 8 hours</SelectItem>
                      <SelectItem value="Every 12 hours">Every 12 hours</SelectItem>
                      <SelectItem value="As needed">As needed</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <FormLabel>Timing</FormLabel>
              {fields.map((field, index) => (
                <FormField
                  key={field.id}
                  control={form.control}
                  name={`specificTimes.${index}.value`}
                  render={({ field: itemField }) => (
                    <FormItem className="flex items-center gap-2 mt-1">
                      <FormControl>
                        <Input type="time" {...itemField} className="w-full" />
                      </FormControl>
                      {fields.length > 1 && (
                        <Button type="button" variant="ghost" size="icon-sm" onClick={() => remove(index)} aria-label="Remove time">
                          <X className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                       {index === fields.length - 1 && (
                         <Button type="button" variant="outline" size="icon-sm" onClick={() => append({ value: "09:00" })} aria-label="Add time">
                           <Plus className="h-4 w-4 text-primary" />
                         </Button>
                       )}
                    </FormItem>
                  )}
                />
              ))}
              <FormDescription className="text-xs mt-1">Add more times if needed (e.g., 8:00 AM, 4:00 PM)</FormDescription>
               {form.formState.errors.specificTimes && !form.formState.errors.specificTimes.message && (
                 <p className="text-sm font-medium text-destructive mt-1">
                   {form.formState.errors.specificTimes.root?.message || form.formState.errors.specificTimes[0]?.value?.message}
                  </p>
               )}
            </div>

            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Start Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date(new Date().setHours(0,0,0,0)) } // Disable past dates
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="durationValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="e.g., 7" 
                        {...field} 
                        value={field.value ?? ""}
                        disabled={watchDurationUnit === "no_end_date"}
                        min="1"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="durationUnit"
                render={({ field }) => (
                  <FormItem className="self-end"> {/* Aligns select with input label */}
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="days">Days</SelectItem>
                        <SelectItem value="weeks">Weeks</SelectItem>
                        <SelectItem value="months">Months</SelectItem>
                        <SelectItem value="no_end_date">No End Date</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="instructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instructions (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Take with food. Avoid dairy products"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="refillReminderEnabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                   <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Remind me to refill</FormLabel>
                  </div>
                  {watchRefillEnabled && (
                    <FormField
                      control={form.control}
                      name="refillDaysBeforeEmpty"
                      render={({ field: refillField }) => (
                        <FormItem className="flex items-center gap-2 ml-auto">
                           <FormControl>
                             <Input 
                              type="number" 
                              placeholder="Days" 
                              className="w-20 h-8" 
                              {...refillField} 
                              value={refillField.value ?? ""}
                              min="1"
                            />
                           </FormControl>
                           <FormLabel className="text-sm !mt-0 text-muted-foreground whitespace-nowrap">days before empty</FormLabel>
                           <FormMessage className="ml-2" />
                        </FormItem>
                      )}
                    />
                  )}
                </FormItem>
              )}
            />


            <FormField
              control={form.control}
              name="medicationShape"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Medication Color/Shape (Optional)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select medication shape" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="round">Round</SelectItem>
                      <SelectItem value="oval">Oval</SelectItem>
                      <SelectItem value="oblong">Oblong</SelectItem>
                      <SelectItem value="square">Square</SelectItem>
                      <SelectItem value="diamond">Diamond</SelectItem>
                      <SelectItem value="triangle">Triangle</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription className="text-xs">Helps to visually identify the medication.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>
                    <Ban className="mr-2 h-4 w-4" /> Cancel
                </Button>
                <Button type="submit" className="bg-primary hover:bg-primary/90">
                    <Save className="mr-2 h-4 w-4" /> Save Reminder
                </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
