'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from "@/components/ui/calendar"

export default function Home() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background font-body flex items-center justify-center p-4">
      <main className="container mx-auto w-full">
        <Card className="w-full">
            <CardContent className="p-0 flex justify-center">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="w-full"
                />
            </CardContent>
        </Card>
      </main>
    </div>
  );
}
