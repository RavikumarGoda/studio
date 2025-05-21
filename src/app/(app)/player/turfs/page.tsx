// src/app/(app)/player/turfs/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { TurfCard } from '@/components/turf/turf-card';
import type { Turf } from '@/types';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search,SlidersHorizontal } from 'lucide-react';
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


// Mock data - replace with actual API call
const mockTurfs: Turf[] = [
  {
    id: 'turf-1',
    ownerId: 'owner-1',
    name: 'Green Kick Arena',
    location: 'Koramangala, Bangalore',
    pricePerHour: 1200,
    images: ['https://placehold.co/600x400.png?text=Green+Kick'],
    amenities: ['parking', 'restroom', 'floodlights', 'wifi'],
    description: 'State-of-the-art 5-a-side football turf with premium grass.',
    isVisible: true,
    createdAt: new Date(),
    averageRating: 4.5,
    reviewCount: 25,
  },
  {
    id: 'turf-2',
    ownerId: 'owner-2',
    name: 'Victory Playfield',
    location: 'Indiranagar, Bangalore',
    pricePerHour: 1000,
    images: ['https://placehold.co/600x400.png?text=Victory+Playfield'],
    amenities: ['restroom', 'floodlights'],
    description: 'Spacious cricket and football turf, perfect for corporate matches.',
    isVisible: true,
    createdAt: new Date(),
    averageRating: 4.2,
    reviewCount: 18,
  },
  {
    id: 'turf-3',
    ownerId: 'owner-1',
    name: 'Net Masters Badminton',
    location: 'HSR Layout, Bangalore',
    pricePerHour: 500,
    images: ['https://placehold.co/600x400.png?text=Net+Masters'],
    amenities: ['parking', 'restroom', 'gym'],
    description: 'Professional wooden badminton courts with excellent lighting.',
    isVisible: true,
    createdAt: new Date(),
    averageRating: 4.8,
    reviewCount: 32,
  },
  {
    id: 'turf-4',
    ownerId: 'owner-3',
    name: 'Hidden Gem Community Field',
    location: 'Whitefield, Bangalore',
    pricePerHour: 800,
    images: ['https://placehold.co/600x400.png?text=Hidden+Gem'],
    amenities: ['parking'],
    description: 'A quiet and well-maintained field for practice sessions.',
    isVisible: false, // This one should not be visible initially
    createdAt: new Date(),
  },
];

const allAmenities = ["parking", "restroom", "floodlights", "wifi", "gym", "cafe"];

export default function TurfsPage() {
  const [turfs, setTurfs] = useState<Turf[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  useEffect(() => {
    // Simulate fetching turfs
    const visibleTurfs = mockTurfs.filter(turf => turf.isVisible);
    
    let filtered = visibleTurfs.filter(turf => 
      turf.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      turf.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (selectedAmenities.length > 0) {
      filtered = filtered.filter(turf => 
        selectedAmenities.every(sa => turf.amenities.includes(sa))
      );
    }
    
    // Sort
    if (sortBy === 'price_asc') {
      filtered.sort((a, b) => a.pricePerHour - b.pricePerHour);
    } else if (sortBy === 'price_desc') {
      filtered.sort((a, b) => b.pricePerHour - a.pricePerHour);
    } else if (sortBy === 'rating') {
      filtered.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
    }

    setTurfs(filtered);
  }, [searchTerm, sortBy, selectedAmenities]);

  const handleAmenityChange = (amenity: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity) 
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };

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

      {turfs.length === 0 && !searchTerm && selectedAmenities.length === 0 && (
         <p className="text-center text-muted-foreground py-8">Loading available turfs...</p>
      )}
      {turfs.length === 0 && (searchTerm || selectedAmenities.length > 0) && (
         <p className="text-center text-muted-foreground py-8">No turfs match your current filters. Try adjusting your search.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {turfs.map((turf) => (
          <TurfCard key={turf.id} turf={turf} />
        ))}
      </div>
    </div>
  );
}
