
'use server';

/**
 * @fileOverview Summarizes turf reviews, including sentiment analysis.
 *
 * - summarizeTurfReviews - A function that handles the summarization of turf reviews.
 * - SummarizeTurfReviewsInput - The input type for the summarizeTurfReviews function.
 * - SummarizeTurfReviewsOutput - The return type for the summarizeTurfReviews function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeTurfReviewsInputSchema = z.object({
  turfId: z.string().describe('The ID of the turf to summarize reviews for.'),
  reviews: z
    .array(
      z.object({
        userId: z.string(),
        rating: z.number(),
        comment: z.string(),
        createdAt: z.string(),
      })
    )
    .describe('An array of reviews for the turf.'),
});
export type SummarizeTurfReviewsInput = z.infer<typeof SummarizeTurfReviewsInputSchema>;

const SummarizeTurfReviewsOutputSchema = z.object({
  summary: z.string().describe('A summary of the turf reviews, including sentiment analysis.'),
});
export type SummarizeTurfReviewsOutput = z.infer<typeof SummarizeTurfReviewsOutputSchema>;

export async function summarizeTurfReviews(input: SummarizeTurfReviewsInput): Promise<SummarizeTurfReviewsOutput> {
  return summarizeTurfReviewsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeTurfReviewsPrompt',
  input: {schema: SummarizeTurfReviewsInputSchema},
  output: {schema: SummarizeTurfReviewsOutputSchema},
  prompt: `You are an AI that analyzes customer reviews for turfs (sports fields).

  Given the following reviews for turf with ID {{{turfId}}}, generate a summary that includes:

  - Overall sentiment (positive, negative, mixed).
  - Common themes or opinions mentioned in the reviews.
  - Specific examples from the reviews to support your analysis.

  Reviews:
  {{#each reviews}}
  - User ID: {{userId}}
    Rating: {{rating}}
    Comment: {{comment}}
    Created At: {{createdAt}}
  {{/each}}
  `,
});

const summarizeTurfReviewsFlow = ai.defineFlow(
  {
    name: 'summarizeTurfReviewsFlow',
    inputSchema: SummarizeTurfReviewsInputSchema,
    outputSchema: SummarizeTurfReviewsOutputSchema,
  },
  async input => {
    try {
      const {output} = await prompt(input);
      if (output) {
        return output;
      }
      // Fallback if output is unexpectedly null or undefined but no error was thrown
      return { summary: "The AI summary could not be generated at this time. Please check individual reviews." };
    } catch (error) {
      console.error("Error in summarizeTurfReviewsFlow:", error);
      // Return a user-friendly error message
      return { summary: "The AI couldn't whip up a summary this time due to a temporary issue. Maybe try checking the individual reviews?" };
    }
  }
);
