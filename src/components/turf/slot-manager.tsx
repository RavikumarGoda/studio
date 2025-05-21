
// src/components/turf/slot-manager.tsx
"use client";

import { useState, useEffect, ChangeEvent, KeyboardEvent } from 'react'; // Added KeyboardEvent
import type { Slot, Turf } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Clock, Trash2, PlusCircle, AlertTriangle, Loader2, CheckCircle, CircleSlash, Construction } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { cn } from '@/lib/utils';

interface SlotManagerProps {
  turf: Turf;
  initialSlots: Slot[];
  onSlotsUpdate: (updatedSlots: Slot[]) => Promise<void>; // To save changes
}

// Predefined time ranges for easier slot creation
const commonTimeRanges = [
  "06:00 AM - 07:00 AM", "07:00 AM - 08:00 AM", "08:00 AM - 09:00 AM", "09:00 AM - 10:00 AM",
  "10:00 AM - 11:00 AM", "11:00 AM - 12:00 PM", "12:00 PM - 01:00 PM", "01:00 PM - 02:00 PM",
  "02:00 PM - 03:00 PM", "03:00 PM - 04:00 PM", "04:00 PM - 05:00 PM", "05:00 PM - 06:00 PM",
  "06:00 PM - 07:00 PM", "07:00 PM - 08:00 PM", "08:00 PM - 09:00 PM", "09:00 PM - 10:00 PM",
  "10:00 PM - 11:00 PM", "11:00 PM - 12:00 AM",
];

// Helper to format hour for time range string
function formatHourForTimeRange(hour: number): string {
    const ampm = hour >= 12 && hour < 24 ? 'PM' : 'AM';
    let h = hour % 12;
    if (h === 0) h = 12; // For 12 AM (midnight) and 12 PM (noon)
    return `${String(h).padStart(2, '0')}:00 ${ampm}`;
}

// Helper to generate default slots from 7 AM to 12 AM (midnight)
function generateDefaultSlots(date: string, turfId: string): Slot[] {
    const defaults: Slot[] = [];
    const startHour = 7; // 7 AM
    const endLoopHour = 23;  // Loop until 23 for slot 11:00 PM - 12:00 AM

    for (let i = startHour; i <= endLoopHour; i++) {
        const startTime = formatHourForTimeRange(i);
        const endTime = formatHourForTimeRange(i + 1);
        const timeRange = `${startTime} - ${endTime}`;
        defaults.push({
            id: `default-slot-${date}-${i}-${Math.random().toString(16).slice(2)}`, // Temporary ID
            turfId: turfId,
            date: date,
            timeRange: timeRange,
            status: 'available',
            createdAt: new Date(),
        });
    }
    return defaults;
}

// Helper to convert time range string to sortable minutes from midnight
function timeRangeToMinutes(timeRange: string): number {
  const startTimeStr = timeRange.split(' - ')[0]; // e.g., "07:00 AM"
  const [timePart, modifier] = startTimeStr.split(' '); // e.g., ["07:00", "AM"]
  let [hours, minutes] = timePart.split(':').map(Number); // e.g., [7, 0]

  if (modifier.toUpperCase() === 'AM') {
    if (hours === 12) { // 12 AM (midnight start of day)
      hours = 0;
    }
  } else if (modifier.toUpperCase() === 'PM') {
    if (hours !== 12) { // 12 PM (noon) is 12, 1 PM is 13, etc.
      hours += 12;
    }
  }
  return hours * 60 + minutes;
}


export function SlotManager({ turf, initialSlots, onSlotsUpdate }: SlotManagerProps) {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [newSlotTimeRange, setNewSlotTimeRange] = useState<string>(commonTimeRanges[0]);
  const [newSlotStatus, setNewSlotStatus] = useState<Slot['status']>('available');
  const [slotToDelete, setSlotToDelete] = useState<Slot | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    let processedSlots = [...initialSlots];
    const selectedDateHasInitialSlots = initialSlots.some(slot => slot.date === selectedDate);

    if (!selectedDateHasInitialSlots) {
        const defaultGeneratedSlots = generateDefaultSlots(selectedDate, turf.id);
        processedSlots = [...processedSlots, ...defaultGeneratedSlots];
    }

    processedSlots.sort((a, b) => {
        const dateComparison = new Date(a.date).getTime() - new Date(b.date).getTime();
        if (dateComparison !== 0) return dateComparison;
        return timeRangeToMinutes(a.timeRange) - timeRangeToMinutes(b.timeRange);
    });

    setSlots(processedSlots);
  }, [initialSlots, selectedDate, turf.id]);


  const handleDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  const addSlot = () => {
    if (!selectedDate || !newSlotTimeRange) {
        toast({title: "Missing Information", description: "Please select a date and time range.", variant: "destructive"});
        return;
    }
    if (slots.some(slot => slot.date === selectedDate && slot.timeRange === newSlotTimeRange)) {
        toast({title: "Duplicate Slot", description: "This time range already exists for the selected date.", variant: "destructive"});
        return;
    }

    const newSlot: Slot = {
      id: `new-slot-${Date.now()}-${mockSlotIdCounter++}`, // Ensure unique temporary ID
      turfId: turf.id,
      date: selectedDate,
      timeRange: newSlotTimeRange,
      status: newSlotStatus,
      createdAt: new Date(),
    };
    const updatedSlots = [...slots, newSlot].sort((a,b) => {
        const dateComparison = new Date(a.date).getTime() - new Date(b.date).getTime();
        if (dateComparison !== 0) return dateComparison;
        return timeRangeToMinutes(a.timeRange) - timeRangeToMinutes(b.timeRange);
    });
    setSlots(updatedSlots);
    toast({title: "Slot Added (Locally)", description: "Remember to save changes."});
  };
  
  const toggleSlotStatus = (slotId: string) => {
    setSlots(prevSlots =>
      prevSlots.map(slot => {
        if (slot.id === slotId) {
          if (slot.status === 'available') {
            return { ...slot, status: 'maintenance' };
          } else if (slot.status === 'maintenance') {
            return { ...slot, status: 'available' };
          }
          // Booked slots are not toggled here
        }
        return slot;
      })
    );
  };

  const confirmDeleteSlot = () => {
    if (!slotToDelete) return;
    if (slotToDelete.status === 'booked') {
      toast({ title: "Cannot Delete Booked Slot", description: "This slot is already booked by a player.", variant: "destructive" });
      setSlotToDelete(null);
      return;
    }
    const updatedSlots = slots.filter(slot => slot.id !== slotToDelete.id);
    setSlots(updatedSlots);
    setSlotToDelete(null);
    toast({title: "Slot Deleted (Locally)", description: "Remember to save changes."});
  };


  const handleSaveChanges = async () => {
    setIsSubmitting(true);
    try {
      // Filter out only slots belonging to the current turf before saving.
      // This is important if `initialSlots` could contain slots from other turfs (though unlikely in this setup).
      const slotsToSave = slots.filter(slot => slot.turfId === turf.id);
      await onSlotsUpdate(slotsToSave);
    } catch (error) {
        toast({title: "Error Saving Slots", description: "An unexpected error occurred.", variant: "destructive"})
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const slotsForSelectedDate = slots.filter(slot => slot.date === selectedDate)
    .sort((a,b) => timeRangeToMinutes(a.timeRange) - timeRangeToMinutes(b.timeRange));

  const getSlotCardClasses = (status: Slot['status']) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 border-green-500 hover:bg-green-200 text-green-700';
      case 'maintenance':
        return 'bg-yellow-100 border-yellow-500 hover:bg-yellow-200 text-yellow-700';
      case 'booked':
        return 'bg-red-100 border-red-500 text-red-700 opacity-75'; // Removed cursor-not-allowed as div won't have it by default
      default:
        return 'bg-gray-100 border-gray-400';
    }
  };

  const getSlotIcon = (status: Slot['status']) => {
    switch(status) {
      case 'available': return <CheckCircle className="h-5 w-5 mr-2" />;
      case 'maintenance': return <Construction className="h-5 w-5 mr-2" />;
      case 'booked': return <CircleSlash className="h-5 w-5 mr-2" />;
      default: return <Clock className="h-5 w-5 mr-2" />;
    }
  }

  // Counter for new slot IDs to ensure uniqueness before saving
  let mockSlotIdCounter = 1;

  const handleSlotCardKeyDown = (event: KeyboardEvent<HTMLDivElement>, slotId: string, currentStatus: Slot['status']) => {
    if (currentStatus !== 'booked' && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      toggleSlotStatus(slotId);
    }
  };


  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl">Manage Slots for {turf.name}</CardTitle>
        <CardDescription>
          Select a date to view and manage slots. Click on an available or maintenance slot to toggle its status.
          Booked slots cannot be changed here. Default slots from 7 AM to 12 AM (midnight) are generated if none exist for a day.
          Make sure to save your changes.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add New Slot Section */}
        <Card className="bg-muted/30 p-4">
          <h3 className="text-lg font-semibold mb-3">Add Custom Slot</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <Label htmlFor="slot-date-custom">Date</Label>
              <Input type="date" id="slot-date-custom" value={selectedDate} onChange={handleDateChange} min={format(new Date(), 'yyyy-MM-dd')} />
            </div>
            <div>
              <Label htmlFor="slot-time">Time Range</Label>
              <Select value={newSlotTimeRange} onValueChange={setNewSlotTimeRange}>
                <SelectTrigger id="slot-time"><SelectValue placeholder="Select time range" /></SelectTrigger>
                <SelectContent>
                  {commonTimeRanges.map(range => <SelectItem key={range} value={range}>{range}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="slot-status-new">Initial Status</Label>
              <Select value={newSlotStatus} onValueChange={(val: Slot['status']) => setNewSlotStatus(val)}>
                <SelectTrigger id="slot-status-new"><SelectValue placeholder="Select status"/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
           <Button onClick={addSlot} className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Custom Slot for {format(parseISO(selectedDate), 'MMM d')}
            </Button>
        </Card>

        {/* Existing Slots Display & Management */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Slots for {format(parseISO(selectedDate), 'EEEE, MMM d, yyyy')}</h3>
          {slotsForSelectedDate.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {slotsForSelectedDate.map(slot => (
                <div // Changed from button to div
                  key={slot.id}
                  role="button" // Accessibility: informs assistive tech it's a button
                  tabIndex={slot.status !== 'booked' ? 0 : -1} // Accessibility: make it focusable if not booked
                  onClick={() => slot.status !== 'booked' && toggleSlotStatus(slot.id)}
                  onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => handleSlotCardKeyDown(e, slot.id, slot.status)}
                  aria-disabled={slot.status === 'booked'}
                  className={cn(
                    "relative p-3 border rounded-lg shadow-sm transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-ring", 
                    getSlotCardClasses(slot.status),
                    slot.status !== 'booked' ? 'cursor-pointer' : 'cursor-not-allowed'
                  )}
                >
                  <div className="flex items-center justify-center mb-1">
                    {getSlotIcon(slot.status)}
                    <span className="font-medium text-sm capitalize">{slot.status}</span>
                  </div>
                  <p className="text-xs text-center">{slot.timeRange}</p>
                  {slot.status === 'booked' && slot.bookedBy && (
                    <p className="text-xs text-center mt-1 opacity-80">(By ...{slot.bookedBy.slice(-4)})</p>
                  )}
                   <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => { e.stopPropagation(); setSlotToDelete(slot);}} 
                        disabled={slot.status === 'booked'}
                        className={cn(
                            "absolute top-1 right-1 h-6 w-6",
                            slot.status === 'booked' ? 'hidden' : 'text-muted-foreground hover:text-destructive hover:bg-destructive/10'
                        )}
                        aria-label="Delete slot"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">No slots configured for this date. Defaults will be generated if none are saved.</p>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <Button onClick={handleSaveChanges} className="bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save All Changes
          </Button>
        </div>
      </CardContent>

      <AlertDialog open={!!slotToDelete} onOpenChange={(open) => !open && setSlotToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center"><AlertTriangle className="h-5 w-5 mr-2 text-destructive" />Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the slot for {slotToDelete?.date} at {slotToDelete?.timeRange}? This action cannot be undone.
              {slotToDelete?.status === 'booked' && <span className="block mt-2 font-semibold text-destructive">This slot is BOOKED and cannot be deleted.</span>}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSlotToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
                onClick={confirmDeleteSlot}
                disabled={slotToDelete?.status === 'booked'}
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
                Delete Slot
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </Card>
  );
}

