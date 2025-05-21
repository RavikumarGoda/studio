
// src/app/(app)/player/turfs/[turfId]/page.tsx
"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { MapPin, IndianRupee, Star, Clock, CalendarDays, ChevronLeft, Loader2 as PageLoaderIcon, UserCheck, MessageSquareWarning, LogIn, Calendar as CalendarIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import type { Turf, Slot, Review, Booking } from '@/types';
import { AmenityIcon } from '@/components/turf/amenity-icon';
import { ReviewCard } from '@/components/turf/review-card';
import { ReviewForm } from '@/components/turf/review-form';
import { AiReviewSummary } from '@/components/turf/ai-review-summary';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, parseISO, isFuture, isEqual, startOfDay } from 'date-fns';
import { cn } from "@/lib/utils";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { getTurfById as fetchTurfById, getSlotsForTurf as fetchSlotsForTurf, getReviewsForTurf as fetchReviewsForTurf, addBooking as addBookingToDB, addReviewForTurf as addReviewToDB } from '@/lib/mock-db';
import { Label } from '@/components/ui/label';

// Helper to sort slots chronologically
function timeStringToMinutes(timeStr: string): number {
  const [time, modifier] = timeStr.split(' ');
  let [hours, minutes] = time.split(':').map(Number);
  if (modifier && modifier.toUpperCase() === 'PM' && hours !== 12) hours += 12;
  if (modifier && modifier.toUpperCase() === 'AM' && hours === 12) hours = 0; // Midnight case
  return hours * 60 + minutes;
}


export default function TurfDetailPage() {
  const params = useParams();
  const turfId = params.turfId as string;
  const { user } = useAuth();
  const [turf, setTurf] = useState<Turf | null>(null);
  const [allSlots, setAllSlots] = useState<Slot[]>([]); // All slots for the turf
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasUserReviewed, setHasUserReviewed] = useState(false);
  const { toast } = useToast();

  // New state for redesigned slot booking
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | undefined>(new Date());
  const [slotsForSelectedDate, setSlotsForSelectedDate] = useState<Slot[]>([]);
  const [pendingBookingSlots, setPendingBookingSlots] = useState<Slot[]>([]); // Slots selected by user for booking
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);


  useEffect(() => {
    if (turfId) {
      setIsLoading(true);
      try {
        const currentTurf = fetchTurfById(turfId);
        if (currentTurf) {
          setTurf(currentTurf);
          const fetchedSlots = fetchSlotsForTurf(turfId).sort((a,b) => {
            const dateComparison = new Date(a.date).getTime() - new Date(b.date).getTime();
            if (dateComparison !== 0) return dateComparison;
            const startTimeA = a.timeRange.split(' - ')[0];
            const startTimeB = b.timeRange.split(' - ')[0];
            return timeStringToMinutes(startTimeA) - timeStringToMinutes(startTimeB);
          });
          setAllSlots(fetchedSlots);
          
          const fetchedReviews = fetchReviewsForTurf(turfId);
          setReviews(fetchedReviews);
          if (currentTurf.images && currentTurf.images.length > 0) {
            setSelectedImage(currentTurf.images[0]);
          }
          if (user && fetchedReviews.some(review => review.userId === user.uid)) {
            setHasUserReviewed(true);
          } else {
            setHasUserReviewed(false);
          }

        } else {
          toast({ title: "Error", description: "Turf not found.", variant: "destructive" });
        }
      } catch (error) {
          console.error("Error fetching turf details:", error);
          toast({ title: "Error", description: "Could not load turf details.", variant: "destructive"});
      } finally {
        setIsLoading(false);
      }
    }
  }, [turfId, toast, user]);

  // Effect to filter slots when selectedCalendarDate or allSlots changes
  useEffect(() => {
    if (selectedCalendarDate) {
      const dateStr = format(selectedCalendarDate, 'yyyy-MM-dd');
      const filtered = allSlots.filter(slot => slot.date === dateStr).sort((a,b) => {
        const startTimeA = a.timeRange.split(' - ')[0];
        const startTimeB = b.timeRange.split(' - ')[0];
        return timeStringToMinutes(startTimeA) - timeStringToMinutes(startTimeB);
      });
      setSlotsForSelectedDate(filtered);
      setPendingBookingSlots([]); // Clear pending bookings when date changes
    } else {
      setSlotsForSelectedDate([]);
      setPendingBookingSlots([]);
    }
  }, [selectedCalendarDate, allSlots]);


  const handleSlotSelection = (slot: Slot) => {
    if (slot.status !== 'available') return;

    setPendingBookingSlots(prev => {
      const isAlreadySelected = prev.find(s => s.id === slot.id);
      if (isAlreadySelected) {
        return prev.filter(s => s.id !== slot.id);
      } else {
        // Sort the newly added slot into the array to maintain chronological order
        const newPendingSlots = [...prev, slot];
        return newPendingSlots.sort((a, b) => {
            const startTimeA = a.timeRange.split(' - ')[0];
            const startTimeB = b.timeRange.split(' - ')[0];
            return timeStringToMinutes(startTimeA) - timeStringToMinutes(startTimeB);
        });
      }
    });
  };

  const handleConfirmMultipleBookings = async () => {
    if (!user || !turf || pendingBookingSlots.length === 0) {
      toast({ title: "Error", description: "No slots selected or user not logged in.", variant: "destructive" });
      setIsBookingDialogOpen(false);
      return;
    }

    let bookingsMadeCount = 0;
    let bookingFailed = false;
    const newAllSlots = [...allSlots]; // Create a mutable copy

    for (const slot of pendingBookingSlots) {
      const newBookingData: Omit<Booking, 'id' | 'createdAt'> = {
          turfId: turf.id,
          playerId: user.uid,
          slotId: slot.id,
          turfName: turf.name,
          turfLocation: turf.location,
          timeRange: slot.timeRange,
          bookingDate: slot.date,
          status: 'pending',
          paymentStatus: 'unpaid',
          totalAmount: turf.pricePerHour,
      };
      try {
          addBookingToDB(newBookingData);
          // Update slot status in the mutable copy of allSlots
          const slotIndex = newAllSlots.findIndex(s => s.id === slot.id);
          if (slotIndex > -1) {
            newAllSlots[slotIndex] = { ...newAllSlots[slotIndex], status: 'booked', bookedBy: user.uid };
          }
          bookingsMadeCount++;
      } catch (error) {
          bookingFailed = true;
          console.error(`Error creating booking for slot ${slot.id}:`, error);
          toast({ title: "Booking Failed", description: `Could not book slot ${slot.timeRange}.`, variant: "destructive"});
      }
    }
    
    setAllSlots(newAllSlots); // Update the main slots state once after all operations

    if (bookingsMadeCount > 0 && !bookingFailed) {
      toast({
        title: `Booking Successful (${bookingsMadeCount} slot${bookingsMadeCount > 1 ? 's' : ''})`,
        description: `Your booking${bookingsMadeCount > 1 ? 's are' : ' is'} pending confirmation. Check 'My Bookings'.`,
        variant: "default",
      });
    } else if (bookingsMadeCount > 0 && bookingFailed) {
        toast({
        title: `Partial Booking (${bookingsMadeCount} slot${bookingsMadeCount > 1 ? 's' : ''})`,
        description: `Some slots were booked. Others failed. Check 'My Bookings'.`,
        variant: "default", // or "warning" if you add such a variant
      });
    }

    setPendingBookingSlots([]);
    setIsBookingDialogOpen(false);
  };
  
  const handleReviewSubmitted = (rating: number, comment: string) => {
    if (!user || !turf) {
        toast({ title: "Error", description: "Cannot submit review.", variant: "destructive" });
        return;
    }
    if (hasUserReviewed) {
        toast({ title: "Already Reviewed", description: "You have already submitted a review for this turf.", variant: "default" });
        return;
    }
    try {
        const reviewPayload = { userId: user.uid, userName: user.name, rating, comment };
        addReviewToDB(turf.id, reviewPayload);
        const updatedReviews = fetchReviewsForTurf(turf.id);
        setReviews(updatedReviews);
        setHasUserReviewed(true);
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

  const totalBookingAmount = turf.pricePerHour * pendingBookingSlots.length;


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

          {/* New Slot Booking UI */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Book Your Slots</CardTitle>
              <CardDescription>Select a date, then choose your desired time slots below.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="booking-date" className="text-md font-semibold block mb-2">Select Date:</Label>
                 <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="booking-date"
                      variant={"outline"}
                      className={cn(
                        "w-full md:w-[280px] justify-start text-left font-normal",
                        !selectedCalendarDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedCalendarDate ? format(selectedCalendarDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedCalendarDate}
                      onSelect={setSelectedCalendarDate}
                      disabled={(date) => !isFuture(date) && !isEqual(startOfDay(date), startOfDay(new Date()))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {selectedCalendarDate && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Available Slots for {format(selectedCalendarDate, "PPP")}:</h3>
                  {slotsForSelectedDate.length > 0 ? (
                    <div className="flex flex-wrap gap-3">
                      {slotsForSelectedDate.map(slot => {
                        const isSelected = pendingBookingSlots.some(s => s.id === slot.id);
                        const isBooked = slot.status === 'booked';
                        return (
                          <Button
                            key={slot.id}
                            variant={isBooked ? "outline" : (isSelected ? "default" : "secondary")}
                            size="sm"
                            onClick={() => handleSlotSelection(slot)}
                            disabled={isBooked}
                            className={cn(
                                "min-w-[130px] transition-all duration-150 ease-in-out py-2 px-3 h-auto",
                                isBooked && "border-border text-muted-foreground cursor-not-allowed opacity-60 bg-muted/30 hover:bg-muted/30",
                                isSelected && "bg-primary text-primary-foreground ring-2 ring-primary-foreground ring-offset-1 ring-offset-primary shadow-md",
                                !isBooked && !isSelected && "hover:bg-primary/10 text-foreground"
                            )}
                          >
                            <Clock className="mr-1.5 h-3.5 w-3.5"/> {slot.timeRange}
                          </Button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">No slots available for this date. Please try another date.</p>
                  )}
                </div>
              )}

              {pendingBookingSlots.length > 0 && (
                <Card className="mt-6 bg-muted/20 p-4 rounded-lg border border-border shadow-sm">
                  <CardHeader className="p-0 pb-3">
                    <CardTitle className="text-xl font-semibold">Booking Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 space-y-2 text-sm">
                    <p><strong>Turf:</strong> {turf.name}</p>
                    <p><strong>Date:</strong> {selectedCalendarDate ? format(selectedCalendarDate, "PPP") : 'N/A'}</p>
                    <div>
                      <strong className="block mb-1">Selected Slots:</strong>
                      <ul className="space-y-1">
                        {pendingBookingSlots.map(slot => 
                            <li key={slot.id} className="flex items-center text-xs bg-background border border-border rounded-md px-2 py-1">
                                <Clock className="h-3 w-3 mr-1.5 text-muted-foreground"/> {slot.timeRange}
                            </li>
                        )}
                      </ul>
                    </div>
                    <p className="font-semibold text-md pt-2 border-t mt-2">
                        <strong>Total:</strong> <IndianRupee className="inline h-4 w-4 align-[-2px]"/>{totalBookingAmount.toLocaleString()}
                    </p>
                  </CardContent>
                  <CardFooter className="p-0 pt-4 mt-3 border-t">
                    <Button 
                      onClick={() => {
                        if (!user) {
                            toast({title: "Login Required", description: "Please log in to confirm your booking.", variant: "default"});
                            // Optionally, you could redirect to login here: router.push('/login?redirect=/player/turfs/' + turfId);
                            return;
                        }
                        setIsBookingDialogOpen(true);
                      }}
                      className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                    >
                       {user ? `Confirm ${pendingBookingSlots.length} Slot${pendingBookingSlots.length > 1 ? 's' : ''}` : 'Login to Book'}
                    </Button>
                  </CardFooter>
                </Card>
              )}
               {!user && selectedCalendarDate && slotsForSelectedDate.length > 0 && pendingBookingSlots.length === 0 && (
                  <p className="text-center text-muted-foreground mt-6">
                    Please <Link href={`/login?redirect=/player/turfs/${turfId}`} className="text-primary hover:underline font-medium">login</Link> to select and book slots.
                  </p>
                )}
            </CardContent>
          </Card>
          {/* End New Slot Booking UI */}
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
              {!user && (
                <CardDescription>You need to be logged in to leave a review.</CardDescription>
              )}
              {user && hasUserReviewed && (
                <CardDescription>You&apos;ve already shared your thoughts on this turf!</CardDescription>
              )}
              {user && !hasUserReviewed && (
                <CardDescription>Share your experience with other players.</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              {!user ? (
                <div className="text-center py-4">
                    <MessageSquareWarning className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground mb-4">Please log in to share your experience.</p>
                    <Link href={`/login?redirect=/player/turfs/${turfId}`}>
                        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                            <LogIn className="mr-2 h-4 w-4" /> Login to Review
                        </Button>
                    </Link>
                </div>
              ) : hasUserReviewed ? (
                 <div className="text-center py-4">
                    <UserCheck className="h-10 w-10 mx-auto text-primary mb-3" />
                    <p className="text-foreground">Thanks for your feedback!</p>
                    <p className="text-sm text-muted-foreground">You have already reviewed this turf.</p>
                </div>
              ) : (
                <ReviewForm turfId={turf.id} onSubmitReview={handleReviewSubmitted} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog for Confirming Multiple Bookings */}
      <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Your Booking</DialogTitle>
            <DialogDescription>
              You are about to book the following slots for <strong>{turf.name}</strong> on <strong>{selectedCalendarDate ? format(selectedCalendarDate, "PPP") : ''}</strong>:
              <ul className="list-disc list-inside my-3 space-y-1 text-sm text-foreground">
                {pendingBookingSlots.map(slot => <li key={slot.id}>{slot.timeRange}</li>)}
              </ul>
              Total Amount: <IndianRupee className="inline h-4 w-4 align-[-2px]"/>{totalBookingAmount.toLocaleString()}. Proceed?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
              <DialogClose asChild>
              <Button variant="outline" onClick={() => setIsBookingDialogOpen(false)}>Cancel</Button>
            </DialogClose>
            <Button onClick={handleConfirmMultipleBookings} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Confirm & Book
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

