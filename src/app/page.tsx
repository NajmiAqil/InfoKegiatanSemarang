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
              caption: "flex justify-center text-3xl font-medium relative items-center",
              nav: "space-x-1 flex items-center",
              nav_button_previous: "absolute left-1",
              nav_button_next: "absolute right-1",
              head_row: "grid grid-cols-7",
              head_cell: "text-center text-sm font-medium text-muted-foreground",
              row: "grid grid-cols-7 w-full mt-4",
              day: "h-14 w-full p-0 text-base",
              cell: "text-center",
            }}
          />
        </CardContent>
      </Card>
    </main>
  );
}
