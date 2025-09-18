const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://uiw_user:uiw_password@localhost:5432/uiw_db',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test database connection
async function initializeDatabase() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as current_time');
    console.log('Database connected at:', result.rows[0].current_time);
    client.release();
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
}

// Generic query function
async function query(text, params) {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: result.rowCount });
    return result;
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
}

// Transaction helper
async function withTransaction(callback) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// User queries
const userQueries = {
  async createUser(userData) {
    const { username, email, passwordHash, displayName } = userData;
    const result = await query(
      `INSERT INTO users (username, email, password_hash, display_name) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, username, email, display_name, created_at`,
      [username, email, passwordHash, displayName]
    );
    return result.rows[0];
  },

  async findUserByEmail(email) {
    const result = await query(
      'SELECT * FROM users WHERE email = $1 AND is_active = true',
      [email]
    );
    return result.rows[0];
  },

  async findUserById(id) {
    const result = await query(
      'SELECT id, username, email, display_name, avatar_url, preferences, created_at, last_login FROM users WHERE id = $1 AND is_active = true',
      [id]
    );
    return result.rows[0];
  },

  async updateUser(id, updates) {
    const setClause = Object.keys(updates).map((key, index) => `${key} = $${index + 2}`).join(', ');
    const values = [id, ...Object.values(updates)];
    
    const result = await query(
      `UPDATE users SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1 AND is_active = true 
       RETURNING id, username, email, display_name, avatar_url, preferences`,
      values
    );
    return result.rows[0];
  },

  async updateLastLogin(id) {
    await query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [id]
    );
  },

  async getUserCount() {
    const result = await query('SELECT COUNT(*) as count FROM users WHERE is_active = true');
    return parseInt(result.rows[0].count);
  }
};

// Session queries
const sessionQueries = {
  async createSession(userId, tokenHash, expiresAt, deviceInfo = {}) {
    const result = await query(
      `INSERT INTO user_sessions (user_id, token_hash, expires_at, device_info) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id`,
      [userId, tokenHash, expiresAt, JSON.stringify(deviceInfo)]
    );
    return result.rows[0];
  },

  async findValidSession(tokenHash) {
    const result = await query(
      `SELECT us.*, u.id as user_id, u.username, u.email 
       FROM user_sessions us 
       JOIN users u ON us.user_id = u.id 
       WHERE us.token_hash = $1 AND us.expires_at > NOW() AND us.is_active = true AND u.is_active = true`,
      [tokenHash]
    );
    return result.rows[0];
  },

  async invalidateSession(tokenHash) {
    await query(
      'UPDATE user_sessions SET is_active = false WHERE token_hash = $1',
      [tokenHash]
    );
  },

  async invalidateUserSessions(userId) {
    await query(
      'UPDATE user_sessions SET is_active = false WHERE user_id = $1',
      [userId]
    );
  }
};

// Chat queries
const chatQueries = {
  async createMessage(senderId, receiverId, content, messageType = 'text', metadata = {}) {
    const result = await query(
      `INSERT INTO chat_messages (sender_id, receiver_id, content, message_type, metadata) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [senderId, receiverId, content, messageType, JSON.stringify(metadata)]
    );
    return result.rows[0];
  },

  async getMessages(userId1, userId2, limit = 50, offset = 0) {
    const result = await query(
      `SELECT cm.*, 
              s.username as sender_username, s.display_name as sender_display_name,
              r.username as receiver_username, r.display_name as receiver_display_name
       FROM chat_messages cm
       JOIN users s ON cm.sender_id = s.id
       JOIN users r ON cm.receiver_id = r.id
       WHERE (cm.sender_id = $1 AND cm.receiver_id = $2) 
          OR (cm.sender_id = $2 AND cm.receiver_id = $1)
       ORDER BY cm.created_at DESC
       LIMIT $3 OFFSET $4`,
      [userId1, userId2, limit, offset]
    );
    return result.rows.reverse();
  },

  async markMessageAsRead(messageId, userId) {
    await query(
      'UPDATE chat_messages SET is_read = true WHERE id = $1 AND receiver_id = $2',
      [messageId, userId]
    );
  }
};

// Booking queries
const bookingQueries = {
  async createBooking(creatorId, partnerId, bookingData) {
    const { title, description, scheduledAt, duration, location, bookingType } = bookingData;
    const result = await query(
      `INSERT INTO bookings (creator_id, partner_id, title, description, scheduled_at, duration_minutes, location, booking_type) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [creatorId, partnerId, title, description, scheduledAt, duration, location, bookingType]
    );
    return result.rows[0];
  },

  async getUserBookings(userId, status = null) {
    let queryText = `
      SELECT b.*, 
             c.username as creator_username, c.display_name as creator_display_name,
             p.username as partner_username, p.display_name as partner_display_name
      FROM bookings b
      JOIN users c ON b.creator_id = c.id
      JOIN users p ON b.partner_id = p.id
      WHERE b.creator_id = $1 OR b.partner_id = $1
    `;
    const params = [userId];
    
    if (status) {
      queryText += ' AND b.status = $2';
      params.push(status);
    }
    
    queryText += ' ORDER BY b.scheduled_at ASC';
    
    const result = await query(queryText, params);
    return result.rows;
  },

  async updateBookingStatus(bookingId, status, userId) {
    const result = await query(
      `UPDATE bookings SET status = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 AND (creator_id = $3 OR partner_id = $3)
       RETURNING *`,
      [status, bookingId, userId]
    );
    return result.rows[0];
  }
};

module.exports = {
  pool,
  query,
  withTransaction,
  initializeDatabase,
  userQueries,
  sessionQueries,
  chatQueries,
  bookingQueries
};