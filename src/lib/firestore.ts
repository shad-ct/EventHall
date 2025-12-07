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
 * Get all events (mock - returns empty for now)
 */
export const getEvents = async (_params?: any): Promise<any> => {
  // TODO: Implement Firestore events collection
  return { events: [] };
};

/**
 * Get events by categories
 */
export const getEventsByCategories = async (_categoryIds: string[]): Promise<any> => {
  // TODO: Implement Firestore events filtering by categories
  return { eventsByCategory: {} };
};

/**
 * Get single event
 */
export const getEvent = async (_id: string): Promise<any> => {
  // TODO: Implement Firestore event retrieval
  return { event: null };
};

/**
 * Create event
 */
export const createEvent = async (_eventData: any): Promise<any> => {
  // TODO: Implement Firestore event creation
  throw new Error('Event creation coming soon');
};

/**
 * Update event
 */
export const updateEvent = async (_id: string, _eventData: any): Promise<any> => {
  // TODO: Implement Firestore event update
  throw new Error('Event update coming soon');
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
  // TODO: Implement Firestore user events query
  return { events: [] };
};

/**
 * Check event interactions (likes, registrations)
 */
export const checkInteractions = async (_eventIds: string[]): Promise<any> => {
  // TODO: Implement Firestore interaction checks
  return { likedEventIds: [], registeredEventIds: [] };
};
