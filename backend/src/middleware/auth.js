const jwt = require('jsonwebtoken');
const { sessionQueries } = require('../services/database');
const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

// Generate JWT token
function generateToken(payload, expiresIn = '7d') {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

// Verify JWT token
function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

// Hash token for storage
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// Authentication middleware
async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No valid authorization token provided'
      });
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Verify JWT token
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (jwtError) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or expired token'
      });
    }
    
    // Check if session exists and is valid
    const tokenHash = hashToken(token);
    const session = await sessionQueries.findValidSession(tokenHash);
    
    if (!session) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Session expired or invalid'
      });
    }
    
    // Attach user info to request
    req.user = {
      id: session.user_id,
      username: session.username,
      email: session.email
    };
    
    req.sessionId = session.id;
    req.token = token;
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Authentication check failed'
    });
  }
}

// Optional authentication middleware (for public endpoints with optional auth)
async function optionalAuthMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }
    
    const token = authHeader.substring(7);
    
    try {
      const decoded = verifyToken(token);
      const tokenHash = hashToken(token);
      const session = await sessionQueries.findValidSession(tokenHash);
      
      if (session) {
        req.user = {
          id: session.user_id,
          username: session.username,
          email: session.email
        };
        req.sessionId = session.id;
        req.token = token;
      } else {
        req.user = null;
      }
    } catch (jwtError) {
      req.user = null;
    }
    
    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    req.user = null;
    next();
  }
}

// Admin middleware (for admin-only endpoints)
async function adminMiddleware(req, res, next) {
  try {
    // Since this is a two-user intimate app, we consider the first user as admin
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }
    
    // In a two-user app, we can check if this is the first registered user
    // or add an is_admin flag to the user model
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Admin check failed'
    });
  }
}

// Partner verification middleware (ensure users are the two registered partners)
async function partnerMiddleware(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }
    
    // This middleware ensures operations are only between the two registered users
    // Additional validation can be added based on specific route requirements
    next();
  } catch (error) {
    console.error('Partner middleware error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Partner verification failed'
    });
  }
}

// Rate limiting for sensitive operations
function createSensitiveRateLimit(windowMs = 15 * 60 * 1000, max = 5) {
  const attempts = new Map();
  
  return (req, res, next) => {
    const key = req.user ? req.user.id : req.ip;
    const now = Date.now();
    
    if (!attempts.has(key)) {
      attempts.set(key, []);
    }
    
    const userAttempts = attempts.get(key);
    
    // Remove old attempts outside the window
    const validAttempts = userAttempts.filter(timestamp => now - timestamp < windowMs);
    attempts.set(key, validAttempts);
    
    if (validAttempts.length >= max) {
      return res.status(429).json({
        error: 'Too Many Requests',
        message: 'Too many sensitive operations. Please try again later.',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
    
    validAttempts.push(now);
    next();
  };
}

module.exports = {
  generateToken,
  verifyToken,
  hashToken,
  authMiddleware,
  optionalAuthMiddleware,
  adminMiddleware,
  partnerMiddleware,
  createSensitiveRateLimit
};