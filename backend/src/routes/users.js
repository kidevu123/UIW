const express = require('express');
const { body, validationResult } = require('express-validator');
const { userQueries } = require('../services/database');
const { partnerMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const user = await userQueries.findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({
        error: 'User Not Found',
        message: 'User profile not found'
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
        createdAt: user.created_at,
        lastLogin: user.last_login
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get user profile'
    });
  }
});

// Update user profile
router.put('/profile', [
  body('displayName')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Display name must be 1-100 characters'),
  body('preferences')
    .optional()
    .isObject()
    .withMessage('Preferences must be an object')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid input data',
        details: errors.array()
      });
    }

    const updates = {};
    if (req.body.displayName !== undefined) {
      updates.display_name = req.body.displayName;
    }
    if (req.body.preferences !== undefined) {
      updates.preferences = JSON.stringify(req.body.preferences);
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'No valid fields to update'
      });
    }

    const updatedUser = await userQueries.updateUser(req.user.id, updates);
    if (!updatedUser) {
      return res.status(404).json({
        error: 'User Not Found',
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        displayName: updatedUser.display_name,
        avatarUrl: updatedUser.avatar_url,
        preferences: updatedUser.preferences
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update profile'
    });
  }
});

// Get partner info
router.get('/partner', partnerMiddleware, async (req, res) => {
  try {
    const userCount = await userQueries.getUserCount();
    if (userCount < 2) {
      return res.json({
        success: true,
        partner: null,
        message: 'Partner not yet registered'
      });
    }

    // Get all users and find the partner
    const { query } = require('../services/database');
    const result = await query(
      'SELECT id, username, display_name, avatar_url, created_at, last_login FROM users WHERE id != $1 AND is_active = true',
      [req.user.id]
    );

    const partner = result.rows[0];
    if (!partner) {
      return res.json({
        success: true,
        partner: null,
        message: 'Partner not found'
      });
    }

    res.json({
      success: true,
      partner: {
        id: partner.id,
        username: partner.username,
        displayName: partner.display_name,
        avatarUrl: partner.avatar_url,
        createdAt: partner.created_at,
        lastLogin: partner.last_login
      }
    });

  } catch (error) {
    console.error('Get partner error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get partner info'
    });
  }
});

module.exports = router;