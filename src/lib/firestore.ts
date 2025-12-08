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

  // Get user to check role
  const userDoc = await getUser(currentUser.uid);
  const isUltimateAdmin = userDoc?.role === 'ULTIMATE_ADMIN';

  const eventsRef = collection(db, 'events');
  
  const newEvent = {
    ...eventData,
    status: isUltimateAdmin ? 'PUBLISHED' : 'PENDING_APPROVAL', // Ultimate admin events auto-publish
    createdBy: {
      id: currentUser.uid,
      fullName: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
      email: currentUser.email || '',
    },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(eventsRef, newEvent);
  
  return { 
    success: true, 
    message: isUltimateAdmin ? 'Event published successfully' : 'Event submitted for approval', 
    eventId: docRef.id 
  };
};

/**
 * Update event
 */
export const updateEvent = async (id: string, eventData: any): Promise<any> => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('Not authenticated');
  }

  // Get the event to check ownership
  const eventRef = doc(db, 'events', id);
  const eventSnap = await getDoc(eventRef);
  
  if (!eventSnap.exists()) {
    throw new Error('Event not found');
  }

  const event = eventSnap.data();
  const userDoc = await getUser(currentUser.uid);
  
  // Check if user is the creator or ultimate admin
  const isCreator = event.createdBy?.id === currentUser.uid;
  const isUltimateAdmin = userDoc?.role === 'ULTIMATE_ADMIN';

  if (!isCreator && !isUltimateAdmin) {
    throw new Error('Unauthorized - You can only edit your own events');
  }
  
  await updateDoc(eventRef, {
    ...eventData,
    updatedAt: serverTimestamp(),
  });
  
  return { success: true, message: 'Event updated successfully' };
};

/**
 * Like event (toggle)
 */
export const likeEvent = async (eventId: string): Promise<any> => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('Not authenticated');
  }

  const likeRef = doc(db, 'likes', `${currentUser.uid}_${eventId}`);
  const likeSnap = await getDoc(likeRef);

  if (likeSnap.exists() && likeSnap.data().deleted === false) {
    // Unlike - mark as deleted
    await updateDoc(likeRef, {
      deleted: true,
      deletedAt: serverTimestamp(),
    });
    console.log(`Unliked event ${eventId}`);
    return { success: true, liked: false };
  } else {
    // Like - create or undelete the like
    await setDoc(likeRef, {
      userId: currentUser.uid,
      eventId,
      createdAt: serverTimestamp(),
      deleted: false,
    }, { merge: true });
    console.log(`Liked event ${eventId}`);
    return { success: true, liked: true };
  }
};

/**
 * Register for event
 */
export const registerEvent = async (eventId: string): Promise<any> => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('Not authenticated');
  }

  const registrationRef = doc(db, 'registrations', `${currentUser.uid}_${eventId}`);
  const registrationSnap = await getDoc(registrationRef);

  if (registrationSnap.exists()) {
    return { success: true, message: 'Already registered' };
  }

  await setDoc(registrationRef, {
    userId: currentUser.uid,
    eventId,
    createdAt: serverTimestamp(),
  });

  return { success: true, message: 'Registered successfully' };
};

/**
 * Get user's registered events
 */
export const getRegisteredEvents = async (): Promise<any> => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('Not authenticated');
  }

  // Get all registrations for this user
  const registrationsRef = collection(db, 'registrations');
  const q = query(registrationsRef, where('userId', '==', currentUser.uid));
  const querySnapshot = await getDocs(q);

  const eventIds = querySnapshot.docs.map(doc => doc.data().eventId);

  if (eventIds.length === 0) {
    return { events: [] };
  }

  // Fetch all registered events
  const events: any[] = [];

  for (const eventId of eventIds) {
    try {
      const eventRef = doc(db, 'events', eventId);
      const eventSnap = await getDoc(eventRef);
      
      if (eventSnap.exists()) {
        // Get like count for this event
        const likesQuery = query(
          collection(db, 'likes'),
          where('eventId', '==', eventId),
          where('deleted', '==', false)
        );
        const likesSnapshot = await getDocs(likesQuery);
        const likeCount = likesSnapshot.docs.length;

        events.push({ 
          id: eventSnap.id, 
          ...eventSnap.data(),
          likeCount 
        });
      }
    } catch (error) {
      console.error(`Failed to fetch event ${eventId}:`, error);
    }
  }

  return { events };
};

/**
 * Get user's liked events
 */
export const getLikedEvents = async (): Promise<any> => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('Not authenticated');
  }

  // Get all likes for this user (excluding deleted ones)
  const likesRef = collection(db, 'likes');
  const q = query(
    likesRef, 
    where('userId', '==', currentUser.uid),
    where('deleted', '==', false)
  );
  const querySnapshot = await getDocs(q);
  console.log(`Found ${querySnapshot.docs.length} liked events for user ${currentUser.uid}`);

  const eventIds = querySnapshot.docs.map(doc => doc.data().eventId);
  console.log('Liked event IDs:', eventIds);

  if (eventIds.length === 0) {
    return { events: [] };
  }

  // Fetch all liked events
  const events: any[] = [];

  for (const eventId of eventIds) {
    try {
      const eventRef = doc(db, 'events', eventId);
      const eventSnap = await getDoc(eventRef);
      
      if (eventSnap.exists()) {
        // Get like count for this event
        const likesQuery = query(
          collection(db, 'likes'),
          where('eventId', '==', eventId),
          where('deleted', '==', false)
        );
        const likesSnapshot = await getDocs(likesQuery);
        const likeCount = likesSnapshot.docs.length;

        events.push({ 
          id: eventSnap.id, 
          ...eventSnap.data(),
          likeCount 
        });
      }
    } catch (error) {
      console.error(`Failed to fetch event ${eventId}:`, error);
    }
  }

  console.log(`Returning ${events.length} liked events`);
  return { events };
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
export const checkInteractions = async (eventIds: string[]): Promise<any> => {
  const currentUser = auth.currentUser;
  if (!currentUser || eventIds.length === 0) {
    return { likedEventIds: [], registeredEventIds: [] };
  }

  // Check likes
  const likedEventIds: string[] = [];
  
  for (const eventId of eventIds) {
    const likeRef = doc(db, 'likes', `${currentUser.uid}_${eventId}`);
    const likeSnap = await getDoc(likeRef);
    
    if (likeSnap.exists() && !likeSnap.data().deleted) {
      likedEventIds.push(eventId);
    }
  }

  // Check registrations
  const registeredEventIds: string[] = [];
  
  for (const eventId of eventIds) {
    const regRef = doc(db, 'registrations', `${currentUser.uid}_${eventId}`);
    const regSnap = await getDoc(regRef);
    
    if (regSnap.exists()) {
      registeredEventIds.push(eventId);
    }
  }

  return { likedEventIds, registeredEventIds };
};

/**
 * Admin Collection Operations
 */

/**
 * Submit admin application
 */
export const submitAdminApplication = async (motivationText: string): Promise<any> => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('Not authenticated');
  }

  // Check if user already has a pending application
  const applicationsRef = collection(db, 'adminApplications');
  const existingQuery = query(
    applicationsRef,
    where('userId', '==', currentUser.uid),
    where('status', '==', 'PENDING')
  );
  const existingSnapshot = await getDocs(existingQuery);

  if (!existingSnapshot.empty) {
    throw new Error('You already have a pending application');
  }

  // Create new application
  const userDoc = await getUser(currentUser.uid);
  
  await addDoc(applicationsRef, {
    userId: currentUser.uid,
    motivationText,
    status: 'PENDING',
    createdAt: serverTimestamp(),
    user: {
      id: currentUser.uid,
      email: userDoc?.email || currentUser.email,
      fullName: userDoc?.fullName || currentUser.displayName,
      photoUrl: userDoc?.photoUrl || currentUser.photoURL,
      isStudent: userDoc?.isStudent,
      collegeName: userDoc?.collegeName,
    },
  });

  return { success: true, message: 'Application submitted successfully' };
};

/**
 * Get admin applications
 */
export const getAdminApplications = async (status?: string): Promise<any> => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('Not authenticated');
  }

  // Verify user is ultimate admin
  const userDoc = await getUser(currentUser.uid);
  if (userDoc?.role !== 'ULTIMATE_ADMIN') {
    throw new Error('Unauthorized - Ultimate admin only');
  }

  const applicationsRef = collection(db, 'adminApplications');
  let q;

  if (status) {
    q = query(applicationsRef, where('status', '==', status));
  } else {
    q = query(applicationsRef);
  }

  const snapshot = await getDocs(q);
  
  const applications = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));

  return { applications };
};

/**
 * Review admin application
 */
export const reviewAdminApplication = async (id: string, status: 'APPROVED' | 'REJECTED'): Promise<any> => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('Not authenticated');
  }

  // Verify user is ultimate admin
  const userDoc = await getUser(currentUser.uid);
  if (userDoc?.role !== 'ULTIMATE_ADMIN') {
    throw new Error('Unauthorized - Ultimate admin only');
  }

  const applicationRef = doc(db, 'adminApplications', id);
  const applicationSnap = await getDoc(applicationRef);

  if (!applicationSnap.exists()) {
    throw new Error('Application not found');
  }

  const application = applicationSnap.data();

  // Update application status
  await updateDoc(applicationRef, {
    status,
    reviewedByUserId: currentUser.uid,
    reviewedAt: serverTimestamp(),
  });

  // If approved, update user role to EVENT_ADMIN
  if (status === 'APPROVED') {
    const userRef = doc(db, 'users', application.userId);
    await updateDoc(userRef, {
      role: 'EVENT_ADMIN',
      updatedAt: serverTimestamp(),
    });
  }

  return { success: true, message: `Application ${status.toLowerCase()} successfully` };
};

/**
 * Get pending events for admin review
 */
export const getPendingEvents = async (): Promise<any> => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('Not authenticated');
  }

  // Verify user is ultimate admin
  const userDoc = await getUser(currentUser.uid);
  if (userDoc?.role !== 'ULTIMATE_ADMIN') {
    throw new Error('Unauthorized - Ultimate admin only');
  }

  const eventsRef = collection(db, 'events');
  const q = query(eventsRef, where('status', '==', 'PENDING_APPROVAL'));
  const snapshot = await getDocs(q);
  
  const events = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));

  return { events };
};

/**
 * Update event status (approve/reject)
 */
export const updateEventAdminStatus = async (eventId: string, status: string, rejectionReason?: string): Promise<any> => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('Not authenticated');
  }

  // Verify user is ultimate admin
  const userDoc = await getUser(currentUser.uid);
  if (userDoc?.role !== 'ULTIMATE_ADMIN') {
    throw new Error('Unauthorized - Ultimate admin only');
  }

  const eventRef = doc(db, 'events', eventId);
  const updateData: any = {
    status,
    updatedAt: serverTimestamp(),
    reviewedBy: currentUser.uid,
    reviewedAt: serverTimestamp(),
  };

  if (rejectionReason) {
    updateData.rejectionReason = rejectionReason;
  }

  await updateDoc(eventRef, updateData);

  return { success: true, message: `Event ${status.toLowerCase()} successfully` };
};

/**
 * Delete event (Ultimate admin only)
 */
export const deleteEvent = async (eventId: string): Promise<any> => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('Not authenticated');
  }

  // Verify user is ultimate admin
  const userDoc = await getUser(currentUser.uid);
  if (userDoc?.role !== 'ULTIMATE_ADMIN') {
    throw new Error('Unauthorized - Ultimate admin only');
  }

  const eventRef = doc(db, 'events', eventId);
  await updateDoc(eventRef, {
    status: 'ARCHIVED',
    archivedAt: serverTimestamp(),
    archivedBy: currentUser.uid,
  });

  return { success: true, message: 'Event deleted successfully' };
};

/**
 * Get all events (admin view with all statuses)
 */
export const getAllEvents = async (statusFilter?: string): Promise<any> => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('Not authenticated');
  }

  // Verify user is ultimate admin
  const userDoc = await getUser(currentUser.uid);
  if (userDoc?.role !== 'ULTIMATE_ADMIN') {
    throw new Error('Unauthorized - Ultimate admin only');
  }

  const eventsRef = collection(db, 'events');
  let q;
  
  if (statusFilter) {
    q = query(eventsRef, where('status', '==', statusFilter));
  } else {
    q = query(eventsRef);
  }

  const snapshot = await getDocs(q);
  
  const events = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));

  return { events };
};

/**
 * Get all users (for admin)
 */
export const getAllUsers = async (_role?: string): Promise<any> => {
  // TODO: Implement Firestore users query
  return { users: [] };
};

/**
 * Toggle event featured status (Ultimate admin only)
 */
export const toggleEventFeatured = async (eventId: string, isFeatured: boolean): Promise<any> => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('Not authenticated');
  }

  // Verify user is ultimate admin
  const userDoc = await getUser(currentUser.uid);
  if (userDoc?.role !== 'ULTIMATE_ADMIN') {
    throw new Error('Unauthorized - Ultimate admin only');
  }

  const eventRef = doc(db, 'events', eventId);
  const updateData: any = {
    isFeatured,
    updatedAt: serverTimestamp(),
  };

  if (isFeatured) {
    updateData.featuredAt = serverTimestamp();
    updateData.featuredBy = currentUser.uid;
  }

  await updateDoc(eventRef, updateData);

  return { success: true, message: isFeatured ? 'Event featured successfully' : 'Event unfeatured successfully' };
};

/**
 * Toggle event publish status (Ultimate admin only)
 */
export const toggleEventPublish = async (eventId: string, shouldPublish: boolean): Promise<any> => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('Not authenticated');
  }

  // Verify user is ultimate admin
  const userDoc = await getUser(currentUser.uid);
  if (userDoc?.role !== 'ULTIMATE_ADMIN') {
    throw new Error('Unauthorized - Ultimate admin only');
  }

  const eventRef = doc(db, 'events', eventId);
  const newStatus = shouldPublish ? 'PUBLISHED' : 'DRAFT';
  
  const updateData: any = {
    status: newStatus,
    updatedAt: serverTimestamp(),
  };

  if (shouldPublish) {
    updateData.publishedBy = currentUser.uid;
    updateData.publishedAt = serverTimestamp();
  } else {
    updateData.unpublishedBy = currentUser.uid;
    updateData.unpublishedAt = serverTimestamp();
  }

  await updateDoc(eventRef, updateData);

  return { success: true, message: shouldPublish ? 'Event published successfully' : 'Event unpublished successfully' };
};

/**
 * Get featured events
 */
export const getFeaturedEvents = async (): Promise<any> => {
  const eventsRef = collection(db, 'events');
  const q = query(
    eventsRef, 
    where('isFeatured', '==', true),
    where('status', '==', 'PUBLISHED')
  );
  const snapshot = await getDocs(q);
  
  const events = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));

  return { events };
};
