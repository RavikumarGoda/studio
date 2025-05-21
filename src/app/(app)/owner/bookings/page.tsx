// src/app/(app)/owner/bookings/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { OwnerBookingCard } from '@/components/booking/owner-booking-card';
import type { Booking, Turf } from '@/types';
import { useAuth } from '@/hooks/use-auth'; // Mock auth
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

// Mock data - replace with actual API calls
const mockAllBookings: Booking[] = [
  {
    id: 'booking-1',
    turfId: 'turf-1', // Belongs to mock-owner-uid
    playerId: 'player-A',
    slotId: 'slot-1-1',
    turfName: 'Green Kick Arena',
    timeRange: '09:00 AM - 10:00 AM',
    bookingDate: '2024-07-20',
    status: 'approved',
    paymentStatus: 'paid',
    totalAmount: 1200,
    createdAt: new Date(2024, 6, 10),
  },
  {
    id: 'booking-p1',
    turfId: 'turf-1', // Belongs to mock-owner-uid
    playerId: 'player-B',
    slotId: 'slot-1-p1',
    turfName: 'Green Kick Arena',
    timeRange: '06:00 PM - 07:00 PM',
    bookingDate: '2024-07-21',
    status: 'pending',
    paymentStatus: 'unpaid',
    totalAmount: 1200,
    createdAt: new Date(2024, 6, 18),
  },
  {
    id: 'booking-p2',
    turfId: 'turf-3', // Belongs to mock-owner-uid
    playerId: 'player-C',
    slotId: 'slot-3-p2',
    turfName: 'Net Masters Badminton',
    timeRange: '07:00 PM - 08:00 PM',
    bookingDate: '2024-07-23',
    status: 'pending',
    paymentStatus: 'unpaid',
    totalAmount: 500,
    createdAt: new Date(2024, 6, 19),
  },
  {
    id: 'booking-c1',
    turfId: 'turf-1',
    playerId: 'player-D',
    slotId: 'slot-1-c1',
    turfName: 'Green Kick Arena',
    timeRange: '11:00 AM - 12:00 PM',
    bookingDate: '2024-07-25',
    status: 'cancelled',
    paymentStatus: 'unpaid',
    totalAmount: 1200,
    createdAt: new Date(2024, 6, 18),
  },
];

const mockOwnerTurfs: Partial<Turf>[] = [
    { id: 'turf-1', name: 'Green Kick Arena', ownerId: 'mock-owner-uid' },
    { id: 'turf-3', name: 'Net Masters Badminton', ownerId: 'mock-owner-uid' },
    // Add another turf not owned by mock-owner-uid for testing
    { id: 'turf-x', name: 'Other Owner Turf', ownerId: 'other-owner-id' }, 
];

// Add a booking for turf-x to test filtering
mockAllBookings.push({
    id: 'booking-x1',
    turfId: 'turf-x', 
    playerId: 'player-E',
    slotId: 'slot-x-1',
    turfName: 'Other Owner Turf',
    timeRange: '10:00 AM - 11:00 AM',
    bookingDate: '2024-07-24',
    status: 'approved',
    paymentStatus: 'paid',
    totalAmount: 900,
    createdAt: new Date(2024, 6, 17),
});


export default function OwnerBookingsPage() {
  const { user, loading: authLoading } = useAuth();
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [ownerTurfs, setOwnerTurfs] = useState<Partial<Turf>[]>([]);
  const [selectedTurfId, setSelectedTurfId] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && user && user.role === 'owner') {
      // Simulate fetching owner's turfs and then all bookings for those turfs
      const turfs = mockOwnerTurfs.filter(t => t.ownerId === user.uid);
      setOwnerTurfs([{ id: 'all', name: 'All My Turfs' }, ...turfs]);
      
      const turfIds = turfs.map(t => t.id);
      const bookingsForOwner = mockAllBookings.filter(b => turfIds.includes(b.turfId))
        .sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime() || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setAllBookings(bookingsForOwner);
      setIsLoading(false);
    } else if (!authLoading && (!user || user.role !== 'owner')) {
      setIsLoading(false);
    }
  }, [user, authLoading]);

  const handleApprove = (bookingId: string) => {
    setAllBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'approved', paymentStatus: 'unpaid' } : b)); // Payment status might change based on flow
    toast({ title: "Booking Approved", description: `Booking ${bookingId} is now approved.` });
  };

  const handleReject = (bookingId: string) => {
    setAllBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b)); // Or a 'rejected' status
    toast({ title: "Booking Rejected", description: `Booking ${bookingId} has been rejected.`, variant: "destructive" });
  };
  
  const handleCancelByOwner = (bookingId: string) => {
    setAllBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b));
    toast({ title: "Booking Cancelled by Owner", description: `Booking ${bookingId} has been cancelled.`, variant: "destructive" });
  };

  const filteredBookings = selectedTurfId === "all"
    ? allBookings
    : allBookings.filter(b => b.turfId === selectedTurfId);

  const bookingTabs: { value: Booking['status'] | 'all', label: string }[] = [
    { value: 'all', label: 'All Bookings' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'completed', label: 'Completed' },
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
        {ownerTurfs.length > 1 && ( // Only show filter if owner has multiple turfs (including "All")
          <div className="flex items-center gap-2">
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
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-5 mb-4">
          {bookingTabs.map(tab => (
             <TabsTrigger key={tab.value} value={tab.value}>{tab.label}</TabsTrigger>
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
