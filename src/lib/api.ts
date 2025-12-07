/**
 * API Client - DEPRECATED FOR AUTHENTICATION
 * 
 * This file is kept as a stub for backward compatibility.
 * All authentication now uses Firebase Firestore directly.
 * 
 * Event, admin, and other features still need to be migrated to Firestore.
 * Remove imports from this file as you migrate each feature.
 */

export const authAPI = {
  getCategories: async () => {
    // TODO: Migrate categories to Firestore
    throw new Error('Categories need to be migrated to Firestore. See FIRESTORE_MIGRATION_COMPLETE.md');
  },
};

export const userAPI = {
  getProfile: async () => {
    // Use firestore.ts instead
    throw new Error('Use Firestore directly. Import from ../lib/firestore');
  },
  getLikedEvents: async () => {
    throw new Error('Event features need Firestore migration');
  },
  getRegisteredEvents: async () => {
    throw new Error('Event features need Firestore migration');
  },
  getMyEvents: async () => {
    throw new Error('Event features need Firestore migration');
  },
};

export const eventAPI = {
  getEvents: async (_params?: any) => {
    throw new Error('Event features need Firestore migration');
  },
  getEventsByCategories: async (_categoryIds: string[]) => {
    throw new Error('Event features need Firestore migration');
  },
  getEvent: async (_id: string) => {
    throw new Error('Event features need Firestore migration');
  },
  createEvent: async (_eventData: any) => {
    throw new Error('Event features need Firestore migration');
  },
  updateEvent: async (_id: string, _eventData: any) => {
    throw new Error('Event features need Firestore migration');
  },
  likeEvent: async (_id: string) => {
    throw new Error('Event features need Firestore migration');
  },
  registerEvent: async (_id: string) => {
    throw new Error('Event features need Firestore migration');
  },
  checkInteractions: async (_eventIds: string[]) => {
    throw new Error('Event features need Firestore migration');
  },
};

export const adminAPI = {
  applyForAdmin: async (_motivationText: string) => {
    throw new Error('Admin features need Firestore migration');
  },
  getApplications: async (_status?: string) => {
    throw new Error('Admin features need Firestore migration');
  },
  reviewApplication: async (_id: string, _status: 'APPROVED' | 'REJECTED') => {
    throw new Error('Admin features need Firestore migration');
  },
  getPendingEvents: async () => {
    throw new Error('Admin features need Firestore migration');
  },
  getAllEvents: async (_status?: string) => {
    throw new Error('Admin features need Firestore migration');
  },
  updateEventStatus: async (_id: string, _status: string, _rejectionReason?: string) => {
    throw new Error('Admin features need Firestore migration');
  },
  getUsers: async (_role?: string) => {
    throw new Error('Admin features need Firestore migration');
  },
};

export default {};
