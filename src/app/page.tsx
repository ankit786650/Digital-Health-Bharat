"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, MoreHorizontal, Heart, User, FileText as DocumentIcon, Megaphone, BadgePercent } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

const upcomingMedications = [
  { name: "Amoxicillin", time: "10:00 AM", dosage: "500mg", icon: PlusCircle },
  { name: "Ibuprofen", time: "12:00 PM", dosage: "200mg", icon: PlusCircle },
  { name: "Vitamin D", time: "06:00 PM", dosage: "1000IU", icon: PlusCircle },
];

const recentAppointments = [
  { title: "Cardiology Checkup", doctor: "Dr. Aisha Khan", date: "Jul 15, 2024", status: "completed", icon: Heart },
  { title: "Annual Physical", doctor: "Dr. Vikram Singh", date: "Aug 2, 2024", status: "upcoming", icon: User },
];

const recentDocuments = [
  { name: "Lab Results", date: "07/15/2024", type: "test results", icon: DocumentIcon },
  { name: "Insurance Card", date: "06/20/2024", type: "insurance", icon: DocumentIcon },
];

const healthProgramAlerts = [
  {
    id: "alert1",
    title: "Local Health Camp: Free Diabetes Screening",
    details: "Main Street Community Hall, July 25th, 9 AM - 3 PM.",
    actionText: "Learn More & Register",
    icon: Megaphone,
    bgColorClass: "bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-900/10 border-green-200 dark:border-green-700/60",
    iconBgClass: "bg-green-100 dark:bg-green-800/70",
    iconColorClass: "text-green-600 dark:text-green-300",
    textColorClass: "text-green-800 dark:text-green-200",
    actionLink: "#",
  },
  {
    id: "alert2",
    title: "New Subsidy for Mental Wellness Programs",
    details: "Eligible individuals can now apply for reduced-cost therapy sessions.",
    actionText: "Check Eligibility",
    icon: BadgePercent,
    bgColorClass: "bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-900/10 border-amber-200 dark:border-amber-700/60",
    iconBgClass: "bg-amber-100 dark:bg-amber-800/70",
    iconColorClass: "text-amber-600 dark:text-amber-300",
    textColorClass: "text-amber-800 dark:text-amber-200",
    actionLink: "#",
  },
];

export default function HomePage() {
  const { t } = useLanguage();
  const { toast } = useToast();

  const handleMoreOptionsClick = (medicationName: string) => {
    toast({
      title: "Coming Soon!",
      description: `More options for ${medicationName} are under development.`,
    });
  };

  return (
    <div className="space-y-8">
      {/* Header with subtle gradient */}
      <div className="bg-gradient-to-r from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 p-6 rounded-lg">
        <h1 className="text-3xl font-bold text-foreground">{t('welcomeBack')}</h1>
        <p className="text-muted-foreground mt-2">{t('welcomeMessage')}</p>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Medications */}
          <section>
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="border-b">
                <CardTitle className="text-xl flex items-center gap-2">
                  <PlusCircle className="h-5 w-5 text-primary" />
                  {t('upcomingMedications')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                {upcomingMedications.map((med) => (
                  <div 
                    key={med.name} 
                    className="flex items-center justify-between p-3 bg-card rounded-lg border hover:bg-accent/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-primary/10 text-primary p-2.5 rounded-lg">
                        <med.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-card-foreground">{med.name}</p>
                          <Badge variant="outline" className="text-xs py-0 px-1.5 font-normal">
                            {med.dosage}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <span className="inline-block h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                          {med.time}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon-sm" 
                      className="text-muted-foreground hover:text-primary"
                      onClick={() => handleMoreOptionsClick(med.name)}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="outline" className="w-full border-dashed" asChild>
                  <Link href="/reminders" className="flex items-center gap-2">
                    <PlusCircle className="h-4 w-4" />
                    {t('viewAllMedications')}
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </section>

          {/* Health Program Alerts */}
          <section>
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="border-b">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Megaphone className="h-5 w-5 text-green-600 dark:text-green-400" />
                  {t('healthProgramAlerts')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-0">
                {healthProgramAlerts.map((alert) => (
                  <div 
                    key={alert.id} 
                    className={cn(
                      "flex items-start gap-3 p-4 border-b last:border-b-0 hover:bg-accent/20 transition-colors",
                      alert.bgColorClass
                    )}
                  >
                    <div className={cn("p-2.5 rounded-lg mt-0.5", alert.iconBgClass)}>
                      <alert.icon className={cn("h-5 w-5", alert.iconColorClass)} />
                    </div>
                    <div className="flex-grow">
                      <p className={cn("text-sm font-semibold", alert.textColorClass)}>{alert.title}</p>
                      <p className="text-xs text-muted-foreground mt-1 leading-normal">{alert.details}</p>
                      <Link 
                        href={alert.actionLink} 
                        className={cn(
                          "text-xs font-medium mt-2 inline-flex items-center hover:underline",
                          alert.textColorClass
                        )}
                      >
                        {alert.actionText}
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          width="12" 
                          height="12" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          className="ml-1"
                        >
                          <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                      </Link>
                    </div>
                  </div>
                ))}
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/programs" className="flex items-center gap-2">
                    {t('viewAllAlerts')}
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </section>
        </div>

        {/* Right Sidebar */}
        <aside className="space-y-6">
          {/* Recent Appointments */}
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="border-b">
              <CardTitle className="text-xl flex items-center gap-2">
                <Heart className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                {t('recentAppointments')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              {recentAppointments.map((appointment) => (
                <div key={appointment.title} className="flex items-start gap-3">
                  <div className="p-2.5 rounded-lg bg-rose-100/50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400">
                    <appointment.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-card-foreground">{appointment.title}</p>
                    <p className="text-xs text-muted-foreground">{appointment.doctor}</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-muted-foreground">{appointment.date}</p>
                      <Badge 
                        variant={appointment.status === "completed" ? "default" : "secondary"} 
                        className="text-xs"
                      >
                        {appointment.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/visits" className="flex items-center gap-2">
                  {t('viewAllAppointments')}
                </Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Recent Documents */}
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="border-b">
              <CardTitle className="text-xl flex items-center gap-2">
                <DocumentIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                {t('documents')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              {recentDocuments.map((doc) => (
                <div key={doc.name} className="flex items-start gap-3">
                  <div className="p-2.5 rounded-lg bg-blue-100/50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                    <doc.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-card-foreground">{doc.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{doc.type}</p>
                    <p className="text-xs text-muted-foreground mt-1">Uploaded on {doc.date}</p>
                  </div>
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/documents" className="flex items-center gap-2">
                  {t('viewAllDocuments')}
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </aside>
      </div>
    </div>
  );
}