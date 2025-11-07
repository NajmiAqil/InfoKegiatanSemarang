'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Bot } from 'lucide-react';

interface ScheduleDisplayProps {
  schedule: string | null;
  isLoading: boolean;
}

export function ScheduleDisplay({ schedule, isLoading }: ScheduleDisplayProps) {
  return (
    <Card className="shadow-lg min-h-[200px]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="text-primary" />
          Generated Schedule
        </CardTitle>
        <CardDescription>
          Here is the optimized schedule created by our AI.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/6" />
            <Skeleton className="h-4 w-full" />
          </div>
        )}
        {!isLoading && !schedule && (
          <p className="text-center text-muted-foreground">
            Generate a schedule to see the results here.
          </p>
        )}
        {!isLoading && schedule && (
          <pre className="whitespace-pre-wrap rounded-md bg-background/50 p-4 font-sans text-sm text-foreground">
            {schedule}
          </pre>
        )}
      </CardContent>
    </Card>
  );
}
