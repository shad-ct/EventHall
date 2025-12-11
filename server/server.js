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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// ==================== AUTH ENDPOINTS ====================
app.post('/api/auth/login', async (req, res) => {
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
  const result = await models.createEvent(req.body, userId);
  res.json(result);
});

app.put('/api/events/:id', async (req, res) => {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ error: 'User ID required' });
  }
  const result = await models.updateEvent(req.params.id, req.body, userId);
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

// ==================== ADMIN ENDPOINTS ====================

app.post('/api/admin/applications', async (req, res) => {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ error: 'User ID required' });
  }
  const { motivationText } = req.body;
  const result = await models.submitAdminApplication(userId, motivationText);
  res.json(result);
});

app.get('/api/admin/applications', async (req, res) => {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ error: 'User ID required' });
  }
  const { status } = req.query;
  const result = await models.getAdminApplications(userId, status);
  res.json(result);
});

app.post('/api/admin/applications/:id/review', async (req, res) => {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ error: 'User ID required' });
  }
  const { status } = req.body;
  const result = await models.reviewAdminApplication(req.params.id, status, userId);
  res.json(result);
});

app.get('/api/admin/events/pending', async (req, res) => {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ error: 'User ID required' });
  }
  const result = await models.getPendingEvents(userId);
  res.json(result);
});

app.post('/api/admin/events/:id/status', async (req, res) => {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ error: 'User ID required' });
  }
  const { status, rejectionReason } = req.body;
  const result = await models.updateEventAdminStatus(req.params.id, status, userId, rejectionReason);
  res.json(result);
});

app.delete('/api/admin/events/:id', async (req, res) => {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ error: 'User ID required' });
  }
  const result = await models.deleteEvent(req.params.id, userId);
  res.json(result);
});

app.get('/api/admin/events', async (req, res) => {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ error: 'User ID required' });
  }
  const { statusFilter } = req.query;
  const result = await models.getAllEvents(userId, statusFilter);
  res.json(result);
});

app.post('/api/admin/events/:id/featured', async (req, res) => {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ error: 'User ID required' });
  }
  const { isFeatured } = req.body;
  const result = await models.toggleEventFeatured(req.params.id, isFeatured, userId);
  res.json(result);
});

app.post('/api/admin/events/:id/publish', async (req, res) => {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ error: 'User ID required' });
  }
  const { shouldPublish } = req.body;
  const result = await models.toggleEventPublish(req.params.id, shouldPublish, userId);
  res.json(result);
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
