// src/app/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ArrowRight, LogIn, UserPlus, Search, CalendarDays, ShieldCheck } from "lucide-react";

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'owner') {
        router.replace('/owner/dashboard');
      } else {
        router.replace('/player/dashboard');
      }
    }
  }, [user, loading, router]);

  if (loading || (!loading && user)) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Logo /> <span className="ml-2 animate-pulse">Loading your experience...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="container mx-auto py-6 px-4 md:px-6 flex flex-col sm:flex-row justify-between items-center">
        <Logo />
        <nav className="space-x-2 sm:space-x-4 mt-4 sm:mt-0">
          <Link href="/login" passHref>
            <Button variant="outline" className="text-primary border-primary hover:bg-primary/10">
              <LogIn className="mr-2 h-4 w-4" /> Login
            </Button>
          </Link>
          <Link href="/signup" passHref>
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <UserPlus className="mr-2 h-4 w-4" /> Sign Up
            </Button>
          </Link>
        </nav>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="container mx-auto py-12 md:py-16 px-4 md:px-6 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-primary mb-6">
            Find & Book Your Perfect Turf
          </h1>
          <p className="text-lg sm:text-xl text-foreground/80 mb-8 sm:mb-10 max-w-3xl mx-auto">
            TOD (TurfOnDemand) connects players with top-quality sports turfs. Owners can easily list and manage their facilities.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link href="/player/turfs" passHref>
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto">
                Find a Turf <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/owner/turfs/new" passHref> 
              <Button size="lg" variant="outline" className="border-accent text-accent hover:bg-accent/10 w-full sm:w-auto">
                List Your Turf
              </Button>
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-white py-12 md:py-16">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-3xl font-bold text-center text-foreground mb-12">Why Choose TOD?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-6 rounded-lg shadow-lg border border-border">
                <Search className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">Easy Discovery</h3>
                <p className="text-foreground/70">Search turfs by location, price, and amenities. Read AI-powered review summaries.</p>
              </div>
              <div className="p-6 rounded-lg shadow-lg border border-border">
                <CalendarDays className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">Seamless Booking</h3>
                <p className="text-foreground/70">View available slots in real-time and book your preferred time instantly.</p>
              </div>
              <div className="p-6 rounded-lg shadow-lg border border-border">
                <ShieldCheck className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">Effortless Management</h3>
                <p className="text-foreground/70">Turf owners can manage listings, bookings, and availability with powerful tools.</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Placeholder for image */}
        <section className="py-12 md:py-16 container mx-auto px-4 md:px-6">
           <Image 
            src="https://placehold.co/1200x400.png" 
            alt="Happy people playing on a turf" 
            width={1200} 
            height={400} 
            className="rounded-lg shadow-xl mx-auto w-full h-auto"
            data-ai-hint="sports field action"
            />
        </section>

      </main>

      <footer className="bg-gray-100 text-foreground/70 py-8 text-center border-t">
        <div className="container mx-auto px-4 md:px-6">
          <Logo className="justify-center mb-4"/>
          <p>&copy; {new Date().getFullYear()} TOD (TurfOnDemand). All rights reserved.</p>
          <p className="text-sm">Your ultimate destination for turf booking.</p>
        </div>
      </footer>
    </div>
  );
}
