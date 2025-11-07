import { z } from "zod";

export const activitySchema = z.object({
  description: z.string().min(3, "Description must be at least 3 characters."),
  duration: z.number().min(1, "Duration must be at least 1 minute."),
  timeOfDay: z.enum(["morning", "afternoon", "evening"]),
  priority: z.enum(["high", "medium", "low"]),
});

export type Activity = z.infer<typeof activitySchema>;
