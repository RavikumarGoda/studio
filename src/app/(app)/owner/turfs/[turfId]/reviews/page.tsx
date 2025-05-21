
// src/app/(app)/owner/turfs/[turfId]/reviews/page.tsx
"use client";

import { useState, useEffect, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { Turf, Review as ReviewType } from '@/types';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { getTurfById as fetchTurfById, getReviewsForTurf as fetchReviewsForTurf, addReplyToReview as addReplyToReviewInDB } from '@/lib/mock-db';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, ChevronLeft, MessageSquare, Loader2, Send, ShieldAlert, CornerDownRight } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

const getInitials = (name: string = "User") => {
    const names = name.split(' ');
    if (names.length === 1) return names[0].substring(0, 2).toUpperCase();
    return (names[0][0] + (names[names.length - 1][0] || names[0][1] || 'U')).toUpperCase();
}

export default function ManageTurfReviewsPage() {
  const params = useParams();
  const router = useRouter();
  const turfId = params.turfId as string;
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [turf, setTurf] = useState<Turf | null>(null);
  const [reviews, setReviews] = useState<ReviewType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  const [submittingReplyFor, setSubmittingReplyFor] = useState<string | null>(null);

  useEffect(() => {
    if (turfId) {
      setIsLoading(true);
      try {
        const currentTurf = fetchTurfById(turfId);
        if (currentTurf) {
          setTurf(currentTurf);
          const turfReviews = fetchReviewsForTurf(turfId);
          setReviews(turfReviews);
        } else {
          toast({ title: "Error", description: "Turf not found.", variant: "destructive" });
          router.push('/owner/turfs');
        }
      } catch (error) {
        console.error("Error fetching turf/reviews data:", error);
        toast({ title: "Error", description: "Could not load data for review management.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    }
  }, [turfId, router, toast]);

  const handleReplyInputChange = (reviewId: string, value: string) => {
    setReplyInputs(prev => ({ ...prev, [reviewId]: value }));
  };

  const handleSubmitReply = async (reviewId: string) => {
    if (!user || !turf || turf.ownerId !== user.uid) {
      toast({ title: "Unauthorized", description: "You are not authorized to reply to reviews for this turf.", variant: "destructive" });
      return;
    }
    const replyText = replyInputs[reviewId];
    if (!replyText || replyText.trim().length < 3) {
      toast({ title: "Invalid Reply", description: "Reply must be at least 3 characters long.", variant: "destructive" });
      return;
    }

    setSubmittingReplyFor(reviewId);
    try {
      const updatedReview = addReplyToReviewInDB(reviewId, turf.id, user.uid, replyText.trim());
      if (updatedReview) {
        setReviews(prevReviews => prevReviews.map(r => r.id === reviewId ? updatedReview : r));
        setReplyInputs(prev => ({ ...prev, [reviewId]: '' })); // Clear input
        toast({ title: "Reply Submitted", description: "Your reply has been posted." });
      } else {
        toast({ title: "Error", description: "Failed to submit reply. Please try again.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Error submitting reply:", error);
      toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setSubmittingReplyFor(null);
    }
  };

  if (isLoading || authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading reviews...</p>
      </div>
    );
  }

  if (!turf) {
    return <p>Turf not found. You will be redirected.</p>;
  }

  if (!user || user.role !== 'owner' || turf.ownerId !== user.uid) {
    return (
      <div className="text-center py-10">
        <ShieldAlert className="mx-auto h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
        <p className="text-muted-foreground">You are not authorized to manage reviews for this turf.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <Link href={`/owner/turfs`} className="inline-flex items-center text-primary hover:underline mb-4 text-sm">
        <ChevronLeft className="h-4 w-4 mr-1" /> Back to My Turfs
      </Link>
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary flex items-center">
            <MessageSquare className="h-8 w-8 mr-3" />
            Manage Reviews for {turf.name}
          </h1>
          <p className="text-muted-foreground">View and respond to player feedback.</p>
        </div>
      </div>

      {reviews.length === 0 ? (
        <Card className="shadow-md">
          <CardContent className="text-center py-12">
            <MessageSquare className="h-20 w-20 mx-auto text-muted-foreground mb-6" />
            <h2 className="text-2xl font-semibold text-foreground mb-2">No Reviews Yet</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              This turf doesn&apos;t have any reviews from players yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <Card key={review.id} className="shadow-md">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3 border-b">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={`https://placehold.co/100x100.png?text=${getInitials(review.userName)}`} alt={review.userName || "User"} data-ai-hint="user avatar" />
                    <AvatarFallback>{getInitials(review.userName)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium leading-none">{review.userName || "Anonymous Player"}</p>
                    <p className="text-xs text-muted-foreground">
                      Reviewed on: {format(new Date(review.createdAt), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < review.rating ? "text-accent fill-accent" : "text-muted-foreground"}`}
                    />
                  ))}
                </div>
              </CardHeader>
              <CardContent className="pt-4 pb-3">
                <p className="text-sm text-foreground/90">{review.comment}</p>
              </CardContent>
              <CardFooter className="flex flex-col items-start gap-3 pt-3 border-t bg-muted/30">
                {review.ownerReply ? (
                  <div className="w-full">
                    <div className="flex items-center mb-1">
                        <CornerDownRight className="h-4 w-4 mr-2 text-primary" />
                        <p className="text-sm font-semibold text-primary">Your Reply:</p>
                    </div>
                    <p className="text-sm text-foreground/80 pl-6">{review.ownerReply}</p>
                    <p className="text-xs text-muted-foreground mt-1 pl-6">
                      Replied on: {review.ownerRepliedAt ? format(new Date(review.ownerRepliedAt), "MMM d, yyyy 'at' h:mm a") : "N/A"}
                    </p>
                  </div>
                ) : (
                  <form
                    onSubmit={(e: FormEvent) => { e.preventDefault(); handleSubmitReply(review.id); }}
                    className="w-full space-y-2"
                  >
                    <Textarea
                      placeholder="Write your reply..."
                      value={replyInputs[review.id] || ''}
                      onChange={(e) => handleReplyInputChange(review.id, e.target.value)}
                      rows={2}
                      className="bg-background text-sm"
                      disabled={submittingReplyFor === review.id}
                    />
                    <Button 
                      type="submit" 
                      size="sm" 
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                      disabled={submittingReplyFor === review.id || !replyInputs[review.id]?.trim()}
                    >
                      {submittingReplyFor === review.id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="mr-2 h-4 w-4" />
                      )}
                      Submit Reply
                    </Button>
                  </form>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
