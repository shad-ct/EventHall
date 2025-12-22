import express from 'express';
import cors from 'cors';
import 'express-async-errors';
import dotenv from 'dotenv';
import * as models from './models.js';
import pool from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// ==================== MAP/LOCATION ENDPOINTS ====================
app.get('/api/maps/search', async (req, res) => {
  const { q, limit = '5', countrycodes = 'in' } = req.query;

  if (!q || typeof q !== 'string') {
    return res.status(400).json({ error: 'Query parameter q is required' });
  }

  const searchUrl = new URL('https://nominatim.openstreetmap.org/search');
  searchUrl.searchParams.set('q', q);
  searchUrl.searchParams.set('format', 'json');
  searchUrl.searchParams.set('limit', String(limit));
  searchUrl.searchParams.set('countrycodes', String(countrycodes));

  try {
    const response = await fetch(searchUrl.toString(), {
      headers: {
        'User-Agent': 'EventHall/1.0 (contact@eventhall.app)',
        'Accept-Language': 'en',
      },
    });

    if (!response.ok) {
      return res
        .status(response.status)
        .json({ error: 'Failed to fetch search results from Nominatim' });
    }

    const data = await response.json();
    res.set('Cache-Control', 'public, max-age=300');
    res.json(data);
  } catch (error) {
    console.error('Nominatim search failed:', error);
    res.status(500).json({ error: 'Map search failed' });
  }
});

app.get('/api/maps/reverse', async (req, res) => {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ error: 'lat and lon are required' });
  }

  const reverseUrl = new URL('https://nominatim.openstreetmap.org/reverse');
  reverseUrl.searchParams.set('format', 'json');
  reverseUrl.searchParams.set('lat', String(lat));
  reverseUrl.searchParams.set('lon', String(lon));

  try {
    const response = await fetch(reverseUrl.toString(), {
      headers: {
        'User-Agent': 'EventHall/1.0 (contact@eventhall.app)',
        'Accept-Language': 'en',
      },
    });

    if (!response.ok) {
      return res
        .status(response.status)
        .json({ error: 'Failed to reverse geocode with Nominatim' });
    }

    const data = await response.json();
    res.set('Cache-Control', 'public, max-age=300');
    res.json(data);
  } catch (error) {
    console.error('Nominatim reverse geocode failed:', error);
    res.status(500).json({ error: 'Reverse geocoding failed' });
  }
});

// ==================== AUTH ENDPOINTS ====================
app.post('/auth/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const user = await models.loginUser(username, password);
    res.json({ user });
  } catch (error) {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// ==================== USER ENDPOINTS ====================

app.get('/api/users/:uid', async (req, res) => {
  const user = await models.getUser(req.params.uid);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  // Get user interests
  const connection = await pool.getConnection();
  try {
    const [interests] = await connection.query(
      `SELECT ec.* FROM event_categories ec 
       JOIN user_interests ui ON ec.id = ui.category_id 
       WHERE ui.user_id = ?`,
      [req.params.uid]
    );
    user.interests = interests.map(cat => ({
      id: cat.id,
      category: cat,
    }));
  } finally {
    connection.release();
  }

  res.json(user);
});

app.put('/api/users/:uid/profile', async (req, res) => {
  const user = await models.updateUserProfile(req.params.uid, req.body);
  res.json(user);
});

app.put('/api/users/:uid/interests', async (req, res) => {
  const { interestCategoryIds } = req.body;
  await models.updateUserInterests(req.params.uid, interestCategoryIds);
  res.json({ success: true });
});

app.get('/api/users/email/:email', async (req, res) => {
  const user = await models.getUserByEmail(req.params.email);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json(user);
});

// ==================== CATEGORY ENDPOINTS ====================

app.get('/api/categories', async (req, res) => {
  const categories = await models.getCategories();
  res.json(categories);
});

// ==================== EVENT ENDPOINTS ====================

app.get('/api/events', async (req, res) => {
  const result = await models.getEvents(req.query);
  res.json(result);
});

app.get('/api/events/categories', async (req, res) => {
  const { categoryIds } = req.query;
  const ids = categoryIds ? categoryIds.split(',') : [];
  const result = await models.getEventsByCategories(ids);
  res.json(result);
});

app.get('/api/events/featured', async (req, res) => {
  const result = await models.getFeaturedEvents();
  res.json(result);
});

app.get('/api/events/:id', async (req, res) => {
  const result = await models.getEvent(req.params.id);
  if (!result.event) {
    return res.status(404).json({ error: 'Event not found' });
  }
  res.json(result);
});

app.post('/api/events', async (req, res) => {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ error: 'User ID required' });
  }
  console.log('Creating event with registrationMethod:', req.body.registrationMethod);
  const result = await models.createEvent(req.body, userId);
  console.log('Event created with ID:', result.eventId);
  res.json(result);
});

app.put('/api/events/:id', async (req, res) => {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ error: 'User ID required' });
  }
  console.log('Updating event', req.params.id, 'with registrationMethod:', req.body.registrationMethod);
  console.log('Full update data:', JSON.stringify(req.body, null, 2));
  const result = await models.updateEvent(req.params.id, req.body, userId);
  console.log('Event updated successfully');
  res.json(result);
});

app.post('/api/events/:id/like', async (req, res) => {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ error: 'User ID required' });
  }
  const result = await models.likeEvent(req.params.id, userId);
  res.json(result);
});

app.post('/api/events/:id/register', async (req, res) => {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ error: 'User ID required' });
  }
  const result = await models.registerEvent(req.params.id, userId);
  res.json(result);
});

app.delete('/api/events/:id/register', async (req, res) => {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ error: 'User ID required' });
  }
  const result = await models.unregisterEvent(req.params.id, userId);
  res.json(result);
});

app.get('/api/events/user/registered', async (req, res) => {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ error: 'User ID required' });
  }
  const result = await models.getRegisteredEvents(userId);
  res.json(result);
});

app.get('/api/events/user/liked', async (req, res) => {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ error: 'User ID required' });
  }
  const result = await models.getLikedEvents(userId);
  res.json(result);
});

app.get('/api/events/user/created', async (req, res) => {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ error: 'User ID required' });
  }
  const result = await models.getUserEvents(userId);
  res.json(result);
});

app.post('/api/events/interactions/check', async (req, res) => {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ error: 'User ID required' });
  }
  const { eventIds } = req.body;
  const result = await models.checkInteractions(eventIds, userId);
  res.json(result);
});

// ==================== HOST ENDPOINTS ====================

app.post('/api/host/applications', async (req, res) => {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ error: 'User ID required' });
  }
  const { motivationText } = req.body;
  const result = await models.submitAdminApplication(userId, motivationText);
  res.json(result);
});

app.get('/api/host/applications', async (req, res) => {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ error: 'User ID required' });
  }
  const { status } = req.query;
  const result = await models.getAdminApplications(userId, status);
  res.json(result);
});

app.post('/api/host/applications/:id/review', async (req, res) => {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ error: 'User ID required' });
  }
  const { status } = req.body;
  const result = await models.reviewAdminApplication(req.params.id, status, userId);
  res.json(result);
});

app.get('/api/host/events/pending', async (req, res) => {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ error: 'User ID required' });
  }
  const result = await models.getPendingEvents(userId);
  res.json(result);
});

app.post('/api/host/events/:id/status', async (req, res) => {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ error: 'User ID required' });
  }
  const { status, rejectionReason } = req.body;
  const result = await models.updateEventAdminStatus(req.params.id, status, userId, rejectionReason);
  res.json(result);
});

app.delete('/api/host/events/:id', async (req, res) => {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ error: 'User ID required' });
  }
  const result = await models.deleteEvent(req.params.id, userId);
  res.json(result);
});

app.get('/api/host/events', async (req, res) => {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ error: 'User ID required' });
  }
  const { statusFilter } = req.query;
  const result = await models.getAllEvents(userId, statusFilter);
  res.json(result);
});

app.post('/api/host/events/:id/featured', async (req, res) => {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ error: 'User ID required' });
  }
  const { isFeatured } = req.body;
  const result = await models.toggleEventFeatured(req.params.id, isFeatured, userId);
  res.json(result);
});

app.post('/api/host/events/:id/publish', async (req, res) => {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ error: 'User ID required' });
  }
  const { shouldPublish } = req.body;
  const result = await models.toggleEventPublish(req.params.id, shouldPublish, userId);
  res.json(result);
});

// ==================== REGISTRATION FORM ENDPOINTS ====================

app.get('/api/events/:id/registration-form', async (req, res) => {
  try {
    const questions = await models.getRegistrationFormQuestions(req.params.id);
    res.json({ questions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/events/:id/registration-form', async (req, res) => {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ error: 'User ID required' });
  }

  try {
    const { questions } = req.body;
    console.log('Received registration form request for event:', req.params.id);
    console.log('Questions count:', questions?.length || 0);
    console.log('Questions:', JSON.stringify(questions, null, 2));
    
    if (!questions || !Array.isArray(questions)) {
      return res.status(400).json({ error: 'Questions array is required' });
    }
    
    const result = await models.createRegistrationFormQuestions(req.params.id, questions);
    res.json(result);
  } catch (error) {
    console.error('Error creating registration form:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/events/:id/registration-form', async (req, res) => {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ error: 'User ID required' });
  }

  try {
    const result = await models.deleteRegistrationFormQuestions(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/events/:id/register-with-form', async (req, res) => {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ error: 'User ID required' });
  }

  try {
    const { formResponses } = req.body;
    const result = await models.registerEventWithForm(req.params.id, userId, formResponses, 'FORM');
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/host/events/:id/registrations', async (req, res) => {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ error: 'User ID required' });
  }

  try {
    const registrations = await models.getEventRegistrationsWithResponses(req.params.id);
    res.json({ registrations });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/host/registrations/:id/status', async (req, res) => {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ error: 'User ID required' });
  }

  try {
    const { status } = req.body;
    if (!['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const result = await models.updateRegistrationStatus(req.params.id, status);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handling middleware (must be after all routes)
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
