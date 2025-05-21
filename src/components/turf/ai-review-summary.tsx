// src/components/turf/ai-review-summary.tsx
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Brain } from "lucide-react";
import type { Review } from "@/types";
import { summarizeTurfReviews, type SummarizeTurfReviewsInput } from "@/ai/flows/turf-review-summarizer"; // Assuming this path

interface AiReviewSummaryProps {
  turfId: string;
  reviews: Review[]; // Pass reviews to the component
}

export function AiReviewSummary({ turfId, reviews }: AiReviewSummaryProps) {
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (reviews && reviews.length > 0) {
      const fetchSummary = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const input: SummarizeTurfReviewsInput = {
            turfId,
            reviews: reviews.map(r => ({
              userId: r.userId,
              rating: r.rating,
              comment: r.comment,
              createdAt: (r.createdAt as Date).toISOString(), // Ensure ISO string
            })),
          };
          // In a real app, ensure summarizeTurfReviews is an async server action or API call
          const result = await summarizeTurfReviews(input);
          setSummary(result.summary);
        } catch (err) {
          console.error("Error fetching AI summary:", err);
          setError("Could not generate review summary at this time.");
          setSummary("The AI couldn't whip up a summary this time. Maybe try checking the individual reviews?");
        } finally {
          setIsLoading(false);
        }
      };
      fetchSummary();
    } else {
      setSummary("Not enough reviews yet to generate an AI summary. Be the first to review!");
    }
  }, [turfId, reviews]);

  return (
    <Card className="bg-primary/5 border-primary/20 shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Brain className="h-5 w-5 mr-2 text-primary" />
          AI Review Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Generating summary...</span>
          </div>
        )}
        {error && !isLoading && <p className="text-destructive">{error}</p>}
        {!isLoading && summary && <p className="text-sm text-foreground/90 whitespace-pre-line">{summary}</p>}
      </CardContent>
    </Card>
  );
}
