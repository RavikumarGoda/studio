
// src/app/(app)/owner/turfs/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { OwnerTurfCard } from '@/components/turf/owner-turf-card';
import type { Turf } from '@/types';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle, Loader2, ShieldAlert } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getOwnerTurfs as fetchOwnerTurfsFromDB, updateTurf as updateTurfInDB } from '@/lib/mock-db';

export default function OwnerTurfsPage() {
  const { user, loading: authLoading } = useAuth();
  const [turfs, setTurfs] = useState<Turf[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && user && user.role === 'owner') {
      setIsLoading(true);
      try {
        const ownerSpecificTurfs = fetchOwnerTurfsFromDB(user.uid);
        setTurfs(ownerSpecificTurfs);
      } catch (error) {
        console.error("Error fetching owner turfs:", error);
        toast({ title: "Error", description: "Could not load your turfs.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    } else if (!authLoading && (!user || user.role !== 'owner')) {
      setIsLoading(false); // Not an owner or not logged in
    }
  }, [user, authLoading, toast]);

  const handleVisibilityToggle = (turfId: string, isVisible: boolean) => {
    try {
      const updatedTurf = updateTurfInDB(turfId, { isVisible });
      if (updatedTurf) {
        setTurfs(prevTurfs => 
          prevTurfs.map(t => t.id === turfId ? { ...t, isVisible } : t)
        );
        toast({
          title: `Turf visibility ${isVisible ? 'enabled' : 'disabled'}`,
          description: `${updatedTurf.name} is now ${isVisible ? 'visible' : 'hidden'} to players.`,
        });
      } else {
        toast({ title: "Error", description: "Failed to update turf visibility.", variant: "destructive"});
      }
    } catch (error) {
        console.error("Error toggling turf visibility:", error);
        toast({ title: "Error", description: "Could not update turf visibility.", variant: "destructive"});
    }
  };

  if (isLoading || authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading your turfs...</p>
      </div>
    );
  }

  if (!user || user.role !== 'owner') {
    return (
      <div className="text-center py-10">
        <ShieldAlert className="mx-auto h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
        <p className="text-muted-foreground">You must be a turf owner to view this page.</p>
      </div>
    );
  }

  const canAddTurf = turfs.length === 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold text-primary">My Turfs</h1>
            <p className="text-muted-foreground">Manage your listed turfs and their availability.</p>
        </div>
        {canAddTurf && (
          <Link href="/owner/turfs/new">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto">
              <PlusCircle className="mr-2 h-5 w-5" /> Add New Turf
            </Button>
          </Link>
        )}
      </div>

      {turfs.length === 0 ? (
        <div className="text-center py-10 bg-card shadow-md rounded-lg">
           <ShieldAlert className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold mb-2">No Turfs Listed Yet</h2>
          <p className="text-muted-foreground mb-6">Start by adding your first turf to attract players.</p>
          <Link href="/owner/turfs/new">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <PlusCircle className="mr-2 h-5 w-5" /> Add Your First Turf
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {turfs.map((turf) => (
            <OwnerTurfCard 
                key={turf.id} 
                turf={turf} 
                onVisibilityToggle={handleVisibilityToggle} 
            />
          ))}
        </div>
      )}
    </div>
  );
}
