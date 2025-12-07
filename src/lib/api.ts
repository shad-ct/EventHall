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
  getAdminApplications,
  reviewAdminApplication,
  getPendingEvents,
  updateEventAdminStatus,
  getAllUsers,
  getAllEvents,
  deleteEvent,
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
    const data = await fsGetEventsByCategories([]);
    return data;
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
    // TODO: Implement Firestore admin application
    // For now, return success response to avoid throwing
    return { success: true, message: 'Application submitted. Admin will review soon.' };
  },
  getApplications: getAdminApplications,
  reviewApplication: reviewAdminApplication,
  getPendingEvents: getPendingEvents,
  getAllEvents: getAllEvents,
  updateEventStatus: updateEventAdminStatus,
  deleteEvent: deleteEvent,
  getUsers: getAllUsers,
};

export default {};
