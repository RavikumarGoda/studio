// src/app/(app)/owner/turfs/[turfId]/edit/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { TurfForm } from '@/components/turf/turf-form';
import type { Turf } from '@/types';
import { useAuth } from '@/hooks/use-auth'; // Mock auth
import { useToast } from '@/hooks/use-toast';
import { Loader2, ShieldAlert } from 'lucide-react';

// Mock data - replace with actual API call
const mockTurfsData: Record<string, Turf> = {
  'turf-1': {
    id: 'turf-1',
    ownerId: 'mock-owner-uid', // Ensure this matches the mock logged-in owner
    name: 'Green Kick Arena',
    location: 'Koramangala, Bangalore',
    pricePerHour: 1200,
    images: ['https://placehold.co/600x400.png?text=Green+Kick'],
    amenities: ['parking', 'restroom', 'floodlights', 'wifi'],
    description: 'State-of-the-art 5-a-side football turf with premium grass.',
    isVisible: true,
    createdAt: new Date(),
  },
};

export default function EditTurfPage() {
  const params = useParams();
  const router = useRouter();
  const turfId = params.turfId as string;
  const { user, loading: authLoading } = useAuth();
  const [turfData, setTurfData] = useState<Turf | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (turfId) {
      // Simulate fetching turf data
      const data = mockTurfsData[turfId];
      if (data) {
        setTurfData(data);
      } else {
        toast({ title: "Error", description: "Turf not found.", variant: "destructive" });
        router.push('/owner/turfs');
      }
      setIsLoading(false);
    }
  }, [turfId, router, toast]);

  const handleSubmit = async (data: any) => {
    if (!user || user.role !== 'owner' || turfData?.ownerId !== user.uid) {
      toast({ title: "Error", description: "You are not authorized to edit this turf.", variant: "destructive" });
      return;
    }

    // Mock API call
    console.log("Updating turf:", turfId, data);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay

    toast({
      title: "Turf Updated Successfully!",
      description: `${data.name} details have been updated.`,
    });
    router.push('/owner/turfs');
  };

  if (isLoading || authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading turf data...</p>
      </div>
    );
  }

  if (!turfData) {
    // This case should ideally be handled by the redirect in useEffect
    return <p>Turf not found.</p>;
  }

  if (!user || user.role !== 'owner' || turfData.ownerId !== user.uid) {
     return (
      <div className="text-center py-10">
        <ShieldAlert className="mx-auto h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
        <p className="text-muted-foreground">You are not authorized to edit this turf.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <TurfForm initialData={turfData} onSubmitForm={handleSubmit} />
    </div>
  );
}
