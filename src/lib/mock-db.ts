
// src/lib/mock-db.ts
import type { Turf, Slot, Booking, Review } from '@/types';

// Initial mock data for turfs - starting empty
let mockTurfsDB: Turf[] = [];

// Mock data for Slots - starting empty
let mockSlotsDB: Slot[] = [];

// Mock data for Reviews - starting empty
let mockReviewsDB: Review[] = [];

// Mock data for Bookings - starting empty
let mockBookingsDB: Booking[] = [];

// ID Counters
let mockTurfIdCounter = 1;
let mockSlotIdCounter = 1;
let mockReviewIdCounter = 1;
let mockBookingIdCounter = 1;


// Turf operations
export const getTurfs = (): Turf[] => {
  return mockTurfsDB.map(turf => ({ ...turf, createdAt: new Date(turf.createdAt) }));
};

export const getVisibleTurfs = (): Turf[] => {
  return mockTurfsDB.filter(t => t.isVisible).map(turf => ({ ...turf, createdAt: new Date(turf.createdAt) }));
};

export const getTurfById = (turfId: string): Turf | undefined => {
  const turf = mockTurfsDB.find(t => t.id === turfId);
  return turf ? { ...turf, createdAt: new Date(turf.createdAt) } : undefined;
};

export const getOwnerTurfs = (ownerId: string): Turf[] => {
  return mockTurfsDB.filter(t => t.ownerId === ownerId).map(turf => ({ ...turf, createdAt: new Date(turf.createdAt) }));
};

export const addTurf = (turfData: Omit<Turf, 'id' | 'createdAt' | 'ownerId'>, ownerId: string): Turf => {
  const newTurf: Turf = {
    ...turfData,
    id: `turf-${mockTurfIdCounter++}`,
    ownerId: ownerId,
    createdAt: new Date(),
    averageRating: turfData.averageRating === undefined ? 0 : turfData.averageRating,
    reviewCount: turfData.reviewCount === undefined ? 0 : turfData.reviewCount,
    ownerPhoneNumber: turfData.ownerPhoneNumber || undefined,
  };
  mockTurfsDB.push(newTurf);
  return { ...newTurf };
};

export const updateTurf = (turfId: string, updates: Partial<Omit<Turf, 'id' | 'ownerId' | 'createdAt'>>): Turf | undefined => {
  const turfIndex = mockTurfsDB.findIndex(t => t.id === turfId);
  if (turfIndex === -1) return undefined;

  mockTurfsDB[turfIndex] = { ...mockTurfsDB[turfIndex], ...updates, createdAt: new Date(mockTurfsDB[turfIndex].createdAt) };
  return { ...mockTurfsDB[turfIndex] };
};


// Slot operations
export const getSlotsForTurf = (turfId: string): Slot[] => {
    return mockSlotsDB.filter(s => s.turfId === turfId).map(slot => ({...slot, createdAt: new Date(slot.createdAt)}));
}

export const updateSlotsForTurf = (turfId: string, updatedSlotsData: Slot[]): void => {
    mockSlotsDB = mockSlotsDB.filter(s => s.turfId !== turfId);
    mockSlotsDB.push(...updatedSlotsData.map(s => {
        const isNewOrTempSlot = s.id.startsWith('new-slot-') || s.id.startsWith('default-slot-');
        const newId = isNewOrTempSlot ? `slot-${turfId}-${mockSlotIdCounter++}` : s.id;
        return {
            ...s,
            id: newId,
            turfId,
            createdAt: s.createdAt ? new Date(s.createdAt) : new Date(),
        };
    }));
}

// Review operations
export const getReviewsForTurf = (turfId: string): Review[] => {
    return mockReviewsDB.filter(r => r.turfId === turfId)
                        .map(review => ({
                            ...review, 
                            createdAt: new Date(review.createdAt),
                            ownerRepliedAt: review.ownerRepliedAt ? new Date(review.ownerRepliedAt) : undefined
                        }))
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export const addReviewForTurf = (turfId: string, reviewData: Omit<Review, 'id' | 'turfId' | 'createdAt' | 'ownerReply' | 'ownerRepliedAt'>): Review => {
    const newReview: Review = {
        ...reviewData,
        id: `review-${mockReviewIdCounter++}`,
        turfId,
        createdAt: new Date(),
    };
    mockReviewsDB.push(newReview);

    const turf = mockTurfsDB.find(t => t.id === turfId);
    if (turf) {
        const reviewsForThisTurf = getReviewsForTurf(turfId);
        const totalRating = reviewsForThisTurf.reduce((sum, r) => sum + r.rating, 0);
        turf.averageRating = reviewsForThisTurf.length > 0 ? parseFloat((totalRating / reviewsForThisTurf.length).toFixed(1)) : 0;
        turf.reviewCount = reviewsForThisTurf.length;
    }
    return { ...newReview };
}

export const addReplyToReview = (reviewId: string, turfId: string, currentOwnerId: string, replyText: string): Review | undefined => {
    const reviewIndex = mockReviewsDB.findIndex(r => r.id === reviewId && r.turfId === turfId);
    if (reviewIndex === -1) return undefined;

    const turf = mockTurfsDB.find(t => t.id === turfId);
    if (!turf || turf.ownerId !== currentOwnerId) {
        // Authorization failed or turf not found
        return undefined; 
    }

    mockReviewsDB[reviewIndex].ownerReply = replyText;
    mockReviewsDB[reviewIndex].ownerRepliedAt = new Date();
    
    return { 
        ...mockReviewsDB[reviewIndex], 
        createdAt: new Date(mockReviewsDB[reviewIndex].createdAt),
        ownerRepliedAt: new Date(mockReviewsDB[reviewIndex].ownerRepliedAt!)
    };
};


// Booking operations
export const getBookingsForPlayer = (playerId: string): Booking[] => {
    return mockBookingsDB.filter(b => b.playerId === playerId).map(b => ({...b, createdAt: new Date(b.createdAt), bookingDate: b.bookingDate }));
}

export const getBookingsForOwnerTurfs = (ownerTurfIds: string[]): Booking[] => {
    return mockBookingsDB.filter(b => ownerTurfIds.includes(b.turfId)).map(b => ({...b, createdAt: new Date(b.createdAt), bookingDate: b.bookingDate }));
}

export const updateBooking = (bookingId: string, updates: Partial<Omit<Booking, 'id' | 'createdAt'>>): Booking | undefined => {
    const bookingIndex = mockBookingsDB.findIndex(b => b.id === bookingId);
    if (bookingIndex === -1) return undefined;

    mockBookingsDB[bookingIndex] = { ...mockBookingsDB[bookingIndex], ...updates, createdAt: new Date(mockBookingsDB[bookingIndex].createdAt) };
    return { ...mockBookingsDB[bookingIndex] };
}

export const addBooking = (bookingData: Omit<Booking, 'id' | 'createdAt'>): Booking => {
    const newBooking: Booking = {
        ...bookingData,
        id: `booking-${mockBookingIdCounter++}`,
        createdAt: new Date(),
    };
    mockBookingsDB.push(newBooking);

    const slot = mockSlotsDB.find(s => s.id === newBooking.slotId && s.turfId === newBooking.turfId);
    if (slot) {
        slot.status = 'booked';
        slot.bookedBy = newBooking.playerId;
    }
    return { ...newBooking };
}

// Helper to get player name
export const getMockPlayerName = (playerId: string) => {
    if (playerId === 'mock-player-uid') return 'Player User';
    if (playerId === 'mock-owner-uid') return 'Owner User';
    // Example of a simple way to make other IDs somewhat readable
    const playerSpecificPart = playerId.replace('mock-player-', '').substring(0, 5);
    return `Player ${playerSpecificPart}`;
};

export const getAllMockTurfs = () => mockTurfsDB;
export const getAllMockSlots = () => mockSlotsDB;
export const getAllMockBookings = () => mockBookingsDB;
export const getAllMockReviews = () => mockReviewsDB;

export const initializeMockData = () => {
    // Reset all data arrays to empty
    mockTurfsDB = [];
    mockSlotsDB = [];
    mockReviewsDB = [];
    mockBookingsDB = [];
    // Reset counters
    mockTurfIdCounter = 1;
    mockSlotIdCounter = 1;
    mockReviewIdCounter = 1;
    mockBookingIdCounter = 1;
    console.log("Mock DB re-initialized and wiped clean.");
};

// Initialize with empty data when this module is first loaded
initializeMockData();
