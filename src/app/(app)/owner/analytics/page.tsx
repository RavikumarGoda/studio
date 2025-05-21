// src/app/(app)/owner/analytics/page.tsx
"use client";

import { BarChart3, Construction } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function OwnerAnalyticsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-primary flex items-center">
          <BarChart3 className="h-8 w-8 mr-3" />
          Turf Analytics
        </h1>
        <p className="text-muted-foreground">Insights into your turf performance and earnings.</p>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Construction className="h-6 w-6 mr-2 text-accent" />
            Feature Under Construction
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-12">
          <Construction className="h-24 w-24 mx-auto text-muted-foreground mb-6" />
          <h2 className="text-2xl font-semibold text-foreground mb-2">Analytics Coming Soon!</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            We&apos;re working hard to bring you detailed analytics, including booking counts, popular slots, and earnings statistics. Please check back later.
          </p>
        </CardContent>
      </Card>

      {/* Placeholder for future chart components */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
            <CardHeader><CardTitle>Bookings per Day (Placeholder)</CardTitle></CardHeader>
            <CardContent className="h-64 flex items-center justify-center text-muted-foreground">Chart will appear here</CardContent>
        </Card>
         <Card>
            <CardHeader><CardTitle>Most Booked Slots (Placeholder)</CardTitle></CardHeader>
            <CardContent className="h-64 flex items-center justify-center text-muted-foreground">Chart will appear here</CardContent>
        </Card>
         <Card>
            <CardHeader><CardTitle>Earnings Overview (Placeholder)</CardTitle></CardHeader>
            <CardContent className="h-64 flex items-center justify-center text-muted-foreground">Chart will appear here</CardContent>
        </Card>
         <Card>
            <CardHeader><CardTitle>Review Sentiments (Placeholder)</CardTitle></CardHeader>
            <CardContent className="h-64 flex items-center justify-center text-muted-foreground">Chart will appear here</CardContent>
        </Card>
      </div>

    </div>
  );
}
