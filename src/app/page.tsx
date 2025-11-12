'use client';

import { useState, useEffect } from 'react';
import type { Activity, ScheduledEvent } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { generateSchedule } from '@/ai/flows/generate-schedule-from-activities';
import { useToast } from "@/hooks/use-toast"
import { Calendar } from "@/components/ui/calendar"
import { format, isSameDay, parseISO } from 'date-fns';

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
  const [events, setEvents] = useState<ScheduledEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast()
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    // This ensures the component only renders on the client, preventing hydration errors.
    setIsClient(true)
    setDate(new Date());
  }, [])


  useEffect(() => {
    const handleGenerateSchedule = async () => {
      setIsLoading(true);
      try {
        const result = await generateSchedule({ activities: defaultActivities, scheduleType: 'daily' });
        setEvents(result.events);
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
  

  const scheduledDays = events.map(event => parseISO(event.startTime));

  const DayWithSchedule = ({ date, displayMonth, ...props }: { date: Date, displayMonth: Date } & React.HTMLAttributes<HTMLDivElement>) => {
    const dayEvents = events
      .filter(event => isSameDay(parseISO(event.startTime), date))
      .sort((a,b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  
    return (
      <div {...props}>
        <time dateTime={date.toISOString()} className="absolute top-2 right-2">{format(date, 'd')}</time>
        {dayEvents.length > 0 && (
          <div className="mt-6 space-y-1 text-left text-xs overflow-y-auto h-full p-1">
            {dayEvents.map(event => (
              <div key={event.title} className="bg-primary/10 p-1 rounded-sm">
                <p className="font-bold truncate">{event.title}</p>
                <p className="text-muted-foreground">
                  {format(parseISO(event.startTime), 'p')}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (!isClient) {
    return null;
  }


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
        <div className="flex flex-col md:flex-row gap-8 items-start justify-center">
          <Card className="w-full md:w-[64rem] aspect-[12/7]">
              <CardContent className="p-0 flex justify-center h-full">
                  <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      className="p-0 w-full h-full"
                      classNames={{
                          months: "w-full h-full flex flex-col",
                          month: "w-full h-full flex flex-col",
                          table: "w-full h-full",
                          head_row: "w-full flex justify-between",
                          row: "w-full flex justify-between flex-1",
                          cell: "w-full h-40 text-base relative",
                          day: "w-full h-full items-start justify-start p-2",
                          head_cell: "w-full",
                          day_selected: "bg-primary/20 text-primary-foreground focus:bg-primary/20",
                      }}
                      modifiers={{
                          scheduled: scheduledDays
                      }}
                      modifiersClassNames={{
                          scheduled: 'bg-accent/20'
                      }}
                      components={{
                        Day: DayWithSchedule,
                      }}
                  />
              </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
