"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";

export default function Home() {
  const [date, setDate] = React.useState<Date | undefined>(new Date())

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <Card className="w-full max-w-4xl aspect-[16/9]">
        <CardContent className="p-0 h-full">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="w-full h-full"
            classNames={{
              months: 'w-full h-full flex',
              month: 'w-full h-full flex flex-col',
              table: 'w-full h-full flex flex-col',
              head_row: 'flex w-full',
              head_cell: 'flex-1 text-center',
              row: 'flex flex-1 w-full',
              day: 'h-full w-full p-0',
              cell: 'flex-1 h-full w-full',
            }}
          />
        </CardContent>
      </Card>
    </main>
  );
}
