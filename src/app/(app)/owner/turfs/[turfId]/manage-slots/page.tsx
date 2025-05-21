// src/app/(app)/owner/turfs/[turfId]/manage-slots/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { Turf, Slot } from '@/types';
import { useAuth } from '@/hooks/use-auth'; // Mock auth
import { useToast } from '@/hooks/use-toast';
import { SlotManager } from '@/components/turf/slot-manager';
import { Loader2, ShieldAlert, ChevronLeft } from 'lucide-react';
import Link from 'next/link';


// Mock data - replace with actual API calls
const mockTurfsData: Record<string, Turf> = {
  'turf-1': {
    id: 'turf-1',
    ownerId: 'mock-owner-uid',
    name: 'Green Kick Arena',
    location: 'Koramangala, Bangalore',
    pricePerHour: 1200,
    images: ['https://placehold.co/600x400.png?text=Green+Kick'],
    amenities: ['parking', 'restroom', 'floodlights', 'wifi'],
    description: 'State-of-the-art 5-a-side football turf with premium grass.',
    isVisible: true,
    createdAt: new Date(),
  },
   'turf-3': {
    id: 'turf-3',
    ownerId: 'mock-owner-uid',
    name: 'Net Masters Badminton',
    location: 'HSR Layout, Bangalore',
    pricePerHour: 500,
    images: ['https://placehold.co/600x400.png?text=Net+Masters'],
    amenities: ['parking', 'restroom', 'gym'],
    description: 'Professional wooden badminton courts with excellent lighting.',
    isVisible: false,
    createdAt: new Date(),
  },
};

const mockSlotsData: Record<string, Slot[]> = {
  'turf-1': [
    { id: 'slot-1-1', turfId: 'turf-1', date: '2024-07-20', timeRange: '09:00 AM - 10:00 AM', status: 'available', createdAt: new Date() },
    { id: 'slot-1-2', turfId: 'turf-1', date: '2024-07-20', timeRange: '10:00 AM - 11:00 AM', status: 'booked', bookedBy: 'player-x', createdAt: new Date() },
    { id: 'slot-1-3', turfId: 'turf-1', date: '2024-07-21', timeRange: '06:00 PM - 07:00 PM', status: 'available', createdAt: new Date() },
  ],
  'turf-3': [
     { id: 'slot-3-1', turfId: 'turf-3', date: '2024-07-22', timeRange: '05:00 PM - 06:00 PM', status: 'maintenance', createdAt: new Date() },
  ]
};


export default function ManageSlotsPage() {
  const params = useParams();
  const router = useRouter();
  const turfId = params.turfId as string;
  const { user, loading: authLoading } = useAuth();
  const [turf, setTurf] = useState<Turf | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (turfId) {
      // Simulate fetching turf and slots data
      const turfData = mockTurfsData[turfId];
      const slotsData = mockSlotsData[turfId] || [];
      
      if (turfData) {
        setTurf(turfData);
        setSlots(slotsData);
      } else {
        toast({ title: "Error", description: "Turf not found.", variant: "destructive" });
        router.push('/owner/turfs');
      }
      setIsLoading(false);
    }
  }, [turfId, router, toast]);

  const handleSlotsUpdate = async (updatedSlots: Slot[]) => {
    if (!user || user.role !== 'owner' || turf?.ownerId !== user.uid) {
      toast({ title: "Error", description: "You are not authorized to update slots for this turf.", variant: "destructive" });
      return;
    }
    // Mock API call to save slots
    console.log("Saving updated slots for turf:", turfId, updatedSlots);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
    
    // Update local state after "successful" save
    // In a real app, you might refetch or trust the optimistic update
    setSlots(updatedSlots); // Assuming updatedSlots contains backend-generated IDs if any were new.
    mockSlotsData[turfId] = updatedSlots; // Update mock database for demo persistence

    toast({
      title: "Slots Updated Successfully!",
      description: `Availability for ${turf?.name} has been saved.`,
    });
  };

  if (isLoading || authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading slot manager...</p>
      </div>
    );
  }

  if (!turf) {
    return <p>Turf not found.</p>;
  }
  
  if (!user || user.role !== 'owner' || turf.ownerId !== user.uid) {
     return (
      <div className="text-center py-10">
        <ShieldAlert className="mx-auto h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
        <p className="text-muted-foreground">You are not authorized to manage slots for this turf.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        <Link href={`/owner/turfs`} className="inline-flex items-center text-primary hover:underline mb-4">
            <ChevronLeft className="h-4 w-4 mr-1" /> Back to My Turfs
        </Link>
      <SlotManager turf={turf} initialSlots={slots} onSlotsUpdate={handleSlotsUpdate} />
    </div>
  );
}
