'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Activity } from '@/lib/types';
import { List, Clock, Sun, Moon, Zap, BarChart, Trash2 } from 'lucide-react';
import { Button } from './ui/button';

interface ActivityListProps {
  activities: Activity[];
  onRemoveActivity: (index: number) => void;
}

const priorityMap: { [key: string]: { variant: 'destructive' | 'secondary' | 'default'; label: string } } = {
  high: { variant: 'destructive', label: 'High' },
  medium: { variant: 'secondary', label: 'Medium' },
  low: { variant: 'default', label: 'Low' },
};

const timeOfDayIcon = {
  morning: <Sun className="h-4 w-4 text-amber-500" />,
  afternoon: <Clock className="h-4 w-4 text-sky-500" />,
  evening: <Moon className="h-4 w-4 text-indigo-500" />,
};

export function ActivityList({ activities, onRemoveActivity }: ActivityListProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <List className="text-primary" />
          Your Activities
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-center text-muted-foreground">
            No activities added yet. Use the form above to get started.
          </p>
        ) : (
          <ul className="space-y-4">
            {activities.map((activity, index) => (
              <li
                key={index}
                className="flex items-center justify-between rounded-lg border bg-card/50 p-4 transition-all hover:bg-card"
              >
                <div className="flex-grow space-y-2">
                  <p className="font-semibold text-card-foreground">{activity.description}</p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4" /> {activity.duration} min
                    </span>
                    <span className="flex items-center gap-1.5">
                      {timeOfDayIcon[activity.timeOfDay]}
                      <span className="capitalize">{activity.timeOfDay}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <BarChart className="h-4 w-4" />
                       <Badge variant={priorityMap[activity.priority].variant}>
                        {priorityMap[activity.priority].label}
                      </Badge>
                    </span>
                  </div>
                </div>
                 <Button variant="ghost" size="icon" className="ml-4 shrink-0" onClick={() => onRemoveActivity(index)}>
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                  <span className="sr-only">Remove activity</span>
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
