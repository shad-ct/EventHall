// API client for EventHall backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

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

// User operations
export const login = async (username: string, password: string) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ username, password }),
  });
  if (!response.ok) throw new Error('Invalid credentials');
  return response.json();
};

export const getUser = async (uid: string) => {
  const response = await fetch(`${API_BASE_URL}/users/${uid}`, {
    method: 'GET',
    headers: getAuthHeaders(uid),
  });
  if (!response.ok) return null;
  return response.json();
};

export const getUserByEmail = async (email: string) => {
  const response = await fetch(`${API_BASE_URL}/users/email/${email}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  if (!response.ok) return null;
  return response.json();
};

export const updateUserProfile = async (uid: string, updates: any) => {
  const response = await fetch(`${API_BASE_URL}/users/${uid}/profile`, {
    method: 'PUT',
    headers: getAuthHeaders(uid),
    body: JSON.stringify(updates),
  });
  if (!response.ok) throw new Error('Failed to update profile');
  return response.json();
};

export const updateUserInterests = async (uid: string, interestCategoryIds: string[]) => {
  const response = await fetch(`${API_BASE_URL}/users/${uid}/interests`, {
    method: 'PUT',
    headers: getAuthHeaders(uid),
    body: JSON.stringify({ interestCategoryIds }),
  });
  if (!response.ok) throw new Error('Failed to update interests');
  return response.json();
};

// Categories
export const getCategories = async () => {
  const response = await fetch(`${API_BASE_URL}/categories`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch categories');
  return response.json();
};

// Events
export const getEvents = async (params?: any) => {
  const queryString = new URLSearchParams(params).toString();
  const response = await fetch(`${API_BASE_URL}/events?${queryString}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch events');
  return response.json();
};

export const getEventsByCategories = async (categoryIds: string[]) => {
  const response = await fetch(`${API_BASE_URL}/events/categories?categoryIds=${categoryIds.join(',')}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch events');
  return response.json();
};

export const getFeaturedEvents = async () => {
  const response = await fetch(`${API_BASE_URL}/events/featured`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch featured events');
  return response.json();
};

export const getEvent = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/events/${id}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch event');
  return response.json();
};

export const createEvent = async (eventData: any, userId: string) => {
  const response = await fetch(`${API_BASE_URL}/events`, {
    method: 'POST',
    headers: getAuthHeaders(userId),
    body: JSON.stringify(eventData),
  });
  if (!response.ok) throw new Error('Failed to create event');
  return response.json();
};

export const updateEvent = async (id: string, eventData: any, userId: string) => {
  const response = await fetch(`${API_BASE_URL}/events/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(userId),
    body: JSON.stringify(eventData),
  });
  if (!response.ok) throw new Error('Failed to update event');
  return response.json();
};

export const likeEvent = async (eventId: string, userId: string) => {
  const response = await fetch(`${API_BASE_URL}/events/${eventId}/like`, {
    method: 'POST',
    headers: getAuthHeaders(userId),
  });
  if (!response.ok) throw new Error('Failed to like event');
  return response.json();
};

export const registerEvent = async (eventId: string, userId: string) => {
  const response = await fetch(`${API_BASE_URL}/events/${eventId}/register`, {
    method: 'POST',
    headers: getAuthHeaders(userId),
  });
  if (!response.ok) throw new Error('Failed to register for event');
  return response.json();
};

export const getRegisteredEvents = async (userId: string) => {
  const response = await fetch(`${API_BASE_URL}/events/user/registered`, {
    method: 'GET',
    headers: getAuthHeaders(userId),
  });
  if (!response.ok) throw new Error('Failed to fetch registered events');
  return response.json();
};

export const getLikedEvents = async (userId: string) => {
  const response = await fetch(`${API_BASE_URL}/events/user/liked`, {
    method: 'GET',
    headers: getAuthHeaders(userId),
  });
  if (!response.ok) throw new Error('Failed to fetch liked events');
  return response.json();
};

export const getUserEvents = async (userId: string) => {
  const response = await fetch(`${API_BASE_URL}/events/user/created`, {
    method: 'GET',
    headers: getAuthHeaders(userId),
  });
  if (!response.ok) throw new Error('Failed to fetch user events');
  return response.json();
};

export const checkInteractions = async (eventIds: string[], userId: string) => {
  const response = await fetch(`${API_BASE_URL}/events/interactions/check`, {
    method: 'POST',
    headers: getAuthHeaders(userId),
    body: JSON.stringify({ eventIds }),
  });
  if (!response.ok) throw new Error('Failed to check interactions');
  return response.json();
};

// Admin operations
export const submitAdminApplication = async (userId: string, motivationText: string) => {
  const response = await fetch(`${API_BASE_URL}/admin/applications`, {
    method: 'POST',
    headers: getAuthHeaders(userId),
    body: JSON.stringify({ motivationText }),
  });
  if (!response.ok) throw new Error('Failed to submit application');
  return response.json();
};

export const getAdminApplications = async (userId: string, status?: string) => {
  const queryString = status ? `?status=${status}` : '';
  const response = await fetch(`${API_BASE_URL}/admin/applications${queryString}`, {
    method: 'GET',
    headers: getAuthHeaders(userId),
  });
  if (!response.ok) throw new Error('Failed to fetch applications');
  return response.json();
};

export const reviewAdminApplication = async (applicationId: string, status: string, userId: string) => {
  const response = await fetch(`${API_BASE_URL}/admin/applications/${applicationId}/review`, {
    method: 'POST',
    headers: getAuthHeaders(userId),
    body: JSON.stringify({ status }),
  });
  if (!response.ok) throw new Error('Failed to review application');
  return response.json();
};

export const getPendingEvents = async (userId: string) => {
  const response = await fetch(`${API_BASE_URL}/admin/events/pending`, {
    method: 'GET',
    headers: getAuthHeaders(userId),
  });
  if (!response.ok) throw new Error('Failed to fetch pending events');
  return response.json();
};

export const updateEventAdminStatus = async (eventId: string, status: string, userId: string, rejectionReason?: string) => {
  const response = await fetch(`${API_BASE_URL}/admin/events/${eventId}/status`, {
    method: 'POST',
    headers: getAuthHeaders(userId),
    body: JSON.stringify({ status, rejectionReason }),
  });
  if (!response.ok) throw new Error('Failed to update event status');
  return response.json();
};

export const deleteEvent = async (eventId: string, userId: string) => {
  const response = await fetch(`${API_BASE_URL}/admin/events/${eventId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(userId),
  });
  if (!response.ok) throw new Error('Failed to delete event');
  return response.json();
};

export const getAllEvents = async (userId: string, statusFilter?: string) => {
  const queryString = statusFilter ? `?statusFilter=${statusFilter}` : '';
  const response = await fetch(`${API_BASE_URL}/admin/events${queryString}`, {
    method: 'GET',
    headers: getAuthHeaders(userId),
  });
  if (!response.ok) throw new Error('Failed to fetch events');
  return response.json();
};

export const toggleEventFeatured = async (eventId: string, isFeatured: boolean, userId: string) => {
  const response = await fetch(`${API_BASE_URL}/admin/events/${eventId}/featured`, {
    method: 'POST',
    headers: getAuthHeaders(userId),
    body: JSON.stringify({ isFeatured }),
  });
  if (!response.ok) throw new Error('Failed to toggle featured status');
  return response.json();
};

export const toggleEventPublish = async (eventId: string, shouldPublish: boolean, userId: string) => {
  const response = await fetch(`${API_BASE_URL}/admin/events/${eventId}/publish`, {
    method: 'POST',
    headers: getAuthHeaders(userId),
    body: JSON.stringify({ shouldPublish }),
  });
  if (!response.ok) throw new Error('Failed to toggle publish status');
  return response.json();
};
