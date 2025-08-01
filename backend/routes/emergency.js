const express = require('express');
const User = require('../models/User');
const Request = require('../models/Request');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/emergency/sos
// @desc    Send emergency SOS alert
// @access  Private
router.post('/sos', protect, async (req, res) => {
  try {
    const { location, description, emergencyType } = req.body;

    // Create emergency request
    const emergencyRequest = new Request({
      senior: req.user._id,
      category: 'medical',
      title: `EMERGENCY SOS - ${emergencyType || 'Medical Emergency'}`,
      description: description || 'Emergency assistance needed immediately',
      urgency: 'high',
      isEmergency: true,
      schedule: {
        preferredDate: new Date(),
        preferredTime: 'immediate',
        duration: 'as-needed'
      },
      location: {
        address: location?.address || req.user.address?.street || 'Location not specified',
        coordinates: location?.coordinates || req.user.location?.coordinates || [0, 0]
      },
      status: 'pending'
    });

    await emergencyRequest.save();

    // Find nearby volunteers
    const nearbyVolunteers = await User.findNearby(
      emergencyRequest.location.coordinates.coordinates,
      5, // 5km radius for emergencies
      'volunteer'
    );

    // TODO: Send notifications to nearby volunteers
    // This would integrate with push notifications or SMS

    res.status(201).json({
      success: true,
      message: 'Emergency SOS sent successfully',
      data: {
        emergencyRequest,
        nearbyVolunteers: nearbyVolunteers.length,
        emergencyContacts: req.user.emergencyContact ? [req.user.emergencyContact] : []
      }
    });
  } catch (error) {
    console.error('Emergency SOS error:', error);
    res.status(500).json({
      error: 'Emergency SOS failed',
      message: 'An error occurred while sending the emergency alert'
    });
  }
});

// @route   GET /api/emergency/contacts
// @desc    Get emergency contacts
// @access  Private
router.get('/contacts', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    const emergencyContacts = [];
    
    // Add user's emergency contact
    if (user.emergencyContact) {
      emergencyContacts.push(user.emergencyContact);
    }
    
    // Add default emergency services
    emergencyContacts.push({
      name: 'Emergency Services',
      relationship: 'Emergency',
      phone: process.env.EMERGENCY_PHONE || '112',
      email: process.env.SUPPORT_EMAIL || 'emergency@careconnect.com'
    });

    res.json({
      success: true,
      data: {
        emergencyContacts
      }
    });
  } catch (error) {
    console.error('Get emergency contacts error:', error);
    res.status(500).json({
      error: 'Failed to get emergency contacts',
      message: 'An error occurred while fetching emergency contacts'
    });
  }
});

// @route   POST /api/emergency/alert
// @desc    Send emergency alert to contacts
// @access  Private
router.post('/alert', protect, async (req, res) => {
  try {
    const { message, contacts } = req.body;

    if (!message) {
      return res.status(400).json({
        error: 'Message required',
        message: 'Please provide an emergency message'
      });
    }

    // TODO: Implement actual notification sending
    // This would integrate with SMS, email, or push notification services

    res.json({
      success: true,
      message: 'Emergency alert sent successfully',
      data: {
        sentTo: contacts?.length || 0,
        message
      }
    });
  } catch (error) {
    console.error('Emergency alert error:', error);
    res.status(500).json({
      error: 'Emergency alert failed',
      message: 'An error occurred while sending the emergency alert'
    });
  }
});

// @route   GET /api/emergency/nearby-help
// @desc    Get nearby emergency help
// @access  Private
router.get('/nearby-help', protect, async (req, res) => {
  try {
    const { lat, lng, maxDistance = 5 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        error: 'Location required',
        message: 'Please provide your location coordinates'
      });
    }

    const coordinates = [parseFloat(lng), parseFloat(lat)];
    const distance = parseFloat(maxDistance);

    // Find nearby volunteers
    const nearbyVolunteers = await User.findNearby(coordinates, distance, 'volunteer');

    // Find nearby medical facilities (mock data)
    const medicalFacilities = [
      {
        name: 'Lilavati Hospital',
        type: 'Hospital',
        distance: '1.2 km',
        phone: '+91-22-26751000',
        address: 'A-791, Bandra Reclamation, Bandra (W), Mumbai - 400050'
      },
      {
        name: 'Kokilaben Dhirubhai Ambani Hospital',
        type: 'Hospital',
        distance: '2.8 km',
        phone: '+91-22-30999999',
        address: 'Rao Saheb Achutrao Patwardhan Marg, Four Bunglows, Andheri (W), Mumbai - 400058'
      }
    ];

    res.json({
      success: true,
      data: {
        nearbyVolunteers: nearbyVolunteers.map(volunteer => volunteer.getPublicProfile()),
        medicalFacilities,
        location: { lat, lng },
        maxDistance: distance
      }
    });
  } catch (error) {
    console.error('Get nearby help error:', error);
    res.status(500).json({
      error: 'Failed to get nearby help',
      message: 'An error occurred while fetching nearby emergency help'
    });
  }
});

// @route   POST /api/emergency/check-in
// @desc    Emergency check-in
// @access  Private
router.post('/check-in', protect, async (req, res) => {
  try {
    const { location, status, notes } = req.body;

    // Update user's last active and location
    await User.findByIdAndUpdate(req.user._id, {
      lastActive: new Date(),
      location: location || req.user.location
    });

    res.json({
      success: true,
      message: 'Emergency check-in successful',
      data: {
        timestamp: new Date(),
        location: location || req.user.location,
        status,
        notes
      }
    });
  } catch (error) {
    console.error('Emergency check-in error:', error);
    res.status(500).json({
      error: 'Emergency check-in failed',
      message: 'An error occurred during emergency check-in'
    });
  }
});

// @route   GET /api/emergency/status
// @desc    Get emergency status
// @access  Private
router.get('/status', protect, async (req, res) => {
  try {
    // Get user's emergency requests
    const emergencyRequests = await Request.find({
      senior: req.user._id,
      isEmergency: true
    })
    .sort({ createdAt: -1 })
    .limit(5);

    // Get user's emergency contact info
    const user = await User.findById(req.user._id);
    
    res.json({
      success: true,
      data: {
        emergencyRequests,
        emergencyContact: user.emergencyContact,
        lastActive: user.lastActive,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Get emergency status error:', error);
    res.status(500).json({
      error: 'Failed to get emergency status',
      message: 'An error occurred while fetching emergency status'
    });
  }
});

module.exports = router; 