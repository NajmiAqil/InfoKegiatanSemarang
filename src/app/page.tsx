'use client';

import { useState, useEffect } from 'react';
import { ScheduleDisplay } from '@/components/schedule-display';
import type { Activity } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Sparkles, CalendarDays, Loader2 } from 'lucide-react';
import { generateSchedule } from '@/ai/flows/generate-schedule-from-activities';
import { useToast } from "@/hooks/use-toast"

const defaultActivities: Activity[] = [
    { description: 'Sarapan dan persiapan', duration: 60, timeOfDay: 'morning', priority: 'high' },
    { description: 'Kerja atau Belajar', duration: 240, timeOfDay: 'morning', priority: 'high' },
    { description: 'Makan siang', duration: 60, timeOfDay: 'afternoon', priority: 'medium' },
    { description: 'Istirahat sejenak', duration: 30, timeOfDay: 'afternoon', priority: 'low' },
    { description: 'Lanjutkan kerja/belajar', duration: 180, timeOfDay: 'afternoon', priority: 'high' },
    { description: 'Olahraga ringan', duration: 45, timeOfDay: 'evening', priority: 'medium' },
    { description: 'Makan malam', duration: 60, timeOfDay: 'evening', priority: 'medium' },
    { description: 'Waktu luang', duration: 120, timeOfDay: 'evening', priority: 'low' },
];


export default function Home() {
  const [schedule, setSchedule] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast()

  useEffect(() => {
    const handleGenerateSchedule = async () => {
      setIsLoading(true);
      try {
        const result = await generateSchedule({ activities: defaultActivities, scheduleType: 'daily' });
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

    handleGenerateSchedule();
  }, [toast]);

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

      <main className="container mx-auto max-w-4xl px-4 pb-16">
        <ScheduleDisplay schedule={schedule} isLoading={isLoading} />
      </main>
    </div>
  );
}
