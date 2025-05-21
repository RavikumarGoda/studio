
// src/app/(app)/player/turfs/[turfId]/page.tsx
"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { MapPin, IndianRupee, Star, Clock, CalendarDays, ChevronLeft, Loader2 as PageLoaderIcon } from 'lucide-react'; // Renamed Loader2 to avoid conflict
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { Turf, Slot, Review, Booking } from '@/types';
import { AmenityIcon } from '@/components/turf/amenity-icon';
import { ReviewCard } from '@/components/turf/review-card';
import { ReviewForm } from '@/components/turf/review-form';
import { AiReviewSummary } from '@/components/turf/ai-review-summary';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { getTurfById as fetchTurfById, getSlotsForTurf as fetchSlotsForTurf, getReviewsForTurf as fetchReviewsForTurf, addBooking as addBookingToDB, addReviewForTurf as addReviewToDB } from '@/lib/mock-db';


export default function TurfDetailPage() {
  const params = useParams();
  const turfId = params.turfId as string;
  const { user } = useAuth();
  const [turf, setTurf] = useState<Turf | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (turfId) {
      setIsLoading(true);
      try {
        const currentTurf = fetchTurfById(turfId);
        if (currentTurf) {
          setTurf(currentTurf);
          setSlots(fetchSlotsForTurf(turfId));
          setReviews(fetchReviewsForTurf(turfId));
          if (currentTurf.images && currentTurf.images.length > 0) {
            setSelectedImage(currentTurf.images[0]);
          }
        } else {
          toast({ title: "Error", description: "Turf not found.", variant: "destructive" });
          // Consider redirecting: router.push('/player/turfs');
        }
      } catch (error) {
          console.error("Error fetching turf details:", error);
          toast({ title: "Error", description: "Could not load turf details.", variant: "destructive"});
      } finally {
        setIsLoading(false);
      }
    }
  }, [turfId, toast]);

  const handleBooking = (slot: Slot) => {
    if (!user) {
      toast({ title: "Login Required", description: "Please login to book a slot.", variant: "default" });
      return;
    }
    if (!turf) return;

    const newBookingData: Omit<Booking, 'id' | 'createdAt'> = {
        turfId: turf.id,
        playerId: user.uid,
        slotId: slot.id,
        turfName: turf.name,
        turfLocation: turf.location,
        timeRange: slot.timeRange,
        bookingDate: slot.date,
        status: 'pending', // Or 'approved' if auto-approved
        paymentStatus: 'unpaid', // Assume payment happens next
        totalAmount: turf.pricePerHour,
    };

    try {
        addBookingToDB(newBookingData);
        // Update slot status locally for demo, or refetch slots
        setSlots(prevSlots => prevSlots.map(s => s.id === slot.id ? {...s, status: 'booked', bookedBy: user.uid } : s));
        toast({
        title: "Slot Booked (Pending Confirmation)!",
        description: `Your booking for ${turf.name} is pending. Check 'My Bookings'.`,
        variant: "default",
        });
    } catch (error) {
        console.error("Error creating booking:", error);
        toast({ title: "Booking Failed", description: "Could not complete your booking.", variant: "destructive"});
    }
  };
  
  const handleReviewSubmitted = (rating: number, comment: string) => {
    if (!user || !turf) {
        toast({ title: "Error", description: "Cannot submit review.", variant: "destructive" });
        return;
    }
    try {
        const reviewPayload = { userId: user.uid, userName: user.name, rating, comment };
        addReviewToDB(turf.id, reviewPayload);
        // Refetch reviews and turf data to update average rating
        setReviews(fetchReviewsForTurf(turf.id));
        const updatedTurf = fetchTurfById(turf.id);
        if(updatedTurf) setTurf(updatedTurf);

        toast({ title: "Review Submitted", description: "Thanks for your feedback!", variant: "default"});
    } catch (error) {
        console.error("Error submitting review:", error);
        toast({ title: "Review Failed", description: "Could not submit your review.", variant: "destructive"});
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <PageLoaderIcon className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading turf details...</p>
      </div>
    );
  }
  
  if (!turf) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-semibold">Turf Not Found</h2>
        <p className="text-muted-foreground">The turf you are looking for does not exist or is unavailable.</p>
        <Link href="/player/turfs" className="mt-4 inline-block">
          <Button>Back to Turfs</Button>
        </Link>
      </div>
    );
  }


  return (
    <div className="space-y-8">
      <Link href="/player/turfs" className="inline-flex items-center text-primary hover:underline mb-4">
        <ChevronLeft className="h-4 w-4 mr-1" /> Back to Turfs
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <Image
            src={selectedImage || (turf.images && turf.images.length > 0 ? turf.images[0] : "https://placehold.co/800x500.png")}
            alt={turf.name}
            width={800}
            height={500}
            className="w-full h-auto max-h-[500px] object-cover rounded-lg shadow-md"
            data-ai-hint="sports field large"
            unoptimized={selectedImage?.startsWith('blob:')}
          />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
          {turf.images && turf.images.slice(0, 4).map((imgUrl, index) => ( 
            <button key={index} onClick={() => setSelectedImage(imgUrl)} className="focus:outline-none focus:ring-2 focus:ring-primary rounded-md">
              <Image
                src={imgUrl}
                alt={`${turf.name} thumbnail ${index + 1}`}
                width={200}
                height={125}
                className={`w-full h-24 object-cover rounded-md cursor-pointer transition-opacity ${selectedImage === imgUrl ? 'opacity-100 ring-2 ring-primary' : 'opacity-75 hover:opacity-100'}`}
                data-ai-hint="turf detail"
                 unoptimized={imgUrl.startsWith('blob:')}
              />
            </button>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-3xl font-bold text-primary">{turf.name}</CardTitle>
                  <CardDescription className="flex items-center text-md text-muted-foreground mt-1">
                    <MapPin className="h-5 w-5 mr-2 flex-shrink-0" />
                    {turf.location}
                  </CardDescription>
                </div>
                <div className="text-right">
                   <div className="flex items-center justify-end text-accent mb-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${i < (turf.averageRating || 0) ? "text-accent fill-accent" : "text-muted-foreground"}`}
                        />
                      ))}
                      <span className="ml-1 text-sm font-medium">({turf.averageRating?.toFixed(1) || 'N/A'})</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{turf.reviewCount || 0} reviews</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-4">
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  <IndianRupee className="h-5 w-5 mr-1" /> {turf.pricePerHour} / hour
                </Badge>
              </div>
              <p className="text-foreground/80 mb-4 whitespace-pre-line">{turf.description}</p>
              
              <h3 className="text-lg font-semibold mb-2">Amenities:</h3>
              <div className="flex flex-wrap gap-4">
                {turf.amenities.map(amenity => (
                  <div key={amenity} className="flex items-center space-x-2 p-2 bg-muted rounded-md">
                    <AmenityIcon amenity={amenity} className="h-6 w-6 text-primary" />
                    <span className="capitalize text-sm">{amenity}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Available Slots</CardTitle>
              <CardDescription>Select a date and time to book this turf.</CardDescription>
            </CardHeader>
            <CardContent>
              {slots.length > 0 ? (
                <div className="space-y-4">
                  {slots.map(slot => (
                    <div key={slot.id} className="flex justify-between items-center p-3 border rounded-md bg-card hover:bg-muted/50 transition-colors">
                      <div>
                        <p className="font-semibold"><CalendarDays className="inline h-4 w-4 mr-1" /> {slot.date}</p>
                        <p className="text-sm text-muted-foreground"><Clock className="inline h-4 w-4 mr-1" /> {slot.timeRange}</p>
                         {slot.status === 'booked' && slot.bookedBy && (
                            <p className="text-xs text-blue-600">Booked</p>
                        )}
                      </div>
                      {slot.status === 'available' ? (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground">Book Now</Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Confirm Booking</DialogTitle>
                              <DialogDescription>
                                You are about to book <strong>{turf.name}</strong> for <strong>{slot.date}</strong> at <strong>{slot.timeRange}</strong>.
                                <br />
                                Price: ₹{turf.pricePerHour}
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                               <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                              </DialogClose>
                              <DialogClose asChild>
                                <Button onClick={() => handleBooking(slot)} className="bg-primary hover:bg-primary/90 text-primary-foreground">Confirm & Proceed</Button>
                              </DialogClose>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      ) : (
                        <Badge variant={slot.status === 'booked' ? 'destructive' : 'outline'} className="capitalize text-sm">
                          {slot.status}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No available slots for this turf currently. Please check back later.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {reviews.length > 0 && (
             <AiReviewSummary turfId={turf.id} reviews={reviews} />
          )}
         
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Player Reviews</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 max-h-[600px] overflow-y-auto">
              {reviews.length > 0 ? (
                reviews.map(review => <ReviewCard key={review.id} review={review} />)
              ) : (
                <p className="text-muted-foreground">No reviews yet for this turf.</p>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Leave a Review</CardTitle>
              <CardDescription>Share your experience with other players.</CardDescription>
            </CardHeader>
            <CardContent>
              <ReviewForm turfId={turf.id} onSubmitReview={handleReviewSubmitted} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
