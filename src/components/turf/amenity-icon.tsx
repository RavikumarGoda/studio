// src/components/turf/amenity-icon.tsx
import { ParkingCircle, ShowerHead, Lightbulb, Wifi, Dumbbell, Utensils, type LucideIcon } from 'lucide-react';

interface AmenityIconProps {
  amenity: string;
  className?: string;
}

const amenityIconMap: Record<string, LucideIcon> = {
  parking: ParkingCircle,
  restroom: ShowerHead,
  floodlights: Lightbulb,
  wifi: Wifi,
  gym: Dumbbell,
  cafe: Utensils,
  // Add more amenities and their icons here
};

export function AmenityIcon({ amenity, className = "h-5 w-5 text-muted-foreground" }: AmenityIconProps) {
  const IconComponent = amenityIconMap[amenity.toLowerCase()];

  if (!IconComponent) {
    // Return a default icon or null if amenity is not found
    return <span className="text-xs text-muted-foreground capitalize">{amenity}</span>; 
  }

  return <IconComponent className={className} aria-label={amenity} />;
}
