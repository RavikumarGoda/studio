
// src/app/(app)/owner/bookings/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { OwnerBookingCard } from '@/components/booking/owner-booking-card';
import type { Booking, Turf } from '@/types';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, CalendarX2, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getOwnerTurfs as fetchOwnerTurfs, getBookingsForOwnerTurfs as fetchOwnerBookings, updateBooking as updateBookingInDB } from '@/lib/mock-db';


export default function OwnerBookingsPage() {
  const { user, loading: authLoading } = useAuth();
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [ownerTurfs, setOwnerTurfs] = useState<Partial<Turf>[]>([]); // Partial for "All My Turfs" option
  const [selectedTurfId, setSelectedTurfId] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && user && user.role === 'owner') {
      setIsLoading(true);
      try {
        const turfs = fetchOwnerTurfs(user.uid);
        setOwnerTurfs([{ id: 'all', name: 'All My Turfs' }, ...turfs]);
        
        const turfIds = turfs.map(t => t.id);
        const bookingsForOwner = fetchOwnerBookings(turfIds)
          .sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime() || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setAllBookings(bookingsForOwner);
      } catch (error) {
          console.error("Error fetching owner bookings/turfs:", error);
          toast({ title: "Error", description: "Could not load bookings data.", variant: "destructive"});
      } finally {
        setIsLoading(false);
      }
    } else if (!authLoading && (!user || user.role !== 'owner')) {
      setIsLoading(false);
    }
  }, [user, authLoading, toast]);

  const updateLocalBookingState = (bookingId: string, updates: Partial<Booking>) => {
    setAllBookings(prev => prev.map(b => b.id === bookingId ? { ...b, ...updates } : b));
  };

  const handleApprove = (bookingId: string) => {
    try {
        const updated = updateBookingInDB(bookingId, { status: 'approved', paymentStatus: 'unpaid' }); // Payment status might change based on flow
        if (updated) {
            updateLocalBookingState(bookingId, { status: 'approved', paymentStatus: 'unpaid' });
            toast({ title: "Booking Approved", description: `Booking ${bookingId} is now approved.` });
        } else {
            toast({ title: "Error", description: "Failed to approve booking.", variant: "destructive" });
        }
    } catch (error) {
        console.error("Error approving booking:", error);
        toast({ title: "Error", description: "Could not approve booking.", variant: "destructive" });
    }
  };

  const handleReject = (bookingId: string) => {
     try {
        const updated = updateBookingInDB(bookingId, { status: 'cancelled' }); // Or a 'rejected' status
        if (updated) {
            updateLocalBookingState(bookingId, { status: 'cancelled' });
            toast({ title: "Booking Rejected", description: `Booking ${bookingId} has been rejected.`, variant: "destructive" });
        } else {
            toast({ title: "Error", description: "Failed to reject booking.", variant: "destructive" });
        }
    } catch (error) {
        console.error("Error rejecting booking:", error);
        toast({ title: "Error", description: "Could not reject booking.", variant: "destructive" });
    }
  };
  
  const handleCancelByOwner = (bookingId: string) => {
    try {
        const updated = updateBookingInDB(bookingId, { status: 'cancelled' });
        if (updated) {
            updateLocalBookingState(bookingId, { status: 'cancelled' });
            toast({ title: "Booking Cancelled by Owner", description: `Booking ${bookingId} has been cancelled.`, variant: "destructive" });
        } else {
            toast({ title: "Error", description: "Failed to cancel booking.", variant: "destructive" });
        }
    } catch (error) {
        console.error("Error cancelling booking by owner:", error);
        toast({ title: "Error", description: "Could not cancel booking.", variant: "destructive" });
    }
  };

  const filteredBookings = selectedTurfId === "all"
    ? allBookings
    : allBookings.filter(b => b.turfId === selectedTurfId);

  const bookingTabs: { value: Booking['status'] | 'all', label: string }[] = [
    { value: 'all', label: 'All Bookings' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'completed', label: 'Completed' }, // Assuming 'completed' status exists
    { value: 'cancelled', label: 'Cancelled' },
  ];

  if (isLoading || authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading bookings...</p>
      </div>
    );
  }

  if (!user || user.role !== 'owner') {
    return (
      <div className="text-center py-10">
        <CalendarX2 className="mx-auto h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
        <p className="text-muted-foreground">You must be a turf owner to view this page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Manage Bookings</h1>
          <p className="text-muted-foreground">Oversee all reservations for your turfs.</p>
        </div>
        {ownerTurfs.length > 1 && (
          <div className="flex items-center gap-2 w-full md:w-auto">
             <Filter className="h-5 w-5 text-muted-foreground" />
            <Select value={selectedTurfId} onValueChange={setSelectedTurfId}>
                <SelectTrigger className="w-full md:w-[250px]">
                    <SelectValue placeholder="Filter by turf..." />
                </SelectTrigger>
                <SelectContent>
                    {ownerTurfs.map(turf => (
                        <SelectItem key={turf.id!} value={turf.id!}>{turf.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 mb-4">
          {bookingTabs.map(tab => (
             <TabsTrigger key={tab.value} value={tab.value} className="text-xs sm:text-sm">{tab.label}</TabsTrigger>
          ))}
        </TabsList>

        {bookingTabs.map(tab => (
          <TabsContent key={tab.value} value={tab.value}>
            {(() => {
              const tabFilteredBookings = tab.value === 'all' 
                ? filteredBookings 
                : filteredBookings.filter(b => b.status === tab.value);

              if (tabFilteredBookings.length === 0) {
                return (
                  <div className="text-center py-10 bg-card shadow-sm rounded-lg">
                    <CalendarX2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h2 className="text-xl font-semibold">No {tab.label.toLowerCase()}</h2>
                    <p className="text-muted-foreground">There are no bookings matching this status{selectedTurfId !== "all" ? " for the selected turf" : ""}.</p>
                  </div>
                );
              }
              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {tabFilteredBookings.map((booking) => (
                    <OwnerBookingCard
                      key={booking.id}
                      booking={booking}
                      onApprove={handleApprove}
                      onReject={handleReject}
                      onCancelByOwner={handleCancelByOwner}
                    />
                  ))}
                </div>
              );
            })()}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
