
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  visibility: 'public' | 'private';
  createdBy: string | null;
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
            {event.createdBy && <p className="text-xs text-muted-foreground">Created by: {event.createdBy}</p>}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const AddEventDialog = ({ selectedDate, onAddEvent }: { selectedDate: Date; onAddEvent: (event: Omit<Event, 'date' | 'createdBy'>) => void }) => {
  const [title, setTitle] = React.useState("");
  const [time, setTime] = React.useState("");
  const [tag, setTag] = React.useState("Meeting");
  const [description, setDescription] = React.useState("");
  const [visibility, setVisibility] = React.useState<'public' | 'private'>('public');
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
        visibility,
        tagColor: tagColorMap[tag] || "bg-gray-500",
      });
      setTitle("");
      setTime("");
      setTag("Meeting");
      setDescription("");
      setVisibility("public");
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
            <Label htmlFor="visibility" className="text-right">
              Visibility
            </Label>
            <select id="visibility" value={visibility} onChange={(e) => setVisibility(e.target.value as 'public' | 'private')} className="col-span-3 border rounded-md p-2">
              <option value="public">Public</option>
              <option value="private">Private</option>
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


const SchedulePanel = ({ selectedDate, events, onAddEvent, showAddButton }: { selectedDate: Date; events: Event[]; onAddEvent: (event: Omit<Event, 'date' | 'createdBy'>) => void, showAddButton: boolean }) => {
  const dayEvents = events.filter(
    (event) => new Date(event.date).toDateString() === selectedDate.toDateString()
  );

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Schedule for {format(selectedDate, "PPP")}</CardTitle>
        {showAddButton && <AddEventDialog selectedDate={selectedDate} onAddEvent={onAddEvent} />}
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

const ScheduleTable = ({ events }: { events: Event[] }) => {
  const todayEvents = events
    .filter(event => new Date(event.date).toDateString() === new Date().toDateString())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Today&apos;s Schedules</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Tag</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {todayEvents.length > 0 ? (
              todayEvents.map((event, index) => (
                <TableRow key={index}>
                  <TableCell>{format(new Date(event.date), "PPP")}</TableCell>
                  <TableCell>{event.time}</TableCell>
                  <TableCell>{event.title}</TableCell>
                  <TableCell><Badge className={event.tagColor}>{event.tag}</Badge></TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  No events for today.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default function CalendarView() {
    const [date, setDate] = React.useState<Date | undefined>(undefined);
    const [events, setEvents] = React.useState<Event[]>([]);
    const [currentUser, setCurrentUser] = React.useState<string|null>(null);
    const [isClient, setIsClient] = React.useState(false);
    const [viewMode, setViewMode] = React.useState<'calendar' | 'table'>('calendar');

    React.useEffect(() => {
        setIsClient(true);
        const storedUser = localStorage.getItem("username");
        setCurrentUser(storedUser);

        const storedEvents = localStorage.getItem("events");
        if (storedEvents) {
            const parsedEvents = JSON.parse(storedEvents).map((e: any) => ({...e, date: new Date(e.date)}));
            setEvents(parsedEvents);
        }
        setDate(new Date());
    }, []);

    const handleAddEvent = (newEvent: Omit<Event, 'date' | 'createdBy'>) => {
      if (date) {
        const fullEvent: Event = { ...newEvent, date: date, createdBy: currentUser };
        const updatedEvents = [...events, fullEvent];
        setEvents(updatedEvents);
        localStorage.setItem("events", JSON.stringify(updatedEvents));
      }
    };
    
    const filteredEvents = React.useMemo(() => {
        if (!isClient) return [];
        // On homepage (no user), show only public events
        if (!currentUser) {
            return events.filter(e => e.visibility === 'public');
        }
        // On user pages, show public events and private events created by the user
        return events.filter(e => e.visibility === 'public' || (e.visibility === 'private' && e.createdBy === currentUser));
    }, [events, currentUser, isClient]);

    const scheduledDays = React.useMemo(() => {
        if (!isClient) return [];
        const publicEvents = events.filter(e => e.visibility === 'public');
        
        if (!currentUser) {
            return publicEvents.map(event => new Date(event.date));
        }
        return filteredEvents.map(event => new Date(event.date));
    }, [events, filteredEvents, currentUser, isClient]);

    if (!isClient) {
        return null;
    }

    return (
        <div className="flex flex-1 flex-col items-center justify-center gap-8 w-full">
            <div className="flex justify-center gap-2 mb-4">
                <Button variant={viewMode === 'calendar' ? 'default' : 'outline'} onClick={() => setViewMode('calendar')}>Calendar</Button>
                <Button variant={viewMode === 'table' ? 'default' : 'outline'} onClick={() => setViewMode('table')}>Table</Button>
            </div>
            {viewMode === 'calendar' ? (
                <div className="flex w-full items-start justify-center gap-8">
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
                    {date && <SchedulePanel selectedDate={date} events={filteredEvents} onAddEvent={handleAddEvent} showAddButton={!!currentUser && isClient} />}
                </div>
            ) : (
                <ScheduleTable events={filteredEvents} />
            )}
      </div>
    )
}

    

    