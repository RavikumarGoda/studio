
// src/lib/mock-db.ts
import type { Turf, Slot, Booking, Review } from '@/types';

// Initial mock data for turfs
// Consolidating mock data from various files here.
let mockTurfsDB: Turf[] = [
  {
    id: 'turf-1',
    ownerId: 'mock-owner-uid',
    name: 'Green Kick Arena',
    location: 'Koramangala, Bangalore',
    pricePerHour: 1200,
    images: ['https://placehold.co/600x400.png?text=Green+Kick+Arena', 'https://placehold.co/400x300.png?text=GK+Side', 'https://placehold.co/400x300.png?text=GK+Goal'],
    amenities: ['parking', 'restroom', 'floodlights', 'wifi', 'cafe'],
    description: 'State-of-the-art 5-a-side football turf with premium FIFA-certified artificial grass. Enjoy thrilling matches under bright floodlights.',
    isVisible: true,
    createdAt: new Date(2023, 10, 1),
    averageRating: 4.5,
    reviewCount: 25,
  },
  {
    id: 'turf-2', // Was turf-3 in some places, standardizing ID
    ownerId: 'mock-owner-uid',
    name: 'Net Masters Badminton',
    location: 'HSR Layout, Bangalore',
    pricePerHour: 500,
    images: ['https://placehold.co/600x400.png?text=Net+Masters'],
    amenities: ['parking', 'restroom', 'gym'],
    description: 'Professional wooden badminton courts with excellent lighting.',
    isVisible: false,
    createdAt: new Date(2023, 11, 15),
    averageRating: 4.8,
    reviewCount: 32,
  },
  {
    id: 'turf-visible-player',
    ownerId: 'another-owner-uid', // Not mock-owner-uid
    name: 'Victory Playfield',
    location: 'Indiranagar, Bangalore',
    pricePerHour: 1000,
    images: ['https://placehold.co/600x400.png?text=Victory+Playfield'],
    amenities: ['restroom', 'floodlights'],
    description: 'Spacious cricket and football turf, perfect for corporate matches.',
    isVisible: true,
    createdAt: new Date(2023, 9, 5),
    averageRating: 4.2,
    reviewCount: 18,
  },
  {
    id: 'turf-hidden-player',
    ownerId: 'another-owner-uid-2',
    name: 'Hidden Gem Community Field',
    location: 'Whitefield, Bangalore',
    pricePerHour: 800,
    images: ['https://placehold.co/600x400.png?text=Hidden+Gem'],
    amenities: ['parking'],
    description: 'A quiet and well-maintained field for practice sessions.',
    isVisible: false, 
    createdAt: new Date(2023, 8, 20),
    averageRating: 4.0,
    reviewCount: 5,
  },
   { 
    id: 'featured-turf-id',
    ownerId: 'owner-f',
    name: 'City Sports Arena',
    location: 'Downtown, Metropolis',
    pricePerHour: 1500,
    images: ['https://placehold.co/800x500.png?text=City+Sports+Main', 'https://placehold.co/400x300.png?text=CSA+Court'],
    amenities: ['parking', 'restroom', 'floodlights', 'wifi'],
    description: 'The best 5-a-side turf in downtown. Features high-quality turf, excellent lighting, and spectator seating. Ideal for both casual play and organized events.',
    isVisible: true,
    createdAt: new Date(2023, 7, 10),
    averageRating: 4.7,
    reviewCount: 42,
  },
];

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
    id: `turf-${Date.now()}`, // Simple unique ID
    ownerId: ownerId,
    createdAt: new Date(),
    averageRating: turfData.averageRating === undefined ? 0 : turfData.averageRating,
    reviewCount: turfData.reviewCount === undefined ? 0 : turfData.reviewCount,
  };
  mockTurfsDB.push(newTurf);
  return { ...newTurf }; // Return a copy
};

export const updateTurf = (turfId: string, updates: Partial<Omit<Turf, 'id' | 'ownerId' | 'createdAt'>>): Turf | undefined => {
  const turfIndex = mockTurfsDB.findIndex(t => t.id === turfId);
  if (turfIndex === -1) return undefined;
  
  mockTurfsDB[turfIndex] = { ...mockTurfsDB[turfIndex], ...updates, createdAt: new Date(mockTurfsDB[turfIndex].createdAt) };
  return { ...mockTurfsDB[turfIndex] };
};


// Mock data for Slots
let mockSlotsDB: Slot[] = [
    { id: 'slot-1-1', turfId: 'turf-1', date: '2024-07-20', timeRange: '09:00 AM - 10:00 AM', status: 'available', createdAt: new Date() },
    { id: 'slot-1-2', turfId: 'turf-1', date: '2024-07-20', timeRange: '10:00 AM - 11:00 AM', status: 'booked', bookedBy: 'player-x', createdAt: new Date() },
    { id: 'slot-1-3', turfId: 'turf-1', date: '2024-07-21', timeRange: '06:00 PM - 07:00 PM', status: 'available', createdAt: new Date() },
    { id: 'slot-2-1', turfId: 'turf-2', date: '2024-07-22', timeRange: '05:00 PM - 06:00 PM', status: 'maintenance', createdAt: new Date() },
    { id: 'slot-f-1', turfId: 'featured-turf-id', date: '2024-07-22', timeRange: '05:00 PM - 06:00 PM', status: 'available', createdAt: new Date() },
    { id: 'slot-f-2', turfId: 'featured-turf-id', date: '2024-07-22', timeRange: '06:00 PM - 07:00 PM', status: 'available', createdAt: new Date() },
];

export const getSlotsForTurf = (turfId: string): Slot[] => {
    return mockSlotsDB.filter(s => s.turfId === turfId).map(slot => ({...slot, createdAt: new Date(slot.createdAt)}));
}

export const updateSlotsForTurf = (turfId: string, updatedSlotsData: Slot[]): void => {
    mockSlotsDB = mockSlotsDB.filter(s => s.turfId !== turfId); // Remove old
    mockSlotsDB.push(...updatedSlotsData.map(s => ({ // Add new/updated
        ...s, 
        turfId, // ensure turfId is set
        createdAt: s.createdAt ? new Date(s.createdAt) : new Date(), // ensure date object
        id: s.id.startsWith('new-slot-') ? `slot-${turfId}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}` : s.id // generate better ID if new
    })));
}

// Mock data for Reviews
let mockReviewsDB: Review[] = [
    { id: 'review-1-1', turfId: 'turf-1', userId: 'player-1', userName: 'John Doe', rating: 5, comment: 'Amazing turf, well maintained!', createdAt: new Date(2024, 5, 10) },
    { id: 'review-1-2', turfId: 'turf-1', userId: 'player-2', userName: 'Jane Smith', rating: 4, comment: 'Good facilities, but can get crowded.', createdAt: new Date(2024, 6, 1) },
    { id: 'review-f-1', turfId: 'featured-turf-id', userId: 'player-3', userName: 'Alex Ray', rating: 5, comment: 'Best turf in the city, hands down!', createdAt: new Date(2024, 6, 15) },
];

export const getReviewsForTurf = (turfId: string): Review[] => {
    return mockReviewsDB.filter(r => r.turfId === turfId).map(review => ({...review, createdAt: new Date(review.createdAt)}));
}

export const addReviewForTurf = (turfId: string, reviewData: Omit<Review, 'id' | 'turfId' | 'createdAt'>): Review => {
    const newReview: Review = {
        ...reviewData,
        id: `review-${Date.now()}`,
        turfId,
        createdAt: new Date(),
    };
    mockReviewsDB.push(newReview);

    const turf = mockTurfsDB.find(t => t.id === turfId);
    if (turf) {
        const reviewsForThisTurf = getReviewsForTurf(turfId); // Use the getter to ensure fresh data
        const totalRating = reviewsForThisTurf.reduce((sum, r) => sum + r.rating, 0);
        turf.averageRating = reviewsForThisTurf.length > 0 ? parseFloat((totalRating / reviewsForThisTurf.length).toFixed(1)) : 0;
        turf.reviewCount = reviewsForThisTurf.length;
    }
    return { ...newReview };
}

// Mock data for Bookings
let mockBookingsDB: Booking[] = [
  { id: 'booking-1', turfId: 'turf-1', playerId: 'mock-player-uid', slotId: 'slot-1-1', turfName: 'Green Kick Arena', turfLocation: 'Koramangala, Bangalore', timeRange: '09:00 AM - 10:00 AM', bookingDate: '2024-07-20', status: 'approved', paymentStatus: 'paid', totalAmount: 1200, createdAt: new Date(2024, 6, 10)},
  { id: 'booking-p1', turfId: 'turf-1', playerId: 'mock-owner-uid', slotId: 'slot-1-p1', turfName: 'Green Kick Arena', timeRange: '06:00 PM - 07:00 PM', bookingDate: '2024-07-21', status: 'pending', paymentStatus: 'unpaid', totalAmount: 1200, createdAt: new Date(2024, 6, 18)},
  { id: 'booking-p2', turfId: 'turf-2', playerId: 'mock-owner-uid', slotId: 'slot-2-p2', turfName: 'Net Masters Badminton', timeRange: '07:00 PM - 08:00 PM', bookingDate: '2024-07-23', status: 'pending', paymentStatus: 'unpaid', totalAmount: 500, createdAt: new Date(2024, 6, 19)},
  { id: 'booking-c1', turfId: 'turf-1', playerId: 'player-D', slotId: 'slot-1-c1', turfName: 'Green Kick Arena', timeRange: '11:00 AM - 12:00 PM', bookingDate: '2024-07-25', status: 'cancelled', paymentStatus: 'unpaid', totalAmount: 1200, createdAt: new Date(2024, 6, 18)},
  { id: 'booking-x1', turfId: 'turf-visible-player', playerId: 'player-E', slotId: 'slot-x-1', turfName: 'Victory Playfield', timeRange: '10:00 AM - 11:00 AM', bookingDate: '2024-07-24', status: 'approved', paymentStatus: 'paid', totalAmount: 900, createdAt: new Date(2024, 6, 17)},
  { id: 'booking-2', turfId: 'featured-turf-id', playerId: 'mock-player-uid', slotId: 'slot-f-1', turfName: 'City Sports Arena', turfLocation: 'Downtown, Metropolis', timeRange: '05:00 PM - 06:00 PM', bookingDate: '2024-07-22', status: 'pending', paymentStatus: 'unpaid', totalAmount: 1500, createdAt: new Date(2024, 6, 15)},
  { id: 'booking-3', turfId: 'turf-visible-player', playerId: 'mock-player-uid', slotId: 'slot-vp-1', turfName: 'Victory Playfield', turfLocation: 'Indiranagar, Bangalore', timeRange: '07:00 PM - 08:00 PM', bookingDate: '2024-06-28', status: 'completed', paymentStatus: 'paid', totalAmount: 1000, createdAt: new Date(2024, 5, 20)},
  { id: 'booking-4', turfId: 'turf-1', playerId: 'mock-player-uid', slotId: 'slot-1-x', turfName: 'Green Kick Arena', turfLocation: 'Koramangala, Bangalore', timeRange: '11:00 AM - 12:00 PM', bookingDate: '2024-07-25', status: 'cancelled', paymentStatus: 'unpaid', totalAmount: 1200, createdAt: new Date(2024, 6, 18)},
];

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
        id: `booking-${Date.now()}`,
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

// Helper to get player name - in real app, fetch from users collection
export const getMockPlayerName = (playerId: string) => {
    if (playerId === 'mock-player-uid') return 'Player User';
    if (playerId === 'mock-owner-uid') return 'Owner User'; // If owner books their own turf
    return `Player (...${playerId.slice(-4)})`;
};

export const getAllMockTurfs = () => mockTurfsDB;
export const getAllMockSlots = () => mockSlotsDB;
export const getAllMockBookings = () => mockBookingsDB;
export const getAllMockReviews = () => mockReviewsDB;

// Function to re-initialize mock data (e.g., for testing or reset)
export const initializeMockData = () => {
    // Re-assign to initial values. Be careful with object references if they were complex.
    // For this example, a simple re-assignment is fine.
    // If you had more complex initialization logic, it would go here.
    console.log("Mock DB re-initialized");
};
