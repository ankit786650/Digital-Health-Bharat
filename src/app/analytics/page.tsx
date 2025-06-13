"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  ChevronLeft,
  ChevronRight,
  Info,
  PlusCircle,
  ThumbsUp,
  Lightbulb,
  MessageSquare,
  ArrowRight,
  Calendar,
  BarChart2,
  Activity,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface MoodEntry {
  id: string;
  emoji: string;
  title: string;
  description: string;
  time: string;
  level: 'high' | 'medium' | 'low';
}

const moodEntries: MoodEntry[] = [
  { id: '1', emoji: '😄', title: 'July 5th - Feeling Great', description: 'Energy levels were high, no significant symptoms.', time: '08:00 AM', level: 'high' },
  { id: '2', emoji: '😐', title: 'July 9th - Feeling Okay', description: 'Slight headache in the afternoon.', time: '09:30 AM', level: 'medium' },
  { id: '3', emoji: '😞', title: 'July 12th - Feeling Bad', description: 'Fatigue and joint pain. Took medication as prescribed.', time: '11:15 AM', level: 'low' },
  { id: '4', emoji: '😄', title: 'July 15th - Feeling Great Again!', description: 'Back to feeling good. Medication seems to be helping.', time: '10:00 AM', level: 'high' },
];

interface MoodCorrelationData {
  positive: { percentage: number; label: string; improvement?: number };
  neutral: { percentage: number; label: string; improvement?: number };
  negative: { percentage: number; label: string; improvement?: number };
}

const moodCorrelationData: MoodCorrelationData = {
  positive: { 
    percentage: 75, 
    label: "Positive Mood Days",
    improvement: 12
  },
  neutral: { 
    percentage: 15, 
    label: "Neutral Mood Days",
    improvement: -3
  },
  negative: { 
    percentage: 10, 
    label: "Negative Mood Days",
    improvement: -9
  },
};

interface Observation {
  id: string;
  Icon: LucideIcon;
  iconColorClass: string;
  bgColorClass: string;
  title: string;
  description: string;
  action?: string;
}

const helpfulObservations: Observation[] = [
  {
    id: '1',
    Icon: TrendingUp,
    iconColorClass: 'text-emerald-600 dark:text-emerald-400',
    bgColorClass: 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50',
    title: 'Consistency Pays Off',
    description: 'Your medication adherence is 92% this month, leading to more stable mood patterns.',
    action: 'View adherence report'
  },
  {
    id: '2',
    Icon: Activity,
    iconColorClass: 'text-blue-600 dark:text-blue-400',
    bgColorClass: 'bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50',
    title: 'Energy Correlations',
    description: "Days with morning exercise show 22% higher energy levels in your logs.",
    action: 'See activity insights'
  },
  {
    id: '3',
    Icon: AlertCircle,
    iconColorClass: 'text-amber-600 dark:text-amber-400',
    bgColorClass: 'bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/50',
    title: 'Sleep Connection',
    description: "When sleep <6 hours, next day fatigue is 3x more likely.",
    action: 'Review sleep patterns'
  },
];

const getLevelColor = (level: MoodEntry['level']) => {
  switch(level) {
    case 'high': return 'bg-emerald-500';
    case 'medium': return 'bg-amber-500';
    case 'low': return 'bg-rose-500';
    default: return 'bg-gray-500';
  }
};

export default function AnalyticsPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [currentMonthYear, setCurrentMonthYear] = useState("July 2024");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Simulate data loading
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleLogNewEntry = () => {
    toast({ 
      title: "New Entry", 
      description: "Let's document how you're feeling today.",
      action: (
        <Button variant="outline" size="sm" onClick={() => console.log('Navigating to log entry')}>
          Continue
        </Button>
      )
    });
  };

  const handleCorrelationReport = () => {
    toast({ 
      title: "Detailed Report Available", 
      description: "Opening your full correlation analysis..." 
    });
  };

  const handleMonthChange = (direction: 'prev' | 'next') => {
    // In a real app, this would fetch new data
    toast({
      title: `Viewing ${direction === 'prev' ? 'previous' : 'next'} month`,
      duration: 1000
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Health Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Insights from your daily logs and medication tracking
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1">
            <Calendar className="h-4 w-4" />
            <span>Export Report</span>
          </Button>
          <Button size="sm" className="gap-1" onClick={handleLogNewEntry}>
            <PlusCircle className="h-4 w-4" />
            <span>New Entry</span>
          </Button>
        </div>
      </div>

      {/* Mood & Symptom Timeline Section */}
      <Card className="overflow-hidden">
        <CardHeader className="border-b">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <BarChart2 className="h-5 w-5 text-primary" />
                Mood & Symptom Timeline
              </CardTitle>
              <CardDescription className="mt-1">
                Track your daily wellbeing and identify patterns
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0"
                onClick={() => handleMonthChange('prev')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium text-foreground px-2 min-w-[100px] text-center">
                {currentMonthYear}
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0"
                onClick={() => handleMonthChange('next')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="divide-y">
              {moodEntries.map((entry) => (
                <div key={entry.id} className="p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <span className="text-3xl flex items-center justify-center h-12 w-12 rounded-full bg-background border">
                        {entry.emoji}
                      </span>
                      <div className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-background ${getLevelColor(entry.level)}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground truncate">{entry.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{entry.description}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-xs px-2 py-1 bg-muted rounded-full">{entry.time}</span>
                        {entry.level === 'high' && (
                          <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full">
                            High Energy
                          </span>
                        )}
                        {entry.level === 'medium' && (
                          <span className="text-xs px-2 py-1 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 rounded-full">
                            Moderate
                          </span>
                        )}
                        {entry.level === 'low' && (
                          <span className="text-xs px-2 py-1 bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400 rounded-full">
                            Low Energy
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t py-3">
          <Button variant="ghost" className="w-full text-primary" onClick={handleLogNewEntry}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add New Entry
          </Button>
        </CardFooter>
      </Card>

      {/* Insights Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Medication & Mood Correlation */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <span>Medication & Mood Correlation</span>
            </CardTitle>
            <div className="flex justify-between items-center">
              <CardDescription>
                How your medication affects your wellbeing
              </CardDescription>
              <Select defaultValue="last30days">
                <SelectTrigger className="w-[140px] h-8">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last7days">Last 7 Days</SelectItem>
                  <SelectItem value="last30days">Last 30 Days</SelectItem>
                  <SelectItem value="last90days">Last 90 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-sm">Medication A Effectiveness</h3>
                <span className="text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-1 rounded-full">
                  +12% improvement
                </span>
              </div>
              <div className="space-y-3">
                {Object.entries(moodCorrelationData).map(([key, data]) => (
                  <div key={key} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{data.label}</span>
                      <span className="font-medium">
                        {data.percentage}%
                        {data.improvement && (
                          <span className={`ml-2 text-xs ${data.improvement > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {data.improvement > 0 ? '+' : ''}{data.improvement}%
                          </span>
                        )}
                      </span>
                    </div>
                    <Progress 
                      value={data.percentage} 
                      className="h-2" 
                      indicatorClassName={
                        key === 'positive' ? 'bg-emerald-500' : 
                        key === 'neutral' ? 'bg-amber-500' : 'bg-rose-500'
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
            <Button 
              variant="link" 
              className="text-primary p-0 h-auto text-sm flex items-center" 
              onClick={handleCorrelationReport}
            >
              View detailed correlation analysis
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardContent>
        </Card>

        {/* Key Observations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              <span>Key Observations</span>
            </CardTitle>
            <CardDescription>
              Patterns and insights from your data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {helpfulObservations.map((obs) => (
              <div 
                key={obs.id} 
                className={cn(
                  "p-4 rounded-lg transition-all hover:shadow-sm",
                  obs.bgColorClass
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "flex-shrink-0 rounded-lg p-2 mt-0.5",
                    obs.bgColorClass.replace('bg-', 'bg-').replace('border', '')
                  )}>
                    <obs.Icon className={cn("h-5 w-5", obs.iconColorClass)} />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">{obs.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{obs.description}</p>
                    {obs.action && (
                      <Button 
                        variant="link" 
                        size="sm" 
                        className={cn(
                          "h-auto p-0 mt-2 text-xs",
                          obs.iconColorClass.replace('text-', 'text-')
                        )}
                      >
                        {obs.action}
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}