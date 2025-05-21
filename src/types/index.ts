
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
  ownerPhoneNumber?: string; // Added owner phone number
  pricePerHour: number;
  images: string[]; // URLs
  amenities: string[]; // e.g., "parking", "restroom", "floodlights"
  description: string;
  isVisible: boolean;
  createdAt: Timestamp | Date;
  // Optional: for aggregated data
  averageRating?: number;
  reviewCount?: number;
}

export interface Slot {
  id: string;
  turfId: string; // For client-side reference if needed outside turf subcollection
  date: string; // "YYYY-MM-DD"
  timeRange: string; // "HH:MM AM/PM - HH:MM AM/PM"
  status: "available" | "booked" | "maintenance";
  bookedBy?: string; // uid of player
  createdAt: Timestamp | Date;
}

export interface Booking {
  id: string;
  turfId: string;
  playerId: string;
  slotId: string;
  turfName?: string; // Denormalized for easier display
  turfLocation?: string; // Denormalized
  timeRange: string;
  bookingDate: string; // "YYYY-MM-DD"
  status: "pending" | "approved" | "cancelled" | "completed";
  paymentStatus: "paid" | "unpaid";
  createdAt: Timestamp | Date;
  totalAmount?: number;
}

export interface Review {
  id: string;
  turfId: string; // For client-side reference
  userId: string;
  userName?: string; // Denormalized for easier display
  rating: number; // 1-5
  comment: string;
  createdAt: Timestamp | Date;
  ownerReply?: string;
  ownerRepliedAt?: Timestamp | Date;
}

