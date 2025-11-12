'use client';

import { useState, useEffect } from 'react';
import type { Activity, ScheduledEvent } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { generateSchedule } from '@/ai/flows/generate-schedule-from-activities';
import { useToast } from "@/hooks/use-toast"
import { Calendar } from "@/components/ui/calendar"
import { format, isSameDay, parseISO } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

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
  const [hasDateBeenSelected, setHasDateBeenSelected] = useState(false);


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
  
  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (selectedDate && !hasDateBeenSelected) {
      setHasDateBeenSelected(true);
    }
  }

  const selectedDayEvents = events.filter(event => date && isSameDay(parseISO(event.startTime), date));

  const scheduledDays = events.map(event => parseISO(event.startTime));

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
          <Card className="w-full md:w-[48rem] aspect-[12/7]">
              <CardContent className="p-0 flex justify-center h-full">
                  <Calendar
                      mode="single"
                      selected={date}
                      onSelect={handleDateSelect}
                      className="p-0 w-full h-full"
                      classNames={{
                          months: "w-full h-full flex flex-col",
                          month: "w-full h-full flex flex-col",
                          table: "w-full h-full",
                          head_row: "w-full flex justify-between",
                          row: "w-full flex justify-between flex-1",
                          cell: "w-full h-auto text-base",
                          day: "w-full h-full",
                          head_cell: "w-full",
                          day_selected: "bg-primary text-primary-foreground hover:bg-primary/90 focus:bg-primary/90",
                      }}
                      modifiers={{
                          scheduled: scheduledDays
                      }}
                      modifiersClassNames={{
                          scheduled: 'bg-accent/50 rounded-md'
                      }}
                  />
              </CardContent>
          </Card>

          {hasDateBeenSelected && (
              <Card className="w-full flex-1">
                  <CardHeader>
                      <CardTitle>Schedule for {date ? format(date, 'PPP') : '...'}</CardTitle>
                      <CardDescription>Here are your scheduled activities for the selected day.</CardDescription>
                  </CardHeader>
                  <CardContent>
                      {isLoading && (
                          <div className="space-y-4">
                              <Skeleton className="h-12 w-full" />
                              <Skeleton className="h-12 w-full" />
                              <Skeleton className="h-12 w-full" />
                          </div>
                      )}
                      {!isLoading && date && selectedDayEvents.length > 0 ? (
                          <ul className="space-y-3">
                              {selectedDayEvents.sort((a,b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()).map(event => (
                                  <li key={event.title} className="p-3 bg-card-foreground/5 rounded-lg">
                                      <p className="font-bold">{event.title}</p>
                                      <p className="text-sm text-muted-foreground">
                                          {format(parseISO(event.startTime), 'p')} - {format(parseISO(event.endTime), 'p')}
                                      </p>
                                  </li>
                              ))}
                          </ul>
                      ) : !isLoading && date && (
                          <p>No activities scheduled for this day.</p>
                      )}
                  </CardContent>
              </Card>
          )}
        </div>
      </main>
    </div>
  );
}
