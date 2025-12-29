// Wrapper around API client to maintain existing imports while using MySQL backend
import * as apiClient from './api-client';

const getCurrentUserId = (): string | null => {
  if (typeof localStorage === 'undefined') return null;
  const raw = localStorage.getItem('authUser');
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return parsed?.id || null;
  } catch (error) {
    console.error('Failed to parse stored user', error);
    return null;
  }
};

export const getUser = async (uid: string) => {
  return apiClient.getUser(uid);
};

export const getUserByEmail = async (email: string) => {
  return apiClient.getUserByEmail(email);
};

export const updateUserProfile = async (uid: string, updates: any) => {
  return apiClient.updateUserProfile(uid, updates);
};

export const updateUserInterests = async (uid: string, interestCategories: any[]) => {
  const categoryIds = interestCategories.map(cat => cat.id);
  return apiClient.updateUserInterests(uid, categoryIds);
};

// Event Categories
export const mockCategories = [
  { id: '1', name: 'Hackathons', slug: 'hackathons', description: 'Coding competitions and marathons' },
  { id: '2', name: 'Workshops', slug: 'workshops', description: 'Technical and skill-building workshops' },
  { id: '3', name: 'Conferences', slug: 'conferences', description: 'Tech talks and conferences' },
  { id: '4', name: 'Seminars', slug: 'seminars', description: 'Expert seminars and lectures' },
  { id: '5', name: 'Sports', slug: 'sports', description: 'Sports events and competitions' },
  { id: '6', name: 'Cultural', slug: 'cultural', description: 'Cultural programs and performances' },
  { id: '7', name: 'Music & Arts', slug: 'music-arts', description: 'Music concerts and art exhibitions' },
  { id: '8', name: 'Gaming', slug: 'gaming', description: 'Gaming tournaments and esports' },
];

export const getCategories = async () => {
  return apiClient.getCategories();
};

// Programs
export const getPrograms = async () => {
  return apiClient.getPrograms();
};

export const getProgram = async (programName: string) => {
  return apiClient.getProgram(programName);
};

export const getProgramEvents = async (programName: string) => {
  return apiClient.getProgramEvents(programName);
};

export const getProgramEvent = async (programName: string, eventId: string) => {
  return apiClient.getProgramEvent(programName, eventId);
};

// Events
export const getEvents = async (params?: any) => {
  return apiClient.getEvents(params);
};

export const getEventsByCategories = async (categoryIds: string[]) => {
  return apiClient.getEventsByCategories(categoryIds);
};

export const getEvent = async (id: string) => {
  return apiClient.getEvent(id);
};

export const createEvent = async (eventData: any) => {
  const userId = getCurrentUserId();
  if (!userId) {
    throw new Error('Not authenticated');
  }
  return apiClient.createEvent(eventData, userId);
};

export const updateEvent = async (id: string, eventData: any) => {
  const userId = getCurrentUserId();
  if (!userId) {
    throw new Error('Not authenticated');
  }
  return apiClient.updateEvent(id, eventData, userId);
};

export const likeEvent = async (eventId: string) => {
  const userId = getCurrentUserId();
  if (!userId) {
    throw new Error('Not authenticated');
  }
  return apiClient.likeEvent(eventId, userId);
};

export const registerEvent = async (eventId: string) => {
  const userId = getCurrentUserId();
  if (!userId) {
    throw new Error('Not authenticated');
  }
  return apiClient.registerEvent(eventId, userId);
};

export const unregisterEvent = async (eventId: string) => {
  const userId = getCurrentUserId();
  if (!userId) {
    throw new Error('Not authenticated');
  }
  return apiClient.unregisterEvent(eventId, userId);
};

export const getRegisteredEvents = async () => {
  const userId = getCurrentUserId();
  if (!userId) {
    throw new Error('Not authenticated');
  }
  return apiClient.getRegisteredEvents(userId);
};

export const getLikedEvents = async () => {
  const userId = getCurrentUserId();
  if (!userId) {
    throw new Error('Not authenticated');
  }
  return apiClient.getLikedEvents(userId);
};

export const getUserEvents = async () => {
  const userId = getCurrentUserId();
  if (!userId) {
    throw new Error('Not authenticated');
  }
  return apiClient.getUserEvents(userId);
};

export const checkInteractions = async (eventIds: string[]) => {
  const userId = getCurrentUserId();
  if (!userId || eventIds.length === 0) {
    return { likedEventIds: [], registeredEventIds: [] };
  }
  return apiClient.checkInteractions(eventIds, userId);
};

// Admin operations
export const submitAdminApplication = async (motivationText: string) => {
  const userId = getCurrentUserId();
  if (!userId) {
    throw new Error('Not authenticated');
  }
  return apiClient.submitAdminApplication(userId, motivationText);
};

export const getAdminApplications = async (status?: string) => {
  const userId = getCurrentUserId();
  if (!userId) {
    throw new Error('Not authenticated');
  }
  return apiClient.getAdminApplications(userId, status);
};

export const reviewAdminApplication = async (id: string, status: 'APPROVED' | 'REJECTED') => {
  const userId = getCurrentUserId();
  if (!userId) {
    throw new Error('Not authenticated');
  }
  return apiClient.reviewAdminApplication(id, status, userId);
};

export const getPendingEvents = async () => {
  const userId = getCurrentUserId();
  if (!userId) {
    throw new Error('Not authenticated');
  }
  return apiClient.getPendingEvents(userId);
};

export const updateEventAdminStatus = async (eventId: string, status: string, rejectionReason?: string) => {
  const userId = getCurrentUserId();
  if (!userId) {
    throw new Error('Not authenticated');
  }
  return apiClient.updateEventAdminStatus(eventId, status, userId, rejectionReason);
};

export const deleteEvent = async (eventId: string) => {
  const userId = getCurrentUserId();
  if (!userId) {
    throw new Error('Not authenticated');
  }
  return apiClient.deleteEvent(eventId, userId);
};

export const getAllEvents = async (statusFilter?: string) => {
  const userId = getCurrentUserId();
  if (!userId) {
    throw new Error('Not authenticated');
  }
  return apiClient.getAllEvents(userId, statusFilter);
};

export const toggleEventFeatured = async (eventId: string, isFeatured: boolean) => {
  const userId = getCurrentUserId();
  if (!userId) {
    throw new Error('Not authenticated');
  }
  return apiClient.toggleEventFeatured(eventId, isFeatured, userId);
};

export const toggleEventPublish = async (eventId: string, shouldPublish: boolean) => {
  const userId = getCurrentUserId();
  if (!userId) {
    throw new Error('Not authenticated');
  }
  return apiClient.toggleEventPublish(eventId, shouldPublish, userId);
};

export const getFeaturedEvents = async () => {
  return apiClient.getFeaturedEvents();
};

// Registration Form Functions
export const createRegistrationForm = async (eventId: string, questions: any[]) => {
  const userId = getCurrentUserId();
  if (!userId) {
    throw new Error('Not authenticated');
  }
  return apiClient.createRegistrationForm(eventId, questions, userId);
};

export const getRegistrationForm = async (eventId: string) => {
  return apiClient.getRegistrationForm(eventId);
};

export const registerEventWithForm = async (eventId: string, formResponses: any[]) => {
  const userId = getCurrentUserId();
  if (!userId) {
    throw new Error('Not authenticated');
  }
  return apiClient.registerEventWithForm(eventId, formResponses, userId);
};

export const getEventRegistrations = async (eventId: string) => {
  const userId = getCurrentUserId();
  if (!userId) {
    throw new Error('Not authenticated');
  }
  return apiClient.getEventRegistrations(eventId, userId);
};

export const updateRegistrationStatus = async (registrationId: string, status: 'PENDING' | 'APPROVED' | 'REJECTED') => {
  const userId = getCurrentUserId();
  if (!userId) {
    throw new Error('Not authenticated');
  }
  return apiClient.updateRegistrationStatus(registrationId, status, userId);
};

export const getAllUsers = async (_role?: string) => {
  return { users: [] };
};
