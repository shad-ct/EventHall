/**
 * API Client - DEPRECATED FOR AUTHENTICATION
 * 
 * This file is kept as a stub for backward compatibility.
 * All authentication now uses Firebase Firestore directly.
 * Event and other features delegate to firestore.ts functions.
 */

// Import Firestore functions for delegation
import {
  getEventsByCategories as fsGetEventsByCategories,
  getEvent as fsGetEvent,
  createEvent as fsCreateEvent,
  updateEvent as fsUpdateEvent,
  likeEvent as fsLikeEvent,
  registerEvent as fsRegisterEvent,
  getRegisteredEvents as fsGetRegisteredEvents,
  getLikedEvents as fsGetLikedEvents,
  getUserEvents as fsGetUserEvents,
  checkInteractions as fsCheckInteractions,
  getCategories,
} from './firestore';

export const authAPI = {
  getCategories,
};

export const userAPI = {
  getProfile: async () => {
    // Use AuthContext for user profile
    throw new Error('Use AuthContext for user profile');
  },
  getLikedEvents: fsGetLikedEvents,
  getRegisteredEvents: fsGetRegisteredEvents,
  getMyEvents: fsGetUserEvents,
};

export const eventAPI = {
  getEvents: async (_params?: any) => {
    const events = await fsGetEventsByCategories([]);
    return { events: events.events || [] };
  },
  getEventsByCategories: fsGetEventsByCategories,
  getEvent: fsGetEvent,
  createEvent: fsCreateEvent,
  updateEvent: fsUpdateEvent,
  likeEvent: fsLikeEvent,
  registerEvent: fsRegisterEvent,
  checkInteractions: fsCheckInteractions,
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
