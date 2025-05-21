
// src/app/(app)/owner/turfs/new/page.tsx
"use client";

import { TurfForm, type TurfFormValues } from '@/components/turf/turf-form';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { addTurf as addTurfToDB } from '@/lib/mock-db';
import { useState } from 'react';

export default function NewTurfPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: TurfFormValues) => {
    if (!user || user.role !== 'owner') {
      toast({ title: "Error", description: "You are not authorized to add turfs.", variant: "destructive" });
      return;
    }
    
    setIsSubmitting(true);
    try {
      // The turfData for addTurfToDB should exclude id, createdAt, ownerId, which are handled by the DB function
      // averageRating and reviewCount will be initialized by addTurfToDB if not present
      const turfPayload = {
        name: data.name,
        location: data.location,
        pricePerHour: data.pricePerHour,
        images: data.images,
        amenities: data.amenities,
        description: data.description,
        isVisible: data.isVisible,
        // averageRating and reviewCount can be omitted, addTurf will default them
      };

      addTurfToDB(turfPayload, user.uid); 
      
      // Simulate a slight delay for user feedback, as mock DB operation is synchronous
      await new Promise(resolve => setTimeout(resolve, 300));

      toast({
        title: "Turf Added Successfully!",
        description: `${data.name} has been listed on TurfLink.`,
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
  };

  return (
    <div className="max-w-3xl mx-auto">
      <TurfForm onSubmitForm={handleSubmit} />
    </div>
  );
}
