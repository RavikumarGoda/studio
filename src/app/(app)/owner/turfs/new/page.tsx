
// src/app/(app)/owner/turfs/new/page.tsx
"use client";

import { TurfForm, type TurfFormValues } from '@/components/turf/turf-form';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { addTurf as addTurfToDB, getOwnerTurfs as fetchOwnerTurfsFromDB } from '@/lib/mock-db';
import { useState, useEffect, useCallback } from 'react'; // Added useCallback
import { Loader2 } from 'lucide-react';

export default function NewTurfPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingPage, setIsLoadingPage] = useState(true);

  useEffect(() => {
    if (!authLoading && user && user.role === 'owner') {
      try {
        const ownerTurfs = fetchOwnerTurfsFromDB(user.uid);
        if (ownerTurfs.length >= 1) {
          toast({
            title: "Limit Reached",
            description: "You can only list one turf at this time.",
            variant: "default",
          });
          router.replace('/owner/turfs');
        } else {
          setIsLoadingPage(false);
        }
      } catch (error) {
        console.error("Error checking owner turfs:", error);
        toast({ title: "Error", description: "Could not verify turf limit.", variant: "destructive" });
        router.replace('/owner/turfs'); // Redirect on error as well
      }
    } else if (!authLoading && (!user || user.role !== 'owner')) {
      // Not an owner or not logged in, redirect
      router.replace('/login');
    }
    // If auth is still loading, isLoadingPage remains true
  }, [user, authLoading, router, toast]);

  const handleSubmit = useCallback(async (data: TurfFormValues) => {
    if (!user || user.role !== 'owner') {
      toast({ title: "Error", description: "You are not authorized to add turfs.", variant: "destructive" });
      return;
    }
    
    const ownerTurfs = fetchOwnerTurfsFromDB(user.uid);
    if (ownerTurfs.length >= 1) {
        toast({ title: "Limit Reached", description: "Cannot add another turf.", variant: "destructive"});
        router.replace('/owner/turfs');
        return;
    }

    setIsSubmitting(true);
    try {
      const turfPayload = {
        name: data.name,
        location: data.location,
        pricePerHour: data.pricePerHour,
        images: data.images,
        amenities: data.amenities,
        description: data.description,
        isVisible: data.isVisible,
        ownerPhoneNumber: data.ownerPhoneNumber,
      };

      addTurfToDB(turfPayload, user.uid); 
      
      await new Promise(resolve => setTimeout(resolve, 300));

      toast({
        title: "Turf Added Successfully!",
        description: `${data.name} has been listed on TOD (TurfOnDemand).`,
      });
      router.push('/owner/turfs');
    } catch (error) {
      console.error("Error adding turf:", error);
      toast({
        title: "Failed to Add Turf",
        description: "An error occurred while adding the turf. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [user, router, toast]); // Dependencies for useCallback

  if (authLoading || isLoadingPage) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <TurfForm onSubmitForm={handleSubmit} />
    </div>
  );
}

    