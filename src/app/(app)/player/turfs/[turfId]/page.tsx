// src/app/(app)/player/turfs/[turfId]/page.tsx
"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { MapPin, रुपया as RupeeIcon, Star, Clock, CalendarDays, Users, ParkingCircle, ShowerHead, Lightbulb,ChevronLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { Turf, Slot, Review } from '@/types';
import { AmenityIcon } from '@/components/turf/amenity-icon';
import { ReviewCard } from '@/components/turf/review-card';
import { ReviewForm } from '@/components/turf/review-form';
import { AiReviewSummary } from '@/components/turf/ai-review-summary';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
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


// Mock data - replace with actual API calls
const mockTurfsData: Record<string, Turf> = {
  'turf-1': {
    id: 'turf-1',
    ownerId: 'owner-1',
    name: 'Green Kick Arena',
    location: 'Koramangala, Bangalore',
    pricePerHour: 1200,
    images: ['https://placehold.co/800x500.png?text=Green+Kick+Main', 'https://placehold.co/400x300.png?text=GK+Side', 'https://placehold.co/400x300.png?text=GK+Goal'],
    amenities: ['parking', 'restroom', 'floodlights', 'wifi', 'cafe'],
    description: 'State-of-the-art 5-a-side football turf with premium FIFA-certified artificial grass. Enjoy thrilling matches under bright floodlights. We offer clean restrooms, ample parking space, and a small cafe for refreshments. Perfect for friendly games and competitive tournaments.',
    isVisible: true,
    createdAt: new Date(),
    averageRating: 4.5,
    reviewCount: 25,
  },
   'featured-turf-id': { // For the featured turf link from dashboard
    id: 'featured-turf-id',
    ownerId: 'owner-f',
    name: 'City Sports Arena',
    location: 'Downtown, Metropolis',
    pricePerHour: 1500,
    images: ['https://placehold.co/800x500.png?text=City+Sports+Main', 'https://placehold.co/400x300.png?text=CSA+Court'],
    amenities: ['parking', 'restroom', 'floodlights', 'wifi'],
    description: 'The best 5-a-side turf in downtown. Features high-quality turf, excellent lighting, and spectator seating. Ideal for both casual play and organized events.',
    isVisible: true,
    createdAt: new Date(),
    averageRating: 4.7,
    reviewCount: 42,
  },
};

const mockSlotsData: Record<string, Slot[]> = {
  'turf-1': [
    { id: 'slot-1-1', turfId: 'turf-1', date: '2024-07-20', timeRange: '09:00 AM - 10:00 AM', status: 'available', createdAt: new Date() },
    { id: 'slot-1-2', turfId: 'turf-1', date: '2024-07-20', timeRange: '10:00 AM - 11:00 AM', status: 'booked', createdAt: new Date() },
    { id: 'slot-1-3', turfId: 'turf-1', date: '2024-07-20', timeRange: '06:00 PM - 07:00 PM', status: 'available', createdAt: new Date() },
    { id: 'slot-1-4', turfId: 'turf-1', date: '2024-07-21', timeRange: '07:00 PM - 08:00 PM', status: 'maintenance', createdAt: new Date() },
  ],
  'featured-turf-id': [
    { id: 'slot-f-1', turfId: 'featured-turf-id', date: '2024-07-22', timeRange: '05:00 PM - 06:00 PM', status: 'available', createdAt: new Date() },
    { id: 'slot-f-2', turfId: 'featured-turf-id', date: '2024-07-22', timeRange: '06:00 PM - 07:00 PM', status: 'available', createdAt: new Date() },
  ]
};

const mockReviewsData: Record<string, Review[]> = {
  'turf-1': [
    { id: 'review-1-1', turfId: 'turf-1', userId: 'player-1', userName: 'John Doe', rating: 5, comment: 'Amazing turf, well maintained!', createdAt: new Date(2024, 5, 10) },
    { id: 'review-1-2', turfId: 'turf-1', userId: 'player-2', userName: 'Jane Smith', rating: 4, comment: 'Good facilities, but can get crowded.', createdAt: new Date(2024, 6, 1) },
  ],
   'featured-turf-id': [
    { id: 'review-f-1', turfId: 'featured-turf-id', userId: 'player-3', userName: 'Alex Ray', rating: 5, comment: 'Best turf in the city, hands down!', createdAt: new Date(2024, 6, 15) },
  ]
};


export default function TurfDetailPage() {
  const params = useParams();
  const turfId = params.turfId as string;
  const [turf, setTurf] = useState<Turf | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (turfId) {
      // Simulate fetching data
      const currentTurf = mockTurfsData[turfId];
      setTurf(currentTurf);
      setSlots(mockSlotsData[turfId] || []);
      setReviews(mockReviewsData[turfId] || []);
      if (currentTurf && currentTurf.images.length > 0) {
        setSelectedImage(currentTurf.images[0]);
      }
    }
  }, [turfId]);

  const handleBooking = (slot: Slot) => {
    // Mock booking logic
    console.log("Booking slot:", slot);
    // Update slot status locally for demo
    setSlots(prevSlots => prevSlots.map(s => s.id === slot.id ? {...s, status: 'booked'} : s));
    toast({
      title: "Slot Booked!",
      description: `You've booked ${turf?.name} for ${slot.date} at ${slot.timeRange}.`,
      variant: "default", // 'default' has better contrast with theme
    });
  };
  
  const handleReviewSubmitted = () => {
    // Mock: refetch reviews or add to local state
    const newReview: Review = {
        id: `review-new-${Date.now()}`,
        turfId: turfId,
        userId: 'current-user-id', // from auth
        userName: 'Current User', // from auth
        rating: 5,
        comment: 'This is a new test review!',
        createdAt: new Date()
    };
    setReviews(prev => [newReview, ...prev]);
    if (turf) {
      setTurf(prevTurf => prevTurf ? ({...prevTurf, averageRating: ((prevTurf.averageRating || 0) * (prevTurf.reviewCount || 0) + newReview.rating) / ((prevTurf.reviewCount || 0) + 1), reviewCount: (prevTurf.reviewCount || 0) + 1 }) : null);
    }
  }

  if (!turf) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading turf details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Link href="/player/turfs" className="inline-flex items-center text-primary hover:underline mb-4">
        <ChevronLeft className="h-4 w-4 mr-1" /> Back to Turfs
      </Link>

      {/* Image Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <Image
            src={selectedImage || turf.images[0] || "https://placehold.co/800x500.png"}
            alt={turf.name}
            width={800}
            height={500}
            className="w-full h-auto max-h-[500px] object-cover rounded-lg shadow-md"
            data-ai-hint="sports field large"
          />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
          {turf.images.slice(0, 4).map((imgUrl, index) => ( // Show up to 4 thumbnails
            <button key={index} onClick={() => setSelectedImage(imgUrl)} className="focus:outline-none focus:ring-2 focus:ring-primary rounded-md">
              <Image
                src={imgUrl}
                alt={`${turf.name} thumbnail ${index + 1}`}
                width={200}
                height={125}
                className={`w-full h-24 object-cover rounded-md cursor-pointer transition-opacity ${selectedImage === imgUrl ? 'opacity-100 ring-2 ring-primary' : 'opacity-75 hover:opacity-100'}`}
                data-ai-hint="turf detail"
              />
            </button>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Turf Info & Booking */}
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
                  <RupeeIcon className="h-5 w-5 mr-1" /> {turf.pricePerHour} / hour
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
              {/* Simplified Slot Display & Booking */}
              {slots.length > 0 ? (
                <div className="space-y-4">
                  {slots.map(slot => (
                    <div key={slot.id} className="flex justify-between items-center p-3 border rounded-md bg-card hover:bg-muted/50 transition-colors">
                      <div>
                        <p className="font-semibold"><CalendarDays className="inline h-4 w-4 mr-1" /> {slot.date}</p>
                        <p className="text-sm text-muted-foreground"><Clock className="inline h-4 w-4 mr-1" /> {slot.timeRange}</p>
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
                                <Button onClick={() => handleBooking(slot)} className="bg-primary hover:bg-primary/90 text-primary-foreground">Confirm & Pay</Button>
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

        {/* Right Column: Reviews */}
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
              <ReviewForm turfId={turf.id} onSubmitSuccess={handleReviewSubmitted} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

const Loader2 = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
  </svg>
);

