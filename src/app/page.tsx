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
            showOutsideDays={false}
            classNames={{
              root: 'h-full',
              months: "h-full",
              month: "h-full flex flex-col",
              table: "w-full h-full border-collapse flex flex-col",
              head_row: "flex",
              head_cell: "flex-1",
              row: "flex w-full mt-2 flex-1",
              day: "h-full w-full p-0",
              cell: "flex-1",
            }}
          />
        </CardContent>
      </Card>
    </main>
  );
}
