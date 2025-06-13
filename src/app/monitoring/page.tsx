
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PenLine, Save, Smile, Meh, Frown, AlertCircle, BellRing, LineChart, Pill as PillIcon, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";

const feelingEmojis = ["😄", "😊", "😐", "😟", "😞"];
const medicationEmojis = ["👍", "🙂", "😐", "🙁", "👎"];

const mockMedications = [
  { id: "med1", name: "Lisinopril (20mg)" },
  { id: "med2", name: "Amoxicillin (500mg)" },
  { id: "med3", name: "Metformin (1000mg)" },
];

interface ActivityItem {
  id: string;
  date: string; // ISO string
  type: "Symptom Log" | "Medication Correlation";
  details: string;
  moodEmoji: string;
}

export default function MedicineSideEffectsMonitorPage() {
  const { toast } = useToast();
  const [selectedFeeling, setSelectedFeeling] = useState<string | null>(null);
  const [symptomDescription, setSymptomDescription] = useState("");
  const [selectedMedication, setSelectedMedication] = useState<string>("");
  const [medicationExperience, setMedicationExperience] = useState<string | null>(null);

  const [symptomAlertsEnabled, setSymptomAlertsEnabled] = useState(true);
  const [medicationRemindersEnabled, setMedicationRemindersEnabled] = useState(false);

  const [activities, setActivities] = useState<ActivityItem[]>([]);

  const handleLogSymptom = () => {
    if (!selectedFeeling) {
      toast({ title: "Feeling not selected", description: "Please select how you are feeling.", variant: "destructive" });
      return;
    }
    if (!symptomDescription.trim()) {
      toast({ title: "Description empty", description: "Please describe your symptoms.", variant: "destructive" });
      return;
    }
    
    const newActivity: ActivityItem = {
      id: `activity-${Date.now()}`,
      date: new Date().toISOString(),
      type: "Symptom Log",
      details: symptomDescription,
      moodEmoji: selectedFeeling,
    };
    setActivities(prevActivities => [newActivity, ...prevActivities]);

    toast({
      title: "Symptom Logged",
      description: `Feeling: ${selectedFeeling}, Description: ${symptomDescription}`,
    });
    // Reset form
    setSelectedFeeling(null);
    setSymptomDescription("");
  };

  const handleSaveCorrelation = () => {
     if (!selectedMedication) {
      toast({ title: "Medication not selected", description: "Please select a medication.", variant: "destructive" });
      return;
    }
    if (!medicationExperience) {
      toast({ title: "Experience not rated", description: "Please rate your experience with the medication.", variant: "destructive" });
      return;
    }

    const medicationName = mockMedications.find(m => m.id === selectedMedication)?.name || "Unknown Medication";
    const newActivity: ActivityItem = {
      id: `activity-${Date.now()}`,
      date: new Date().toISOString(),
      type: "Medication Correlation",
      details: medicationName,
      moodEmoji: medicationExperience,
    };
    setActivities(prevActivities => [newActivity, ...prevActivities]);

    toast({
      title: "Correlation Saved",
      description: `Medication: ${medicationName}, Experience: ${medicationExperience}`,
    });
     // Reset form
    setSelectedMedication("");
    setMedicationExperience(null);
  };

  const handleViewReport = (reportType: string) => {
    toast({
        title: `${reportType} Report`,
        description: `Viewing the ${reportType.toLowerCase()} report is coming soon!`,
    });
  };


  return (
    <div className="container mx-auto py-8 px-4 md:px-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Medicine Side Effects Monitor</h1>
        <p className="text-muted-foreground mt-1">
          Track and manage your symptoms and medication side effects.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* How are you feeling today? Card */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>How are you feeling today?</CardTitle>
                <span className="text-sm text-muted-foreground">Log your current symptoms</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-around items-center space-x-2">
                {feelingEmojis.map((emoji) => (
                  <Button
                    key={emoji}
                    variant={selectedFeeling === emoji ? "default" : "outline"}
                    size="lg"
                    onClick={() => setSelectedFeeling(emoji)}
                    className="text-2xl p-3 aspect-square hover:bg-primary/10 data-[state=selected]:bg-primary data-[state=selected]:text-primary-foreground"
                  >
                    {emoji}
                  </Button>
                ))}
              </div>
              <Textarea
                placeholder="Describe your symptoms in detail (e.g., headache, nausea, fatigue...)"
                value={symptomDescription}
                onChange={(e) => setSymptomDescription(e.target.value)}
                rows={4}
              />
              <Button onClick={handleLogSymptom} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                <PenLine className="mr-2 h-4 w-4" />
                Log Symptom
              </Button>
            </CardContent>
          </Card>

          {/* Medication Correlation Card */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Medication Correlation</CardTitle>
                 <span className="text-sm text-muted-foreground">How did this medication make you feel?</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                <div className="space-y-1">
                    <Label htmlFor="medication-select">Select Medication</Label>
                    <Select value={selectedMedication} onValueChange={setSelectedMedication}>
                        <SelectTrigger id="medication-select">
                        <SelectValue placeholder="Choose a medication" />
                        </SelectTrigger>
                        <SelectContent>
                        {mockMedications.map((med) => (
                            <SelectItem key={med.id} value={med.id}>
                            {med.name}
                            </SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                </div>
                 <div className="space-y-1">
                    <Label className="block text-center md:text-left mb-1">Rate Experience</Label>
                    <div className="flex justify-center items-center gap-2">
                        {medicationEmojis.map((emoji) => (
                        <Button
                            key={emoji}
                            variant={medicationExperience === emoji ? "default" : "outline"}
                            onClick={() => setMedicationExperience(emoji)}
                            className="text-xl p-1.5 aspect-square hover:bg-primary/10 data-[state=selected]:bg-primary data-[state=selected]:text-primary-foreground rounded-md flex items-center justify-center h-9 w-9"
                        >
                            {emoji}
                        </Button>
                        ))}
                    </div>
                 </div>
              </div>
              <Button onClick={handleSaveCorrelation} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                <Save className="mr-2 h-4 w-4" />
                Save Correlation
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Alerts & Notifications Card */}
          <Card>
            <CardHeader>
              <CardTitle>Alerts & Notifications</CardTitle>
              <CardDescription>
                Stay informed about important changes and patterns.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:shadow-sm transition-shadow">
                <div>
                  <p className="font-medium text-card-foreground">Symptom Alerts</p>
                  <p className="text-xs text-muted-foreground">
                    Receive notifications for concerning symptom patterns.
                  </p>
                </div>
                <Switch
                  checked={symptomAlertsEnabled}
                  onCheckedChange={setSymptomAlertsEnabled}
                  aria-label="Toggle symptom alerts"
                />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:shadow-sm transition-shadow">
                <div>
                  <p className="font-medium text-card-foreground">Medication Reminders</p>
                  <p className="text-xs text-muted-foreground">
                    Get reminders for your medication schedule.
                  </p>
                </div>
                <Switch
                  checked={medicationRemindersEnabled}
                  onCheckedChange={setMedicationRemindersEnabled}
                  aria-label="Toggle medication reminders"
                />
              </div>
            </CardContent>
          </Card>

           {/* Symptom & Medication Reports Card */}
          <Card>
            <CardHeader>
              <CardTitle>Symptom & Medication Reports</CardTitle>
              <CardDescription>
                View detailed reports and trends based on your logged data.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={() => handleViewReport("Symptom")} variant="outline" className="w-full">
                <LineChart className="mr-2 h-4 w-4" />
                View Symptom Report
              </Button>
              <Button onClick={() => handleViewReport("Medication")} variant="outline" className="w-full">
                <PillIcon className="mr-2 h-4 w-4" />
                View Medication Report
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Activity Card */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>DATE</TableHead>
                <TableHead>TYPE</TableHead>
                <TableHead>DETAILS</TableHead>
                <TableHead className="text-right">FEELING/RATING</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activities.length > 0 ? (
                activities.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell className="font-medium">{format(new Date(activity.date), "MMM d, yyyy - HH:mm")}</TableCell>
                    <TableCell>{activity.type}</TableCell>
                    <TableCell>{activity.details}</TableCell>
                    <TableCell className="text-right text-xl">{activity.moodEmoji}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    <div className="flex flex-col items-center gap-2">
                      <Package className="h-10 w-10" />
                      <span>No recent activity.</span>
                      <span className="text-xs">Log your symptoms or medication experiences above.</span>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

