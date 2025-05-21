// src/app/(app)/player/dashboard/page.tsx
"use client";

import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Search, ListChecks, Star } from 'lucide-react';
import Image from 'next/image';

export default function PlayerDashboardPage() {
  const { user } = useAuth();

  if (!user) {
    return <div>Loading user data...</div>; // Or a redirect
  }

  return (
    <div className="space-y-8">
      <div className="bg-card p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-primary">Welcome back, {user.name}!</h1>
        <p className="text-muted-foreground mt-1">Ready to hit the field? Let&apos;s find your next game.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
        
        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-6 w-6 text-accent" />
              Review Turfs
            </CardTitle>
            <CardDescription>Share your experience and help other players make informed decisions.</CardDescription>
          </CardHeader>
          <CardContent>
             {/* This could link to the last viewed turf or a general review page */}
            <p className="text-sm text-muted-foreground mb-2">Recently played? Leave a review!</p>
            <Link href="/player/turfs" passHref>
                <Button variant="outline" className="w-full border-accent text-accent hover:bg-accent/10">Find Turfs to Review</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Featured Turf</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-4 items-center">
          <Image 
            src="https://placehold.co/600x300.png" 
            alt="Featured Turf" 
            width={300} 
            height={150} 
            className="rounded-md object-cover"
            data-ai-hint="soccer field"
          />
          <div>
            <h3 className="text-xl font-semibold">City Sports Arena</h3>
            <p className="text-muted-foreground mb-2">The best 5-a-side turf in downtown. Floodlights, parking, and more!</p>
            <Link href="/player/turfs/featured-turf-id"> {/* Replace with actual ID */}
              <Button variant="link" className="p-0 text-primary">View Details &rarr;</Button>
            </Link>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
