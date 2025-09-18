const express = require('express');
const { body, validationResult } = require('express-validator');
const { chatQueries, userQueries } = require('../services/database');

const router = express.Router();

// Get chat messages
router.get('/messages/:partnerId', async (req, res) => {
  try {
    const { partnerId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    // Verify partner exists and is valid
    const partner = await userQueries.findUserById(partnerId);
    if (!partner) {
      return res.status(404).json({
        error: 'Partner Not Found',
        message: 'Chat partner not found'
      });
    }

    const messages = await chatQueries.getMessages(
      req.user.id, 
      partnerId, 
      parseInt(limit), 
      parseInt(offset)
    );

    res.json({
      success: true,
      messages,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: messages.length === parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get messages'
    });
  }
});

// Send message
router.post('/messages', [
  body('receiverId')
    .isUUID()
    .withMessage('Valid receiver ID is required'),
  body('content')
    .notEmpty()
    .isLength({ max: 10000 })
    .withMessage('Message content is required and must be less than 10000 characters'),
  body('messageType')
    .optional()
    .isIn(['text', 'image', 'audio', 'video', 'file'])
    .withMessage('Invalid message type')
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

    const { receiverId, content, messageType = 'text', metadata = {} } = req.body;

    // Verify receiver exists
    const receiver = await userQueries.findUserById(receiverId);
    if (!receiver) {
      return res.status(404).json({
        error: 'Receiver Not Found',
        message: 'Message receiver not found'
      });
    }

    // Create message
    const message = await chatQueries.createMessage(
      req.user.id,
      receiverId,
      content,
      messageType,
      metadata
    );

    // Emit socket event for real-time messaging
    const io = req.app.get('io');
    io.to(`user_${receiverId}`).emit('new_message', {
      id: message.id,
      senderId: req.user.id,
      senderUsername: req.user.username,
      content: message.content,
      messageType: message.message_type,
      createdAt: message.created_at,
      metadata: message.metadata
    });

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: {
        id: message.id,
        senderId: message.sender_id,
        receiverId: message.receiver_id,
        content: message.content,
        messageType: message.message_type,
        createdAt: message.created_at,
        metadata: message.metadata
      }
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to send message'
    });
  }
});

// Mark message as read
router.put('/messages/:messageId/read', async (req, res) => {
  try {
    const { messageId } = req.params;

    await chatQueries.markMessageAsRead(messageId, req.user.id);

    res.json({
      success: true,
      message: 'Message marked as read'
    });

  } catch (error) {
    console.error('Mark message read error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to mark message as read'
    });
  }
});

module.exports = router;