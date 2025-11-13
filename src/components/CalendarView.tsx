

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
  id: string;
  date: Date;
  title: string;
  startTime: string;
  endTime: string;
  tag: string;
  tagColor: string;
  description: string;
  visibility: 'public' | 'private';
  createdBy: string | null;
  repeat: string;
  location: string;
  relatedPeople: string;
};

const EventDetailDialog = ({ event, children, onDelete, currentUser }: { event: Event, children: React.ReactNode, onDelete: (eventId: string) => void, currentUser: string | null }) => {
  const [open, setOpen] = React.useState(false);

  const canDelete = event.createdBy === currentUser && currentUser !== null;

  const handleDelete = () => {
    onDelete(event.id);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
        <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{event.startTime} - {event.endTime}</p>
            <div>
                <h4 className="font-semibold">Description:</h4>
                <p>{event.description || "No description."}</p>
            </div>
             <div>
                <h4 className="font-semibold">Location:</h4>
                <p>{event.location || "Not specified."}</p>
            </div>
            <div>
                <h4 className="font-semibold">Repeats:</h4>
                <p>{event.repeat}</p>
            </div>
            <div>
                <h4 className="font-semibold">Related People:</h4>
                <p>{event.relatedPeople || "None."}</p>
            </div>
            {event.createdBy && <p className="text-xs text-muted-foreground pt-4">Created by: {event.createdBy}</p>}
        </div>
        {canDelete && (
          <DialogFooter>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};


const EventItem = ({ event, onDelete, currentUser }: { event: Event, onDelete: (eventId: string) => void, currentUser: string | null }) => {
  return (
    <EventDetailDialog event={event} onDelete={onDelete} currentUser={currentUser}>
      <div className="flex items-center justify-between p-3 rounded-lg bg-secondary cursor-pointer hover:bg-secondary/80">
        <div>
          <p className="font-semibold">{event.title}</p>
          <p className="text-sm text-muted-foreground">{event.startTime} - {event.endTime}</p>
        </div>
        <Badge className={event.tagColor}>{event.tag}</Badge>
      </div>
    </EventDetailDialog>
  );
};


const AddEventDialog = ({ selectedDate, onAddEvent }: { selectedDate: Date; onAddEvent: (event: Omit<Event, 'id' | 'date' | 'createdBy'>) => void }) => {
  const [title, setTitle] = React.useState("");
  const [startTime, setStartTime] = React.useState("");
  const [endTime, setEndTime] = React.useState("");
  const [tag, setTag] = React.useState("Meeting");
  const [description, setDescription] = React.useState("");
  const [visibility, setVisibility] = React.useState<'public' | 'private'>('public');
  const [repeat, setRepeat] = React.useState("Never");
  const [location, setLocation] = React.useState("");
  const [relatedPeople, setRelatedPeople] = React.useState("");

  const [open, setOpen] = React.useState(false);

  const handleSubmit = () => {
    if (title && startTime && endTime) {
      const tagColorMap: { [key: string]: string } = {
        Meeting: "bg-blue-500",
        "Personal": "bg-green-500",
        "Urgent": "bg-red-500",
      };
      onAddEvent({
        title,
        startTime,
        endTime,
        tag,
        description,
        visibility,
        tagColor: tagColorMap[tag] || "bg-gray-500",
        repeat,
        location,
        relatedPeople,
      });
      // Reset fields
      setTitle("");
      setStartTime("");
      setEndTime("");
      setTag("Meeting");
      setDescription("");
      setVisibility("public");
      setRepeat("Never");
      setLocation("");
      setRelatedPeople("");
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Event</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Event for {format(selectedDate, "PPP")}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Nama Schedule
            </Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="startTime" className="text-right">
              Jam Mulai
            </Label>
            <Input id="startTime" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="endTime" className="text-right">
              Jam Berakhir
            </Label>
            <Input id="endTime" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="col-span-3" />
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="repeat" className="text-right">
              Ulangi
            </Label>
            <select id="repeat" value={repeat} onChange={(e) => setRepeat(e.target.value)} className="col-span-3 border rounded-md p-2">
              <option>Never</option>
              <option>Daily</option>
              <option>Weekly</option>
              <option>Monthly</option>
            </select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="tag" className="text-right">
              Type
            </Label>
            <select id="tag" value={tag} onChange={(e) => setTag(e.target.value)} className="col-span-3 border rounded-md p-2">
              <option>Meeting</option>
              <option>Personal</option>
              <option>Urgent</option>
            </select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="visibility" className="text-right">
              Publish or Private
            </Label>
            <select id="visibility" value={visibility} onChange={(e) => setVisibility(e.target.value as 'public' | 'private')} className="col-span-3 border rounded-md p-2">
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="location" className="text-right">
              Lokasi
            </Label>
            <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Deskripsi
            </Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-3" />
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="relatedPeople" className="text-right">
              Orang yang Berkaitan
            </Label>
            <Input id="relatedPeople" value={relatedPeople} onChange={(e) => setRelatedPeople(e.target.value)} className="col-span-3" />
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


const SchedulePanel = ({ selectedDate, events, onAddEvent, onDeleteEvent, showAddButton, currentUser }: { selectedDate: Date; events: Event[]; onAddEvent: (event: Omit<Event, 'id' |'date' | 'createdBy'>) => void, onDeleteEvent: (eventId: string) => void, showAddButton: boolean, currentUser: string | null }) => {
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
          dayEvents.filter(event => event && event.id).map((event) => (
             <EventItem key={event.id} event={event} onDelete={onDeleteEvent} currentUser={currentUser} />
          ))
        ) : (
          <p className="text-muted-foreground">No events scheduled for this day.</p>
        )}
      </CardContent>
    </Card>
  );
};

const ScheduleTable = ({ events }: { events: Event[] }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingEvents = events
    .filter(event => new Date(event.date) >= today)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Upcoming Schedules</CardTitle>
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
            {upcomingEvents.length > 0 ? (
              upcomingEvents.filter(event => event && event.id).map((event) => (
                <TableRow key={event.id}>
                  <TableCell>{format(new Date(event.date), "PPP")}</TableCell>
                  <TableCell>{event.startTime}</TableCell>
                  <TableCell>{event.title}</TableCell>
                  <TableCell><Badge className={event.tagColor}>{event.tag}</Badge></TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  No upcoming events.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default function CalendarView({ viewedUser }: { viewedUser?: string | null }) {
    const [date, setDate] = React.useState<Date | undefined>(undefined);
    const [events, setEvents] = React.useState<Event[]>([]);
    const [currentUser, setCurrentUser] = React.useState<string|null>(null);
    const [userRole, setUserRole] = React.useState<string|null>(null);
    const [isClient, setIsClient] = React.useState(false);
    const [viewMode, setViewMode] = React.useState<'calendar' | 'table'>('calendar');

    React.useEffect(() => {
        setIsClient(true);
        const storedUser = localStorage.getItem("username");
        const storedRole = localStorage.getItem("userRole");
        setCurrentUser(storedUser);
        setUserRole(storedRole);

        const storedEvents = localStorage.getItem("events");
        if (storedEvents) {
            const parsedEvents = JSON.parse(storedEvents).map((e: any) => ({...e, date: new Date(e.date)}));
            setEvents(parsedEvents);
        }
        setDate(new Date());
    }, []);

    const handleAddEvent = (newEvent: Omit<Event, 'id' | 'date' | 'createdBy'>) => {
      if (date) {
        const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const fullEvent: Event = { ...newEvent, id: uniqueId, date: date, createdBy: currentUser };
        const updatedEvents = [...events, fullEvent];
        setEvents(updatedEvents);
        localStorage.setItem("events", JSON.stringify(updatedEvents));
      }
    };

    const handleDeleteEvent = (eventId: string) => {
        const updatedEvents = events.filter(event => event.id !== eventId);
        setEvents(updatedEvents);
        localStorage.setItem("events", JSON.stringify(updatedEvents));
    };
    
    const filteredEvents = React.useMemo(() => {
        if (!isClient) return [];

        // Atasan viewing a specific Bawahan's schedule
        if (userRole === 'atasan' && viewedUser && viewedUser !== currentUser) {
            // Show all events created by the viewedUser, plus all public events
             return events.filter(e => e.createdBy === viewedUser || e.visibility === 'public');
        }

        // Logged-in user viewing their own schedule (or public view)
        if (currentUser) {
             return events.filter(e => e.visibility === 'public' || e.createdBy === currentUser);
        }

        // Public view (not logged in)
        return events.filter(e => e.visibility === 'public');

    }, [events, currentUser, isClient, viewedUser, userRole]);

    const scheduledDays = React.useMemo(() => {
        if (!isClient) return [];
        return filteredEvents.map(event => new Date(event.date));
    }, [filteredEvents, isClient]);

    if (!isClient) {
        return null;
    }
    
    const showAddButton = !!currentUser && (!viewedUser || viewedUser === currentUser);

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
                    {date && <SchedulePanel selectedDate={date} events={filteredEvents} onAddEvent={handleAddEvent} onDeleteEvent={handleDeleteEvent} showAddButton={showAddButton} currentUser={currentUser}/>}
                </div>
            ) : (
                <ScheduleTable events={filteredEvents} />
            )}
      </div>
    )
}
