
// src/app/(app)/owner/turfs/[turfId]/manage-slots/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { Turf, Slot } from '@/types';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { SlotManager } from '@/components/turf/slot-manager';
import { Loader2, ShieldAlert, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { getTurfById as fetchTurfById, getSlotsForTurf as fetchSlotsForTurf, updateSlotsForTurf as updateSlotsInDB } from '@/lib/mock-db';

export default function ManageSlotsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [turf, setTurf] = useState<Turf | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const [resolvedTurfId, setResolvedTurfId] = useState<string | null>(null);

  useEffect(() => {
    if (params?.turfId && typeof params.turfId === 'string') {
      setResolvedTurfId(params.turfId);
    }
  }, [params?.turfId]);

  useEffect(() => {
    if (resolvedTurfId) {
      setIsLoading(true);
      try {
        const turfData = fetchTurfById(resolvedTurfId);
        const slotsData = fetchSlotsForTurf(resolvedTurfId);
        
        if (turfData) {
          setTurf(turfData);
          setSlots(slotsData);
        } else {
          toast({ title: "Error", description: "Turf not found.", variant: "destructive" });
          router.push('/owner/turfs');
        }
      } catch (error) {
          console.error("Error fetching turf/slots data:", error);
          toast({ title: "Error", description: "Could not load turf or slot data.", variant: "destructive"});
      } finally {
        setIsLoading(false);
      }
    }
  }, [resolvedTurfId, router, toast]);

  const handleSlotsUpdate = async (updatedSlots: Slot[]) => {
    if (!user || user.role !== 'owner' || turf?.ownerId !== user.uid) {
      toast({ title: "Error", description: "You are not authorized to update slots for this turf.", variant: "destructive" });
      return;
    }
    if (!resolvedTurfId) {
        toast({ title: "Error", description: "Turf ID is missing for slot update.", variant: "destructive"});
        return;
    }
    
    try {
      updateSlotsInDB(resolvedTurfId, updatedSlots);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setSlots(fetchSlotsForTurf(resolvedTurfId)); 

      toast({
        title: "Slots Updated Successfully!",
        description: `Availability for ${turf?.name} has been saved.`,
      });
    } catch (error) {
        console.error("Error updating slots:", error);
        toast({ title: "Error", description: "Failed to update slots. Please try again.", variant: "destructive"});
    }
  };

  if (!resolvedTurfId && !authLoading) {
     return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading turf identifier...</p>
      </div>
    );
  }

  if (isLoading || authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading slot manager...</p>
      </div>
    );
  }

  if (!turf) {
    return <p>Turf not found. You will be redirected.</p>;
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
