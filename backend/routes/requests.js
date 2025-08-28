const express = require('express');
const Request = require('../models/Request');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { protect, isSenior, isVolunteer } = require('../middleware/auth');
const { validateRequestCreation, validateRequestUpdate, validatePagination, validateSearch } = require('../middleware/validation');

const router = express.Router();

// @route   POST /api/requests
// @desc    Create a new help request
// @access  Private (Seniors only)
router.post('/', protect, isSenior, validateRequestCreation, async (req, res) => {
  try {
    const {
      category,
      title,
      description,
      urgency,
      schedule,
      location,
      budget,
      specialRequirements
    } = req.body;

    // Create request
    const request = new Request({
      senior: req.user._id,
      category,
      title,
      description,
      urgency,
      schedule,
      location,
      budget,
      specialRequirements
    });

    await request.save();

    // Populate senior info
    await request.populate('senior', 'name age rating location');

    res.status(201).json({
      success: true,
      message: 'Help request created successfully',
      data: {
        request
      }
    });
  } catch (error) {
    console.error('Request creation error:', error);
    res.status(500).json({
      error: 'Request creation failed',
      message: 'An error occurred while creating your request'
    });
  }
});

// @route   GET /api/requests
// @desc    Get all requests (with filters)
// @access  Private
router.get('/', protect, validatePagination, validateSearch, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = 'createdAt',
      order = 'desc',
      q,
      category,
      urgency,
      status,
      location
    } = req.query;

    const skip = (page - 1) * limit;
    const sortOrder = order === 'asc' ? 1 : -1;

    // Build query
    const query = {};

    // Role-based filtering
    if (req.user.role === 'senior') {
      query.senior = req.user._id;
    } else if (req.user.role === 'volunteer') {
      // If volunteer parameter is provided, get requests assigned to this volunteer
      if (req.query.volunteer) {
        query.volunteer = req.query.volunteer;
      } else {
        // Otherwise, get pending requests available for volunteers
        query.status = 'pending';
        // Filter by volunteer preferences
        if (req.user.preferences?.preferredCategories?.length > 0) {
          query.category = { $in: req.user.preferences.preferredCategories };
        }
      }
    }

    // Apply filters
    if (q) {
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ];
    }

    if (category) query.category = category;
    if (urgency) query.urgency = urgency;
    if (status) query.status = status;

    // Location-based filtering for volunteers
    if (location && req.user.role === 'volunteer') {
      const [lat, lng] = location.split(',').map(Number);
      if (!isNaN(lat) && !isNaN(lng)) {
        query['location.coordinates'] = {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [lng, lat]
            },
            $maxDistance: (req.user.preferences?.maxDistance || 10) * 1000
          }
        };
      }
    }

    // Get requests
    const requests = await Request.find(query)
      .populate('senior', 'name age rating location')
      .populate('volunteer', 'name rating')
      .sort({ [sort]: sortOrder })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await Request.countDocuments(query);

    res.json({
      success: true,
      data: {
        requests,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get requests error:', error);
    res.status(500).json({
      error: 'Failed to get requests',
      message: 'An error occurred while fetching requests'
    });
  }
});

// @route   GET /api/requests/nearby
// @desc    Get nearby requests for volunteers
// @access  Private (Volunteers only)
router.get('/nearby', protect, isVolunteer, async (req, res) => {
  try {
    const { lat, lng, maxDistance = 10 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        error: 'Location required',
        message: 'Please provide your location coordinates'
      });
    }

    const coordinates = [parseFloat(lng), parseFloat(lat)];
    const distance = parseFloat(maxDistance);

    const requests = await Request.findNearby(coordinates, distance, {
      category: req.query.category,
      urgency: req.query.urgency,
      maxBudget: req.query.maxBudget
    });

    res.json({
      success: true,
      data: {
        requests,
        location: { lat, lng },
        maxDistance: distance
      }
    });
  } catch (error) {
    console.error('Get nearby requests error:', error);
    res.status(500).json({
      error: 'Failed to get nearby requests',
      message: 'An error occurred while fetching nearby requests'
    });
  }
});

// @route   GET /api/requests/:id
// @desc    Get a specific request
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate('senior', 'name age rating location phone')
      .populate('volunteer', 'name rating phone')
      .populate('messages.sender', 'name');

    if (!request) {
      return res.status(404).json({
        error: 'Request not found',
        message: 'The requested help request was not found'
      });
    }

    // Check if user has access to this request
    if (req.user.role !== 'admin' && 
        request.senior._id.toString() !== req.user._id.toString() &&
        request.volunteer?._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have permission to view this request'
      });
    }

    res.json({
      success: true,
      data: {
        request
      }
    });
  } catch (error) {
    console.error('Get request error:', error);
    res.status(500).json({
      error: 'Failed to get request',
      message: 'An error occurred while fetching the request'
    });
  }
});

// @route   PUT /api/requests/:id
// @desc    Update a request
// @access  Private
router.put('/:id', protect, validateRequestUpdate, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        error: 'Request not found',
        message: 'The requested help request was not found'
      });
    }

    // Check if user can update this request
    if (req.user.role !== 'admin' && 
        request.senior.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only update your own requests'
      });
    }

    // Update request
    const updatedRequest = await Request.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    .populate('senior', 'name age rating location')
    .populate('volunteer', 'name rating');

    res.json({
      success: true,
      message: 'Request updated successfully',
      data: {
        request: updatedRequest
      }
    });
  } catch (error) {
    console.error('Update request error:', error);
    res.status(500).json({
      error: 'Request update failed',
      message: 'An error occurred while updating the request'
    });
  }
});

// @route   POST /api/requests/:id/accept
// @desc    Accept a request (volunteers only)
// @access  Private (Volunteers only)
router.post('/:id/accept', protect, isVolunteer, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        error: 'Request not found',
        message: 'The requested help request was not found'
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        error: 'Request not available',
        message: 'This request is no longer available for acceptance'
      });
    }

    // Check if volunteer is already assigned to this request
    if (request.volunteer && request.volunteer.toString() === req.user._id.toString()) {
      return res.status(400).json({
        error: 'Already accepted',
        message: 'You have already accepted this request'
      });
    }

    // Update request
    request.volunteer = req.user._id;
    await request.updateStatus('accepted');

    // Create notification for the senior
    await Notification.createNotification({
      user: request.senior,
      type: 'request_accepted',
      title: 'Request Accepted!',
      message: `${req.user.name} has accepted your request "${request.title}". They will contact you soon.`,
      relatedRequest: request._id,
      relatedUser: req.user._id,
      priority: 'high'
    });

    // Populate user info
    await request.populate('senior', 'name age rating location');
    await request.populate('volunteer', 'name rating');

    res.json({
      success: true,
      message: 'Request accepted successfully',
      data: {
        request
      }
    });
  } catch (error) {
    console.error('Accept request error:', error);
    res.status(500).json({
      error: 'Request acceptance failed',
      message: 'An error occurred while accepting the request'
    });
  }
});

// @route   POST /api/requests/:id/complete
// @desc    Mark request as completed
// @access  Private
router.post('/:id/complete', protect, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        error: 'Request not found',
        message: 'The requested help request was not found'
      });
    }

    // Check if user can complete this request
    if (req.user.role !== 'admin' && 
        request.senior.toString() !== req.user._id.toString() &&
        request.volunteer?.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'Only the senior who created the request or the assigned volunteer can complete this request'
      });
    }

    if (request.status !== 'accepted' && request.status !== 'in-progress') {
      return res.status(400).json({
        error: 'Invalid status',
        message: 'Request must be accepted or in progress to be completed'
      });
    }

    // Update request
    await request.updateStatus('completed');

    // Update volunteer stats
    if (request.volunteer) {
      await User.findByIdAndUpdate(request.volunteer, {
        $inc: { completedRequests: 1 }
      });

      // Create notification for the volunteer
      await Notification.createNotification({
        user: request.volunteer,
        type: 'request_completed',
        title: 'Request Completed!',
        message: `The request "${request.title}" has been marked as completed by the senior.`,
        relatedRequest: request._id,
        relatedUser: req.user._id,
        priority: 'medium'
      });
    }

    // Create notification for the senior
    await Notification.createNotification({
      user: request.senior,
      type: 'request_completed',
      title: 'Request Completed!',
      message: `Your request "${request.title}" has been marked as completed. Thank you for using CareConnect!`,
      relatedRequest: request._id,
      priority: 'medium'
    });

    res.json({
      success: true,
      message: 'Request completed successfully'
    });
  } catch (error) {
    console.error('Complete request error:', error);
    res.status(500).json({
      error: 'Request completion failed',
      message: 'An error occurred while completing the request'
    });
  }
});

// @route   POST /api/requests/:id/cancel
// @desc    Cancel a request
// @access  Private
router.post('/:id/cancel', protect, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        error: 'Request not found',
        message: 'The requested help request was not found'
      });
    }

    // Check if user can cancel this request
    if (req.user.role !== 'admin' && 
        request.senior.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only cancel your own requests'
      });
    }

    if (request.status === 'completed' || request.status === 'cancelled') {
      return res.status(400).json({
        error: 'Cannot cancel',
        message: 'This request cannot be cancelled'
      });
    }

    // Update request
    await request.updateStatus('cancelled');

    res.json({
      success: true,
      message: 'Request cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel request error:', error);
    res.status(500).json({
      error: 'Request cancellation failed',
      message: 'An error occurred while cancelling the request'
    });
  }
});

// @route   POST /api/requests/:id/message
// @desc    Add a message to a request
// @access  Private
router.post('/:id/message', protect, async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        error: 'Message required',
        message: 'Please provide a message'
      });
    }

    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        error: 'Request not found',
        message: 'The requested help request was not found'
      });
    }

    // Check if user can message this request
    if (req.user.role !== 'admin' && 
        request.senior.toString() !== req.user._id.toString() &&
        request.volunteer?.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only message requests you are involved with'
      });
    }

    // Add message
    await request.addMessage(req.user._id, message);

    // Populate sender info
    await request.populate('messages.sender', 'name');

    res.json({
      success: true,
      message: 'Message sent successfully',
      data: {
        message: request.messages[request.messages.length - 1]
      }
    });
  } catch (error) {
    console.error('Add message error:', error);
    res.status(500).json({
      error: 'Message sending failed',
      message: 'An error occurred while sending the message'
    });
  }
});

// @route   POST /api/requests/:id/rate
// @desc    Rate a completed request
// @access  Private
router.post('/:id/rate', protect, async (req, res) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        error: 'Invalid rating',
        message: 'Rating must be between 1 and 5'
      });
    }

    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        error: 'Request not found',
        message: 'The requested help request was not found'
      });
    }

    // Check if user can rate this request
    if (req.user.role !== 'admin' && 
        request.senior.toString() !== req.user._id.toString() &&
        request.volunteer?.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only rate requests you are involved with'
      });
    }

    if (request.status !== 'completed') {
      return res.status(400).json({
        error: 'Cannot rate',
        message: 'You can only rate completed requests'
      });
    }

    // Rate request
    await request.rateRequest(req.user._id, rating, comment);

    res.json({
      success: true,
      message: 'Rating submitted successfully'
    });
  } catch (error) {
    console.error('Rate request error:', error);
    res.status(500).json({
      error: 'Rating submission failed',
      message: 'An error occurred while submitting the rating'
    });
  }
});

// @route   DELETE /api/requests/:id
// @desc    Delete a request
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        error: 'Request not found',
        message: 'The requested help request was not found'
      });
    }

    // Check if user can delete this request
    if (req.user.role !== 'admin' && 
        request.senior.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only delete your own requests'
      });
    }

    // Only allow deletion of pending requests
    if (request.status !== 'pending') {
      return res.status(400).json({
        error: 'Cannot delete',
        message: 'You can only delete pending requests'
      });
    }

    await Request.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Request deleted successfully'
    });
  } catch (error) {
    console.error('Delete request error:', error);
    res.status(500).json({
      error: 'Request deletion failed',
      message: 'An error occurred while deleting the request'
    });
  }
});

module.exports = router; 