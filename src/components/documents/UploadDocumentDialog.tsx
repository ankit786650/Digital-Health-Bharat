
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, UploadCloud } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "application/pdf"];

const documentUploadFormSchema = z.object({
  documentFile: z.custom<File>((val) => val instanceof File, "Please upload a document file.")
    .refine((file) => file.size <= MAX_FILE_SIZE, `Max file size is 10MB.`)
    .refine((file) => ALLOWED_FILE_TYPES.includes(file.type), "Only .jpg, .png, and .pdf files are accepted."),
  documentType: z.enum(["lab_report", "prescription", "medical_imaging", "consultation_notes", "discharge_summary", "vaccination_document", "insurance_document", "other"], {
    required_error: "Document type is required.",
  }),
  documentDate: z.date({ required_error: "Document date is required." }),
  doctorName: z.string().optional(),
  documentTitle: z.string().min(1, "Document title is required."),
  visitReason: z.enum(["routine_checkup", "follow_up", "symptoms_consultation", "emergency", "health_screening", "vaccination", "other"]).optional(),
});

export type DocumentUploadFormValues = z.infer<typeof documentUploadFormSchema>;

interface UploadDocumentDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmitDocument: (data: DocumentUploadFormValues) => void;
  userName?: string;
}

export function UploadDocumentDialog({ isOpen, onOpenChange, onSubmitDocument, userName }: UploadDocumentDialogProps) {
  const { toast } = useToast();
  const [fileName, setFileName] = useState<string | null>(null);

  const form = useForm<DocumentUploadFormValues>({
    resolver: zodResolver(documentUploadFormSchema),
    defaultValues: {
      documentType: undefined,
      documentDate: new Date(),
      doctorName: "",
      documentTitle: "",
      visitReason: undefined,
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      form.setValue("documentFile", file, { shouldValidate: true });
      setFileName(file.name);
    } else {
      form.setValue("documentFile", undefined as any, { shouldValidate: true }); // Clear value if no file
      setFileName(null);
    }
  };

  function onSubmit(data: DocumentUploadFormValues) {
    onSubmitDocument(data);
    form.reset({
        documentType: undefined,
        documentDate: new Date(),
        doctorName: "",
        documentTitle: "",
        visitReason: undefined,
    });
    setFileName(null);
    onOpenChange(false); // Close dialog on submit
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Hi {userName || 'User'}, please fill it</DialogTitle>
          <DialogDescription>
            Provide details for the document you are uploading.
            Accepted formats: JPG, PDF, PNG (max 10MB).
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
            <FormField
              control={form.control}
              name="documentFile"
              render={() => ( // No 'field' needed from render if we manually handle with onChange
                <FormItem>
                  <FormLabel>Document File</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept={ALLOWED_FILE_TYPES.join(",")}
                      onChange={handleFileChange}
                      className="file:text-primary file:font-semibold"
                    />
                  </FormControl>
                  {fileName && <FormDescription>Selected: {fileName}</FormDescription>}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="documentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Document Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select document type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="lab_report">Lab Report</SelectItem>
                      <SelectItem value="prescription">Prescription</SelectItem>
                      <SelectItem value="medical_imaging">Medical Imaging</SelectItem>
                      <SelectItem value="consultation_notes">Consultation Notes</SelectItem>
                      <SelectItem value="discharge_summary">Discharge Summary</SelectItem>
                      <SelectItem value="vaccination_document">Vaccination Document</SelectItem>
                      <SelectItem value="insurance_document">Insurance Document</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="documentDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Document Date</FormLabel>
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
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="documentTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Document Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Blood Test Report, X-Ray Left Knee" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="doctorName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Doctor Name (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Dr. Priya Sharma" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="visitReason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Visit Reason (Optional)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select reason for visit" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="routine_checkup">Routine Checkup</SelectItem>
                      <SelectItem value="follow_up">Follow-up Visit</SelectItem>
                      <SelectItem value="symptoms_consultation">Symptoms Consultation</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                      <SelectItem value="health_screening">Health Screening</SelectItem>
                      <SelectItem value="vaccination">Vaccination</SelectItem>
                       <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
                <UploadCloud className="mr-2 h-4 w-4" />
                Upload & Save
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
