import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use(async (config) => {
  // In mock mode, use localStorage token
  const mockToken = localStorage.getItem('mockAuthToken');
  if (mockToken) {
    config.headers.Authorization = `Bearer ${mockToken}`;
  }
  return config;
});

// Auth APIs
export const authAPI = {
  syncUser: async (idToken: string, profile?: any) => {
    const res = await axios.post(`${API_BASE_URL}/auth/sync-user`, { idToken, profile });
    return res.data;
  },
  updateProfile: async (idToken: string, profile: any) => {
    const res = await axios.post(`${API_BASE_URL}/auth/update-profile`, { idToken, profile });
    return res.data;
  },
  getCategories: async () => {
    const res = await axios.get(`${API_BASE_URL}/auth/categories`);
    return res.data;
  },
};

// User APIs
export const userAPI = {
  getProfile: async () => {
    const res = await apiClient.get('/me');
    return res.data;
  },
  getLikedEvents: async () => {
    const res = await apiClient.get('/me/likes');
    return res.data;
  },
  getRegisteredEvents: async () => {
    const res = await apiClient.get('/me/registrations');
    return res.data;
  },
  getMyEvents: async () => {
    const res = await apiClient.get('/me/events');
    return res.data;
  },
};

// Event APIs
export const eventAPI = {
  getEvents: async (params?: any) => {
    const res = await apiClient.get('/events', { params });
    return res.data;
  },
  getEventsByCategories: async (categoryIds: string[]) => {
    const res = await apiClient.get('/events/by-categories', {
      params: { categoryIds: categoryIds.join(',') },
    });
    return res.data;
  },
  getEvent: async (id: string) => {
    const res = await apiClient.get(`/events/${id}`);
    return res.data;
  },
  createEvent: async (eventData: any) => {
    const res = await apiClient.post('/events', eventData);
    return res.data;
  },
  updateEvent: async (id: string, eventData: any) => {
    const res = await apiClient.put(`/events/${id}`, eventData);
    return res.data;
  },
  likeEvent: async (id: string) => {
    const res = await apiClient.post(`/events/${id}/like`);
    return res.data;
  },
  registerEvent: async (id: string) => {
    const res = await apiClient.post(`/events/${id}/register`);
    return res.data;
  },
  checkInteractions: async (eventIds: string[]) => {
    const res = await apiClient.post('/events/check-interactions', { eventIds });
    return res.data;
  },
};

// Admin APIs
export const adminAPI = {
  applyForAdmin: async (motivationText: string) => {
    const res = await apiClient.post('/admin/apply', { motivationText });
    return res.data;
  },
  getApplications: async (status?: string) => {
    const res = await apiClient.get('/admin/applications', { params: { status } });
    return res.data;
  },
  reviewApplication: async (id: string, status: 'APPROVED' | 'REJECTED') => {
    const res = await apiClient.patch(`/admin/applications/${id}`, { status });
    return res.data;
  },
  getPendingEvents: async () => {
    const res = await apiClient.get('/admin/events/pending');
    return res.data;
  },
  getAllEvents: async (status?: string) => {
    const res = await apiClient.get('/admin/events/all', { params: { status } });
    return res.data;
  },
  updateEventStatus: async (id: string, status: string, rejectionReason?: string) => {
    const res = await apiClient.patch(`/admin/events/${id}/status`, { status, rejectionReason });
    return res.data;
  },
  getUsers: async (role?: string) => {
    const res = await apiClient.get('/admin/users', { params: { role } });
    return res.data;
  },
};

export default apiClient;
