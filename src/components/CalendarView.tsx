
"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Event = {
  date: Date;
  title: string;
  time: string;
  tag: string;
  tagColor: string;
  description: string;
};

const EventDetailDialog = ({ event, children }: { event: Event, children: React.ReactNode }) => {
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

const AddEventDialog = ({ selectedDate, onAddEvent }: { selectedDate: Date; onAddEvent: (event: Omit<Event, 'date'>) => void }) => {
  const [title, setTitle] = React.useState("");
  const [time, setTime] = React.useState("");
  const [tag, setTag] = React.useState("Meeting");
  const [description, setDescription] = React.useState("");
  const [open, setOpen] = React.useState(false);

  const handleSubmit = () => {
    if (title && time) {
      const tagColorMap: { [key: string]: string } = {
        Meeting: "bg-blue-500",
        "Personal": "bg-green-500",
        "Urgent": "bg-red-500",
      };
      onAddEvent({
        title,
        time,
        tag,
        description,
        tagColor: tagColorMap[tag] || "bg-gray-500",
      });
      setTitle("");
      setTime("");
      setTag("Meeting");
      setDescription("");
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Event</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Event for {format(selectedDate, "PPP")}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="time" className="text-right">
              Time
            </Label>
            <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="tag" className="text-right">
              Tag
            </Label>
            <select id="tag" value={tag} onChange={(e) => setTag(e.target.value)} className="col-span-3 border rounded-md p-2">
              <option>Meeting</option>
              <option>Personal</option>
              <option>Urgent</option>
            </select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSubmit}>Save Event</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


const SchedulePanel = ({ selectedDate, events, onAddEvent }: { selectedDate: Date; events: Event[]; onAddEvent: (event: Omit<Event, 'date'>) => void }) => {
  const dayEvents = events.filter(
    (event) => event.date.toDateString() === selectedDate.toDateString()
  );

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Schedule for {format(selectedDate, "PPP")}</CardTitle>
        <AddEventDialog selectedDate={selectedDate} onAddEvent={onAddEvent} />
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

export default function CalendarView() {
    const [date, setDate] = React.useState<Date | undefined>(new Date());
    const [events, setEvents] = React.useState<Event[]>([]);

    const scheduledDays = events.map(event => event.date);

    const handleAddEvent = (newEvent: Omit<Event, 'date'>) => {
      if (date) {
        setEvents([...events, { ...newEvent, date: date }]);
      }
    };

    return (
        <div className="flex flex-1 items-center justify-center p-8 gap-8">
            <div className="w-full max-w-4xl">
            <Card>
                <CardContent className="p-0">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="p-0"
                    classNames={{
                    months: "w-full",
                    month: "w-full space-y-4 p-4",
                    caption: "flex justify-center text-4xl font-bold relative items-center mb-6",
                    nav: "space-x-2 flex items-center",
                    nav_button: "h-10 w-10",
                    nav_button_previous: "absolute left-2",
                    nav_button_next: "absolute right-2",
                    table: "w-full border-collapse",
                    head_row: "grid grid-cols-7",
                    head_cell: "text-center text-base font-normal text-muted-foreground w-full",
                    row: "grid grid-cols-7",
                    day: "h-12 w-full p-0 text-base flex items-center justify-center",
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
            {date && <SchedulePanel selectedDate={date} events={events} onAddEvent={handleAddEvent} />}
      </div>
    )
}
