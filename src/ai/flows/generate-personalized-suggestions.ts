'use server';

/**
 * @fileOverview AI-powered function to generate personalized suggestions for users of the SmartBuilding app.
 *
 * - generatePersonalizedSuggestions - A function that generates personalized suggestions based on user role and historical behavior.
 * - PersonalizedSuggestionsInput - The input type for the generatePersonalizedSuggestions function.
 * - PersonalizedSuggestionsOutput - The return type for the generatePersonalizedSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedSuggestionsInputSchema = z.object({
  userRole: z
    .string()
    .describe("The user's role (resident, admin, or technician)."),
  historicalBehavior: z
    .string()
    .describe('A summary of the user historical behavior.'),
  availableBuildingData: z
    .string()
    .describe('Available data related to the building and its services.'),
});
export type PersonalizedSuggestionsInput = z.infer<
  typeof PersonalizedSuggestionsInputSchema
>;

const PersonalizedSuggestionsOutputSchema = z.object({
  suggestions: z
    .string()
    .describe('A list of personalized suggestions for the user.'),
});
export type PersonalizedSuggestionsOutput = z.infer<
  typeof PersonalizedSuggestionsOutputSchema
>;

export async function generatePersonalizedSuggestions(
  input: PersonalizedSuggestionsInput
): Promise<PersonalizedSuggestionsOutput> {
  return generatePersonalizedSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedSuggestionsPrompt',
  input: {schema: PersonalizedSuggestionsInputSchema},
  output: {schema: PersonalizedSuggestionsOutputSchema},
  prompt: `You are an AI assistant designed to provide personalized suggestions to users of a smart building application.

  Based on the user's role, historical behavior, and available building data, generate a list of suggestions that can help them proactively manage their account and the building effectively.

  User Role: {{{userRole}}}
  Historical Behavior: {{{historicalBehavior}}}
  Available Building Data: {{{availableBuildingData}}}

  Suggestions:`,
});

const generatePersonalizedSuggestionsFlow = ai.defineFlow(
  {
    name: 'generatePersonalizedSuggestionsFlow',
    inputSchema: PersonalizedSuggestionsInputSchema,
    outputSchema: PersonalizedSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
