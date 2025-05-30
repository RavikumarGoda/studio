
// src/app/(app)/owner/dashboard/page.tsx
"use client";

import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ShieldCheck, PlusCircle, CalendarDays, BarChart3, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { Turf, Booking } from '@/types';
import { getOwnerTurfs as fetchOwnerTurfsFromDB, getBookingsForOwnerTurfs } from '@/lib/mock-db';
import { isFuture, isSameMonth, parseISO, isToday } from 'date-fns';

export default function OwnerDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [ownerTurfs, setOwnerTurfs] = useState<Turf[]>([]);
  const [ownerBookings, setOwnerBookings] = useState<Booking[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const [upcomingBookingsCount, setUpcomingBookingsCount] = useState(0);
  const [currentMonthRevenue, setCurrentMonthRevenue] = useState(0);

  useEffect(() => {
    if (!authLoading && user && user.role === 'owner') {
      setIsLoadingData(true);
      try {
        const turfs = fetchOwnerTurfsFromDB(user.uid);
        setOwnerTurfs(turfs);

        if (turfs.length > 0) {
          const turfIds = turfs.map(t => t.id);
          const bookings = getBookingsForOwnerTurfs(turfIds);
          setOwnerBookings(bookings);
        } else {
          setOwnerBookings([]);
        }
      } catch (error) {
        console.error("Error fetching owner data for dashboard:", error);
      } finally {
        setIsLoadingData(false);
      }
    } else if (!authLoading) {
      setIsLoadingData(false);
    }
  }, [user, authLoading]);

  useEffect(() => {
    // Calculate upcoming bookings
    const upcoming = ownerBookings.filter(booking => {
      const bookingDateObj = parseISO(booking.bookingDate);
      return (booking.status === 'approved' || booking.status === 'pending') &&
             (isToday(bookingDateObj) || isFuture(bookingDateObj));
    }).length;
    setUpcomingBookingsCount(upcoming);

    // Calculate current month revenue
    const now = new Date();
    const revenue = ownerBookings
      .filter(booking => {
        const bookingDateObj = parseISO(booking.bookingDate);
        return (booking.status === 'approved' || booking.status === 'completed') &&
               isSameMonth(bookingDateObj, now) &&
               booking.totalAmount;
      })
      .reduce((sum, booking) => sum + (booking.totalAmount || 0), 0);
    setCurrentMonthRevenue(revenue);

  }, [ownerBookings]);

  if (authLoading || isLoadingData) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading dashboard...</p>
      </div>
    );
  }

  if (!user) {
    return <div>Redirecting to login...</div>;
  }

  const canAddTurf = ownerTurfs.length === 0;

  return (
    <div className="space-y-8">
      <div className="bg-card p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-primary">Welcome, {user.name}!</h1>
        <p className="text-muted-foreground mt-1">Manage your turfs and bookings efficiently.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Total Turfs</CardTitle>
            <CardDescription>Number of turfs you manage.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-primary">{ownerTurfs.length}</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Upcoming Bookings</CardTitle>
            <CardDescription>Future & today's approved/pending bookings.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-primary">{upcomingBookingsCount}</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Current Month Revenue</CardTitle>
            <CardDescription>Earnings from approved/completed bookings this month.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-primary">₹{currentMonthRevenue.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/owner/turfs" passHref>
          <Card className="shadow-lg hover:shadow-xl transition-shadow cursor-pointer h-full flex flex-col">
            <CardHeader className="flex-grow">
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-6 w-6 text-primary" />
                My Turfs
              </CardTitle>
              <CardDescription>View and edit your turf details.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button variant="outline" className="w-full">Manage Turfs</Button>
            </CardContent>
          </Card>
        </Link>

        {canAddTurf && (
          <Link href="/owner/turfs/new" passHref>
            <Card className="shadow-lg hover:shadow-xl transition-shadow cursor-pointer h-full flex flex-col">
              <CardHeader className="flex-grow">
                <CardTitle className="flex items-center gap-2">
                  <PlusCircle className="h-6 w-6 text-primary" />
                  Add New Turf
                </CardTitle>
                <CardDescription>List a new turf on TOD (TurfOnDemand).</CardDescription>
              </CardHeader>
              <CardContent>
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">Add Turf</Button>
              </CardContent>
            </Card>
          </Link>
        )}

        <Link href="/owner/bookings" passHref>
          <Card className="shadow-lg hover:shadow-xl transition-shadow cursor-pointer h-full flex flex-col">
            <CardHeader className="flex-grow">
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-6 w-6 text-primary" />
                View Bookings
              </CardTitle>
              <CardDescription>Manage all bookings for your turfs.</CardDescription>
            </CardHeader>
             <CardContent>
                <Button variant="outline" className="w-full">Manage Bookings</Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/owner/analytics" passHref>
          <Card className="shadow-lg hover:shadow-xl transition-shadow cursor-pointer h-full flex flex-col">
            <CardHeader className="flex-grow">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-primary" />
                Analytics
              </CardTitle>
              <CardDescription>Track performance and earnings.</CardDescription>
            </CardHeader>
             <CardContent>
                <Button variant="outline" className="w-full">View Analytics</Button>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
