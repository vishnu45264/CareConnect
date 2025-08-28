const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const Message = require('../models/Message');
const Request = require('../models/Request');
const User = require('../models/User');

// Get all messages for the current user
router.get('/', protect, async (req, res) => {
  try {
    const { requestId, limit = 50, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    let query = {
      $or: [
        { sender: req.user._id },
        { recipient: req.user._id }
      ]
    };

    // Filter by request if provided
    if (requestId) {
      query.request = requestId;
    }

    const messages = await Message.find(query)
      .populate('sender', 'name email role')
      .populate('recipient', 'name email role')
      .populate('request', 'title status')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Message.countDocuments(query);

    res.json({
      success: true,
      data: {
        messages,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch messages'
    });
  }
});

// Send a new message
router.post('/', protect, [
  body('recipientId').isMongoId().withMessage('Valid recipient ID is required'),
  body('requestId').isMongoId().withMessage('Valid request ID is required'),
  body('message').trim().isLength({ min: 1, max: 1000 }).withMessage('Message must be between 1 and 1000 characters'),
  body('type').isIn(['volunteer_to_senior', 'senior_to_volunteer']).withMessage('Valid message type is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: errors.array()
      });
    }

    const { recipientId, requestId, message, type } = req.body;

    // Verify the request exists and user has access to it
    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({
        success: false,
        error: 'Request not found',
        message: 'The specified request does not exist'
      });
    }

    // Check if user is involved in this request
    const isSenior = request.senior.toString() === req.user._id.toString();
    const isVolunteer = request.volunteer && request.volunteer.toString() === req.user._id.toString();
    
    if (!isSenior && !isVolunteer) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'You can only send messages for requests you are involved in'
      });
    }

    // Verify recipient exists and is involved in the request
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({
        success: false,
        error: 'Recipient not found',
        message: 'The specified recipient does not exist'
      });
    }

    // Verify recipient is involved in the request
    const recipientIsSenior = request.senior.toString() === recipientId;
    const recipientIsVolunteer = request.volunteer && request.volunteer.toString() === recipientId;
    
    if (!recipientIsSenior && !recipientIsVolunteer) {
      return res.status(403).json({
        success: false,
        error: 'Invalid recipient',
        message: 'The recipient is not involved in this request'
      });
    }

    // Verify message type matches the sender's role
    if (type === 'volunteer_to_senior' && req.user.role.toLowerCase() !== 'volunteer') {
      return res.status(400).json({
        success: false,
        error: 'Invalid message type',
        message: 'Only volunteers can send volunteer_to_senior messages'
      });
    }

    if (type === 'senior_to_volunteer' && req.user.role.toLowerCase() !== 'senior') {
      return res.status(400).json({
        success: false,
        error: 'Invalid message type',
        message: 'Only seniors can send senior_to_volunteer messages'
      });
    }

    // Create the message
    const newMessage = await Message.create({
      sender: req.user._id,
      recipient: recipientId,
      request: requestId,
      message: message.trim(),
      type
    });

    // Populate the message with sender and recipient details
    const populatedMessage = await Message.findById(newMessage._id)
      .populate('sender', 'name email role')
      .populate('recipient', 'name email role')
      .populate('request', 'title status');

    res.status(201).json({
      success: true,
      data: {
        message: populatedMessage
      },
      message: 'Message sent successfully'
    });

  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to send message'
    });
  }
});

// Mark a message as read
router.put('/:id/read', protect, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        error: 'Message not found',
        message: 'The specified message does not exist'
      });
    }

    // Check if user is the recipient
    if (message.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'You can only mark messages sent to you as read'
      });
    }

    await message.markAsRead();

    res.json({
      success: true,
      data: {
        message
      },
      message: 'Message marked as read'
    });

  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to mark message as read'
    });
  }
});

// Mark all messages as read for a specific request
router.put('/request/:requestId/read-all', protect, async (req, res) => {
  try {
    const { requestId } = req.params;

    // Verify the request exists and user has access to it
    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({
        success: false,
        error: 'Request not found',
        message: 'The specified request does not exist'
      });
    }

    // Check if user is involved in this request
    const isSenior = request.senior.toString() === req.user._id.toString();
    const isVolunteer = request.volunteer && request.volunteer.toString() === req.user._id.toString();
    
    if (!isSenior && !isVolunteer) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'You can only mark messages as read for requests you are involved in'
      });
    }

    // Mark all unread messages for this request as read
    const result = await Message.updateMany(
      {
        request: requestId,
        recipient: req.user._id,
        isRead: false
      },
      {
        isRead: true
      }
    );

    res.json({
      success: true,
      data: {
        updatedCount: result.modifiedCount
      },
      message: `${result.modifiedCount} messages marked as read`
    });

  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to mark messages as read'
    });
  }
});

// Get unread message count
router.get('/unread-count', protect, async (req, res) => {
  try {
    const count = await Message.countDocuments({
      recipient: req.user._id,
      isRead: false
    });

    res.json({
      success: true,
      data: {
        unreadCount: count
      }
    });

  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch unread count'
    });
  }
});

// Delete a message (only sender can delete)
router.delete('/:id', protect, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        error: 'Message not found',
        message: 'The specified message does not exist'
      });
    }

    // Check if user is the sender
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'You can only delete messages you sent'
      });
    }

    await Message.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to delete message'
    });
  }
});

module.exports = router;
