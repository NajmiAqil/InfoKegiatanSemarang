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
            className="w-full h-full"
            classNames={{
              months: 'w-full h-full flex',
              month: 'w-full h-full flex flex-col',
              table: 'w-full h-full flex flex-col',
              head_row: 'flex justify-around',
              row: 'flex flex-1 justify-around items-center w-full',
              day: 'h-full w-full max-w-none',
              cell: 'h-full w-full max-w-none',
            }}
          />
        </CardContent>
      </Card>
    </main>
  );
}
