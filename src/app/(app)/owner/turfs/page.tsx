// src/app/(app)/owner/turfs/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { OwnerTurfCard } from '@/components/turf/owner-turf-card';
import type { Turf } from '@/types';
import { useAuth } from '@/hooks/use-auth'; // Mock auth
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle, Loader2, ShieldAlert } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Mock data - replace with actual API call
const mockOwnerTurfs: Turf[] = [
  {
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
  {
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
];

export default function OwnerTurfsPage() {
  const { user, loading: authLoading } = useAuth();
  const [turfs, setTurfs] = useState<Turf[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && user && user.role === 'owner') {
      // Simulate fetching turfs for the current owner
      const ownerSpecificTurfs = mockOwnerTurfs.filter(t => t.ownerId === user.uid);
      setTurfs(ownerSpecificTurfs);
      setIsLoading(false);
    } else if (!authLoading && (!user || user.role !== 'owner')) {
      // Handle case where user is not an owner
      setIsLoading(false);
    }
  }, [user, authLoading]);

  const handleVisibilityToggle = (turfId: string, isVisible: boolean) => {
    // Mock update logic
    setTurfs(prevTurfs => 
      prevTurfs.map(t => t.id === turfId ? { ...t, isVisible } : t)
    );
    toast({
      title: `Turf visibility ${isVisible ? 'enabled' : 'disabled'}`,
      description: `${turfs.find(t=>t.id===turfId)?.name} is now ${isVisible ? 'visible' : 'hidden'} to players.`,
    });
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


  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold text-primary">My Turfs</h1>
            <p className="text-muted-foreground">Manage your listed turfs and their availability.</p>
        </div>
        <Link href="/owner/turfs/new">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <PlusCircle className="mr-2 h-5 w-5" /> Add New Turf
          </Button>
        </Link>
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
