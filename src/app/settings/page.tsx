
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Settings as SettingsIcon, Construction } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="flex items-center gap-3 mb-6">
        <SettingsIcon className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
      </div>
      
      <Card className="w-full shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Construction className="h-6 w-6 text-muted-foreground" />
            Under Development
          </CardTitle>
          <CardDescription>
            We're working hard to bring you a comprehensive settings page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-10">
            <p className="text-lg text-foreground mb-2">
              This section is currently under construction.
            </p>
            <p className="text-muted-foreground">
              Soon, you'll be able to manage your application preferences, notification settings, account details, and more right here.
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
