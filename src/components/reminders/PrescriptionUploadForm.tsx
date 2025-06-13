"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { MedicationReminder } from "@/lib/types";
import { processPrescriptionImage, ProcessPrescriptionResult } from "@/lib/actions";
import { extractMedicationDetailsFromImage } from "@/lib/gemini";
import { UploadCloud, Loader2, X, ScanLine } from "lucide-react"; // Added ScanLine
import Image from "next/image";

interface PrescriptionUploadFormProps {
  onRemindersGenerated: (reminders: MedicationReminder[]) => void;
  onCancel: () => void;
}

export function PrescriptionUploadForm({ onRemindersGenerated, onCancel }: PrescriptionUploadFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedFile(null);
      setFilePreview(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedFile || !filePreview) {
      toast({
        title: "No file selected",
        description: "Please select a prescription image to upload.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    try {
      // Use Gemini API directly
      const geminiResult = await extractMedicationDetailsFromImage(selectedFile);
      if (geminiResult && geminiResult.length > 0) {
        // Map Gemini result to MedicationReminder[]
        const reminders = geminiResult.map((med: any, idx: number) => ({
          id: `ai-gemini-${Date.now()}-${idx}`,
          name: med.name || "Unknown",
          dosage: med.dosage || "",
          timings: med.frequency || med.timings || "",
          isGenerated: true,
        }));
        onRemindersGenerated(reminders);
        toast({
          title: "Success!",
          description: `${reminders.length} medication reminder(s) extracted.`,
        });
        setSelectedFile(null);
        setFilePreview(null);
      } else {
        toast({
          title: "No medications found",
          description: "The AI could not find any medication details in the image.",
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Error processing prescription upload:", error);
      toast({
        title: "Upload Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full shadow-lg border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle className="flex items-center gap-2 text-xl"><UploadCloud className="text-primary h-5 w-5" />Scan Prescription (AI Powered)</CardTitle>
            <CardDescription className="mt-1">
            Upload an image of your prescription. Our AI will try to extract medication details.
            </CardDescription>
        </div>
         <Button variant="ghost" size="icon-sm" onClick={onCancel} aria-label="Close form">
            <X className="h-5 w-5" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1.5">
            <Label htmlFor="prescription-file">Prescription Image</Label>
            <Input
              id="prescription-file"
              type="file"
              accept="image/png, image/jpeg, image/jpg"
              onChange={handleFileChange}
              className="file:text-sm file:font-medium file:text-primary file:bg-primary-foreground hover:file:bg-primary/10"
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">Supported formats: PNG, JPG, JPEG.</p>
          </div>

          {filePreview && (
            <div className="mt-4 border rounded-md p-2 relative bg-muted/20 border-border">
              <p className="text-sm font-medium mb-2 text-foreground">Preview:</p>
              <Image
                src={filePreview}
                alt="Prescription preview"
                width={300}
                height={200}
                className="rounded-md object-contain max-h-48 w-auto mx-auto"
                data-ai-hint="prescription image"
              />
               <Button 
                variant="ghost" 
                size="icon-xs" 
                className="absolute top-1 right-1 bg-card hover:bg-muted"
                onClick={() => {setSelectedFile(null); setFilePreview(null);}}
                type="button"
                aria-label="Clear preview"
               >
                <X className="h-3 w-3"/>
               </Button>
            </div>
          )}
            <div className="flex justify-end gap-3 pt-2">
                 <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                     Cancel
                </Button>
                <Button type="submit" disabled={isLoading || !selectedFile} className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-[120px]">
                    {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                    <ScanLine className="mr-2 h-4 w-4" /> 
                    )}
                    {isLoading ? "Processing..." : "Extract Details"}
                </Button>
            </div>
        </form>
      </CardContent>
    </Card>
  );
}
