
// src/components/booking/owner-booking-card.tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Booking } from "@/types";
import { CalendarDays, Clock, User as UserIcon, Tag, IndianRupee, CheckCircle, XCircle, AlertTriangle, Layers } from "lucide-react";
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { getMockPlayerName } from "@/lib/mock-db"; 

interface OwnerBookingCardProps {
  booking: Booking;
  onApprove?: (bookingId: string) => void;
  onReject?: (bookingId: string) => void;
  onCancelByOwner?: (bookingId: string) => void;
}

export function OwnerBookingCard({ booking, onApprove, onReject, onCancelByOwner }: OwnerBookingCardProps) {
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

  // Helper to convert time string to minutes for sorting
  function timeStringToMinutes(timeStr: string): number {
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (modifier && modifier.toUpperCase() === 'PM' && hours !== 12) hours += 12;
    if (modifier && modifier.toUpperCase() === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  }

  const sortedSlotDetails = [...booking.bookedSlotDetails].sort((a, b) => 
    timeStringToMinutes(a.timeRange.split(' - ')[0]) - timeStringToMinutes(b.timeRange.split(' - ')[0])
  );


  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardHeader>
         <div className="flex justify-between items-start">
            <div>
                <CardTitle className="text-lg font-semibold">{booking.turfName || "Turf Booking"}</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">ID: {booking.id}</CardDescription>
            </div>
             <div className="flex gap-2">
                <Badge variant={getStatusVariant(booking.status)} className="capitalize text-sm px-3 py-1">
                    {booking.status}
                </Badge>
                <Badge variant={getPaymentStatusVariant(booking.paymentStatus)} className="capitalize text-sm px-3 py-1">
                    {booking.paymentStatus}
                </Badge>
            </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex items-center">
          <UserIcon className="h-4 w-4 mr-2 text-muted-foreground" />
          <span className="font-medium">Player:</span>
          <span className="ml-2">{getMockPlayerName(booking.playerId)}</span>
        </div>
        <div className="flex items-center">
          <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" />
          <span className="font-medium">Date:</span>
          <span className="ml-2">{format(new Date(booking.bookingDate), "eee, MMM d, yyyy")}</span>
        </div>
        
        <div className="flex items-start">
          <Clock className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground flex-shrink-0" />
          <span className="font-medium mr-2">Slots ({sortedSlotDetails.length}):</span>
          <div className="flex flex-wrap gap-1">
            {sortedSlotDetails.map(detail => (
                <Badge variant="outline" key={detail.slotId} className="text-xs px-1.5 py-0.5 font-normal">
                    {detail.timeRange}
                </Badge>
            ))}
          </div>
        </div>

        <div className="flex items-center">
            <IndianRupee className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="font-medium">Total Amount:</span>
            <span className="ml-2">₹{booking.totalAmount.toLocaleString()}</span>
        </div>
        {/* <div className="flex items-center">
          <Tag className="h-4 w-4 mr-2 text-muted-foreground" />
          <span className="font-medium">Slot IDs:</span>
          <span className="ml-2 text-xs truncate">{booking.bookedSlotDetails.map(d => d.slotId).join(', ')}</span>
        </div> */}
      </CardContent>
      <CardFooter className="flex justify-end gap-2 pt-4 border-t">
        {booking.status === 'pending' && onApprove && onReject && (
          <>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="border-red-500 text-red-500 hover:bg-red-500/10">
                        <XCircle className="mr-1 h-4 w-4" /> Reject
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Reject Booking?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to reject this booking? This action cannot be undone. All {booking.bookedSlotDetails.length} associated slots will be affected.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onReject(booking.id)} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                        Confirm Rejection
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <Button onClick={() => onApprove(booking.id)} size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <CheckCircle className="mr-1 h-4 w-4" /> Approve
            </Button>
          </>
        )}
        {booking.status === 'approved' && onCancelByOwner && (
           <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                        <AlertTriangle className="mr-1 h-4 w-4" /> Cancel Booking
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Cancel Approved Booking?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to cancel this approved booking? The player will be notified. All {booking.bookedSlotDetails.length} associated slots will be made available.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Keep Booking</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onCancelByOwner(booking.id)} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                        Confirm Cancellation
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        )}
      </CardFooter>
    </Card>
  );
}
