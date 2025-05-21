// src/app/(app)/player/dashboard/page.tsx
"use client";

import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Search, ListChecks, Star, ImageOff, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import type { Turf } from '@/types';
import { getVisibleTurfs } from '@/lib/mock-db';
import { useToast } from '@/hooks/use-toast';

export default function PlayerDashboardPage() {
  const { user } = useAuth();
  const [featuredTurf, setFeaturedTurf] = useState<Turf | null>(null);
  const [isLoadingFeatured, setIsLoadingFeatured] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    setIsLoadingFeatured(true);
    try {
      const visibleTurfs = getVisibleTurfs();
      if (visibleTurfs.length > 0) {
        // For simplicity, pick the first visible turf.
        // In a real app, this could be random, highest rated, etc.
        setFeaturedTurf(visibleTurfs[0]);
      } else {
        setFeaturedTurf(null);
      }
    } catch (error) {
      console.error("Error fetching featured turf:", error);
      toast({ title: "Error", description: "Could not load featured turf.", variant: "destructive" });
      setFeaturedTurf(null);
    } finally {
      setIsLoadingFeatured(false);
    }
  }, [toast]);


  if (!user) {
    return <div>Loading user data...</div>; // Or a redirect
  }

  return (
    <div className="space-y-8">
      <div className="bg-card p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-primary">Welcome back, {user.name}!</h1>
        <p className="text-muted-foreground mt-1">Ready to hit the field? Let&apos;s find your next game.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2"> {/* Simplified grid for better stacking */}
        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-6 w-6 text-primary" />
              Find a Turf
            </CardTitle>
            <CardDescription>Browse and discover turfs near you. Filter by amenities, price, and ratings.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/player/turfs" passHref>
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">Explore Turfs</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListChecks className="h-6 w-6 text-primary" />
              My Bookings
            </CardTitle>
            <CardDescription>View your upcoming and past turf bookings. Manage your schedule easily.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/player/bookings" passHref>
              <Button className="w-full">View My Bookings</Button>
            </Link>
          </CardContent>
        </Card>
        
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Featured Turf</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-4 md:items-center">
          {isLoadingFeatured ? (
            <div className="flex items-center justify-center w-full h-[150px] md:w-[200px] lg:w-[300px] flex-shrink-0">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : featuredTurf ? (
            <>
              <div className="w-full md:w-[200px] lg:w-[300px] h-auto md:h-[150px] flex-shrink-0">
                <Image 
                  src={featuredTurf.images[0] || "https://placehold.co/600x300.png"} 
                  alt={featuredTurf.name} 
                  width={300} 
                  height={150} 
                  className="rounded-md object-cover w-full h-full"
                  data-ai-hint="sports field" 
                />
              </div>
              <div className="mt-4 md:mt-0 md:ml-4">
                <h3 className="text-xl font-semibold">{featuredTurf.name}</h3>
                <p className="text-muted-foreground mb-2 line-clamp-2 md:line-clamp-3">{featuredTurf.description}</p>
                <Link href={`/player/turfs/${featuredTurf.id}`}>
                  <Button variant="link" className="p-0 text-primary">View Details &rarr;</Button>
                </Link>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-8 w-full">
              <ImageOff className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-1">No Turfs to Feature Yet</h3>
              <p className="text-muted-foreground">Check back later or encourage owners to list their turfs!</p>
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}
