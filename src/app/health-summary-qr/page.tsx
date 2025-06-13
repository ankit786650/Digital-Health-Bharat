"use client";

import { useState, useRef, useEffect } from "react";
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Download, QrCode as QrCodeIcon, ShieldAlert, Info, AlertCircle, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import dynamic from 'next/dynamic';

const DynamicMapComponent = dynamic(() => import('@/components/MapComponent'), { ssr: false });
const DynamicQRCodeCanvas = dynamic(() => import('qrcode.react').then(mod => mod.QRCodeCanvas), { ssr: false });

const healthSummarySchema = z.object({
  fullName: z.string().min(1, "Full name is required."),
  age: z.coerce.number().int().positive("Age must be a positive number.").min(0).max(150).optional(),
  sex: z.enum(["Male", "Female", "Other"], {
    required_error: "Sex is required.",
  }).optional(),
  bloodGroup: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"], {
    required_error: "Blood group is required.",
  }).optional(),
  emergencyContact1Name: z.string().optional(),
  emergencyContact1Phone: z.string().optional(),
  emergencyContact2Name: z.string().optional(),
  emergencyContact2Phone: z.string().optional(),
  lastMedications: z.array(z.object({
    name: z.string(),
    date: z.string(),
    time: z.string(),
  })).optional(),
  nextAppointment: z.object({
    date: z.string(),
    time: z.string(),
    doctorName: z.string(),
  }).optional(),
  healthRecordUrl: z.string().url().optional(),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
    address: z.string().optional(),
  }).optional(),
});

type HealthSummaryFormValues = z.infer<typeof healthSummarySchema>;

// --- Mock Data for new fields ---
const mockLastMedications = [
  { name: "Lisinopril 20mg", date: "2024-07-28", time: "09:00 AM" },
  { name: "Atorvastatin 40mg", date: "2024-07-28", time: "09:00 AM" },
  { name: "Metformin 500mg", date: "2024-07-27", time: "08:00 PM" },
];

const mockNextAppointment = {
  date: "2024-08-15",
  time: "10:30 AM",
  doctorName: "Dr. Emily Carter",
};

const mockHealthRecordUrl = "https://health.example.com/record/user123-xyz";
// --- End Mock Data ---


function calculateAge(dateOfBirth?: Date): number | undefined {
  if (!dateOfBirth) return undefined;
  const today = new Date();
  let age = today.getFullYear() - dateOfBirth.getFullYear();
  const monthDiff = today.getMonth() - dateOfBirth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
    age--;
  }
  return age;
}

function mapProfileGenderToQrSex(gender?: string): "Male" | "Female" | "Other" | undefined {
  if (!gender) return undefined;
  switch (gender.toLowerCase()) {
    case "male": return "Male";
    case "female": return "Female";
    case "other": return "Other";
    default: return undefined;
  }
}

function mapProfileBloodTypeToQrBloodGroup(bloodType?: string): "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-" | "Unknown" | undefined {
  if (!bloodType) return undefined;
  switch (bloodType) {
    case "a_pos": return "A+";
    case "a_neg": return "A-";
    case "b_pos": return "B+";
    case "b_neg": return "B-";
    case "ab_pos": return "AB+";
    case "ab_neg": return "AB-";
    case "o_pos": return "O+";
    case "o_neg": return "O-";
    case "unknown": return "Unknown";
    default: return undefined;
  }
}

const defaultProfileData = {
  firstName: "Kishan",
  middleName: "",
  lastName: "Davis",
  dateOfBirth: new Date("1990-07-22"),
  gender: "male",
  bloodType: "o_pos",
  emergencyContact1Name: "Jane Doe",
  emergencyContact1Phone: "(555) 987-6543",
  emergencyContact2Name: "John Smith",
  emergencyContact2Phone: "(555) 111-2222",
};

export default function HealthSummaryQrPage() {
  const [qrData, setQrData] = useState<string | null>(null);
  const qrCanvasRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [scannedData, setScannedData] = useState<HealthSummaryFormValues | null>(null);

  const constructedFullName = `${defaultProfileData.firstName}${defaultProfileData.middleName ? ` ${defaultProfileData.middleName}` : ""} ${defaultProfileData.lastName}`;
  const mappedSex = mapProfileGenderToQrSex(defaultProfileData.gender);
  const mappedBloodGroup = mapProfileBloodTypeToQrBloodGroup(defaultProfileData.bloodType);
  const clientCalculatedAge = calculateAge(defaultProfileData.dateOfBirth);

  const initialLocationDefaults = {
    latitude: 0,
    longitude: 0,
    address: "",
  };

  const form = useForm<HealthSummaryFormValues>({
    resolver: zodResolver(healthSummarySchema),
    defaultValues: {
      fullName: constructedFullName || "",
      age: clientCalculatedAge,
      sex: mappedSex,
      bloodGroup: mappedBloodGroup,
      emergencyContact1Name: defaultProfileData.emergencyContact1Name || "",
      emergencyContact1Phone: defaultProfileData.emergencyContact1Phone || "",
      emergencyContact2Name: defaultProfileData.emergencyContact2Name || "",
      emergencyContact2Phone: defaultProfileData.emergencyContact2Phone || "",
      lastMedications: mockLastMedications,
      nextAppointment: mockNextAppointment,
      healthRecordUrl: mockHealthRecordUrl,
      location: initialLocationDefaults,
    },
  });

  const [selectedLocation, setSelectedLocation] = useState<{latitude: number; longitude: number} | null>(initialLocationDefaults);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const qrDataFromUrl = urlParams.get('data');
      
      if (qrDataFromUrl) {
        try {
          const parsedData = JSON.parse(decodeURIComponent(qrDataFromUrl));
          setScannedData(parsedData);
        } catch (error) {
          console.error('Error parsing QR data from URL:', error);
        }
      }
    }
  }, [setScannedData]);

  function onSubmit(data: HealthSummaryFormValues) {
    const baseUrl = "http://192.168.1.4:3000"; // Replace with your computer's IP address
    const encodedData = encodeURIComponent(JSON.stringify(data));
    const qrUrl = `${baseUrl}/health-summary-qr/view?data=${encodedData}`;
    setQrData(qrUrl);
    toast({
      title: "QR Code Generated",
      description: "Your health summary QR code is ready. When scanned, it will show your health information.",
    });
  }

  const handlePdfDownload = async (data: HealthSummaryFormValues) => {
    const { jsPDF } = await import('jspdf');
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();

    pdf.setFontSize(20);
    pdf.text('Health Summary', pageWidth/2, 20, { align: 'center' });

    pdf.setFontSize(12);
    let yPos = 40;

    pdf.text(`Full Name: ${data.fullName}`, 20, yPos);
    yPos += 10;
    if (data.age) {
      pdf.text(`Age: ${data.age}`, 20, yPos);
      yPos += 10;
    }
    if (data.sex) {
      pdf.text(`Sex: ${data.sex}`, 20, yPos);
      yPos += 10;
    }
    if (data.bloodGroup) {
      pdf.text(`Blood Group: ${data.bloodGroup}`, 20, yPos);
      yPos += 10;
    }

    yPos += 5;
    pdf.setFontSize(14);
    pdf.text('Emergency Contacts', 20, yPos);
    pdf.setFontSize(12);
    yPos += 10;
    if (data.emergencyContact1Name && data.emergencyContact1Phone) {
      pdf.text(`1. ${data.emergencyContact1Name}: ${data.emergencyContact1Phone}`, 20, yPos);
      yPos += 10;
    }
    if (data.emergencyContact2Name && data.emergencyContact2Phone) {
      pdf.text(`2. ${data.emergencyContact2Name}: ${data.emergencyContact2Phone}`, 20, yPos);
    }

    pdf.save('health-summary.pdf');
    toast({
      title: "PDF Downloaded",
      description: "Health summary has been saved as PDF.",
    });
  };

  const handleLatitudeChange = (value: number) => {
    form.setValue('location.latitude', value, { shouldValidate: true });
    setSelectedLocation(prev => prev ? { ...prev, latitude: value } : { latitude: value, longitude: form.getValues().location?.longitude || 0 });
  };

  const handleLongitudeChange = (value: number) => {
    form.setValue('location.longitude', value, { shouldValidate: true });
    setSelectedLocation(prev => prev ? { ...prev, longitude: value } : { longitude: value, latitude: form.getValues().location?.latitude || 0 });
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 space-y-8">
      {scannedData && (
        <Card>
          <CardHeader>
            <CardTitle>Scanned Health Summary</CardTitle>
            <CardDescription>Health information from QR code</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold">Personal Information</h3>
              <p>Full Name: {scannedData.fullName}</p>
              {scannedData.age && <p>Age: {scannedData.age}</p>}
              {scannedData.sex && <p>Sex: {scannedData.sex}</p>}
              {scannedData.bloodGroup && <p>Blood Group: {scannedData.bloodGroup}</p>}
            </div>
            {(scannedData.emergencyContact1Name || scannedData.emergencyContact2Name) && (
              <div>
                <h3 className="font-semibold">Emergency Contacts</h3>
                {scannedData.emergencyContact1Name && scannedData.emergencyContact1Phone && (
                  <p>1. {scannedData.emergencyContact1Name}: {scannedData.emergencyContact1Phone}</p>
                )}
                {scannedData.emergencyContact2Name && scannedData.emergencyContact2Phone && (
                  <p>2. {scannedData.emergencyContact2Name}: {scannedData.emergencyContact2Phone}</p>
                )}
              </div>
            )}
            {scannedData.lastMedications && scannedData.lastMedications.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Last Medications</h3>
                {scannedData.lastMedications.map((med, index) => (
                  <p key={index}>{med.name} - {med.date} {med.time}</p>
                ))}
              </div>
            )}

            {scannedData.nextAppointment && (
              <div>
                <h3 className="font-semibold mb-2">Next Appointment</h3>
                <p>Date: {scannedData.nextAppointment.date}</p>
                <p>Time: {scannedData.nextAppointment.time}</p>
                <p>Doctor: {scannedData.nextAppointment.doctorName}</p>
              </div>
            )}
            {scannedData.location && (
              <div>
                <h3 className="font-semibold mb-2">Location</h3>
                <DynamicMapComponent 
                  latitude={scannedData.location.latitude}
                  longitude={scannedData.location.longitude}
                  zoom={12}
                />
                {scannedData.location.address && (
                  <p className="mt-2">Address: {scannedData.location.address}</p>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={() => handlePdfDownload(scannedData)} className="w-full" variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Download as PDF
            </Button>
          </CardFooter>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Generate Health Summary QR Code</CardTitle>
          <CardDescription>
            Fill in your health information to generate a QR code.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g., 30"
                        {...field}
                        value={field.value ?? ''}
                        onChange={e => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sex"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sex</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""} defaultValue={field.value || ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select sex" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bloodGroup"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Blood Group</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""} defaultValue={field.value || ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select blood group" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="A+">A+</SelectItem>
                        <SelectItem value="A-">A-</SelectItem>
                        <SelectItem value="B+">B+</SelectItem>
                        <SelectItem value="B-">B-</SelectItem>
                        <SelectItem value="AB+">AB+</SelectItem>
                        <SelectItem value="AB-">AB-</SelectItem>
                        <SelectItem value="O+">O+</SelectItem>
                        <SelectItem value="O-">O-</SelectItem>
                        <SelectItem value="Unknown">Unknown</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="emergencyContact1Name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Emergency Contact 1: Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Jane Doe" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="emergencyContact1Phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Emergency Contact 1: Phone</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="e.g., (555) 987-6543" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="emergencyContact2Name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Emergency Contact 2: Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., John Smith" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="emergencyContact2Phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Emergency Contact 2: Phone</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="e.g., (555) 111-2222" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Location Information Card */}
              <Card className="border-none shadow-none mt-6"> 
                <CardHeader className="px-0 pt-0 pb-4"> 
                  <CardTitle>Location Information</CardTitle> 
                  <CardDescription>Add your location for emergency services</CardDescription> 
                </CardHeader> 
                <CardContent className="space-y-4 px-0 pb-0"> 
                  <DynamicMapComponent 
                    latitude={selectedLocation?.latitude || 12.9716} 
                    longitude={selectedLocation?.longitude || 77.5946}
                    zoom={12}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="location.latitude"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Latitude</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="any"
                              {...field}
                              value={field.value || ''}
                              onChange={(e) => {
                                const value = parseFloat(e.target.value);
                                if (!isNaN(value)) {
                                  field.onChange(value);
                                  handleLatitudeChange(value);
                                }
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="location.longitude"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Longitude</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="any"
                              {...field}
                              value={field.value || ''}
                              onChange={(e) => {
                                const value = parseFloat(e.target.value);
                                if (!isNaN(value)) {
                                  field.onChange(value);
                                  handleLongitudeChange(value);
                                }
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="location.address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your address" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                <QrCodeIcon className="mr-2 h-4 w-4" />
                Generate QR Code
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {qrData && (
        <Card>
          <CardHeader>
            <CardTitle>Your Health Summary QR Code</CardTitle>
            <CardDescription>Scan this QR code to view and download your health summary</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <div ref={qrCanvasRef} className="p-4 bg-white rounded-lg shadow-lg">
              <DynamicQRCodeCanvas
                value={qrData}
                size={300}
                level="L"
                includeMargin={true}
                bgColor="#FFFFFF"
                fgColor="#000000"
              />
            </div>
            <div className="text-sm text-muted-foreground text-center max-w-xs">
              Scan this QR code with your phone's camera to view your health summary
            </div>
            <Button
              onClick={() => {
                if (qrCanvasRef.current) {
                  const canvas = qrCanvasRef.current.querySelector('canvas');
                  if (canvas) {
                    const link = document.createElement('a');
                    link.download = 'health-summary-qr.png';
                    link.href = canvas.toDataURL('image/png');
                    link.click();
                  }
                }
              }}
              variant="outline"
            >
              <Download className="mr-2 h-4 w-4" />
              Download QR Code
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

