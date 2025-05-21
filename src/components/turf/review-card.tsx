
// src/components/turf/review-card.tsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Star, CornerDownRight } from "lucide-react";
import type { Review } from "@/types";
import { format } from 'date-fns';

interface ReviewCardProps {
  review: Review;
}

const getInitials = (name: string = "User") => {
    const names = name.split(' ');
    if (names.length === 1) return names[0].substring(0, 2).toUpperCase();
    return (names[0][0] + (names[names.length - 1][0] || names[0][1] || 'U')).toUpperCase();
}

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={`https://placehold.co/100x100.png?text=${getInitials(review.userName)}`} alt={review.userName || "User"} data-ai-hint="user avatar" />
            <AvatarFallback>{getInitials(review.userName)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium leading-none">{review.userName || "Anonymous Player"}</p>
            <p className="text-xs text-muted-foreground">
              Reviewed: {format(new Date(review.createdAt), "MMM d, yyyy")}
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
      <CardContent className="pb-3">
        <p className="text-sm text-foreground/90">{review.comment}</p>
      </CardContent>
      {review.ownerReply && (
        <CardFooter className="pt-3 pb-4 border-t bg-muted/30">
          <div className="w-full">
            <div className="flex items-center mb-1">
              <CornerDownRight className="h-4 w-4 mr-2 text-primary flex-shrink-0" />
              <p className="text-sm font-semibold text-primary">Owner's Reply:</p>
            </div>
            <p className="text-sm text-foreground/80 pl-6">{review.ownerReply}</p>
            {review.ownerRepliedAt && (
              <p className="text-xs text-muted-foreground mt-1 pl-6">
                Replied: {format(new Date(review.ownerRepliedAt), "MMM d, yyyy")}
              </p>
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
