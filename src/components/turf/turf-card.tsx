// src/components/turf/turf-card.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, रुपया as RupeeIcon, Star, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { Turf } from "@/types";
import { AmenityIcon } from "./amenity-icon";

interface TurfCardProps {
  turf: Turf;
}

export function TurfCard({ turf }: TurfCardProps) {
  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
      <CardHeader className="p-0 relative">
        <Link href={`/player/turfs/${turf.id}`} className="block">
          <Image
            src={turf.images[0] || "https://placehold.co/600x400.png"}
            alt={turf.name}
            width={600}
            height={400}
            className="w-full h-48 object-cover transition-transform duration-300 hover:scale-105"
            data-ai-hint="sports turf"
          />
        </Link>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <Link href={`/player/turfs/${turf.id}`}>
          <CardTitle className="text-xl font-semibold mb-1 hover:text-primary transition-colors">{turf.name}</CardTitle>
        </Link>
        <CardDescription className="flex items-center text-sm text-muted-foreground mb-2">
          <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
          {turf.location}
        </CardDescription>
        
        <div className="flex items-center space-x-2 mb-3">
          <Badge variant="secondary" className="flex items-center">
            <RupeeIcon className="h-4 w-4 mr-1" /> {turf.pricePerHour}/hr
          </Badge>
          {turf.averageRating && (
             <Badge variant="outline" className="flex items-center border-accent text-accent">
                <Star className="h-4 w-4 mr-1" /> {turf.averageRating.toFixed(1)} ({turf.reviewCount || 0})
            </Badge>
          )}
        </div>

        <p className="text-sm text-foreground/80 mb-3 line-clamp-2">{turf.description}</p>
        
        <div className="flex flex-wrap gap-2 mb-2">
          {turf.amenities.slice(0, 3).map((amenity) => (
            <div key={amenity} className="flex items-center text-xs bg-muted px-2 py-1 rounded-md">
              <AmenityIcon amenity={amenity} className="h-3 w-3 mr-1" />
              <span className="capitalize">{amenity}</span>
            </div>
          ))}
          {turf.amenities.length > 3 && (
            <Badge variant="outline" className="text-xs">+ {turf.amenities.length - 3} more</Badge>
          )}
        </div>

      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Link href={`/player/turfs/${turf.id}`} className="w-full">
          <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
            View Details & Book
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
