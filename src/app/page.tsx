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
              caption: "flex justify-start text-xl font-medium pl-1",
              nav: "hidden",
              head_row: "grid grid-cols-7 border-b pb-2",
              head_cell: "text-center text-sm font-medium text-muted-foreground",
              row: "grid grid-cols-7 w-full mt-4",
              day: "h-12 w-full p-0 text-base",
              cell: "text-center",
            }}
          />
        </CardContent>
      </Card>
    </main>
  );
}
