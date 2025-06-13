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
import { PenLine, Save, LineChart, Pill, Bell, AlertCircle, CalendarClock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

const feelingOptions = [
  { emoji: "😄", label: "Excellent", color: "bg-emerald-100 text-emerald-800" },
  { emoji: "😊", label: "Good", color: "bg-teal-100 text-teal-800" },
  { emoji: "😐", label: "Neutral", color: "bg-amber-100 text-amber-800" },
  { emoji: "😟", label: "Poor", color: "bg-orange-100 text-orange-800" },
  { emoji: "😞", label: "Severe", color: "bg-rose-100 text-rose-800" },
];

const experienceOptions = [
  { emoji: "👍", label: "Very Positive", color: "bg-emerald-100 text-emerald-800" },
  { emoji: "🙂", label: "Positive", color: "bg-teal-100 text-teal-800" },
  { emoji: "😐", label: "Neutral", color: "bg-amber-100 text-amber-800" },
  { emoji: "🙁", label: "Negative", color: "bg-orange-100 text-orange-800" },
  { emoji: "👎", label: "Very Negative", color: "bg-rose-100 text-rose-800" },
];

const mockMedications = [
  { id: "med1", name: "Lisinopril", dosage: "20mg", type: "Blood Pressure" },
  { id: "med2", name: "Amoxicillin", dosage: "500mg", type: "Antibiotic" },
  { id: "med3", name: "Metformin", dosage: "1000mg", type: "Diabetes" },
];

interface ActivityItem {
  id: string;
  date: string;
  type: "Symptom Log" | "Medication Correlation";
  details: string;
  moodEmoji: string;
  moodLabel: string;
}

export default function MedicineSideEffectsMonitorPage() {
  const { toast } = useToast();
  const [selectedFeeling, setSelectedFeeling] = useState<{emoji: string, label: string} | null>(null);
  const [symptomDescription, setSymptomDescription] = useState("");
  const [selectedMedication, setSelectedMedication] = useState("");
  const [medicationExperience, setMedicationExperience] = useState<{emoji: string, label: string} | null>(null);
  const [symptomAlertsEnabled, setSymptomAlertsEnabled] = useState(true);
  const [medicationRemindersEnabled, setMedicationRemindersEnabled] = useState(false);
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  const handleLogSymptom = () => {
    if (!selectedFeeling) {
      toast({
        title: "Missing Information",
        description: "Please select how you are feeling.",
        variant: "destructive",
        action: <AlertCircle className="h-5 w-5" />
      });
      return;
    }
    if (!symptomDescription.trim()) {
      toast({
        title: "Missing Information",
        description: "Please describe your symptoms.",
        variant: "destructive",
        action: <AlertCircle className="h-5 w-5" />
      });
      return;
    }
    
    const newActivity: ActivityItem = {
      id: `activity-${Date.now()}`,
      date: new Date().toISOString(),
      type: "Symptom Log",
      details: symptomDescription,
      moodEmoji: selectedFeeling.emoji,
      moodLabel: selectedFeeling.label
    };
    
    setActivities(prev => [newActivity, ...prev]);
    setSelectedFeeling(null);
    setSymptomDescription("");

    toast({
      title: "Symptom Logged Successfully",
      description: "Your symptoms have been recorded for tracking.",
      action: <Bell className="h-5 w-5" />
    });
  };

  const handleSaveCorrelation = () => {
    if (!selectedMedication) {
      toast({
        title: "Missing Information",
        description: "Please select a medication.",
        variant: "destructive",
        action: <AlertCircle className="h-5 w-5" />
      });
      return;
    }
    if (!medicationExperience) {
      toast({
        title: "Missing Information",
        description: "Please rate your medication experience.",
        variant: "destructive",
        action: <AlertCircle className="h-5 w-5" />
      });
      return;
    }

    const medication = mockMedications.find(m => m.id === selectedMedication);
    const newActivity: ActivityItem = {
      id: `activity-${Date.now()}`,
      date: new Date().toISOString(),
      type: "Medication Correlation",
      details: `${medication?.name} (${medication?.dosage})`,
      moodEmoji: medicationExperience.emoji,
      moodLabel: medicationExperience.label
    };
    
    setActivities(prev => [newActivity, ...prev]);
    setSelectedMedication("");
    setMedicationExperience(null);

    toast({
      title: "Correlation Recorded",
      description: "Your medication experience has been saved.",
      action: <Bell className="h-5 w-5" />
    });
  };

  const handleViewReport = (reportType: string) => {
    toast({
      title: `${reportType} Report`,
      description: `The ${reportType.toLowerCase()} report will be available soon.`,
      action: <LineChart className="h-5 w-5" />
    });
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Medication Side Effects Tracker
        </h1>
        <p className="text-lg text-muted-foreground">
          Monitor symptoms and correlate with medication use for better health management
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Symptom Tracker Card */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30">
                  <PenLine className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold">Symptom Tracker</CardTitle>
                  <CardDescription>Record how you're feeling and any symptoms</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-2">
              <div>
                <Label className="block mb-3 text-sm font-medium">Current Well-being</Label>
                <div className="flex flex-wrap gap-3">
                  {feelingOptions.map((feeling) => (
                    <Button
                      key={feeling.emoji}
                      variant={selectedFeeling?.emoji === feeling.emoji ? "default" : "outline"}
                      onClick={() => setSelectedFeeling(feeling)}
                      className={`h-auto py-3 px-4 rounded-lg flex flex-col items-center ${selectedFeeling?.emoji === feeling.emoji ? '' : feeling.color}`}
                    >
                      <span className="text-2xl">{feeling.emoji}</span>
                      <span className="text-xs mt-1">{feeling.label}</span>
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="symptoms" className="block text-sm font-medium">
                  Symptom Details
                </Label>
                <Textarea
                  id="symptoms"
                  placeholder="Describe your symptoms in detail (e.g., headache severity, duration, triggers...)"
                  value={symptomDescription}
                  onChange={(e) => setSymptomDescription(e.target.value)}
                  rows={4}
                  className="min-h-[120px]"
                />
              </div>
              
              <Button 
                onClick={handleLogSymptom}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
              >
                <PenLine className="mr-2 h-4 w-4" />
                Log Symptoms
              </Button>
            </CardContent>
          </Card>

          {/* Medication Experience Card */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/30">
                  <Pill className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold">Medication Experience</CardTitle>
                  <CardDescription>Track your response to medications</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="medication" className="block text-sm font-medium">
                    Medication
                  </Label>
                  <Select value={selectedMedication} onValueChange={setSelectedMedication}>
                    <SelectTrigger id="medication" className="w-full">
                      <SelectValue placeholder="Select medication..." />
                    </SelectTrigger>
                    <SelectContent>
                      {mockMedications.map((med) => (
                        <SelectItem key={med.id} value={med.id}>
                          <div className="flex items-center space-x-2">
                            <Pill className="h-4 w-4 text-muted-foreground" />
                            <span>{med.name}</span>
                            <Badge variant="outline" className="ml-2 text-xs">
                              {med.dosage}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label className="block text-sm font-medium">Your Experience</Label>
                  <div className="flex flex-wrap gap-2">
                    {experienceOptions.map((exp) => (
                      <Button
                        key={exp.emoji}
                        variant={medicationExperience?.emoji === exp.emoji ? "default" : "outline"}
                        onClick={() => setMedicationExperience(exp)}
                        className={`h-auto py-2 px-3 rounded-lg ${medicationExperience?.emoji === exp.emoji ? '' : exp.color}`}
                      >
                        <span className="text-xl">{exp.emoji}</span>
                        <span className="sr-only">{exp.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
              
              <Button 
                onClick={handleSaveCorrelation}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white shadow-sm"
              >
                <Save className="mr-2 h-4 w-4" />
                Save Medication Experience
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Notification Settings Card */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-900/30">
                  <Bell className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold">Notification Settings</CardTitle>
                  <CardDescription>Configure your alert preferences</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              <div className="flex items-center justify-between p-4 rounded-lg bg-background border">
                <div className="space-y-1">
                  <Label htmlFor="symptom-alerts" className="font-medium">
                    Symptom Pattern Alerts
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications for concerning symptom trends
                  </p>
                </div>
                <Switch
                  id="symptom-alerts"
                  checked={symptomAlertsEnabled}
                  onCheckedChange={setSymptomAlertsEnabled}
                />
              </div>
              
              <div className="flex items-center justify-between p-4 rounded-lg bg-background border">
                <div className="space-y-1">
                  <Label htmlFor="medication-reminders" className="font-medium">
                    Medication Reminders
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Get reminders for your medication schedule
                  </p>
                </div>
                <Switch
                  id="medication-reminders"
                  checked={medicationRemindersEnabled}
                  onCheckedChange={setMedicationRemindersEnabled}
                />
              </div>
            </CardContent>
          </Card>

          {/* Reports Card */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/30">
                  <LineChart className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold">Health Reports</CardTitle>
                  <CardDescription>Analyze your health data</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid gap-3 pt-2">
              <Button 
                variant="outline" 
                onClick={() => handleViewReport("Symptom")}
                className="justify-start h-12"
              >
                <LineChart className="mr-3 h-4 w-4" />
                <div className="text-left">
                  <p className="font-medium">Symptom Trends</p>
                  <p className="text-xs text-muted-foreground">View patterns over time</p>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => handleViewReport("Medication")}
                className="justify-start h-12"
              >
                <Pill className="mr-3 h-4 w-4" />
                <div className="text-left">
                  <p className="font-medium">Medication Effects</p>
                  <p className="text-xs text-muted-foreground">Analyze medication impact</p>
                </div>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Activity Log Card */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Recent Activity Log</CardTitle>
          <CardDescription>Your tracked symptoms and medication experiences</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">Date & Time</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Details</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activities.length > 0 ? (
                activities.map((activity) => (
                  <TableRow key={activity.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <CalendarClock className="h-4 w-4 mr-2 text-muted-foreground" />
                        {format(new Date(activity.date), "MMM d, yyyy")}
                        <span className="text-muted-foreground ml-1">
                          {format(new Date(activity.date), "h:mm a")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {activity.type.toLowerCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate">
                      {activity.details}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <span className="text-2xl">{activity.moodEmoji}</span>
                        <span className="text-sm text-muted-foreground">
                          {activity.moodLabel}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center py-8 space-y-2">
                      <PenLine className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">No activity recorded yet</p>
                      <p className="text-sm text-muted-foreground">
                        Start by logging your symptoms or medication experiences
                      </p>
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