'use server';
/**
 * @fileOverview Generates a schedule based on logged activities and their priorities.
 *
 * - generateSchedule - A function that generates the schedule.
 * - GenerateScheduleInput - The input type for the generateSchedule function.
 * - GenerateScheduleOutput - The return type for the generateSchedule function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateScheduleInputSchema = z.object({
  activities: z.array(
    z.object({
      description: z.string().describe('Description of the activity.'),
      duration: z.number().describe('Duration of the activity in minutes.'),
      timeOfDay: z.string().describe('The preferred time of day for the activity (e.g., morning, afternoon, evening).'),
      priority: z.string().describe('The priority of the activity (e.g., high, medium, low).'),
    })
  ).describe('A list of activities to schedule.'),
  scheduleType: z.enum(['daily', 'weekly']).describe('The type of schedule to generate (daily or weekly).'),
});
export type GenerateScheduleInput = z.infer<typeof GenerateScheduleInputSchema>;

const GenerateScheduleOutputSchema = z.object({
  schedule: z.string().describe('The generated schedule in a human-readable format.'),
});
export type GenerateScheduleOutput = z.infer<typeof GenerateScheduleOutputSchema>;

export async function generateSchedule(input: GenerateScheduleInput): Promise<GenerateScheduleOutput> {
  return generateScheduleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSchedulePrompt',
  input: {schema: GenerateScheduleInputSchema},
  output: {schema: GenerateScheduleOutputSchema},
  prompt: `You are a personal schedule optimizer. Generate an optimized {{scheduleType}} schedule based on the user's logged activities and their priorities.

Consider the activity descriptions, durations, preferred times of day, and priorities when creating the schedule.

Activities:
{{#each activities}}
- Description: {{description}}, Duration: {{duration}} minutes, Time of Day: {{timeOfDay}}, Priority: {{priority}}
{{/each}}

Ensure the schedule is realistic and accounts for potential conflicts or constraints.

Output the schedule in a clear, human-readable format.
`,
});

const generateScheduleFlow = ai.defineFlow(
  {
    name: 'generateScheduleFlow',
    inputSchema: GenerateScheduleInputSchema,
    outputSchema: GenerateScheduleOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
