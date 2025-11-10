import { z } from "zod";

export const activitySchema = z.object({
  description: z.string().min(3, "Description must be at least 3 characters."),
  duration: z.number().min(1, "Duration must be at least 1 minute."),
  timeOfDay: z.enum(["morning", "afternoon", "evening"]),
  priority: z.enum(["high", "medium", "low"]),
});

export type Activity = z.infer<typeof activitySchema>;

export const scheduledEventSchema = z.object({
    title: z.string().describe("The title of the event."),
    startTime: z.string().describe("The start time of the event in ISO 8601 format for today."),
    endTime: z.string().describe("The end time of the event in ISO 8601 format for today."),
    description: z.string().describe("A brief description of the event."),
});

export type ScheduledEvent = z.infer<typeof scheduledEventSchema>;
