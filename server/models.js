import pool from './db.js';
import crypto from 'crypto';

export const getUser = async (uid) => {
  const connection = await pool.getConnection();
  try {
    const [users] = await connection.query('SELECT * FROM users WHERE id = ?', [uid]);
    if (users.length > 0) {
      return formatUserData(users[0]);
    }
    return null;
  } finally {
    connection.release();
  }
};

export const getUserByEmail = async (email) => {
  const connection = await pool.getConnection();
  try {
    const [users] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length > 0) {
      return formatUserData(users[0]);
    }
    return null;
  } finally {
    connection.release();
  }
};

export const updateUserProfile = async (uid, updates) => {
  const connection = await pool.getConnection();
  try {
    const allowedFields = ['full_name', 'is_student', 'college_name', 'photo_url'];
    const fields = [];
    const values = [];

    Object.keys(updates).forEach((key) => {
      const dbKey = key === 'fullName' ? 'full_name' : key === 'isStudent' ? 'is_student' : key === 'collegeName' ? 'college_name' : key === 'photoUrl' ? 'photo_url' : key;
      if (allowedFields.includes(dbKey)) {
        fields.push(`${dbKey} = ?`);
        values.push(updates[key]);
      }
    });

    if (fields.length === 0) {
      return await getUser(uid);
    }

    values.push(uid);

    await connection.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
    return await getUser(uid);
  } finally {
    connection.release();
  }
};

export const updateUserInterests = async (uid, interestCategoryIds) => {
  const connection = await pool.getConnection();
  try {
    // Delete existing interests
    await connection.query('DELETE FROM user_interests WHERE user_id = ?', [uid]);

    // Insert new interests
    if (interestCategoryIds.length > 0) {
      for (const categoryId of interestCategoryIds) {
        await connection.query(
          'INSERT INTO user_interests (user_id, category_id) VALUES (?, ?)',
          [uid, categoryId]
        );
      }
    }
  } finally {
    connection.release();
  }
};

// Helper function to format user data
function formatUserData(dbUser) {
  return {
    id: dbUser.id,
    username: dbUser.username,
    email: dbUser.email,
    fullName: dbUser.full_name,
    photoUrl: dbUser.photo_url,
    role: dbUser.role,
    isStudent: dbUser.is_student,
    collegeName: dbUser.college_name,
    interests: [], // Will be populated separately if needed
  };
}

// Simple SHA-256 hash for passwords (development/demo only)
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export const loginUser = async (username, password) => {
  const connection = await pool.getConnection();
  try {
    const [users] = await connection.query('SELECT * FROM users WHERE username = ?', [username]);
    if (users.length === 0) {
      throw new Error('Invalid credentials');
    }

    const user = users[0];
    const incomingHash = hashPassword(password);
    if (user.password_hash !== incomingHash) {
      throw new Error('Invalid credentials');
    }

    return formatUserData(user);
  } finally {
    connection.release();
  }
};

// Event Categories
export const getCategories = async () => {
  const connection = await pool.getConnection();
  try {
    const [categories] = await connection.query('SELECT * FROM event_categories');
    return categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
    }));
  } finally {
    connection.release();
  }
};

// Events
export const getEvents = async (params = {}) => {
  const connection = await pool.getConnection();
  try {
    let query = 'SELECT e.* FROM events e WHERE e.status = "PUBLISHED"';
    const values = [];

    if (params.district) {
      query += ' AND e.district = ?';
      values.push(params.district);
    }

    query += ' ORDER BY e.date ASC';

    const [events] = await connection.query(query, values);
    return { events: await Promise.all(events.map(e => formatEventData(e, connection))) };
  } finally {
    connection.release();
  }
};

export const getEventsByCategories = async (categoryIds) => {
  const connection = await pool.getConnection();
  try {
    if (!categoryIds || categoryIds.length === 0) {
      const [events] = await connection.query(
        'SELECT * FROM events WHERE status = "PUBLISHED" ORDER BY date ASC'
      );
      return { eventsByCategory: {}, events: await Promise.all(events.map(e => formatEventData(e, connection))) };
    }

    const placeholders = categoryIds.map(() => '?').join(',');
    const [events] = await connection.query(
      `SELECT DISTINCT e.* FROM events e 
       LEFT JOIN event_category_links ecl ON e.id = ecl.event_id 
       WHERE e.status = "PUBLISHED" AND ecl.category_id IN (${placeholders})
       ORDER BY e.date ASC`,
      [...categoryIds]
    );

    const eventsByCategory = {};
    for (const event of events) {
      const formattedEvent = await formatEventData(event, connection);
      const [primaryCat] = await connection.query(
        'SELECT category_id FROM event_category_links WHERE event_id = ? AND is_primary = TRUE LIMIT 1',
        [event.id]
      );

      if (primaryCat.length > 0) {
        const catId = primaryCat[0].category_id;
        if (categoryIds.includes(catId)) {
          if (!eventsByCategory[catId]) {
            const [cat] = await connection.query(
              'SELECT * FROM event_categories WHERE id = ?',
              [catId]
            );
            eventsByCategory[catId] = {
              category: cat[0],
              events: [],
            };
          }
          eventsByCategory[catId].events.push(formattedEvent);
        }
      }
    }

    return { eventsByCategory, events: await Promise.all(events.map(e => formatEventData(e, connection))) };
  } finally {
    connection.release();
  }
};

export const getEvent = async (id) => {
  const connection = await pool.getConnection();
  try {
    const [events] = await connection.query('SELECT * FROM events WHERE id = ?', [id]);
    if (events.length === 0) {
      return { event: null };
    }
    return { event: await formatEventData(events[0], connection) };
  } finally {
    connection.release();
  }
};

export const createEvent = async (eventData, userId) => {
  const connection = await pool.getConnection();
  try {
    const eventId = Math.random().toString(36).substring(7) + Date.now();
    const status = 'PUBLISHED';

    const [user] = await connection.query('SELECT full_name, email FROM users WHERE id = ?', [userId]);

    await connection.query(
      `INSERT INTO events (
        id, title, description, date, time, location, district, google_maps_link,
        entry_fee, is_free, prize_details, contact_email, contact_phone,
        external_registration_link, registration_method, how_to_register_link, instagram_url, facebook_url,
        youtube_url, banner_url, status, created_by_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        eventId,
        eventData.title,
        eventData.description,
        eventData.date,
        eventData.time,
        eventData.location,
        eventData.district,
        eventData.googleMapsLink || null,
        eventData.entryFee || null,
        eventData.isFree || false,
        eventData.prizeDetails || null,
        eventData.contactEmail,
        eventData.contactPhone,
        eventData.externalRegistrationLink || null,
        eventData.registrationMethod || 'EXTERNAL',
        eventData.howToRegisterLink || null,
        eventData.instagramUrl || null,
        eventData.facebookUrl || null,
        eventData.youtubeUrl || null,
        eventData.bannerUrl || null,
        status,
        userId,
      ]
    );

    // Insert category links
    if (eventData.primaryCategory?.id) {
      await connection.query(
        'INSERT INTO event_category_links (event_id, category_id, is_primary) VALUES (?, ?, TRUE)',
        [eventId, eventData.primaryCategory.id]
      );
    }

    if (eventData.additionalCategories && eventData.additionalCategories.length > 0) {
      for (const cat of eventData.additionalCategories) {
        await connection.query(
          'INSERT INTO event_category_links (event_id, category_id, is_primary) VALUES (?, ?, FALSE)',
          [eventId, cat.id]
        );
      }
    }

    // Insert assets (brochures, posters, socials) if provided
    try {
      if (eventData.brochureFiles && eventData.brochureFiles.length > 0) {
        for (const file of eventData.brochureFiles) {
          await connection.query(
            'INSERT INTO event_assets (event_id, asset_type, name, url, label) VALUES (?, ?, ?, ?, ?)',
            [eventId, 'BROCHURE', file.name || null, file.url, null]
          );
        }
      }

      if (eventData.posterImages && eventData.posterImages.length > 0) {
        for (const file of eventData.posterImages) {
          await connection.query(
            'INSERT INTO event_assets (event_id, asset_type, name, url, label) VALUES (?, ?, ?, ?, ?)',
            [eventId, 'POSTER', file.name || null, file.url, null]
          );
        }
      }

      if (eventData.socialLinks && eventData.socialLinks.length > 0) {
        for (const link of eventData.socialLinks) {
          await connection.query(
            'INSERT INTO event_assets (event_id, asset_type, name, url, label) VALUES (?, ?, ?, ?, ?)',
            [eventId, 'SOCIAL', null, link.url, link.label || null]
          );
        }
      }
    } catch (err) {
      console.warn('event_assets table not found, skipping asset insertion');
    }

    return {
      success: true,
      message: 'Event published successfully',
      eventId,
    };
  } finally {
    connection.release();
  }
};

export const updateEvent = async (eventId, eventData, userId) => {
  const connection = await pool.getConnection();
  try {
    // Get the event
    const [events] = await connection.query('SELECT created_by_id FROM events WHERE id = ?', [eventId]);
    if (events.length === 0) {
      throw new Error('Event not found');
    }

    // Get user to check role
    const [users] = await connection.query('SELECT role FROM users WHERE id = ?', [userId]);
    const isCreator = events[0].created_by_id === userId;
    const isUltimateAdmin = users[0]?.role === 'ULTIMATE_ADMIN';

    if (!isCreator && !isUltimateAdmin) {
      throw new Error('Unauthorized - You can only edit your own events');
    }

    const allowedFields = ['title', 'description', 'date', 'time', 'location', 'district', 'google_maps_link', 'entry_fee', 'is_free', 'prize_details', 'contact_email', 'contact_phone', 'external_registration_link', 'registration_method', 'how_to_register_link', 'instagram_url', 'facebook_url', 'youtube_url', 'banner_url'];
    const fields = [];
    const values = [];

    Object.keys(eventData).forEach((key) => {
      const dbKey = key === 'googleMapsLink' ? 'google_maps_link' : key === 'isFree' ? 'is_free' : key === 'entryFee' ? 'entry_fee' : key === 'prizeDetails' ? 'prize_details' : key === 'contactEmail' ? 'contact_email' : key === 'contactPhone' ? 'contact_phone' : key === 'externalRegistrationLink' ? 'external_registration_link' : key === 'registrationMethod' ? 'registration_method' : key === 'howToRegisterLink' ? 'how_to_register_link' : key === 'instagramUrl' ? 'instagram_url' : key === 'facebookUrl' ? 'facebook_url' : key === 'youtubeUrl' ? 'youtube_url' : key === 'bannerUrl' ? 'banner_url' : key;
      if (allowedFields.includes(dbKey)) {
        fields.push(`${dbKey} = ?`);
        values.push(eventData[key]);
      }
    });

    if (fields.length > 0) {
      values.push(eventId);
      console.log('UPDATE SQL:', `UPDATE events SET ${fields.join(', ')} WHERE id = ?`);
      console.log('UPDATE VALUES:', values);
      await connection.query(`UPDATE events SET ${fields.join(', ')} WHERE id = ?`, values);
    }

    // Update categories if provided
    if (eventData.primaryCategory?.id) {
      await connection.query('DELETE FROM event_category_links WHERE event_id = ? AND is_primary = TRUE', [eventId]);
      await connection.query(
        'INSERT INTO event_category_links (event_id, category_id, is_primary) VALUES (?, ?, TRUE)',
        [eventId, eventData.primaryCategory.id]
      );
    }

    if (eventData.additionalCategories !== undefined) {
      await connection.query('DELETE FROM event_category_links WHERE event_id = ? AND is_primary = FALSE', [eventId]);
      if (eventData.additionalCategories.length > 0) {
        for (const cat of eventData.additionalCategories) {
          await connection.query(
            'INSERT INTO event_category_links (event_id, category_id, is_primary) VALUES (?, ?, FALSE)',
            [eventId, cat.id]
          );
        }
      }
    }

    // Update assets if provided (brochures/posters/socials)
    try {
      if (eventData.brochureFiles !== undefined) {
        await connection.query(
          'DELETE FROM event_assets WHERE event_id = ? AND asset_type = ?',
          [eventId, 'BROCHURE']
        );
        if (eventData.brochureFiles.length > 0) {
          for (const file of eventData.brochureFiles) {
            await connection.query(
              'INSERT INTO event_assets (event_id, asset_type, name, url, label) VALUES (?, ?, ?, ?, ?)',
              [eventId, 'BROCHURE', file.name || null, file.url, null]
            );
          }
        }
      }

      if (eventData.posterImages !== undefined) {
        await connection.query(
          'DELETE FROM event_assets WHERE event_id = ? AND asset_type = ?',
          [eventId, 'POSTER']
        );
        if (eventData.posterImages.length > 0) {
          for (const file of eventData.posterImages) {
            await connection.query(
              'INSERT INTO event_assets (event_id, asset_type, name, url, label) VALUES (?, ?, ?, ?, ?)',
              [eventId, 'POSTER', file.name || null, file.url, null]
            );
          }
        }
      }

      if (eventData.socialLinks !== undefined) {
        await connection.query(
          'DELETE FROM event_assets WHERE event_id = ? AND asset_type = ?',
          [eventId, 'SOCIAL']
        );
        if (eventData.socialLinks.length > 0) {
          for (const link of eventData.socialLinks) {
            await connection.query(
              'INSERT INTO event_assets (event_id, asset_type, name, url, label) VALUES (?, ?, ?, ?, ?)',
              [eventId, 'SOCIAL', null, link.url, link.label || null]
            );
          }
        }
      }
    } catch (err) {
      console.warn('event_assets table not found, skipping asset update');
    }

    return { success: true, message: 'Event updated successfully' };
  } finally {
    connection.release();
  }
};

export const likeEvent = async (eventId, userId) => {
  const connection = await pool.getConnection();
  try {
    const likeId = `${userId}_${eventId}`;

    // Check if like exists
    const [likes] = await connection.query(
      'SELECT * FROM event_likes WHERE id = ?',
      [likeId]
    );

    if (likes.length > 0 && !likes[0].deleted) {
      // Unlike
      await connection.query(
        'UPDATE event_likes SET deleted = true, deleted_at = NOW() WHERE id = ?',
        [likeId]
      );
      return { success: true, liked: false };
    } else if (likes.length > 0) {
      // Undelete
      await connection.query(
        'UPDATE event_likes SET deleted = false, deleted_at = NULL WHERE id = ?',
        [likeId]
      );
      return { success: true, liked: true };
    } else {
      // Create new like
      await connection.query(
        'INSERT INTO event_likes (id, user_id, event_id, deleted) VALUES (?, ?, ?, false)',
        [likeId, userId, eventId]
      );
      return { success: true, liked: true };
    }
  } finally {
    connection.release();
  }
};

export const registerEvent = async (eventId, userId) => {
  const connection = await pool.getConnection();
  try {
    const registrationId = `${userId}_${eventId}`;

    // Check if already registered
    const [registrations] = await connection.query(
      'SELECT * FROM event_registrations WHERE id = ?',
      [registrationId]
    );

    if (registrations.length > 0) {
      return { success: true, message: 'Already registered' };
    }

    await connection.query(
      'INSERT INTO event_registrations (id, user_id, event_id) VALUES (?, ?, ?)',
      [registrationId, userId, eventId]
    );

    return { success: true, message: 'Registered successfully' };
  } finally {
    connection.release();
  }
};

export const unregisterEvent = async (eventId, userId) => {
  const connection = await pool.getConnection();
  try {
    const registrationId = `${userId}_${eventId}`;

    const [result] = await connection.query(
      'DELETE FROM event_registrations WHERE id = ?',
      [registrationId]
    );

    const wasRegistered = result?.affectedRows > 0;

    return {
      success: true,
      message: wasRegistered ? 'Unregistered successfully' : 'You were not registered for this event',
    };
  } finally {
    connection.release();
  }
};

export const getRegisteredEvents = async (userId) => {
  const connection = await pool.getConnection();
  try {
    const [registrations] = await connection.query(
      'SELECT event_id FROM event_registrations WHERE user_id = ?',
      [userId]
    );

    if (registrations.length === 0) {
      return { events: [] };
    }

    const eventIds = registrations.map(r => r.event_id);
    const events = [];

    for (const eventId of eventIds) {
      const [eventRows] = await connection.query(
        'SELECT * FROM events WHERE id = ?',
        [eventId]
      );
      if (eventRows.length > 0) {
        events.push(await formatEventData(eventRows[0], connection));
      }
    }

    return { events };
  } finally {
    connection.release();
  }
};

export const getLikedEvents = async (userId) => {
  const connection = await pool.getConnection();
  try {
    const [likes] = await connection.query(
      'SELECT event_id FROM event_likes WHERE user_id = ? AND deleted = false',
      [userId]
    );

    if (likes.length === 0) {
      return { events: [] };
    }

    const eventIds = likes.map(l => l.event_id);
    const events = [];

    for (const eventId of eventIds) {
      const [eventRows] = await connection.query(
        'SELECT * FROM events WHERE id = ?',
        [eventId]
      );
      if (eventRows.length > 0) {
        events.push(await formatEventData(eventRows[0], connection));
      }
    }

    return { events };
  } finally {
    connection.release();
  }
};

export const getUserEvents = async (userId) => {
  const connection = await pool.getConnection();
  try {
    const [events] = await connection.query(
      'SELECT * FROM events WHERE created_by_id = ?',
      [userId]
    );

    return { events: await Promise.all(events.map(e => formatEventData(e, connection))) };
  } finally {
    connection.release();
  }
};

export const checkInteractions = async (eventIds, userId) => {
  const connection = await pool.getConnection();
  try {
    if (!eventIds || eventIds.length === 0) {
      return { likedEventIds: [], registeredEventIds: [] };
    }

    const placeholders = eventIds.map(() => '?').join(',');

    const [likes] = await connection.query(
      `SELECT event_id FROM event_likes WHERE user_id = ? AND deleted = false AND event_id IN (${placeholders})`,
      [userId, ...eventIds]
    );

    const [registrations] = await connection.query(
      `SELECT event_id FROM event_registrations WHERE user_id = ? AND event_id IN (${placeholders})`,
      [userId, ...eventIds]
    );

    return {
      likedEventIds: likes.map(l => l.event_id),
      registeredEventIds: registrations.map(r => r.event_id),
    };
  } finally {
    connection.release();
  }
};

// Admin operations
export const submitAdminApplication = async (userId, motivationText) => {
  const connection = await pool.getConnection();
  try {
    // Check for pending application
    const [existing] = await connection.query(
      'SELECT * FROM admin_applications WHERE user_id = ? AND status = "PENDING"',
      [userId]
    );

    if (existing.length > 0) {
      throw new Error('You already have a pending application');
    }

    const applicationId = Math.random().toString(36).substring(7) + Date.now();
    const [user] = await connection.query('SELECT email, full_name FROM users WHERE id = ?', [userId]);

    await connection.query(
      'INSERT INTO admin_applications (id, user_id, motivation_text, status) VALUES (?, ?, ?, "PENDING")',
      [applicationId, userId, motivationText]
    );

    return { success: true, message: 'Application submitted successfully' };
  } finally {
    connection.release();
  }
};

export const getAdminApplications = async (userId, status = null) => {
  const connection = await pool.getConnection();
  try {
    // Verify user is ultimate admin
    const [users] = await connection.query('SELECT role FROM users WHERE id = ?', [userId]);
    if (users[0]?.role !== 'ULTIMATE_ADMIN') {
      throw new Error('Unauthorized - Ultimate admin only');
    }

    let query = 'SELECT * FROM admin_applications';
    const values = [];

    if (status) {
      query += ' WHERE status = ?';
      values.push(status);
    }

    const [applications] = await connection.query(query, values);
    return { applications };
  } finally {
    connection.release();
  }
};

export const reviewAdminApplication = async (applicationId, status, userId) => {
  const connection = await pool.getConnection();
  try {
    // Verify user is ultimate admin
    const [users] = await connection.query('SELECT role FROM users WHERE id = ?', [userId]);
    if (users[0]?.role !== 'ULTIMATE_ADMIN') {
      throw new Error('Unauthorized - Ultimate admin only');
    }

    // Get application
    const [applications] = await connection.query(
      'SELECT * FROM admin_applications WHERE id = ?',
      [applicationId]
    );

    if (applications.length === 0) {
      throw new Error('Application not found');
    }

    const application = applications[0];

    // Update application
    await connection.query(
      'UPDATE admin_applications SET status = ?, reviewed_by_user_id = ?, reviewed_at = NOW() WHERE id = ?',
      [status, userId, applicationId]
    );

    // If approved, update user role
    if (status === 'APPROVED') {
      await connection.query(
        'UPDATE users SET role = "EVENT_ADMIN" WHERE id = ?',
        [application.user_id]
      );
    }

    return { success: true, message: `Application ${status.toLowerCase()} successfully` };
  } finally {
    connection.release();
  }
};

export const getPendingEvents = async (userId) => {
  const connection = await pool.getConnection();
  try {
    // Verify user is ultimate admin
    const [users] = await connection.query('SELECT role FROM users WHERE id = ?', [userId]);
    if (users[0]?.role !== 'ULTIMATE_ADMIN') {
      throw new Error('Unauthorized - Ultimate admin only');
    }

    const [events] = await connection.query(
      'SELECT * FROM events WHERE status = "PENDING_APPROVAL"'
    );

    return { events: await Promise.all(events.map(e => formatEventData(e, connection))) };
  } finally {
    connection.release();
  }
};

export const updateEventAdminStatus = async (eventId, status, userId, rejectionReason = null) => {
  const connection = await pool.getConnection();
  try {
    // Verify user is ultimate admin
    const [users] = await connection.query('SELECT role FROM users WHERE id = ?', [userId]);
    if (users[0]?.role !== 'ULTIMATE_ADMIN') {
      throw new Error('Unauthorized - Ultimate admin only');
    }

    let query = 'UPDATE events SET status = ?, reviewed_by = ?, reviewed_at = NOW() WHERE id = ?';
    const values = [status, userId, eventId];

    if (rejectionReason) {
      query = 'UPDATE events SET status = ?, reviewed_by = ?, reviewed_at = NOW(), rejection_reason = ? WHERE id = ?';
      values.splice(3, 0, rejectionReason);
    }

    await connection.query(query, values);
    return { success: true, message: `Event ${status.toLowerCase()} successfully` };
  } finally {
    connection.release();
  }
};

export const deleteEvent = async (eventId, userId) => {
  const connection = await pool.getConnection();
  try {
    // Verify user is ultimate admin
    const [users] = await connection.query('SELECT role FROM users WHERE id = ?', [userId]);
    if (users[0]?.role !== 'ULTIMATE_ADMIN') {
      throw new Error('Unauthorized - Ultimate admin only');
    }

    await connection.query(
      'UPDATE events SET status = "ARCHIVED", archived_at = NOW(), archived_by = ? WHERE id = ?',
      [userId, eventId]
    );

    return { success: true, message: 'Event deleted successfully' };
  } finally {
    connection.release();
  }
};

export const getAllEvents = async (userId, statusFilter = null) => {
  const connection = await pool.getConnection();
  try {
    // Verify user is ultimate admin
    const [users] = await connection.query('SELECT role FROM users WHERE id = ?', [userId]);
    if (users[0]?.role !== 'ULTIMATE_ADMIN') {
      throw new Error('Unauthorized - Ultimate admin only');
    }

    let query = 'SELECT * FROM events';
    const values = [];

    if (statusFilter) {
      query += ' WHERE status = ?';
      values.push(statusFilter);
    }

    const [events] = await connection.query(query, values);
    return { events: await Promise.all(events.map(e => formatEventData(e, connection))) };
  } finally {
    connection.release();
  }
};

export const toggleEventFeatured = async (eventId, isFeatured, userId) => {
  const connection = await pool.getConnection();
  try {
    // Verify user is ultimate admin
    const [users] = await connection.query('SELECT role FROM users WHERE id = ?', [userId]);
    if (users[0]?.role !== 'ULTIMATE_ADMIN') {
      throw new Error('Unauthorized - Ultimate admin only');
    }

    if (isFeatured) {
      await connection.query(
        'UPDATE events SET is_featured = true, featured_at = NOW(), featured_by = ? WHERE id = ?',
        [userId, eventId]
      );
    } else {
      await connection.query(
        'UPDATE events SET is_featured = false WHERE id = ?',
        [eventId]
      );
    }

    return { success: true, message: isFeatured ? 'Event featured successfully' : 'Event unfeatured successfully' };
  } finally {
    connection.release();
  }
};

export const toggleEventPublish = async (eventId, shouldPublish, userId) => {
  const connection = await pool.getConnection();
  try {
    // Verify user is ultimate admin
    const [users] = await connection.query('SELECT role FROM users WHERE id = ?', [userId]);
    if (users[0]?.role !== 'ULTIMATE_ADMIN') {
      throw new Error('Unauthorized - Ultimate admin only');
    }

    const newStatus = shouldPublish ? 'PUBLISHED' : 'DRAFT';

    if (shouldPublish) {
      await connection.query(
        'UPDATE events SET status = ?, published_by = ?, published_at = NOW() WHERE id = ?',
        [newStatus, userId, eventId]
      );
    } else {
      await connection.query(
        'UPDATE events SET status = ?, unpublished_by = ?, unpublished_at = NOW() WHERE id = ?',
        [newStatus, userId, eventId]
      );
    }

    return { success: true, message: shouldPublish ? 'Event published successfully' : 'Event unpublished successfully' };
  } finally {
    connection.release();
  }
};

export const getFeaturedEvents = async () => {
  const connection = await pool.getConnection();
  try {
    const [events] = await connection.query(
      'SELECT * FROM events WHERE is_featured = true AND status = "PUBLISHED"'
    );

    return { events: await Promise.all(events.map(e => formatEventData(e, connection))) };
  } finally {
    connection.release();
  }
};

// Helper function to format event data with all related info
async function formatEventData(dbEvent, connection) {
  // Get primary category
  const [primaryCat] = await connection.query(
    `SELECT ec.* FROM event_categories ec 
     JOIN event_category_links ecl ON ec.id = ecl.category_id 
     WHERE ecl.event_id = ? AND ecl.is_primary = TRUE 
     LIMIT 1`,
    [dbEvent.id]
  );

  // Get additional categories
  const [additionalCats] = await connection.query(
    `SELECT ec.* FROM event_categories ec 
     JOIN event_category_links ecl ON ec.id = ecl.category_id 
     WHERE ecl.event_id = ? AND ecl.is_primary = FALSE`,
    [dbEvent.id]
  );

  // Get like count
  const [likeCount] = await connection.query(
    'SELECT COUNT(*) as count FROM event_likes WHERE event_id = ? AND deleted = false',
    [dbEvent.id]
  );

  // Get registration count
  const [registrationCount] = await connection.query(
    'SELECT COUNT(*) as count FROM event_registrations WHERE event_id = ?',
    [dbEvent.id]
  );

  // Get creator info
  const [creator] = await connection.query(
    'SELECT id, full_name, email FROM users WHERE id = ?',
    [dbEvent.created_by_id]
  );

  // Get assets (brochures, posters, socials) with graceful fallback
  let brochures = [];
  let posters = [];
  let socialLinks = [];
  try {
    const [assets] = await connection.query(
      'SELECT asset_type, name, url, label FROM event_assets WHERE event_id = ?',
      [dbEvent.id]
    );

    brochures = assets
      .filter(a => a.asset_type === 'BROCHURE')
      .map(a => ({ name: a.name, url: a.url }));

    posters = assets
      .filter(a => a.asset_type === 'POSTER')
      .map(a => ({ name: a.name, url: a.url }));

    socialLinks = assets
      .filter(a => a.asset_type === 'SOCIAL')
      .map(a => ({ url: a.url, label: a.label }));
  } catch (err) {
    // Table may not exist yet; skip assets
  }

  return {
    id: dbEvent.id,
    title: dbEvent.title,
    description: dbEvent.description,
    date: dbEvent.date,
    time: dbEvent.time,
    location: dbEvent.location,
    district: dbEvent.district,
    googleMapsLink: dbEvent.google_maps_link,
    primaryCategory: primaryCat[0] || null,
    additionalCategories: additionalCats.map(cat => ({ category: cat })),
    entryFee: dbEvent.entry_fee,
    isFree: dbEvent.is_free,
    prizeDetails: dbEvent.prize_details,
    contactEmail: dbEvent.contact_email,
    contactPhone: dbEvent.contact_phone,
    externalRegistrationLink: dbEvent.external_registration_link,
    registrationMethod: dbEvent.registration_method,
    howToRegisterLink: dbEvent.how_to_register_link,
    instagramUrl: dbEvent.instagram_url,
    facebookUrl: dbEvent.facebook_url,
    youtubeUrl: dbEvent.youtube_url,
    bannerUrl: dbEvent.banner_url,
    status: dbEvent.status,
    isFeatured: dbEvent.is_featured,
    featuredAt: dbEvent.featured_at,
    featuredBy: dbEvent.featured_by,
    createdBy: creator[0] ? { id: creator[0].id, fullName: creator[0].full_name, email: creator[0].email } : null,
    createdAt: dbEvent.created_at,
    updatedAt: dbEvent.updated_at,
    brochureFiles: brochures,
    posterImages: posters,
    socialLinks: socialLinks,
    _count: {
      likes: likeCount[0].count,
      registrations: registrationCount[0].count,
    },
  };
}

// Registration Form Methods
export const createRegistrationFormQuestions = async (eventId, questions) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    // First, delete existing questions for this event
    await connection.query(
      'DELETE FROM registration_form_questions WHERE event_id = ?',
      [eventId]
    );
    
    // Then insert new questions
    for (const question of questions) {
      const questionId = crypto.randomUUID();
      await connection.query(
        `INSERT INTO registration_form_questions 
         (id, event_id, question_category, question_key, question_text, question_type, options, is_required, display_order, is_custom) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          questionId,
          eventId,
          question.questionCategory || 'Custom',
          question.questionKey || `custom_${questionId}`,
          question.questionText,
          question.questionType,
          question.options ? JSON.stringify(question.options) : null,
          question.isRequired !== undefined ? question.isRequired : false,
          question.displayOrder !== undefined ? question.displayOrder : 0,
          question.isCustom !== undefined ? question.isCustom : false
        ]
      );
    }
    
    await connection.commit();
    return { success: true };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const getRegistrationFormQuestions = async (eventId) => {
  const connection = await pool.getConnection();
  try {
    const [questions] = await connection.query(
      `SELECT * FROM registration_form_questions WHERE event_id = ? ORDER BY display_order ASC`,
      [eventId]
    );
    
    return questions.map(q => ({
      id: q.id,
      eventId: q.event_id,
      questionCategory: q.question_category,
      questionKey: q.question_key,
      questionText: q.question_text,
      questionType: q.question_type,
      options: q.options ? JSON.parse(q.options) : null,
      isRequired: q.is_required,
      displayOrder: q.display_order,
      isCustom: q.is_custom
    }));
  } finally {
    connection.release();
  }
};

export const registerEventWithForm = async (eventId, userId, formResponses, registrationType = 'FORM') => {
  const connection = await pool.getConnection();
  try {
    const registrationId = `${userId}_${eventId}`;

    // Check if already registered
    const [registrations] = await connection.query(
      'SELECT * FROM event_registrations WHERE id = ?',
      [registrationId]
    );

    if (registrations.length > 0) {
      return { success: false, message: 'Already registered' };
    }

    // Start transaction
    await connection.beginTransaction();

    // Create registration
    await connection.query(
      'INSERT INTO event_registrations (id, user_id, event_id, registration_type) VALUES (?, ?, ?, ?)',
      [registrationId, userId, eventId, registrationType]
    );

    // Save form responses if provided
    if (formResponses && formResponses.length > 0) {
      console.log('Saving form responses:', JSON.stringify(formResponses, null, 2));
      
      // Get all question IDs for this event to validate
      const [existingQuestions] = await connection.query(
        'SELECT id FROM registration_form_questions WHERE event_id = ?',
        [eventId]
      );
      const validQuestionIds = new Set(existingQuestions.map(q => q.id));
      console.log('Valid question IDs:', Array.from(validQuestionIds));
      
      for (const response of formResponses) {
        if (!validQuestionIds.has(response.questionId)) {
          console.error(`Invalid question ID: ${response.questionId}`);
          throw new Error(`Question ID ${response.questionId} does not exist for this event`);
        }
        
        const responseId = crypto.randomUUID();
        await connection.query(
          `INSERT INTO registration_form_responses 
           (id, registration_id, event_id, user_id, question_id, answer) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            responseId,
            registrationId,
            eventId,
            userId,
            response.questionId,
            response.answer
          ]
        );
      }
    }

    await connection.commit();
    return { success: true, message: 'Registered successfully with form' };
  } catch (error) {
    await connection.rollback();
    console.error('Error in registerEventWithForm:', error);
    throw error;
  } finally {
    connection.release();
  }
};

export const getRegistrationFormResponses = async (registrationId) => {
  const connection = await pool.getConnection();
  try {
    const [responses] = await connection.query(
      `SELECT rfr.*, rfq.question_text, rfq.question_type 
       FROM registration_form_responses rfr
       LEFT JOIN registration_form_questions rfq ON rfr.question_id = rfq.id
       WHERE rfr.registration_id = ?`,
      [registrationId]
    );

    return responses.map(r => ({
      id: r.id,
      registrationId: r.registration_id,
      eventId: r.event_id,
      userId: r.user_id,
      questionId: r.question_id,
      questionText: r.question_text || 'Unknown Question',
      questionType: r.question_type,
      answer: r.answer
    }));
  } finally {
    connection.release();
  }
};

export const getEventRegistrationsWithResponses = async (eventId) => {
  const connection = await pool.getConnection();
  try {
    const [registrations] = await connection.query(
      `SELECT er.*, u.full_name, u.email 
       FROM event_registrations er
       JOIN users u ON er.user_id = u.id
       WHERE er.event_id = ?`,
      [eventId]
    );

    const registrationsWithResponses = await Promise.all(
      registrations.map(async (reg) => {
        const responses = await getRegistrationFormResponses(reg.id);
        return {
          id: reg.id,
          userId: reg.user_id,
          eventId: reg.event_id,
          registrationType: reg.registration_type,
          status: reg.status,
          userName: reg.full_name,
          userEmail: reg.email,
          createdAt: reg.created_at,
          registeredAt: reg.created_at,
          formResponses: responses
        };
      })
    );

    return registrationsWithResponses;
  } finally {
    connection.release();
  }
};

export const updateRegistrationStatus = async (registrationId, status) => {
  const connection = await pool.getConnection();
  try {
    await connection.query(
      'UPDATE event_registrations SET status = ? WHERE id = ?',
      [status, registrationId]
    );
    return { success: true, message: 'Registration status updated' };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const deleteRegistrationFormQuestions = async (eventId) => {
  const connection = await pool.getConnection();
  try {
    await connection.query(
      'DELETE FROM registration_form_questions WHERE event_id = ?',
      [eventId]
    );
    return { success: true };
  } finally {
    connection.release();
  }
};
