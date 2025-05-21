
// src/app/(app)/player/turfs/[turfId]/page.tsx
"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { MapPin, IndianRupee, Star, Clock, CalendarDays, ChevronLeft, Loader2 as PageLoaderIcon, UserCheck, MessageSquareWarning, LogIn, Calendar as CalendarIcon, Construction } from 'lucide-react';
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
import { format, parseISO, isEqual, startOfDay } from 'date-fns';
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

// Helper to generate default slots for player view
function generateDefaultSlotsForPlayerView(date: string, turfId: string): Slot[] {
    const defaults: Slot[] = [];
    const startHour = 7; // 7 AM
    const endLoopHour = 23;  // Loop until 23 for slot 11:00 PM - 12:00 AM

    function formatHourForTimeRange(hour: number): string { // Local helper
        const ampm = hour >= 12 && hour < 24 ? 'PM' : 'AM';
        let h = hour % 12;
        if (h === 0) h = 12; // For 12 AM (midnight) and 12 PM (noon)
        return `${String(h).padStart(2, '0')}:00 ${ampm}`;
    }

    for (let i = startHour; i <= endLoopHour; i++) {
        const startTime = formatHourForTimeRange(i);
        const endTime = formatHourForTimeRange(i + 1);
        const timeRange = `${startTime} - ${endTime}`;
        defaults.push({
            id: `player-default-slot-${date}-${i}-${Math.random().toString(16).slice(2)}`, // Temporary unique ID for UI
            turfId: turfId,
            date: date,
            timeRange: timeRange,
            status: 'available',
            createdAt: new Date(), 
        });
    }
    return defaults; 
}


export default function TurfDetailPage() {
  const params = useParams();
  const [resolvedTurfId, setResolvedTurfId] = useState<string | null>(null);
  const { user } = useAuth();
  const [turf, setTurf] = useState<Turf | null>(null);
  const [allSlots, setAllSlots] = useState<Slot[]>([]); 
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasUserReviewed, setHasUserReviewed] = useState(false);
  const { toast } = useToast();

  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | undefined>(new Date());
  const [slotsForSelectedDate, setSlotsForSelectedDate] = useState<Slot[]>([]);
  const [pendingBookingSlots, setPendingBookingSlots] = useState<Slot[]>([]); 
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);

  useEffect(() => {
    if (params?.turfId && typeof params.turfId === 'string') {
      setResolvedTurfId(params.turfId);
    }
  }, [params?.turfId]);


  useEffect(() => {
    if (resolvedTurfId) {
      setIsLoading(true);
      try {
        const currentTurf = fetchTurfById(resolvedTurfId);
        if (currentTurf) {
          setTurf(currentTurf);
          const fetchedSlots = fetchSlotsForTurf(resolvedTurfId); 
          setAllSlots(fetchedSlots);
          
          const fetchedReviews = fetchReviewsForTurf(resolvedTurfId);
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
  }, [resolvedTurfId, toast, user]);

  useEffect(() => {
    if (selectedCalendarDate && resolvedTurfId) {
      const dateStr = format(selectedCalendarDate, 'yyyy-MM-dd');
      
      const dbSlotsForDate = allSlots
        .filter(slot => slot.date === dateStr)
        .sort((a,b) => timeStringToMinutes(a.timeRange.split(' - ')[0]) - timeStringToMinutes(b.timeRange.split(' - ')[0]));

      if (dbSlotsForDate.length > 0) {
          setSlotsForSelectedDate(dbSlotsForDate);
      } else {
          const defaultGeneratedSlots = generateDefaultSlotsForPlayerView(dateStr, resolvedTurfId);
          setSlotsForSelectedDate(defaultGeneratedSlots);
      }
      setPendingBookingSlots([]); 
    } else {
      setSlotsForSelectedDate([]);
      setPendingBookingSlots([]);
    }
  }, [selectedCalendarDate, allSlots, resolvedTurfId]);


  const handleSlotSelection = (slot: Slot) => {
    if (slot.status !== 'available') return;

    setPendingBookingSlots(prev => {
      const isAlreadySelected = prev.find(s => s.id === slot.id);
      if (isAlreadySelected) {
        return prev.filter(s => s.id !== slot.id);
      } else {
        const newPendingSlots = [...prev, slot];
        return newPendingSlots.sort((a, b) => 
            timeStringToMinutes(a.timeRange.split(' - ')[0]) - timeStringToMinutes(b.timeRange.split(' - ')[0])
        );
      }
    });
  };

  const handleConfirmMultipleBookings = async () => {
    if (!user || !turf || pendingBookingSlots.length === 0 || !resolvedTurfId || !selectedCalendarDate) {
      toast({ title: "Error", description: "No slots selected, user not logged in, turf ID, or date missing.", variant: "destructive" });
      setIsBookingDialogOpen(false);
      return;
    }

    const slotsToBookInfo = pendingBookingSlots.map(slot => ({
        tempSlotId: slot.id, // This ID might be temporary if it's a default generated one
        timeRange: slot.timeRange,
        price: turf.pricePerHour, // Assuming price per hour is per slot for now
    }));
    
    try {
      const confirmedBooking = addBookingToDB(
          user.uid,
          turf.id,
          turf.name,
          turf.location,
          format(selectedCalendarDate, 'yyyy-MM-dd'),
          slotsToBookInfo
      );
        
      // Update local UI state: fetch all slots again to get persistent IDs and updated statuses
      const updatedDbSlots = fetchSlotsForTurf(turf.id);
      setAllSlots(updatedDbSlots);

      toast({
        title: `Booking Successful (${confirmedBooking.bookedSlotDetails.length} slot${confirmedBooking.bookedSlotDetails.length > 1 ? 's' : ''})`,
        description: `Your booking is pending confirmation. Check 'My Bookings'.`,
        variant: "default",
      });

    } catch (error) {
        console.error(`Error creating consolidated booking:`, error);
        toast({ title: "Booking Failed", description: `Could not book selected slots. Some may have become unavailable.`, variant: "destructive"});
    } finally {
        setPendingBookingSlots([]);
        setIsBookingDialogOpen(false);
    }
  };
  
  const handleReviewSubmitted = (rating: number, comment: string) => {
    if (!user || !turf || !resolvedTurfId) {
        toast({ title: "Error", description: "Cannot submit review. User, turf, or turf ID missing.", variant: "destructive" });
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

  if (!resolvedTurfId && !isLoading) { 
    return (
      <div className="flex items-center justify-center h-64">
        <PageLoaderIcon className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading turf identifier...</p>
      </div>
    );
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
                        const isMaintenance = slot.status === 'maintenance';

                        let slotVariant: "default" | "secondary" | "outline" = "secondary";
                        let slotIcon = <Clock className="mr-1.5 h-3.5 w-3.5"/>;
                        let additionalClasses = "hover:bg-primary/10 text-foreground";
                        let buttonTitle = "Available";

                        if (isBooked) {
                            slotVariant = "outline";
                            additionalClasses = "border-border text-muted-foreground cursor-not-allowed opacity-60 bg-muted/30 hover:bg-muted/30";
                            buttonTitle = "Slot booked";
                        } else if (isMaintenance) {
                            slotVariant = "outline";
                            additionalClasses = "border-yellow-500/50 text-yellow-700 cursor-not-allowed opacity-70 bg-yellow-500/10 hover:bg-yellow-500/10";
                            slotIcon = <Construction className="mr-1.5 h-3.5 w-3.5 text-yellow-600"/>;
                            buttonTitle = "Slot under maintenance";
                        } else if (isSelected) {
                            slotVariant = "default";
                            additionalClasses = "bg-primary text-primary-foreground ring-2 ring-primary-foreground ring-offset-1 ring-offset-primary shadow-md";
                        }
                        
                        return (
                          <Button
                            key={slot.id}
                            variant={slotVariant}
                            size="sm"
                            onClick={() => handleSlotSelection(slot)}
                            disabled={isBooked || isMaintenance}
                            className={cn(
                                "min-w-[130px] transition-all duration-150 ease-in-out py-2 px-3 h-auto",
                                additionalClasses
                            )}
                            title={buttonTitle}
                          >
                            {slotIcon} {slot.timeRange}
                          </Button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">No slots configured or available for this date. Please try another date.</p>
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
                      <strong className="block mb-1">Selected Slots ({pendingBookingSlots.length}):</strong>
                      <ul className="space-y-1 max-h-20 overflow-y-auto">
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
                            return;
                        }
                        setIsBookingDialogOpen(true);
                      }}
                      className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                      disabled={pendingBookingSlots.length === 0}
                    >
                       {user ? `Confirm ${pendingBookingSlots.length} Slot${pendingBookingSlots.length > 1 ? 's' : ''}` : 'Login to Book'}
                    </Button>
                  </CardFooter>
                </Card>
              )}
               {!user && selectedCalendarDate && slotsForSelectedDate.length > 0 && pendingBookingSlots.length === 0 && (
                  <p className="text-center text-muted-foreground mt-6">
                    Please {resolvedTurfId ? 
                      <Link href={`/login?redirect=/player/turfs/${resolvedTurfId}`} className="text-primary hover:underline font-medium">login</Link> : 
                      <span className="text-primary font-medium">login</span>
                    } to select and book slots.
                  </p>
                )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {reviews.length > 0 && resolvedTurfId && (
             <AiReviewSummary turfId={resolvedTurfId} reviews={reviews} />
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
                    {resolvedTurfId ? (
                       <Link href={`/login?redirect=/player/turfs/${resolvedTurfId}`}>
                            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                                <LogIn className="mr-2 h-4 w-4" /> Login to Review
                            </Button>
                        </Link>
                    ) : (
                         <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled>
                            <LogIn className="mr-2 h-4 w-4" /> Login to Review
                        </Button>
                    )}
                </div>
              ) : hasUserReviewed ? (
                 <div className="text-center py-4">
                    <UserCheck className="h-10 w-10 mx-auto text-primary mb-3" />
                    <p className="text-foreground">Thanks for your feedback!</p>
                    <p className="text-sm text-muted-foreground">You have already reviewed this turf.</p>
                </div>
              ) : resolvedTurfId ? ( 
                <ReviewForm turfId={resolvedTurfId} onSubmitReview={handleReviewSubmitted} />
              ) : (
                <p className="text-muted-foreground">Loading review form...</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Your Booking</DialogTitle>
            <DialogDescription asChild>
              <div>
                You are about to book the following {pendingBookingSlots.length} slot(s) for <strong>{turf.name}</strong> on <strong>{selectedCalendarDate ? format(selectedCalendarDate, "PPP") : ''}</strong>:
                <ul className="list-disc list-inside my-3 space-y-1 text-sm text-foreground max-h-32 overflow-y-auto">
                  {pendingBookingSlots.map(slot => <li key={slot.id}>{slot.timeRange}</li>)}
                </ul>
                Total Amount: <IndianRupee className="inline h-4 w-4 align-[-2px]"/>{totalBookingAmount.toLocaleString()}. Proceed?
              </div>
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

