"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";

export default function Home() {
  const [date, setDate] = React.useState<Date | undefined>(new Date())

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <Card className="w-full max-w-4xl aspect-[16/9]">
        <CardContent className="p-0 h-full flex items-center justify-center">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="w-full h-full flex justify-center"
            classNames={{
              months: 'w-full h-full',
              month: 'w-full h-full flex flex-col',
              table: 'w-full h-full',
              head_row: 'flex justify-around',
              row: 'flex justify-around',
              day: 'h-16 w-16',
            }}
          />
        </CardContent>
      </Card>
    </main>
  );
}
