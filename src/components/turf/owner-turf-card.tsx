
// src/components/turf/owner-turf-card.tsx
import Image from "next/image";
import Link from "next/link";
import { MapPin, Edit3, Settings2, Eye, EyeOff, IndianRupee, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import type { Turf } from "@/types";

interface OwnerTurfCardProps {
  turf: Turf;
  onVisibilityToggle: (turfId: string, isVisible: boolean) => void;
}

export function OwnerTurfCard({ turf, onVisibilityToggle }: OwnerTurfCardProps) {
  return (
    <Card className="overflow-hidden shadow-lg flex flex-col h-full">
      <CardHeader className="p-0 relative">
        <Image
          src={turf.images[0] || "https://placehold.co/600x400.png"}
          alt={turf.name}
          width={600}
          height={400}
          className="w-full h-48 object-cover"
          data-ai-hint="soccer pitch grass"
        />
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-xl font-semibold mb-1 text-primary">{turf.name}</CardTitle>
        <CardDescription className="flex items-center text-sm text-muted-foreground mb-2">
          <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
          {turf.location}
        </CardDescription>
        
        <div className="flex items-center space-x-2 mb-3">
          <Badge variant="secondary" className="flex items-center">
            <IndianRupee className="h-4 w-4 mr-1" /> {turf.pricePerHour}/hr
          </Badge>
           <Badge variant={turf.isVisible ? "default" : "outline"} className="flex items-center">
            {turf.isVisible ? <Eye className="h-4 w-4 mr-1" /> : <EyeOff className="h-4 w-4 mr-1" />}
            {turf.isVisible ? "Visible" : "Hidden"}
          </Badge>
        </div>
        <p className="text-sm text-foreground/80 mb-3 line-clamp-2">{turf.description}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0 grid grid-cols-1 gap-3">
        <div className="flex items-center space-x-2">
            <Switch 
                id={`visibility-${turf.id}`} 
                checked={turf.isVisible}
                onCheckedChange={(checked) => onVisibilityToggle(turf.id, checked)}
            />
            <Label htmlFor={`visibility-${turf.id}`} className="text-sm">
                {turf.isVisible ? "Publicly Visible" : "Hidden from Players"}
            </Label>
        </div>
        <div className="flex gap-2 w-full">
            <Link href={`/owner/turfs/${turf.id}/edit`} className="flex-1">
                <Button variant="outline" className="w-full">
                    <Edit3 className="h-4 w-4 mr-2" /> Edit Details
                </Button>
            </Link>
            <Link href={`/owner/turfs/${turf.id}/manage-slots`} className="flex-1">
                <Button variant="outline" className="w-full">
                    <Settings2 className="h-4 w-4 mr-2" /> Manage Slots
                </Button>
            </Link>
        </div>
         <Link href={`/owner/turfs/${turf.id}/reviews`} className="w-full">
            <Button variant="outline" className="w-full">
                <MessageSquare className="h-4 w-4 mr-2" /> Manage Reviews
            </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
