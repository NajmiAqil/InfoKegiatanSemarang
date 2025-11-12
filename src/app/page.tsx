"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";

export default function Home() {
  const [date, setDate] = React.useState<Date | undefined>(new Date())

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <Card className="w-full max-w-4xl">
        <CardContent className="p-6">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="w-full"
            showOutsideDays={false}
            classNames={{
              root: "p-0",
              months: "w-full",
              month: "w-full space-y-4",
              caption: "flex justify-center text-5xl font-medium relative items-center mb-8",
              nav: "space-x-1 flex items-center",
              nav_button: "h-10 w-10",
              nav_button_previous: "absolute left-1",
              nav_button_next: "absolute right-1",
              head_row: "grid grid-cols-7",
              head_cell: "text-center text-xl font-normal text-muted-foreground",
              row: "grid grid-cols-7",
              day: "h-16 w-full p-0 text-xl flex items-center justify-center",
              cell: "text-center",
            }}
          />
        </CardContent>
      </Card>
    </main>
  );
}
