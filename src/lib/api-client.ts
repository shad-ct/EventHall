// API client for EventHall backend
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Helper function to get auth headers
const getAuthHeaders = (userId?: string): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (userId) {
    headers['x-user-id'] = userId;
  }
  return headers;
};

const fetchJson = async (url: string, init: RequestInit = {}, errorPrefix = 'Request failed') => {
  const response = await fetch(url, init);
  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`${errorPrefix}: ${response.status} ${body}`);
  }
  return response.json();
};

// User operations
export const login = async (username: string, password: string) => {
  return fetchJson(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ username, password }),
  }, 'Invalid credentials');
};

export const getUser = async (uid: string) => {
  try {
    return await fetchJson(`${API_BASE_URL}/users/${uid}`, { method: 'GET', headers: getAuthHeaders(uid) }, 'Failed to fetch user');
  } catch (err) {
    return null;
  }
};

export const getUserByEmail = async (email: string) => {
  try {
    return await fetchJson(`${API_BASE_URL}/users/email/${email}`, { method: 'GET', headers: getAuthHeaders() }, 'Failed to fetch user by email');
  } catch (err) {
    return null;
  }
};

export const updateUserProfile = async (uid: string, updates: any) => {
  const response = await fetch(`${API_BASE_URL}/users/${uid}/profile`, {
    method: 'PUT',
    headers: getAuthHeaders(uid),
    body: JSON.stringify(updates),
  });
  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`Failed to update profile: ${response.status} ${body}`);
  }
  return response.json();
};

export const updateUserInterests = async (uid: string, interestCategoryIds: string[]) => {
  return fetchJson(`${API_BASE_URL}/users/${uid}/interests`, {
    method: 'PUT',
    headers: getAuthHeaders(uid),
    body: JSON.stringify({ interestCategoryIds }),
  }, 'Failed to update interests');
};

// Categories
export const getCategories = async () => {
  return fetchJson(`${API_BASE_URL}/categories`, { method: 'GET', headers: getAuthHeaders() }, 'Failed to fetch categories');
};

// Events
export const getEvents = async (params?: any) => {
  const queryString = new URLSearchParams(params).toString();
  return fetchJson(`${API_BASE_URL}/events?${queryString}`, { method: 'GET', headers: getAuthHeaders() }, 'Failed to fetch events');
};

export const getEventsByCategories = async (categoryIds: string[]) => {
  return fetchJson(`${API_BASE_URL}/events/categories?categoryIds=${categoryIds.join(',')}`, { method: 'GET', headers: getAuthHeaders() }, 'Failed to fetch events by categories');
};

export const getFeaturedEvents = async () => {
  return fetchJson(`${API_BASE_URL}/events/featured`, { method: 'GET', headers: getAuthHeaders() }, 'Failed to fetch featured events');
};

export const getEvent = async (id: string) => {
  return fetchJson(`${API_BASE_URL}/events/${id}`, { method: 'GET', headers: getAuthHeaders() }, 'Failed to fetch event');
};

// Programs
export const getPrograms = async () => {
  return fetchJson(`${API_BASE_URL}/programs`, { method: 'GET', headers: getAuthHeaders() }, 'Failed to fetch programs');
};

export const getProgram = async (programName: string) => {
  return fetchJson(`${API_BASE_URL}/programs/${encodeURIComponent(programName)}`, { method: 'GET', headers: getAuthHeaders() }, 'Failed to fetch program');
};

export const getProgramEvents = async (programName: string) => {
  return fetchJson(`${API_BASE_URL}/programs/${encodeURIComponent(programName)}/events`, { method: 'GET', headers: getAuthHeaders() }, 'Failed to fetch program events');
};

export const getProgramEvent = async (programName: string, eventId: string) => {
  return fetchJson(`${API_BASE_URL}/programs/${encodeURIComponent(programName)}/events/${encodeURIComponent(eventId)}`, { method: 'GET', headers: getAuthHeaders() }, 'Failed to fetch program event');
};

export const createEvent = async (eventData: any, userId: string) => {
  return fetchJson(`${API_BASE_URL}/events`, {
    method: 'POST',
    headers: getAuthHeaders(userId),
    body: JSON.stringify(eventData),
  }, 'Failed to create event');
};

export const updateEvent = async (id: string, eventData: any, userId: string) => {
  return fetchJson(`${API_BASE_URL}/events/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(userId),
    body: JSON.stringify(eventData),
  }, 'Failed to update event');
};

export const likeEvent = async (eventId: string, userId: string) => {
  return fetchJson(`${API_BASE_URL}/events/${eventId}/like`, { method: 'POST', headers: getAuthHeaders(userId) }, 'Failed to like event');
};

export const registerEvent = async (eventId: string, userId: string) => {
  return fetchJson(`${API_BASE_URL}/events/${eventId}/register`, { method: 'POST', headers: getAuthHeaders(userId) }, 'Failed to register for event');
};

export const unregisterEvent = async (eventId: string, userId: string) => {
  return fetchJson(`${API_BASE_URL}/events/${eventId}/register`, { method: 'DELETE', headers: getAuthHeaders(userId) }, 'Failed to unregister from event');
};

export const getRegisteredEvents = async (userId: string) => {
  return fetchJson(`${API_BASE_URL}/events/user/registered`, { method: 'GET', headers: getAuthHeaders(userId) }, 'Failed to fetch registered events');
};

export const getLikedEvents = async (userId: string) => {
  return fetchJson(`${API_BASE_URL}/events/user/liked`, { method: 'GET', headers: getAuthHeaders(userId) }, 'Failed to fetch liked events');
};

export const getUserEvents = async (userId: string) => {
  return fetchJson(`${API_BASE_URL}/events/user/created`, { method: 'GET', headers: getAuthHeaders(userId) }, 'Failed to fetch user events');
};

export const checkInteractions = async (eventIds: string[], userId: string) => {
  return fetchJson(`${API_BASE_URL}/events/interactions/check`, { method: 'POST', headers: getAuthHeaders(userId), body: JSON.stringify({ eventIds }) }, 'Failed to check interactions');
};

// Admin operations
export const submitAdminApplication = async (userId: string, motivationText: string) => {
  return fetchJson(`${API_BASE_URL}/host/applications`, { method: 'POST', headers: getAuthHeaders(userId), body: JSON.stringify({ motivationText }) }, 'Failed to submit application');
};

export const getAdminApplications = async (userId: string, status?: string) => {
  const queryString = status ? `?status=${status}` : '';
  return fetchJson(`${API_BASE_URL}/host/applications${queryString}`, { method: 'GET', headers: getAuthHeaders(userId) }, 'Failed to fetch applications');
};

export const reviewAdminApplication = async (applicationId: string, status: string, userId: string) => {
  return fetchJson(`${API_BASE_URL}/host/applications/${applicationId}/review`, { method: 'POST', headers: getAuthHeaders(userId), body: JSON.stringify({ status }) }, 'Failed to review application');
};

export const getPendingEvents = async (userId: string) => {
  return fetchJson(`${API_BASE_URL}/host/events/pending`, { method: 'GET', headers: getAuthHeaders(userId) }, 'Failed to fetch pending events');
};

export const updateEventAdminStatus = async (eventId: string, status: string, userId: string, rejectionReason?: string) => {
  return fetchJson(`${API_BASE_URL}/host/events/${eventId}/status`, { method: 'POST', headers: getAuthHeaders(userId), body: JSON.stringify({ status, rejectionReason }) }, 'Failed to update event status');
};

export const deleteEvent = async (eventId: string, userId: string) => {
  return fetchJson(`${API_BASE_URL}/host/events/${eventId}`, { method: 'DELETE', headers: getAuthHeaders(userId) }, 'Failed to delete event');
};

export const getAllEvents = async (userId: string, statusFilter?: string) => {
  const queryString = statusFilter ? `?statusFilter=${statusFilter}` : '';
  return fetchJson(`${API_BASE_URL}/host/events${queryString}`, { method: 'GET', headers: getAuthHeaders(userId) }, 'Failed to fetch events');
};

export const toggleEventFeatured = async (eventId: string, isFeatured: boolean, userId: string) => {
  return fetchJson(`${API_BASE_URL}/host/events/${eventId}/featured`, { method: 'POST', headers: getAuthHeaders(userId), body: JSON.stringify({ isFeatured }) }, 'Failed to toggle featured status');
};

export const toggleEventPublish = async (eventId: string, shouldPublish: boolean, userId: string) => {
  return fetchJson(`${API_BASE_URL}/host/events/${eventId}/publish`, { method: 'POST', headers: getAuthHeaders(userId), body: JSON.stringify({ shouldPublish }) }, 'Failed to toggle publish status');
};
// Registration Form operations
export const createRegistrationForm = async (eventId: string, questions: any[], userId: string) => {
  return fetchJson(`${API_BASE_URL}/events/${eventId}/registration-form`, { method: 'POST', headers: getAuthHeaders(userId), body: JSON.stringify({ questions }) }, 'Failed to create registration form');
};

export const getRegistrationForm = async (eventId: string) => {
  return fetchJson(`${API_BASE_URL}/events/${eventId}/registration-form`, { method: 'GET', headers: getAuthHeaders() }, 'Failed to fetch registration form');
};

export const registerEventWithForm = async (eventId: string, formResponses: any[], userId: string) => {
  return fetchJson(`${API_BASE_URL}/events/${eventId}/register-with-form`, { method: 'POST', headers: getAuthHeaders(userId), body: JSON.stringify({ formResponses }) }, 'Failed to register with form');
};

export const getEventRegistrations = async (eventId: string, userId: string) => {
  return fetchJson(`${API_BASE_URL}/host/events/${eventId}/registrations`, { method: 'GET', headers: getAuthHeaders(userId) }, 'Failed to fetch registrations');
};

export const updateRegistrationStatus = async (registrationId: string, status: 'PENDING' | 'APPROVED' | 'REJECTED', userId: string) => {
  return fetchJson(`${API_BASE_URL}/host/registrations/${registrationId}/status`, { method: 'PATCH', headers: getAuthHeaders(userId), body: JSON.stringify({ status }) }, 'Failed to update registration status');
};