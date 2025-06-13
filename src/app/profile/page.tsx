
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Camera, CalendarIcon as CalendarDateIcon, Save, Phone, Settings as SettingsIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

const profileFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional(),
  lastName: z.string().min(1, "Last name is required"),
  dateOfBirth: z.date().optional(),
  gender: z.enum(["male", "female", "other", "prefer_not_to_say"]).optional(),
  primaryPhone: z.string().min(1, "Primary phone is required"), // Basic validation, can be improved
  secondaryPhone: z.string().optional(),
  primaryEmail: z.string().email("Invalid email address"),
  secondaryEmail: z.string().email("Invalid email address").optional(),
  homeAddress: z.string().optional(),
  emergencyContact1Name: z.string().optional(),
  emergencyContact1Phone: z.string().optional(),
  emergencyContact2Name: z.string().optional(),
  emergencyContact2Phone: z.string().optional(),
  preferredLanguage: z.string().optional(),
  heightCm: z.coerce.number().positive("Height must be positive").optional(),
  weightKg: z.coerce.number().positive("Weight must be positive").optional(),
  bloodType: z.enum(["a_pos", "a_neg", "b_pos", "b_neg", "ab_pos", "ab_neg", "o_pos", "o_neg", "unknown"]).optional(),
  chronicConditions: z.string().optional(),
  avatarUrl: z.string().url().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfilePage() {
  const [isMounted, setIsMounted] = useState(false);
  const [calculatedBmi, setCalculatedBmi] = useState<string>("N/A");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: "Kishan",
      middleName: "",
      lastName: "Davis",
      dateOfBirth: new Date("1990-07-22"),
      gender: "male",
      primaryPhone: "(555) 123-4567",
      primaryEmail: "kishan.davis@example.com",
      preferredLanguage: "English, Hindi",
      heightCm: 170,
      weightKg: 70,
      bloodType: "o_pos",
      chronicConditions: "Migraine, Seasonal Allergies",
      avatarUrl: "https://placehold.co/128x128.png",
      emergencyContact1Name: "Jane Doe",
      emergencyContact1Phone: "(555) 987-6543",
      emergencyContact2Name: "John Smith",
      emergencyContact2Phone: "(555) 111-2222",
    },
  });

  const heightCm = form.watch("heightCm");
  const weightKg = form.watch("weightKg");

  useEffect(() => {
    if (heightCm && weightKg && heightCm > 0 && weightKg > 0) {
      const heightM = heightCm / 100;
      const bmi = weightKg / (heightM * heightM);
      setCalculatedBmi(bmi.toFixed(1));
    } else {
      setCalculatedBmi("N/A");
    }
  }, [heightCm, weightKg]);


  function onSubmit(data: ProfileFormValues) {
    console.log(data);
    // Handle profile update logic here
    // If data.avatarUrl is a Data URL, you might want to upload it to a storage service
    // and replace data.avatarUrl with the actual stored image URL before saving to a database.
    toast({
      title: "Profile Saved",
      description: "Your profile information has been successfully updated.",
    });
  }

  const handleAvatarChangeClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        form.setValue("avatarUrl", reader.result as string, { shouldValidate: true });
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Profile Information</h1>
        <p className="text-muted-foreground">Manage your personal and health-related details.</p>
      </div>

      <div className="flex flex-col items-center space-y-2 mb-8">
        <Avatar className="h-32 w-32">
          <AvatarImage src={form.watch("avatarUrl") || "https://placehold.co/128x128.png"} alt="User Avatar" data-ai-hint="person face" />
          <AvatarFallback>{form.getValues("firstName")?.charAt(0)}{form.getValues("lastName")?.charAt(0)}</AvatarFallback>
        </Avatar>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          style={{ display: "none" }}
        />
        <Button variant="ghost" size="sm" onClick={handleAvatarChangeClick}>
          <Camera className="mr-2 h-4 w-4" />
          Change Picture
        </Button>
      </div>

      <Form {...form} suppressHydrationWarning>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Personal Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-primary">Personal Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField control={form.control} name="firstName" render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl><Input placeholder="e.g., John" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="middleName" render={({ field }) => (
                <FormItem>
                  <FormLabel>Middle Name</FormLabel>
                  <FormControl><Input placeholder="Optional" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="lastName" render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl><Input placeholder="e.g., Doe" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="dateOfBirth" render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date of Birth</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          <CalendarDateIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={field.value} onSelect={field.onChange} captionLayout="dropdown-buttons" fromYear={1900} toYear={new Date().getFullYear()} initialFocus disabled={(date) => date > new Date() || date < new Date("1900-01-01")} />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="gender" render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-primary">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="primaryPhone" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Phone</FormLabel>
                    <FormControl><Input type="tel" placeholder="e.g., (555) 123-4567" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="secondaryPhone" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Secondary Phone (Optional)</FormLabel>
                    <FormControl><Input type="tel" placeholder="Optional" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="primaryEmail" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Email</FormLabel>
                    <FormControl><Input type="email" placeholder="e.g., john.doe@example.com" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="secondaryEmail" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Secondary Email (Optional)</FormLabel>
                    <FormControl><Input type="email" placeholder="Optional" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="homeAddress" render={({ field }) => (
                <FormItem>
                  <FormLabel>Home Address</FormLabel>
                  <FormControl><Textarea placeholder="e.g., 123 Main St, Anytown, USA" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </CardContent>
          </Card>

          {/* Emergency Contacts */}
           <Card>
            <CardHeader className="bg-destructive text-destructive-foreground rounded-t-lg p-3 flex justify-center items-center">
              <a href="tel:108" className="flex items-center gap-2 text-sm font-medium hover:opacity-90 focus:outline-none focus:ring-1 focus:ring-destructive-foreground rounded">
                <Phone className="h-5 w-5" />
                <span>Dial 108 (National Emergency)</span>
              </a>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
              <FormField control={form.control} name="emergencyContact1Name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Emergency Contact 1: Name</FormLabel>
                  <FormControl><Input placeholder="e.g., Jane Doe" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="emergencyContact1Phone" render={({ field }) => (
                <FormItem>
                  <FormLabel>Emergency Contact 1: Phone</FormLabel>
                  <div className="flex items-center gap-2">
                    <FormControl className="flex-grow"><Input type="tel" placeholder="e.g., (555) 987-6543" {...field} /></FormControl>
                    {field.value && (
                      <Button asChild variant="outline" size="icon" className="border-border hover:bg-muted/80 shrink-0">
                        <a href={`tel:${field.value.replace(/\D/g, '')}`}>
                          <Phone className="h-4 w-4 text-foreground" />
                          <span className="sr-only">Call {field.value}</span>
                        </a>
                      </Button>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="emergencyContact2Name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Emergency Contact 2: Name</FormLabel>
                  <FormControl><Input placeholder="e.g., John Smith" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="emergencyContact2Phone" render={({ field }) => (
                <FormItem>
                  <FormLabel>Emergency Contact 2: Phone</FormLabel>
                   <div className="flex items-center gap-2">
                    <FormControl className="flex-grow"><Input type="tel" placeholder="e.g., (555) 111-2222" {...field} /></FormControl>
                    {field.value && (
                       <Button asChild variant="outline" size="icon" className="border-border hover:bg-muted/80 shrink-0">
                        <a href={`tel:${field.value.replace(/\D/g, '')}`}>
                          <Phone className="h-4 w-4 text-foreground" />
                          <span className="sr-only">Call {field.value}</span>
                        </a>
                      </Button>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )} />
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-primary">Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField control={form.control} name="preferredLanguage" render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred Language</FormLabel>
                  <FormControl><Input placeholder="e.g., English, Hindi" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </CardContent>
          </Card>

          {/* Health Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-primary">Health Metrics</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <FormField control={form.control} name="heightCm" render={({ field }) => (
                <FormItem>
                  <FormLabel>Height (cm)</FormLabel>
                  <FormControl><Input type="number" placeholder="e.g., 170" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="weightKg" render={({ field }) => (
                <FormItem>
                  <FormLabel>Weight (kg)</FormLabel>
                  <FormControl><Input type="number" placeholder="e.g., 70" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="bloodType" render={({ field }) => (
                <FormItem>
                  <FormLabel>Blood Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select blood type" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="a_pos">A+</SelectItem>
                      <SelectItem value="a_neg">A-</SelectItem>
                      <SelectItem value="b_pos">B+</SelectItem>
                      <SelectItem value="b_neg">B-</SelectItem>
                      <SelectItem value="ab_pos">AB+</SelectItem>
                      <SelectItem value="ab_neg">AB-</SelectItem>
                      <SelectItem value="o_pos">O+</SelectItem>
                      <SelectItem value="o_neg">O-</SelectItem>
                      <SelectItem value="unknown">Unknown</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
               <FormItem>
                  <FormLabel>BMI</FormLabel>
                  <Input value={calculatedBmi} readOnly className="bg-muted/50 border-input" />
                  <FormDescription className="text-xs">Body Mass Index</FormDescription>
                </FormItem>
            </CardContent>
          </Card>

          {/* Medical Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-primary">Medical Information</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField control={form.control} name="chronicConditions" render={({ field }) => (
                <FormItem>
                  <FormLabel>Chronic Conditions (comma separated)</FormLabel>
                  <FormControl><Textarea placeholder="e.g., Diabetes, Hypertension" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </CardContent>
          </Card>

          <div className="flex justify-end pt-4">
            <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Save className="mr-2 h-4 w-4" /> Save Profile
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
    
