
// src/app/(app)/owner/turfs/[turfId]/edit/page.tsx
"use client";

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { TurfForm, type TurfFormValues } from '@/components/turf/turf-form';
import type { Turf } from '@/types';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ShieldAlert } from 'lucide-react';
import { getTurfById as fetchTurfById, updateTurf as updateTurfInDB } from '@/lib/mock-db';

export default function EditTurfPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [turfData, setTurfData] = useState<Turf | null>(null);
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
      const data = fetchTurfById(resolvedTurfId);
      if (data) {
        setTurfData({ ...data, images: data.images || [] });
      } else {
        toast({ title: "Error", description: "Turf not found.", variant: "destructive" });
        router.push('/owner/turfs');
      }
      setIsLoading(false);
    }
  }, [resolvedTurfId, router, toast]);

  const handleSubmit = useCallback(async (data: TurfFormValues) => {
    if (!user || user.role !== 'owner' || turfData?.ownerId !== user.uid) {
      toast({ title: "Error", description: "You are not authorized to edit this turf.", variant: "destructive" });
      return;
    }
    if (!resolvedTurfId) {
        toast({ title: "Error", description: "Turf ID is missing.", variant: "destructive" });
        return;
    }

    try {
      updateTurfInDB(resolvedTurfId, data);
      
      await new Promise(resolve => setTimeout(resolve, 300));

      toast({
        title: "Turf Updated Successfully!",
        description: `${data.name} details have been updated.`,
      });
      router.push('/owner/turfs');
    } catch (error) {
        console.error("Error updating turf:", error);
        toast({ title: "Error", description: "Failed to update turf. Please try again.", variant: "destructive"});
    }
  }, [user, turfData, resolvedTurfId, router, toast]);

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
        <p className="ml-2">Loading turf data...</p>
      </div>
    );
  }

  if (!turfData) {
    // This case should ideally be handled by the redirect in the useEffect if turf not found
    return <p>Turf not found. You may be redirected.</p>;
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
