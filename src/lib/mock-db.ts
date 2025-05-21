
// src/lib/mock-db.ts
import type { Turf, Slot, Booking, Review, BookedSlotDetail } from '@/types';

// Define the shape of our mock DB on the global object for HMR
declare global {
  var __mockDB_TOD: {
    turfs: Turf[];
    slots: Slot[];
    reviews: Review[];
    bookings: Booking[];
    turfIdCounter: number;
    slotIdCounter: number;
    reviewIdCounter: number;
    bookingIdCounter: number;
    initialized: boolean;
  } | undefined;
}

// Initialize the mockDB on globalThis if it doesn't exist
if (!globalThis.__mockDB_TOD) {
  globalThis.__mockDB_TOD = {
    turfs: [],
    slots: [],
    reviews: [],
    bookings: [],
    turfIdCounter: 1,
    slotIdCounter: 1,
    reviewIdCounter: 1,
    bookingIdCounter: 1,
    initialized: false,
  };
}

const mockDB = globalThis.__mockDB_TOD;

// Initialize data arrays if not already done (e.g., after a full server restart)
if (!mockDB.initialized || process.env.NODE_ENV !== 'development') {
  mockDB.turfs = [];
  mockDB.slots = [];
  mockDB.reviews = [];
  mockDB.bookings = [];
  mockDB.turfIdCounter = 1;
  mockDB.slotIdCounter = 1;
  mockDB.reviewIdCounter = 1;
  mockDB.bookingIdCounter = 1;
  mockDB.initialized = true;
  console.log("Mock DB initialized (first time or non-dev environment).");
}


// Turf operations
export const getTurfs = (): Turf[] => {
  return mockDB.turfs.map(turf => ({ ...turf, createdAt: new Date(turf.createdAt) }));
};

export const getVisibleTurfs = (): Turf[] => {
  return mockDB.turfs.filter(t => t.isVisible).map(turf => ({ ...turf, createdAt: new Date(turf.createdAt) }));
};

export const getTurfById = (turfId: string): Turf | undefined => {
  const turf = mockDB.turfs.find(t => t.id === turfId);
  return turf ? { ...turf, createdAt: new Date(turf.createdAt) } : undefined;
};

export const getOwnerTurfs = (ownerId: string): Turf[] => {
  return mockDB.turfs.filter(t => t.ownerId === ownerId).map(turf => ({ ...turf, createdAt: new Date(turf.createdAt) }));
};

export const addTurf = (turfData: Omit<Turf, 'id' | 'createdAt' | 'ownerId' | 'averageRating' | 'reviewCount'>, ownerId: string): Turf => {
  const newTurf: Turf = {
    ...turfData,
    id: `turf-${mockDB.turfIdCounter++}`,
    ownerId: ownerId,
    createdAt: new Date(),
    averageRating: 0,
    reviewCount: 0,
    ownerPhoneNumber: turfData.ownerPhoneNumber || undefined,
  };
  mockDB.turfs.push(newTurf);
  return { ...newTurf };
};

export const updateTurf = (turfId: string, updates: Partial<Omit<Turf, 'id' | 'ownerId' | 'createdAt'>>): Turf | undefined => {
  const turfIndex = mockDB.turfs.findIndex(t => t.id === turfId);
  if (turfIndex === -1) return undefined;

  mockDB.turfs[turfIndex] = { ...mockDB.turfs[turfIndex], ...updates, createdAt: new Date(mockDB.turfs[turfIndex].createdAt) };
  return { ...mockDB.turfs[turfIndex] };
};


// Slot operations
export const getSlotsForTurf = (turfId: string): Slot[] => {
    return mockDB.slots.filter(s => s.turfId === turfId).map(slot => ({...slot, createdAt: new Date(slot.createdAt)}));
}

export const updateSlotsForTurf = (turfId: string, updatedSlotsData: Slot[]): void => {
    mockDB.slots = mockDB.slots.filter(s => s.turfId !== turfId);
    mockDB.slots.push(...updatedSlotsData.map(s => {
        const isNewOrTempSlot = s.id.startsWith('new-slot-') || s.id.startsWith('default-slot-');
        const newId = isNewOrTempSlot ? `slot-${turfId}-${mockDB.slotIdCounter++}` : s.id;
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
    return mockDB.reviews.filter(r => r.turfId === turfId)
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
        id: `review-${mockDB.reviewIdCounter++}`,
        turfId,
        createdAt: new Date(),
    };
    mockDB.reviews.push(newReview);

    const turf = mockDB.turfs.find(t => t.id === turfId);
    if (turf) {
        const reviewsForThisTurf = getReviewsForTurf(turfId);
        const totalRating = reviewsForThisTurf.reduce((sum, r) => sum + r.rating, 0);
        turf.averageRating = reviewsForThisTurf.length > 0 ? parseFloat((totalRating / reviewsForThisTurf.length).toFixed(1)) : 0;
        turf.reviewCount = reviewsForThisTurf.length;
    }
    return { ...newReview };
}

export const addReplyToReview = (reviewId: string, turfId: string, currentOwnerId: string, replyText: string): Review | undefined => {
    const reviewIndex = mockDB.reviews.findIndex(r => r.id === reviewId && r.turfId === turfId);
    if (reviewIndex === -1) return undefined;

    const turf = mockDB.turfs.find(t => t.id === turfId);
    if (!turf || turf.ownerId !== currentOwnerId) {
        return undefined; 
    }

    mockDB.reviews[reviewIndex].ownerReply = replyText;
    mockDB.reviews[reviewIndex].ownerRepliedAt = new Date();
    
    return { 
        ...mockDB.reviews[reviewIndex], 
        createdAt: new Date(mockDB.reviews[reviewIndex].createdAt),
        ownerRepliedAt: new Date(mockDB.reviews[reviewIndex].ownerRepliedAt!)
    };
};


// Booking operations
export const getBookingsForPlayer = (playerId: string): Booking[] => {
    return mockDB.bookings.filter(b => b.playerId === playerId).map(b => ({
      ...b, 
      createdAt: new Date(b.createdAt), 
      bookingDate: b.bookingDate 
    }));
}

export const getBookingsForOwnerTurfs = (ownerTurfIds: string[]): Booking[] => {
    return mockDB.bookings.filter(b => ownerTurfIds.includes(b.turfId)).map(b => ({
      ...b, 
      createdAt: new Date(b.createdAt), 
      bookingDate: b.bookingDate 
    }));
}

export const updateBooking = (bookingId: string, updates: Partial<Omit<Booking, 'id' | 'createdAt' | 'bookedSlotDetails'>>): Booking | undefined => {
    const bookingIndex = mockDB.bookings.findIndex(b => b.id === bookingId);
    if (bookingIndex === -1) return undefined;

    const originalBooking = mockDB.bookings[bookingIndex];
    mockDB.bookings[bookingIndex] = { 
        ...originalBooking, 
        ...updates, 
        createdAt: new Date(originalBooking.createdAt) 
    };

    // If booking is cancelled, update associated slots
    if (updates.status === 'cancelled') {
        originalBooking.bookedSlotDetails.forEach(detail => {
            const slotIndex = mockDB.slots.findIndex(s => s.id === detail.slotId);
            if (slotIndex !== -1) {
                mockDB.slots[slotIndex].status = 'available';
                delete mockDB.slots[slotIndex].bookedBy;
            }
        });
    }
    
    return { ...mockDB.bookings[bookingIndex] };
}


export const addBooking = (
    playerId: string,
    turfId: string,
    turfName: string | undefined,
    turfLocation: string | undefined,
    bookingDate: string, // Single date for all slots in this booking
    slotsToBookInfo: Array<{ tempSlotId: string; timeRange: string; price: number }>
): Booking => {
    let totalAmount = 0;
    const newBookedSlotDetails: BookedSlotDetail[] = [];

    slotsToBookInfo.forEach(slotInfo => {
        let persistentSlotId = slotInfo.tempSlotId;
        let slotIndex = mockDB.slots.findIndex(s => s.id === slotInfo.tempSlotId && s.turfId === turfId);

        if (slotIndex !== -1) { // Slot exists in DB
            if (mockDB.slots[slotIndex].status === 'available') {
                mockDB.slots[slotIndex].status = 'booked';
                mockDB.slots[slotIndex].bookedBy = playerId;
            } else {
                throw new Error(`Slot ${slotInfo.tempSlotId} (${slotInfo.timeRange}) is not available.`);
            }
        } else { // Slot was a default generated slot, does not exist in DB yet
            persistentSlotId = `slot-${turfId}-${mockDB.slotIdCounter++}`;
            const newSlotForDB: Slot = {
                id: persistentSlotId,
                turfId: turfId,
                date: bookingDate, // All slots in this consolidated booking share the same date
                timeRange: slotInfo.timeRange,
                status: 'booked',
                bookedBy: playerId,
                createdAt: new Date(),
            };
            mockDB.slots.push(newSlotForDB);
        }
        newBookedSlotDetails.push({ slotId: persistentSlotId, timeRange: slotInfo.timeRange });
        totalAmount += slotInfo.price;
    });

    const newBooking: Booking = {
        id: `booking-${mockDB.bookingIdCounter++}`,
        turfId,
        playerId,
        turfName,
        turfLocation,
        bookingDate,
        bookedSlotDetails: newBookedSlotDetails,
        status: 'pending',
        paymentStatus: 'unpaid',
        createdAt: new Date(),
        totalAmount,
    };

    mockDB.bookings.push(newBooking);
    return { ...newBooking };
};


export const getMockPlayerName = (playerId: string) => {
    if (playerId === 'mock-player-uid') return 'Player User';
    if (playerId === 'mock-owner-uid') return 'Owner User';
    const playerSpecificPart = playerId.replace('mock-player-', '').substring(0, 5);
    return `Player ${playerSpecificPart}`;
};

export const getAllMockTurfs = () => mockDB.turfs;
export const getAllMockSlots = () => mockDB.slots;
export const getAllMockBookings = () => mockDB.bookings;
export const getAllMockReviews = () => mockDB.reviews;

export const initializeMockData = () => {
    mockDB.turfs = [];
    mockDB.slots = [];
    mockDB.reviews = [];
    mockDB.bookings = [];
    mockDB.turfIdCounter = 1;
    mockDB.slotIdCounter = 1;
    mockDB.reviewIdCounter = 1;
    mockDB.bookingIdCounter = 1;
    console.log("Mock DB re-initialized and wiped clean via initializeMockData().");
};

// DO NOT call initializeMockData() automatically here to allow HMR persistence
// Call it manually or ensure the globalThis.__mockDB_TOD setup handles initial state.
// The globalThis setup above ensures it starts empty on a true server restart.
