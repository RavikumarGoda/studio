
// src/components/booking/booking-card.tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Booking } from "@/types";
import { CalendarDays, Clock, MapPin, IndianRupee as RupeeIcon, Info, Layers } from "lucide-react";
import Link from "next/link";
import { format } from 'date-fns';

interface BookingCardProps {
  booking: Booking;
  onCancel?: (bookingId: string) => void; // Optional: for player to cancel
}

export function BookingCard({ booking, onCancel }: BookingCardProps) {
  const getStatusVariant = (status: Booking['status']): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "approved":
      case "completed":
        return "default"; 
      case "pending":
        return "secondary";
      case "cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getPaymentStatusVariant = (status: Booking['paymentStatus']): "default" | "secondary" | "destructive" | "outline" => {
    return status === "paid" ? "default" : "destructive";
  };

  const sortedSlotDetails = [...booking.bookedSlotDetails].sort((a, b) => 
    timeStringToMinutes(a.timeRange.split(' - ')[0]) - timeStringToMinutes(b.timeRange.split(' - ')[0])
  );

  // Helper to convert time string to minutes for sorting
  function timeStringToMinutes(timeStr: string): number {
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (modifier && modifier.toUpperCase() === 'PM' && hours !== 12) hours += 12;
    if (modifier && modifier.toUpperCase() === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  }


  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="text-xl font-semibold text-primary">{booking.turfName || "Turf Details Unavailable"}</CardTitle>
                <CardDescription className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                    {booking.turfLocation || "Location not specified"}
                </CardDescription>
            </div>
            <Link href={`/player/turfs/${booking.turfId}`}>
                <Button variant="outline" size="sm">View Turf</Button>
            </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center text-sm">
          <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" />
          <span className="font-medium">Date:</span>
          <span className="ml-2">{format(new Date(booking.bookingDate), "eee, MMM d, yyyy")}</span>
        </div>
        
        <div className="flex items-start text-sm">
          <Clock className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground flex-shrink-0" />
          <span className="font-medium mr-2">Time Slots ({sortedSlotDetails.length}):</span>
          <div className="flex flex-wrap gap-1">
            {sortedSlotDetails.map(detail => (
                <Badge variant="outline" key={detail.slotId} className="text-xs px-1.5 py-0.5 font-normal">
                    {detail.timeRange}
                </Badge>
            ))}
          </div>
        </div>

        <div className="flex items-center text-sm">
            <RupeeIcon className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="font-medium">Total Amount:</span>
            <span className="ml-2">₹{booking.totalAmount.toLocaleString()}</span>
        </div>
        <div className="flex items-center text-sm">
          <Info className="h-4 w-4 mr-2 text-muted-foreground" />
          <span className="font-medium">Booking ID:</span>
          <span className="ml-2 text-xs">{booking.id}</span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center pt-4 border-t">
        <div className="flex gap-2">
            <Badge variant={getStatusVariant(booking.status)} className="capitalize text-sm">
                {booking.status}
            </Badge>
            <Badge variant={getPaymentStatusVariant(booking.paymentStatus)} className="capitalize text-sm">
                {booking.paymentStatus}
            </Badge>
        </div>
        {onCancel && (booking.status === "pending" || booking.status === "approved") && booking.paymentStatus === "unpaid" && (
          <Button variant="destructive" size="sm" onClick={() => onCancel(booking.id)}>
            Cancel Booking
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
