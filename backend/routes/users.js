const express = require('express');
const User = require('../models/User');
const { protect, isAdmin } = require('../middleware/auth');
const { validateProfileUpdate, validatePagination } = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users (admin only)
// @access  Private (Admin only)
router.get('/', protect, isAdmin, validatePagination, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      role,
      sort = 'createdAt',
      order = 'desc'
    } = req.query;

    const skip = (page - 1) * limit;
    const sortOrder = order === 'asc' ? 1 : -1;

    // Build query
    const query = {};
    if (role) query.role = role;

    // Get users
    const users = await User.find(query)
      .select('-password')
      .sort({ [sort]: sortOrder })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      error: 'Failed to get users',
      message: 'An error occurred while fetching users'
    });
  }
});

// @route   GET /api/users/nearby
// @desc    Get nearby users
// @access  Private
router.get('/nearby', protect, async (req, res) => {
  try {
    const { lat, lng, maxDistance = 10, role } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        error: 'Location required',
        message: 'Please provide your location coordinates'
      });
    }

    const coordinates = [parseFloat(lng), parseFloat(lat)];
    const distance = parseFloat(maxDistance);

    const users = await User.findNearby(coordinates, distance, role);

    res.json({
      success: true,
      data: {
        users: users.map(user => user.getPublicProfile()),
        location: { lat, lng },
        maxDistance: distance
      }
    });
  } catch (error) {
    console.error('Get nearby users error:', error);
    res.status(500).json({
      error: 'Failed to get nearby users',
      message: 'An error occurred while fetching nearby users'
    });
  }
});

// @route   GET /api/users/:id
// @desc    Get a specific user
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'The requested user was not found'
      });
    }

    // Check if user has access to this profile
    if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only view your own profile'
      });
    }

    res.json({
      success: true,
      data: {
        user: user.getPublicProfile()
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      error: 'Failed to get user',
      message: 'An error occurred while fetching the user'
    });
  }
});

// @route   PUT /api/users/:id
// @desc    Update a user profile
// @access  Private
router.put('/:id', protect, validateProfileUpdate, async (req, res) => {
  try {
    // Check if user can update this profile
    if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only update your own profile'
      });
    }

    const updateFields = {};
    const allowedFields = [
      'name', 'phone', 'address', 'emergencyContact', 
      'preferences', 'profileImage', 'location'
    ];

    // Only update allowed fields
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateFields[field] = req.body[field];
      }
    });

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: updatedUser.getPublicProfile()
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      error: 'Profile update failed',
      message: 'An error occurred while updating the profile'
    });
  }
});

// @route   PUT /api/users/:id/verify
// @desc    Verify a user (admin only)
// @access  Private (Admin only)
router.put('/:id/verify', protect, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'The requested user was not found'
      });
    }

    user.isVerified = true;
    await user.save();

    res.json({
      success: true,
      message: 'User verified successfully',
      data: {
        user: user.getPublicProfile()
      }
    });
  } catch (error) {
    console.error('Verify user error:', error);
    res.status(500).json({
      error: 'User verification failed',
      message: 'An error occurred while verifying the user'
    });
  }
});

// @route   PUT /api/users/:id/activate
// @desc    Activate/deactivate a user (admin only)
// @access  Private (Admin only)
router.put('/:id/activate', protect, isAdmin, async (req, res) => {
  try {
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        error: 'Invalid status',
        message: 'isActive must be a boolean value'
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'The requested user was not found'
      });
    }

    user.isActive = isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        user: user.getPublicProfile()
      }
    });
  } catch (error) {
    console.error('Activate user error:', error);
    res.status(500).json({
      error: 'User activation failed',
      message: 'An error occurred while updating the user status'
    });
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete a user (admin only)
// @access  Private (Admin only)
router.delete('/:id', protect, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'The requested user was not found'
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      error: 'User deletion failed',
      message: 'An error occurred while deleting the user'
    });
  }
});

module.exports = router; 