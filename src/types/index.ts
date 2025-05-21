
import type { Timestamp } from "firebase/firestore";

export interface User {
  uid: string;
  name: string;
  email: string;
  role: "owner" | "player";
  createdAt: Timestamp | Date; // Use Date for client-side objects, Timestamp for Firebase
}

export interface Turf {
  id: string;
  ownerId: string;
  name: string;
  location: string; // Could be more complex, e.g., GeoPoint or address object
  ownerPhoneNumber?: string;
  pricePerHour: number;
  images: string[]; // URLs
  amenities: string[]; // e.g., "parking", "restroom", "floodlights"
  description: string;
  isVisible: boolean;
  createdAt: Timestamp | Date;
  averageRating?: number;
  reviewCount?: number;
}

export interface Slot {
  id: string;
  turfId: string; 
  date: string; // "YYYY-MM-DD"
  timeRange: string; // "HH:MM AM/PM - HH:MM AM/PM"
  status: "available" | "booked" | "maintenance";
  bookedBy?: string; // uid of player
  createdAt: Timestamp | Date;
}

export interface BookedSlotDetail {
  slotId: string;
  timeRange: string;
}

export interface Booking {
  id: string;
  turfId: string;
  playerId: string;
  turfName?: string; 
  turfLocation?: string; 
  bookingDate: string; // "YYYY-MM-DD" - The single date for all slots in this booking
  bookedSlotDetails: BookedSlotDetail[]; // Details of all slots in this booking
  status: "pending" | "approved" | "cancelled" | "completed";
  paymentStatus: "paid" | "unpaid";
  createdAt: Timestamp | Date;
  totalAmount: number; // Total for all slots in this booking
}

export interface Review {
  id: string;
  turfId: string; 
  userId: string;
  userName?: string; 
  rating: number; // 1-5
  comment: string;
  createdAt: Timestamp | Date;
  ownerReply?: string;
  ownerRepliedAt?: Timestamp | Date;
}

