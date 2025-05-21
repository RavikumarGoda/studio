// src/components/turf/slot-manager.tsx
"use client";

import { useState, useEffect, ChangeEvent } from 'react';
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
import { CalendarDays, Clock, Trash2, PlusCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { format, addDays, parseISO } from 'date-fns';
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
  "10:00 PM - 11:00 PM",
];

export function SlotManager({ turf, initialSlots, onSlotsUpdate }: SlotManagerProps) {
  const [slots, setSlots] = useState<Slot[]>(initialSlots);
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [newSlotTimeRange, setNewSlotTimeRange] = useState<string>(commonTimeRanges[0]);
  const [newSlotStatus, setNewSlotStatus] = useState<Slot['status']>('available');
  const [slotToDelete, setSlotToDelete] = useState<Slot | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setSlots(initialSlots); // Sync with parent if initialSlots change
  }, [initialSlots]);

  const handleDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  const addSlot = () => {
    if (!selectedDate || !newSlotTimeRange) {
        toast({title: "Missing Information", description: "Please select a date and time range.", variant: "destructive"});
        return;
    }
    const newSlot: Slot = {
      id: `new-slot-${Date.now()}`, // Temporary ID, backend should generate real one
      turfId: turf.id,
      date: selectedDate,
      timeRange: newSlotTimeRange,
      status: newSlotStatus,
      createdAt: new Date(),
    };
    const updatedSlots = [...slots, newSlot].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime() || a.timeRange.localeCompare(b.timeRange));
    setSlots(updatedSlots);
    toast({title: "Slot Added (Locally)", description: "Remember to save changes."});
  };
  
  const updateSlotStatus = (slotId: string, status: Slot['status']) => {
    const updatedSlots = slots.map(slot => slot.id === slotId ? { ...slot, status } : slot);
    setSlots(updatedSlots);
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
      await onSlotsUpdate(slots); // Call parent's save function
      // Parent should show toast on success/failure
    } catch (error) {
        // This catch is a fallback if onSlotsUpdate itself throws an error not handled by the parent
        toast({title: "Error Saving Slots", description: "An unexpected error occurred.", variant: "destructive"})
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const slotsForSelectedDate = slots.filter(slot => slot.date === selectedDate)
    .sort((a,b) => a.timeRange.localeCompare(b.timeRange));

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl">Manage Slots for {turf.name}</CardTitle>
        <CardDescription>Add, edit, or remove time slots for your turf. Make sure to save your changes.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add New Slot Section */}
        <Card className="bg-muted/30 p-4">
          <h3 className="text-lg font-semibold mb-3">Add New Slot</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <Label htmlFor="slot-date">Date</Label>
              <Input type="date" id="slot-date" value={selectedDate} onChange={handleDateChange} min={format(new Date(), 'yyyy-MM-dd')} />
            </div>
            <div>
              <Label htmlFor="slot-time">Time Range</Label>
              <Select value={newSlotTimeRange} onValueChange={setNewSlotTimeRange}>
                <SelectTrigger id="slot-time"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {commonTimeRanges.map(range => <SelectItem key={range} value={range}>{range}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="slot-status-new">Initial Status</Label>
              <Select value={newSlotStatus} onValueChange={(val: Slot['status']) => setNewSlotStatus(val)}>
                <SelectTrigger id="slot-status-new"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
           <Button onClick={addSlot} className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Slot for {format(parseISO(selectedDate), 'MMM d')}
            </Button>
        </Card>

        {/* Existing Slots Display & Management */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Slots for {format(parseISO(selectedDate), 'EEEE, MMM d, yyyy')}</h3>
          {slotsForSelectedDate.length > 0 ? (
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {slotsForSelectedDate.map(slot => (
                <div key={slot.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 border rounded-md bg-card hover:bg-muted/50 transition-colors space-y-2 sm:space-y-0">
                  <div className="flex-grow">
                    <p className="font-medium"><Clock className="inline h-4 w-4 mr-1 text-muted-foreground" /> {slot.timeRange}</p>
                     {slot.status === 'booked' && slot.bookedBy && (
                        <p className="text-xs text-blue-600">Booked (Player ID: ...{slot.bookedBy.slice(-4)})</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Select 
                        value={slot.status} 
                        onValueChange={(value: Slot['status']) => updateSlotStatus(slot.id, value)}
                        disabled={slot.status === 'booked'}
                    >
                      <SelectTrigger className="w-full sm:w-[150px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        {slot.status === 'booked' && <SelectItem value="booked" disabled>Booked</SelectItem>}
                      </SelectContent>
                    </Select>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setSlotToDelete(slot)}
                        disabled={slot.status === 'booked'}
                        className={slot.status === 'booked' ? 'cursor-not-allowed' : 'text-destructive hover:bg-destructive/10'}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">No slots configured for this date.</p>
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
