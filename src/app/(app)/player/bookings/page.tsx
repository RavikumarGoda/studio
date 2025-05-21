
// src/app/(app)/player/bookings/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { BookingCard } from '@/components/booking/booking-card';
import type { Booking } from '@/types';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, CalendarX2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getBookingsForPlayer as fetchPlayerBookings, updateBooking as updateBookingInDB } from '@/lib/mock-db';

export default function PlayerBookingsPage() {
  const { user, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [bookingToCancel, setBookingToCancel] = useState<string | null>(null);


  useEffect(() => {
    if (!authLoading && user) {
      setIsLoading(true);
      try {
        const userBookings = fetchPlayerBookings(user.uid)
          .sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime() || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setBookings(userBookings);
      } catch (error) {
        console.error("Error fetching player bookings:", error);
        toast({ title: "Error", description: "Could not load your bookings.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    } else if (!authLoading && !user) {
      setIsLoading(false);
    }
  }, [user, authLoading, toast]);

  const handleConfirmCancelBooking = () => {
    if (!bookingToCancel) return;
    
    try {
      const updatedBooking = updateBookingInDB(bookingToCancel, { status: 'cancelled' });
      if (updatedBooking) {
        setBookings(prevBookings =>
          prevBookings.map(b =>
            b.id === bookingToCancel ? { ...b, status: 'cancelled' } : b
          )
        );
        toast({
          title: "Booking Cancelled",
          description: `Booking ID ${bookingToCancel} has been cancelled.`,
        });
      } else {
        toast({ title: "Error", description: "Failed to cancel booking.", variant: "destructive" });
      }
    } catch (error) {
        console.error("Error cancelling booking:", error);
        toast({ title: "Error", description: "Could not cancel booking.", variant: "destructive" });
    } finally {
        setBookingToCancel(null);
    }
  };

  if (isLoading || authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading your bookings...</p>
      </div>
    );
  }

  if (!user) {
     return (
      <div className="text-center py-10">
        <CalendarX2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Please log in</h2>
        <p className="text-muted-foreground">Log in to view your turf bookings.</p>
         <Link href="/login" className="mt-4 inline-block">
            <Button>Login</Button>
        </Link>
      </div>
    );
  }

  const upcomingBookings = bookings.filter(b => (b.status === 'approved' || b.status === 'pending') && new Date(b.bookingDate) >= new Date());
  const pastBookings = bookings.filter(b => b.status === 'completed' || b.status === 'cancelled' || new Date(b.bookingDate) < new Date());


  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-primary">My Bookings</h1>
        <p className="text-muted-foreground">Manage your upcoming and past turf reservations.</p>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-10 bg-card shadow-md rounded-lg">
          <CalendarX2 className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold mb-2">No Bookings Yet</h2>
          <p className="text-muted-foreground mb-6">You haven&apos;t made any bookings. Time to hit the field!</p>
          <Link href="/player/turfs">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Find a Turf</Button>
          </Link>
        </div>
      ) : (
        <>
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground/90">Upcoming Bookings</h2>
            {upcomingBookings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {upcomingBookings.map((booking) => (
                  <BookingCard 
                    key={booking.id} 
                    booking={booking} 
                    onCancel={() => setBookingToCancel(booking.id)}
                  />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No upcoming bookings.</p>
            )}
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground/90">Past Bookings</h2>
            {pastBookings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pastBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No past bookings.</p>
            )}
          </section>
        </>
      )}
      
      <AlertDialog open={!!bookingToCancel} onOpenChange={(open) => !open && setBookingToCancel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to cancel this booking?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Cancellation policies may apply.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setBookingToCancel(null)}>Keep Booking</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmCancelBooking}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Confirm Cancellation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
