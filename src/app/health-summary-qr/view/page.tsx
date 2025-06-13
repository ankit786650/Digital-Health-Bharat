"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import dynamic from 'next/dynamic';

const DynamicMapComponent = dynamic(() => import('@/components/MapComponent'), { ssr: false });

type HealthSummaryFormValues = {
  fullName: string;
  age?: number;
  sex?: string;
  bloodGroup?: string;
  emergencyContact1Name?: string;
  emergencyContact1Phone?: string;
  emergencyContact2Name?: string;
  emergencyContact2Phone?: string;
  lastMedications?: Array<{
    name: string;
    date: string;
    time: string;
  }>;
  nextAppointment?: {
    date: string;
    time: string;
    doctorName: string;
  };
  healthRecordUrl?: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
};

export default function HealthSummaryView() {
  const [healthData, setHealthData] = useState<HealthSummaryFormValues | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Get data from URL parameters
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const dataParam = urlParams.get('data');
      
      if (dataParam) {
        try {
          const decodedData = JSON.parse(decodeURIComponent(dataParam));
          setHealthData(decodedData);
        } catch (error) {
          console.error('Error parsing health data:', error);
          toast({
            title: "Error",
            description: "Could not load health summary data.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "No Data",
          description: "No health summary data found.",
          variant: "destructive",
        });
      }
    }
  }, [toast]);

  const handlePdfDownload = async (data: HealthSummaryFormValues) => {
    const { jsPDF } = await import('jspdf');
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();

    // Add title
    pdf.setFontSize(20);
    pdf.text('Health Summary', pageWidth/2, 20, { align: 'center' });

    // Add health information
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

    // Emergency contacts
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
      yPos += 10;
    }

    // Location
    if (data.location) {
      yPos += 5;
      pdf.setFontSize(14);
      pdf.text('Location', 20, yPos);
      pdf.setFontSize(12);
      yPos += 10;
      pdf.text(`Latitude: ${data.location.latitude}`, 20, yPos);
      yPos += 10;
      pdf.text(`Longitude: ${data.location.longitude}`, 20, yPos);
      yPos += 10;
      if (data.location.address) {
        pdf.text(`Address: ${data.location.address}`, 20, yPos);
        yPos += 10;
      }
    }

    // Last Medications
    if (data.lastMedications && data.lastMedications.length > 0) {
      yPos += 5;
      pdf.setFontSize(14);
      pdf.text('Last Medications', 20, yPos);
      pdf.setFontSize(12);
      yPos += 10;
      data.lastMedications.forEach(med => {
        pdf.text(`${med.name} - ${med.date} ${med.time}`, 20, yPos);
        yPos += 10;
      });
    }

    // Next Appointment
    if (data.nextAppointment) {
      yPos += 5;
      pdf.setFontSize(14);
      pdf.text('Next Appointment', 20, yPos);
      pdf.setFontSize(12);
      yPos += 10;
      pdf.text(`Date: ${data.nextAppointment.date}`, 20, yPos);
      yPos += 10;
      pdf.text(`Time: ${data.nextAppointment.time}`, 20, yPos);
      yPos += 10;
      pdf.text(`Doctor: ${data.nextAppointment.doctorName}`, 20, yPos);
    }

    // Save PDF
    pdf.save('health-summary.pdf');
    toast({
      title: "PDF Downloaded",
      description: "Health summary has been saved as PDF.",
    });
  };

  if (!healthData) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="py-8">
            <p className="text-center">Loading health summary...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Health Summary</CardTitle>
          <CardDescription>View and download your health information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Personal Information</h3>
            <p>Full Name: {healthData.fullName}</p>
            {healthData.age && <p>Age: {healthData.age}</p>}
            {healthData.sex && <p>Sex: {healthData.sex}</p>}
            {healthData.bloodGroup && <p>Blood Group: {healthData.bloodGroup}</p>}
          </div>

          {(healthData.emergencyContact1Name || healthData.emergencyContact2Name) && (
            <div>
              <h3 className="font-semibold mb-2">Emergency Contacts</h3>
              {healthData.emergencyContact1Name && healthData.emergencyContact1Phone && (
                <p>1. {healthData.emergencyContact1Name}: {healthData.emergencyContact1Phone}</p>
              )}
              {healthData.emergencyContact2Name && healthData.emergencyContact2Phone && (
                <p>2. {healthData.emergencyContact2Name}: {healthData.emergencyContact2Phone}</p>
              )}
            </div>
          )}

          {healthData.location && (
            <div>
              <h3 className="font-semibold mb-2">Location</h3>
              <DynamicMapComponent 
                latitude={healthData.location.latitude}
                longitude={healthData.location.longitude}
                zoom={12}
              />
              {healthData.location.address && (
                <p className="mt-2">Address: {healthData.location.address}</p>
              )}
            </div>
          )}

          {healthData.lastMedications && healthData.lastMedications.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Last Medications</h3>
              {healthData.lastMedications.map((med, index) => (
                <p key={index}>{med.name} - {med.date} {med.time}</p>
              ))}
            </div>
          )}

          {healthData.nextAppointment && (
            <div>
              <h3 className="font-semibold mb-2">Next Appointment</h3>
              <p>Date: {healthData.nextAppointment.date}</p>
              <p>Time: {healthData.nextAppointment.time}</p>
              <p>Doctor: {healthData.nextAppointment.doctorName}</p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={() => handlePdfDownload(healthData)} className="w-full" variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            Download as PDF
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 