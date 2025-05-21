// src/components/turf/review-card.tsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Star } from "lucide-react";
import type { Review } from "@/types";
import { format } from 'date-fns';

interface ReviewCardProps {
  review: Review;
}

const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length === 1) return names[0].substring(0, 2).toUpperCase();
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
}

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={`https://placehold.co/100x100.png?text=${getInitials(review.userName || "User")}`} alt={review.userName || "User"} data-ai-hint="user avatar" />
            <AvatarFallback>{getInitials(review.userName || "U")}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium leading-none">{review.userName || "Anonymous Player"}</p>
            <p className="text-xs text-muted-foreground">
              {format(new Date(review.createdAt as Date), "MMM d, yyyy")}
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
      <CardContent>
        <p className="text-sm text-foreground/90">{review.comment}</p>
      </CardContent>
    </Card>
  );
}
