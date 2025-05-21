
// src/app/(app)/player/turfs/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { TurfCard } from '@/components/turf/turf-card';
import type { Turf } from '@/types';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search,SlidersHorizontal, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { getVisibleTurfs as fetchVisibleTurfs } from '@/lib/mock-db';
import { useToast } from '@/hooks/use-toast';

const allAmenities = ["parking", "restroom", "floodlights", "wifi", "gym", "cafe", "showers", "firstaid", "water"];

export default function TurfsPage() {
  const [allVisibleTurfs, setAllVisibleTurfs] = useState<Turf[]>([]);
  const [filteredTurfs, setFilteredTurfs] = useState<Turf[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    setIsLoading(true);
    try {
      const turfsFromDB = fetchVisibleTurfs();
      setAllVisibleTurfs(turfsFromDB);
    } catch (error) {
      console.error("Error fetching turfs:", error);
      toast({ title: "Error", description: "Could not load available turfs.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    let currentTurfs = [...allVisibleTurfs];
    
    // Filter by search term
    if (searchTerm) {
      currentTurfs = currentTurfs.filter(turf => 
        turf.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        turf.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by amenities
    if (selectedAmenities.length > 0) {
      currentTurfs = currentTurfs.filter(turf => 
        selectedAmenities.every(sa => turf.amenities.includes(sa))
      );
    }
    
    // Sort
    if (sortBy === 'price_asc') {
      currentTurfs.sort((a, b) => a.pricePerHour - b.pricePerHour);
    } else if (sortBy === 'price_desc') {
      currentTurfs.sort((a, b) => b.pricePerHour - a.pricePerHour);
    } else if (sortBy === 'rating') {
      // Ensure averageRating is treated as 0 if undefined for sorting
      currentTurfs.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
    }

    setFilteredTurfs(currentTurfs);
  }, [searchTerm, sortBy, selectedAmenities, allVisibleTurfs]);

  const handleAmenityChange = (amenity: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity) 
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading turfs...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-primary">Discover Turfs</h1>
        <p className="text-muted-foreground">Find the perfect spot for your next game.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-full md:flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            type="text"
            placeholder="Search by name or location..."
            className="pl-10 pr-4 py-2 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="rating">Sort by Rating</SelectItem>
            <SelectItem value="price_asc">Price: Low to High</SelectItem>
            <SelectItem value="price_desc">Price: High to Low</SelectItem>
          </SelectContent>
        </Select>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full md:w-auto">
              <SlidersHorizontal className="mr-2 h-4 w-4" /> Filters
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Filter Turfs</SheetTitle>
              <SheetDescription>
                Select amenities to narrow down your search.
              </SheetDescription>
            </SheetHeader>
            <div className="grid gap-4 py-4">
              <Label className="font-semibold">Amenities</Label>
              {allAmenities.map((amenity) => (
                <div key={amenity} className="flex items-center space-x-2">
                  <Checkbox
                    id={`amenity-${amenity}`}
                    checked={selectedAmenities.includes(amenity)}
                    onCheckedChange={() => handleAmenityChange(amenity)}
                  />
                  <label
                    htmlFor={`amenity-${amenity}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize"
                  >
                    {amenity}
                  </label>
                </div>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {filteredTurfs.length === 0 && (
         <p className="text-center text-muted-foreground py-8">
           {searchTerm || selectedAmenities.length > 0 
             ? "No turfs match your current filters. Try adjusting your search."
             : "No turfs available at the moment. Please check back later."}
         </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTurfs.map((turf) => (
          <TurfCard key={turf.id} turf={turf} />
        ))}
      </div>
    </div>
  );
}
