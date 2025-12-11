/**
 * API Client wrapper for backwards compatibility.
 * Authentication now uses the backend API via AuthContext.
 * Event and admin features delegate to firestore.ts helpers.
 */

// Import Firestore functions for delegation
import {
  getEventsByCategories as fsGetEventsByCategories,
  getEvent as fsGetEvent,
  createEvent as fsCreateEvent,
  updateEvent as fsUpdateEvent,
  likeEvent as fsLikeEvent,
  registerEvent as fsRegisterEvent,
  unregisterEvent as fsUnregisterEvent,
  getRegisteredEvents as fsGetRegisteredEvents,
  getLikedEvents as fsGetLikedEvents,
  getUserEvents as fsGetUserEvents,
  checkInteractions as fsCheckInteractions,
  getCategories,
  submitAdminApplication,
  getAdminApplications,
  reviewAdminApplication,
  getPendingEvents,
  updateEventAdminStatus,
  getAllUsers,
  getAllEvents,
  deleteEvent,
  toggleEventFeatured,
  getFeaturedEvents,
  toggleEventPublish,
  createRegistrationForm as fsCreateRegistrationForm,
  getRegistrationForm as fsGetRegistrationForm,
  registerEventWithForm as fsRegisterEventWithForm,
  getEventRegistrations as fsGetEventRegistrations,
  updateRegistrationStatus as fsUpdateRegistrationStatus,
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
  unregisterEvent: fsUnregisterEvent,
  checkInteractions: fsCheckInteractions,
  createRegistrationForm: fsCreateRegistrationForm,
  getRegistrationForm: fsGetRegistrationForm,
  registerEventWithForm: fsRegisterEventWithForm,
  getEventRegistrations: fsGetEventRegistrations,
  updateRegistrationStatus: fsUpdateRegistrationStatus,
};

export const adminAPI = {
  applyForAdmin: submitAdminApplication,
  getApplications: getAdminApplications,
  reviewApplication: reviewAdminApplication,
  getPendingEvents: getPendingEvents,
  getAllEvents: getAllEvents,
  updateEventStatus: updateEventAdminStatus,
  deleteEvent: deleteEvent,
  getUsers: getAllUsers,
  toggleEventFeatured: toggleEventFeatured,
  getFeaturedEvents: getFeaturedEvents,
  toggleEventPublish: toggleEventPublish,
};

export default {};
