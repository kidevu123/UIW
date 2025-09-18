const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { userQueries, sessionQueries } = require('../services/database');
const { generateToken, hashToken, createSensitiveRateLimit } = require('../middleware/auth');

const router = express.Router();

// Rate limiting for auth endpoints
const authRateLimit = createSensitiveRateLimit(15 * 60 * 1000, 5); // 5 attempts per 15 minutes

// Validation rules
const registerValidation = [
  body('username')
    .isLength({ min: 3, max: 30 })
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username must be 3-30 characters and contain only letters, numbers, and underscores'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must be at least 8 characters with uppercase, lowercase, number, and special character'),
  body('displayName')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Display name must be 1-100 characters')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Register new user
router.post('/register', authRateLimit, registerValidation, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid input data',
        details: errors.array()
      });
    }

    const { username, email, password, displayName } = req.body;

    // Check if maximum users reached (2 users max)
    const userCount = await userQueries.getUserCount();
    if (userCount >= 2) {
      return res.status(403).json({
        error: 'Registration Closed',
        message: 'This intimate app is limited to 2 users. Registration is closed.'
      });
    }

    // Check if user already exists
    const existingUser = await userQueries.findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        error: 'User Exists',
        message: 'A user with this email already exists'
      });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const newUser = await userQueries.createUser({
      username,
      email,
      passwordHash,
      displayName: displayName || username
    });

    // Generate JWT token
    const token = generateToken({
      userId: newUser.id,
      username: newUser.username,
      email: newUser.email
    });

    // Create session
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await sessionQueries.createSession(newUser.id, tokenHash, expiresAt, {
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });

    // Update last login
    await userQueries.updateLastLogin(newUser.id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        displayName: newUser.display_name,
        createdAt: newUser.created_at
      },
      token,
      isFirstUser: userCount === 0
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Registration failed'
    });
  }
});

// Login user
router.post('/login', authRateLimit, loginValidation, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid input data',
        details: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user
    const user = await userQueries.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        error: 'Invalid Credentials',
        message: 'Invalid email or password'
      });
    }

    // Verify password
    const passwordValid = await bcrypt.compare(password, user.password_hash);
    if (!passwordValid) {
      return res.status(401).json({
        error: 'Invalid Credentials',
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      username: user.username,
      email: user.email
    });

    // Create session
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await sessionQueries.createSession(user.id, tokenHash, expiresAt, {
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });

    // Update last login
    await userQueries.updateLastLogin(user.id);

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.display_name,
        avatarUrl: user.avatar_url,
        preferences: user.preferences,
        lastLogin: new Date()
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Login failed'
    });
  }
});

// Logout user
router.post('/logout', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const tokenHash = hashToken(token);
      await sessionQueries.invalidateSession(tokenHash);
    }

    res.json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Logout failed'
    });
  }
});

// Check authentication status
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No valid authorization token provided'
      });
    }
    
    const token = authHeader.substring(7);
    const tokenHash = hashToken(token);
    const session = await sessionQueries.findValidSession(tokenHash);
    
    if (!session) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Session expired or invalid'
      });
    }
    
    const user = await userQueries.findUserById(session.user_id);
    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.display_name,
        avatarUrl: user.avatar_url,
        preferences: user.preferences,
        lastLogin: user.last_login
      }
    });

  } catch (error) {
    console.error('Auth check error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Authentication check failed'
    });
  }
});

// Get app status (for onboarding)
router.get('/status', async (req, res) => {
  try {
    const userCount = await userQueries.getUserCount();
    
    res.json({
      success: true,
      userCount,
      maxUsers: 2,
      registrationOpen: userCount < 2,
      appInitialized: userCount > 0
    });

  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Status check failed'
    });
  }
});

module.exports = router;