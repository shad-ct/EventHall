import { db, auth } from './firebase';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { User, UserInterest, EventCategory } from '../types';

/**
 * User collection operations
 */

/**
 * Get or create user document in Firestore
 */
export const syncUserToFirestore = async (
  firebaseUser: typeof auth.currentUser
): Promise<User> => {
  if (!firebaseUser) {
    throw new Error('No Firebase user');
  }

  const userRef = doc(db, 'users', firebaseUser.uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    // User exists, return their data
    return userSnap.data() as User;
  }

  // Create new user document
  const newUser: User = {
    id: firebaseUser.uid,
    firebaseUid: firebaseUser.uid,
    email: firebaseUser.email || '',
    fullName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
    photoUrl: firebaseUser.photoURL || undefined,
    role: 'STANDARD_USER',
    isStudent: null,
    collegeName: null,
    interests: [],
  };

  await setDoc(userRef, {
    ...newUser,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return newUser;
};

/**
 * Get user by UID
 */
export const getUser = async (uid: string): Promise<User | null> => {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    return userSnap.data() as User;
  }

  return null;
};

/**
 * Update user profile
 */
export const updateUserProfile = async (
  uid: string,
  updates: Partial<User>
): Promise<User> => {
  const userRef = doc(db, 'users', uid);

  await updateDoc(userRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });

  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    return userSnap.data() as User;
  }

  throw new Error('User not found after update');
};

/**
 * Get user by email
 */
export const getUserByEmail = async (email: string): Promise<User | null> => {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('email', '==', email));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    return null;
  }

  return querySnapshot.docs[0].data() as User;
};

/**
 * Event Categories - Mock data (can be migrated to Firestore later)
 */
export const mockCategories: EventCategory[] = [
  { id: '1', name: 'Hackathons', slug: 'hackathons', description: 'Coding competitions and marathons' },
  { id: '2', name: 'Workshops', slug: 'workshops', description: 'Technical and skill-building workshops' },
  { id: '3', name: 'Conferences', slug: 'conferences', description: 'Tech talks and conferences' },
  { id: '4', name: 'Seminars', slug: 'seminars', description: 'Expert seminars and lectures' },
  { id: '5', name: 'Sports', slug: 'sports', description: 'Sports events and competitions' },
  { id: '6', name: 'Cultural', slug: 'cultural', description: 'Cultural programs and performances' },
  { id: '7', name: 'Music & Arts', slug: 'music-arts', description: 'Music concerts and art exhibitions' },
  { id: '8', name: 'Gaming', slug: 'gaming', description: 'Gaming tournaments and esports' },
];

export const getCategories = async (): Promise<EventCategory[]> => {
  // Return mock categories for now
  return mockCategories;
};

/**
 * Update user interests with category details
 */
export const updateUserInterests = async (
  uid: string,
  interestCategories: EventCategory[]
): Promise<void> => {
  const userRef = doc(db, 'users', uid);

  const interests: UserInterest[] = interestCategories.map(category => ({
    id: category.id,
    category: category,
  }));

  await updateDoc(userRef, {
    interests,
    updatedAt: serverTimestamp(),
  });
};

/**
 * Event Collection Operations - Mock data for now
 * Full event features will be migrated to Firestore soon
 */

/**
 * Get all events
 */
export const getEvents = async (_params?: any): Promise<any> => {
  const eventsRef = collection(db, 'events');
  const q = query(eventsRef, where('status', '==', 'PUBLISHED'));
  const querySnapshot = await getDocs(q);
  
  const events = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
  
  return { events };
};

/**
 * Get events by categories
 */
export const getEventsByCategories = async (categoryIds: string[]): Promise<any> => {
  const eventsRef = collection(db, 'events');
  
  if (!categoryIds || categoryIds.length === 0) {
    // If no categories specified, get all published events
    const q = query(eventsRef, where('status', '==', 'PUBLISHED'));
    const querySnapshot = await getDocs(q);
    
    const events = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    return { eventsByCategory: {}, events };
  }
  
  // Get all published events
  const q = query(eventsRef, where('status', '==', 'PUBLISHED'));
  const querySnapshot = await getDocs(q);
  
  const allEvents = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
  
  // Group events by category
  const eventsByCategory: any = {};
  
  allEvents.forEach((event: any) => {
    const primaryCatId = event.primaryCategoryId;
    const additionalCatIds = event.additionalCategoryIds || [];
    
    // Check if event matches any requested category
    if (categoryIds.includes(primaryCatId) || additionalCatIds.some((id: string) => categoryIds.includes(id))) {
      // Add to primary category
      if (categoryIds.includes(primaryCatId)) {
        if (!eventsByCategory[primaryCatId]) {
          eventsByCategory[primaryCatId] = {
            category: mockCategories.find(c => c.id === primaryCatId),
            events: [],
          };
        }
        eventsByCategory[primaryCatId].events.push(event);
      }
    }
  });
  
  return { eventsByCategory, events: allEvents };
};

/**
 * Get single event
 */
export const getEvent = async (id: string): Promise<any> => {
  const eventRef = doc(db, 'events', id);
  const eventSnap = await getDoc(eventRef);
  
  if (!eventSnap.exists()) {
    return { event: null };
  }
  
  return { 
    event: {
      id: eventSnap.id,
      ...eventSnap.data(),
    }
  };
};

/**
 * Create event
 */
export const createEvent = async (eventData: any): Promise<any> => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('Not authenticated');
  }

  const eventsRef = collection(db, 'events');
  
  const newEvent = {
    ...eventData,
    status: 'PUBLISHED', // Auto-publish for now, can add approval flow later
    createdBy: {
      id: currentUser.uid,
      fullName: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
      email: currentUser.email || '',
    },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(eventsRef, newEvent);
  
  return { success: true, message: 'Event created successfully', eventId: docRef.id };
};

/**
 * Update event
 */
export const updateEvent = async (id: string, eventData: any): Promise<any> => {
  const eventRef = doc(db, 'events', id);
  
  await updateDoc(eventRef, {
    ...eventData,
    updatedAt: serverTimestamp(),
  });
  
  return { success: true, message: 'Event updated successfully' };
};

/**
 * Like event
 */
export const likeEvent = async (_id: string): Promise<any> => {
  // TODO: Implement Firestore event like
  return {};
};

/**
 * Register for event
 */
export const registerEvent = async (_id: string): Promise<any> => {
  // TODO: Implement Firestore event registration
  return {};
};

/**
 * Get user's registered events
 */
export const getRegisteredEvents = async (): Promise<any> => {
  // TODO: Implement Firestore user registrations query
  return { events: [] };
};

/**
 * Get user's liked events
 */
export const getLikedEvents = async (): Promise<any> => {
  // TODO: Implement Firestore user likes query
  return { events: [] };
};

/**
 * Get user's created events
 */
export const getUserEvents = async (): Promise<any> => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('Not authenticated');
  }

  const eventsRef = collection(db, 'events');
  const q = query(eventsRef, where('createdBy.id', '==', currentUser.uid));
  const querySnapshot = await getDocs(q);
  
  const events = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
  
  return { events };
};

/**
 * Check event interactions (likes, registrations)
 */
export const checkInteractions = async (_eventIds: string[]): Promise<any> => {
  // TODO: Implement Firestore interaction checks
  return { likedEventIds: [], registeredEventIds: [] };
};

/**
 * Admin Collection Operations - Stubs for now
 * Full admin features will be migrated to Firestore soon
 */

/**
 * Get admin applications
 */
export const getAdminApplications = async (_status?: string): Promise<any> => {
  // TODO: Implement Firestore admin applications query
  return { applications: [] };
};

/**
 * Review admin application
 */
export const reviewAdminApplication = async (_id: string, _status: 'APPROVED' | 'REJECTED'): Promise<any> => {
  // TODO: Implement Firestore admin application review
  return { success: true };
};

/**
 * Get pending events for admin review
 */
export const getPendingEvents = async (): Promise<any> => {
  // TODO: Implement Firestore pending events query
  return { events: [] };
};

/**
 * Update event status
 */
export const updateEventAdminStatus = async (_id: string, _status: string, _rejectionReason?: string): Promise<any> => {
  // TODO: Implement Firestore event status update
  return { success: true };
};

/**
 * Get all users (for admin)
 */
export const getAllUsers = async (_role?: string): Promise<any> => {
  // TODO: Implement Firestore users query
  return { users: [] };
};

/**
 * Seed sample events to Firestore
 */
export const seedSampleEvents = async (): Promise<void> => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('Not authenticated');
  }

  const sampleEvents = [
    {
      title: 'HackNIT 2025 - 48 Hour Hackathon',
      description: 'Join us for the biggest hackathon of the year! Build innovative solutions, compete with the best minds, and win exciting prizes. Free food, swag, and mentorship provided.',
      date: '2025-12-15',
      time: '09:00',
      location: 'Computer Science Block, NIT Calicut',
      district: 'Kozhikode',
      googleMapsLink: 'https://maps.google.com',
      primaryCategoryId: '1',
      additionalCategoryIds: ['2'],
      entryFee: undefined,
      isFree: true,
      prizeDetails: 'First Prize: ₹50,000, Second Prize: ₹30,000, Third Prize: ₹20,000',
      contactEmail: 'hacknit@nitc.ac.in',
      contactPhone: '+91 9876543210',
      bannerUrl: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=1200',
      instagramUrl: 'https://instagram.com/hacknit',
    },
    {
      title: 'Web Development Workshop',
      description: 'Learn modern web development with React, Node.js, and MongoDB. Hands-on session with industry experts. Build your first full-stack application.',
      date: '2025-12-20',
      time: '14:00',
      location: 'Seminar Hall, MEC',
      district: 'Ernakulam',
      primaryCategoryId: '2',
      additionalCategoryIds: ['3'],
      entryFee: '₹200',
      isFree: false,
      contactEmail: 'workshops@mec.ac.in',
      contactPhone: '+91 9876543211',
      bannerUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200',
    },
    {
      title: 'Annual Tech Conference 2025',
      description: 'Premier technology conference featuring keynote speakers from Google, Microsoft, and Amazon. Topics: AI, Cloud Computing, Blockchain, and more.',
      date: '2026-01-10',
      time: '10:00',
      location: 'Convention Center, Trivandrum',
      district: 'Thiruvananthapuram',
      primaryCategoryId: '3',
      additionalCategoryIds: ['4'],
      entryFee: '₹500',
      isFree: false,
      prizeDetails: 'Networking opportunities, certificates, and goodies',
      contactEmail: 'techconf@kerala.gov.in',
      contactPhone: '+91 9876543212',
      bannerUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200',
      facebookUrl: 'https://facebook.com/techconf2025',
    },
    {
      title: 'Inter-College Football Championship',
      description: 'Annual football tournament featuring top colleges from Kerala. Register your team now! Exciting matches, professional referees, and grand prizes.',
      date: '2025-12-25',
      time: '08:00',
      location: 'Sports Complex, CET',
      district: 'Thiruvananthapuram',
      primaryCategoryId: '5',
      entryFee: '₹1000 per team',
      isFree: false,
      prizeDetails: 'Winners: ₹25,000, Runners-up: ₹15,000',
      contactEmail: 'sports@cet.ac.in',
      contactPhone: '+91 9876543213',
      bannerUrl: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=1200',
    },
    {
      title: 'Onam Cultural Fest',
      description: 'Celebrate Onam with traditional dance, music, and food. Pookalam competition, Thiruvathira, Pulikali, and much more!',
      date: '2025-12-18',
      time: '16:00',
      location: 'Open Air Theatre, Kerala University',
      district: 'Thiruvananthapuram',
      primaryCategoryId: '6',
      additionalCategoryIds: ['7'],
      isFree: true,
      contactEmail: 'cultural@keralauniversity.ac.in',
      contactPhone: '+91 9876543214',
      bannerUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1200',
      instagramUrl: 'https://instagram.com/kuonamfest',
    },
    {
      title: 'Rock Band Night - Battle of Bands',
      description: 'Live rock music performances by college bands. Vote for your favorite! Food stalls, merch, and an electrifying atmosphere.',
      date: '2026-01-05',
      time: '18:00',
      location: 'Stadium, CUSAT',
      district: 'Ernakulam',
      primaryCategoryId: '7',
      additionalCategoryIds: ['6'],
      entryFee: '₹150',
      isFree: false,
      prizeDetails: 'Winning band gets ₹30,000 and recording contract',
      contactEmail: 'music@cusat.ac.in',
      contactPhone: '+91 9876543215',
      bannerUrl: 'https://images.unsplash.com/photo-1501612780327-45045538702b?w=1200',
      youtubeUrl: 'https://youtube.com/battleofbands',
    },
    {
      title: 'Valorant Gaming Tournament',
      description: 'Compete in the ultimate Valorant tournament! 5v5 matches, professional setup, live streaming, and huge prize pool.',
      date: '2025-12-22',
      time: '11:00',
      location: 'Gaming Arena, TKM College',
      district: 'Kollam',
      primaryCategoryId: '8',
      entryFee: '₹500 per team',
      isFree: false,
      prizeDetails: 'First Prize: ₹40,000, Second Prize: ₹25,000',
      contactEmail: 'gaming@tkmce.ac.in',
      contactPhone: '+91 9876543216',
      externalRegistrationLink: 'https://challonge.com/valorant2025',
      bannerUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200',
    },
    {
      title: 'AI & Machine Learning Seminar',
      description: 'Learn about the latest trends in AI and ML from industry experts. Topics include Deep Learning, NLP, Computer Vision, and practical applications.',
      date: '2025-12-28',
      time: '10:00',
      location: 'Auditorium, IIT Palakkad',
      district: 'Palakkad',
      primaryCategoryId: '4',
      additionalCategoryIds: ['2', '3'],
      isFree: true,
      contactEmail: 'ai@iitpkd.ac.in',
      contactPhone: '+91 9876543217',
      bannerUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200',
    },
  ];

  const eventsRef = collection(db, 'events');
  
  for (const eventData of sampleEvents) {
    const newEvent = {
      ...eventData,
      status: 'PUBLISHED',
      createdBy: {
        id: currentUser.uid,
        fullName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Admin',
        email: currentUser.email || '',
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await addDoc(eventsRef, newEvent);
  }

  console.log(`✅ Successfully seeded ${sampleEvents.length} sample events!`);
};
