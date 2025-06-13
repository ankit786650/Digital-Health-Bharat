
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Megaphone, Construction } from "lucide-react";

export default function HealthProgramsPage() {
  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="flex items-center gap-3 mb-6">
        <Megaphone className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold text-foreground">Health Programs</h1>
      </div>
      
      <Card className="w-full shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Construction className="h-6 w-6 text-muted-foreground" />
            Under Development
          </CardTitle>
          <CardDescription>
            We're working on bringing you a comprehensive list of health programs and alerts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-10">
            <p className="text-lg text-foreground mb-2">
              This section is currently under construction.
            </p>
            <p className="text-muted-foreground">
              Soon, you'll be able to find details about local health camps, screenings, subsidies, and other health initiatives here.
            </p>
            <p className="text-muted-foreground mt-4">
              Thank you for your patience!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
