
"use client"

import * as React from "react"
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useRouter } from "next/navigation";

const events = [
  {
    date: new Date(new Date().setDate(new Date().getDate() + 1)),
    title: "Team Meeting",
    time: "10:00 AM",
    tag: "Work",
    tagColor: "bg-blue-500",
    description: "Weekly team sync to discuss project progress and blockers."
  },
  {
    date: new Date(new Date().setDate(new Date().getDate() + 1)),
    title: "Lunch with Sarah",
    time: "1:00 PM",
    tag: "Personal",
    tagColor: "bg-green-500",
    description: "Catch up with Sarah at the new cafe downtown."
  },
  {
    date: new Date(new Date().setDate(new Date().getDate() + 5)),
    title: "Project Deadline",
    time: "All Day",
    tag: "Work",
    tagColor: "bg-blue-500",
    description: "Final submission for the Q2 project. Ensure all deliverables are ready."
  },
];

const scheduledDays = events.map(event => event.date);

const EventDetailDialog = ({ event, children }: { event: any, children: React.ReactNode }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{event.title}</DialogTitle>
          <DialogDescription asChild>
            <div>
              <Badge className={`${event.tagColor} mt-2`}>{event.tag}</Badge>
            </div>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{event.time}</p>
            <p>{event.description}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};


const SchedulePanel = ({ selectedDate }: { selectedDate: Date }) => {
  const dayEvents = events.filter(
    (event) => event.date.toDateString() === selectedDate.toDateString()
  );

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Schedule for {format(selectedDate, "PPP")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {dayEvents.length > 0 ? (
          dayEvents.map((event, index) => (
            <EventDetailDialog key={index} event={event}>
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary cursor-pointer hover:bg-secondary/80">
                <div>
                  <p className="font-semibold">{event.title}</p>
                  <p className="text-sm text-muted-foreground">{event.time}</p>
                </div>
                <Badge className={event.tagColor}>{event.tag}</Badge>
              </div>
            </EventDetailDialog>
          ))
        ) : (
          <p className="text-muted-foreground">No events scheduled for this day.</p>
        )}
      </CardContent>
    </Card>
  );
};

const Navbar = () => {
    const router = useRouter();
    const [userRole, setUserRole] = React.useState<string | null>(null);

    React.useEffect(() => {
        const role = localStorage.getItem("userRole");
        setUserRole(role);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("userRole");
        setUserRole(null);
        router.push("/");
    };

    const handleProfileClick = () => {
        if(userRole === 'atasan') {
            router.push('/atasan');
        } else if (userRole === 'bawahan') {
            router.push('/bawahan');
        }
    }

    return (
      <header className="bg-primary text-primary-foreground p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">InfoKegiatanSemarang</h1>
          <div>
            {userRole ? (
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={handleProfileClick}>
                        {userRole === 'atasan' ? 'Atasan Page' : 'Bawahan Page'}
                    </Button>
                    <Button onClick={handleLogout}>Logout</Button>
                </div>
            ) : (
              <Link href="/login">
                <Button>
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>
    );
  };

export default function Home() {
  const [date, setDate] = React.useState<Date | undefined>(new Date())

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex flex-1 items-center justify-center p-8 gap-8">
        <div className="w-full max-w-2xl">
          <Card>
            <CardContent className="p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="p-0"
                classNames={{
                  months: "w-full",
                  month: "w-full space-y-2 p-3",
                  caption: "flex justify-center text-3xl font-bold relative items-center mb-4",
                  nav: "space-x-1 flex items-center",
                  nav_button: "h-8 w-8",
                  nav_button_previous: "absolute left-1",
                  nav_button_next: "absolute right-1",
                  table: "w-full border-collapse",
                  head_row: "grid grid-cols-7",
                  head_cell: "text-center text-sm font-normal text-muted-foreground w-full",
                  row: "grid grid-cols-7",
                  day: "h-9 w-full p-0 text-sm flex items-center justify-center",
                  cell: "text-center",
                }}
                modifiers={{
                  scheduled: scheduledDays,
                }}
                modifiersStyles={{
                  scheduled: {
                    color: 'white',
                    backgroundColor: '#2563eb'
                  },
                }}
              />
            </CardContent>
          </Card>
        </div>
        {date && <SchedulePanel selectedDate={date} />}
      </main>
    </div>
  );
}
