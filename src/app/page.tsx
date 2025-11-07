'use client';

import { useState } from 'react';
import { ActivityForm } from '@/components/activity-form';
import { ActivityList } from '@/components/activity-list';
import { ScheduleDisplay } from '@/components/schedule-display';
import type { Activity } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Sparkles, CalendarDays, Loader2 } from 'lucide-react';
import { generateSchedule } from '@/ai/flows/generate-schedule-from-activities';
import { useToast } from "@/hooks/use-toast"

export default function Home() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [schedule, setSchedule] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast()


  const handleAddActivity = (activity: Activity) => {
    setActivities((prev) => [...prev, activity]);
  };
  
  const handleRemoveActivity = (index: number) => {
    setActivities((prev) => prev.filter((_, i) => i !== index));
  };

  const handleGenerateSchedule = async (scheduleType: 'daily' | 'weekly') => {
    if (activities.length === 0) {
       toast({
        variant: "destructive",
        title: "No Activities",
        description: "Please add at least one activity before generating a schedule.",
      })
      return;
    }

    setIsLoading(true);
    setSchedule(null);

    try {
      const result = await generateSchedule({ activities, scheduleType });
      setSchedule(result.schedule);
    } catch (error) {
      console.error('Error generating schedule:', error);
       toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "Could not generate schedule. Please try again.",
      })
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background font-body">
      <header className="py-8 px-4 text-center">
        <h1 className="font-headline text-5xl font-bold text-primary tracking-tight">
          InfoKegiatanSemarang
        </h1>
        <p className="mt-2 text-lg text-foreground/80">
          Your Personal Activity Scheduler
        </p>
      </header>

      <main className="container mx-auto max-w-7xl px-4 pb-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-8">
          <div className="space-y-8">
            <ActivityForm onActivityAdd={handleAddActivity} />
            <ActivityList activities={activities} onRemoveActivity={handleRemoveActivity} />
          </div>

          <div className="space-y-8">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="text-primary" />
                  Generate Your Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-muted-foreground">
                  Once you've added your activities, let our AI create an optimized schedule for you.
                </p>
                <div className="flex flex-col gap-4 sm:flex-row">
                  <Button
                    onClick={() => handleGenerateSchedule('daily')}
                    disabled={isLoading || activities.length === 0}
                    className="w-full"
                  >
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CalendarDays className="mr-2 h-4 w-4" />}
                    Generate Daily Schedule
                  </Button>
                  <Button
                    onClick={() => handleGenerateSchedule('weekly')}
                    disabled={isLoading || activities.length === 0}
                    variant="secondary"
                    className="w-full"
                  >
                     {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CalendarDays className="mr-2 h-4 w-4" />}
                    Generate Weekly Schedule
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Separator />
            
            <ScheduleDisplay schedule={schedule} isLoading={isLoading} />
          </div>
        </div>
      </main>
    </div>
  );
}
