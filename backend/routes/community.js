const express = require('express');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Mock data for community events
const communityEvents = [
  {
    id: 1,
    title: 'Senior Wellness Workshop',
    description: 'Join us for a comprehensive wellness workshop covering nutrition, exercise, and mental health.',
    date: '2024-02-15',
    time: '10:00 AM - 2:00 PM',
    location: 'Community Center, Andheri West',
    organizer: 'CareConnect Community',
    category: 'wellness',
    maxParticipants: 50,
    currentParticipants: 25,
    isFree: true,
    image: '/images/wellness-workshop.jpg'
  },
  {
    id: 2,
    title: 'Technology Training for Seniors',
    description: 'Learn to use smartphones, tablets, and computers effectively. Basic to advanced level training.',
    date: '2024-02-20',
    time: '2:00 PM - 4:00 PM',
    location: 'Digital Learning Center, Bandra',
    organizer: 'Tech for Seniors',
    category: 'technology',
    maxParticipants: 30,
    currentParticipants: 18,
    isFree: false,
    price: '₹500',
    image: '/images/tech-training.jpg'
  },
  {
    id: 3,
    title: 'Social Meet & Greet',
    description: 'A casual gathering for seniors to meet new people, share stories, and build friendships.',
    date: '2024-02-25',
    time: '4:00 PM - 6:00 PM',
    location: 'Garden Café, Juhu',
    organizer: 'Senior Social Club',
    category: 'social',
    maxParticipants: 40,
    currentParticipants: 32,
    isFree: true,
    image: '/images/social-meet.jpg'
  },
  {
    id: 4,
    title: 'Health Check-up Camp',
    description: 'Free health check-up including blood pressure, blood sugar, and general consultation.',
    date: '2024-03-01',
    time: '9:00 AM - 5:00 PM',
    location: 'Local Hospital, Santacruz',
    organizer: 'Health First Foundation',
    category: 'health',
    maxParticipants: 100,
    currentParticipants: 75,
    isFree: true,
    image: '/images/health-camp.jpg'
  }
];

// @route   GET /api/community/events
// @desc    Get community events
// @access  Private
router.get('/events', protect, async (req, res) => {
  try {
    const { category, date, search } = req.query;

    let filteredEvents = [...communityEvents];

    // Filter by category
    if (category) {
      filteredEvents = filteredEvents.filter(event => event.category === category);
    }

    // Filter by date
    if (date) {
      filteredEvents = filteredEvents.filter(event => event.date === date);
    }

    // Search by title or description
    if (search) {
      const searchLower = search.toLowerCase();
      filteredEvents = filteredEvents.filter(event => 
        event.title.toLowerCase().includes(searchLower) ||
        event.description.toLowerCase().includes(searchLower)
      );
    }

    res.json({
      success: true,
      data: {
        events: filteredEvents,
        total: filteredEvents.length
      }
    });
  } catch (error) {
    console.error('Get community events error:', error);
    res.status(500).json({
      error: 'Failed to get community events',
      message: 'An error occurred while fetching community events'
    });
  }
});

// @route   GET /api/community/events/:id
// @desc    Get a specific community event
// @access  Private
router.get('/events/:id', protect, async (req, res) => {
  try {
    const event = communityEvents.find(e => e.id === parseInt(req.params.id));

    if (!event) {
      return res.status(404).json({
        error: 'Event not found',
        message: 'The requested community event was not found'
      });
    }

    res.json({
      success: true,
      data: {
        event
      }
    });
  } catch (error) {
    console.error('Get community event error:', error);
    res.status(500).json({
      error: 'Failed to get community event',
      message: 'An error occurred while fetching the community event'
    });
  }
});

// @route   POST /api/community/events/:id/register
// @desc    Register for a community event
// @access  Private
router.post('/events/:id/register', protect, async (req, res) => {
  try {
    const event = communityEvents.find(e => e.id === parseInt(req.params.id));

    if (!event) {
      return res.status(404).json({
        error: 'Event not found',
        message: 'The requested community event was not found'
      });
    }

    // Check if event is full
    if (event.currentParticipants >= event.maxParticipants) {
      return res.status(400).json({
        error: 'Event is full',
        message: 'This event has reached its maximum capacity'
      });
    }

    // TODO: Add user to event participants in database
    // For now, just return success

    res.json({
      success: true,
      message: 'Successfully registered for the event',
      data: {
        eventId: event.id,
        eventTitle: event.title,
        registrationDate: new Date()
      }
    });
  } catch (error) {
    console.error('Event registration error:', error);
    res.status(500).json({
      error: 'Event registration failed',
      message: 'An error occurred while registering for the event'
    });
  }
});

// @route   GET /api/community/resources
// @desc    Get community resources
// @access  Private
router.get('/resources', protect, async (req, res) => {
  try {
    const resources = [
      {
        id: 1,
        title: 'Senior Care Guide',
        description: 'Comprehensive guide for senior care and wellness',
        type: 'pdf',
        url: '/resources/senior-care-guide.pdf',
        category: 'health'
      },
      {
        id: 2,
        title: 'Emergency Contact Directory',
        description: 'Directory of emergency contacts and services',
        type: 'pdf',
        url: '/resources/emergency-contacts.pdf',
        category: 'emergency'
      },
      {
        id: 3,
        title: 'Technology Tips for Seniors',
        description: 'Helpful tips for using technology safely',
        type: 'video',
        url: '/resources/tech-tips.mp4',
        category: 'technology'
      },
      {
        id: 4,
        title: 'Local Support Groups',
        description: 'Directory of local support groups and communities',
        type: 'pdf',
        url: '/resources/support-groups.pdf',
        category: 'social'
      }
    ];

    res.json({
      success: true,
      data: {
        resources
      }
    });
  } catch (error) {
    console.error('Get community resources error:', error);
    res.status(500).json({
      error: 'Failed to get community resources',
      message: 'An error occurred while fetching community resources'
    });
  }
});

// @route   GET /api/community/support-groups
// @desc    Get support groups
// @access  Private
router.get('/support-groups', protect, async (req, res) => {
  try {
    const supportGroups = [
      {
        id: 1,
        name: 'Diabetes Support Group',
        description: 'A supportive community for people managing diabetes',
        meetingDay: 'Every Tuesday',
        meetingTime: '6:00 PM - 7:30 PM',
        location: 'Community Health Center, Andheri',
        contactPerson: 'Dr. Priya Sharma',
        contactPhone: '+91-98765-43210',
        category: 'health'
      },
      {
        id: 2,
        name: 'Technology Learning Group',
        description: 'Learn and share technology tips with fellow seniors',
        meetingDay: 'Every Saturday',
        meetingTime: '10:00 AM - 12:00 PM',
        location: 'Digital Learning Center, Bandra',
        contactPerson: 'Mr. Rajesh Kumar',
        contactPhone: '+91-98765-43211',
        category: 'technology'
      },
      {
        id: 3,
        name: 'Social Activities Group',
        description: 'Fun activities and social events for seniors',
        meetingDay: 'Every Sunday',
        meetingTime: '4:00 PM - 6:00 PM',
        location: 'Garden Café, Juhu',
        contactPerson: 'Mrs. Meera Patel',
        contactPhone: '+91-98765-43212',
        category: 'social'
      }
    ];

    res.json({
      success: true,
      data: {
        supportGroups
      }
    });
  } catch (error) {
    console.error('Get support groups error:', error);
    res.status(500).json({
      error: 'Failed to get support groups',
      message: 'An error occurred while fetching support groups'
    });
  }
});

// @route   GET /api/community/volunteer-opportunities
// @desc    Get volunteer opportunities
// @access  Private
router.get('/volunteer-opportunities', protect, async (req, res) => {
  try {
    const opportunities = [
      {
        id: 1,
        title: 'Teaching Assistant',
        description: 'Help teach basic computer skills to seniors',
        organization: 'Tech for Seniors',
        location: 'Digital Learning Center, Bandra',
        commitment: '2 hours per week',
        requirements: 'Basic computer knowledge, patience',
        contactPerson: 'Mr. Rajesh Kumar',
        contactPhone: '+91-98765-43211',
        category: 'education'
      },
      {
        id: 2,
        title: 'Health Camp Volunteer',
        description: 'Assist in organizing health check-up camps',
        organization: 'Health First Foundation',
        location: 'Various locations in Mumbai',
        commitment: '4 hours per month',
        requirements: 'Medical background preferred',
        contactPerson: 'Dr. Priya Sharma',
        contactPhone: '+91-98765-43210',
        category: 'health'
      },
      {
        id: 3,
        title: 'Social Event Coordinator',
        description: 'Help organize social events and activities',
        organization: 'Senior Social Club',
        location: 'Garden Café, Juhu',
        commitment: '3 hours per month',
        requirements: 'Good communication skills, event planning experience',
        contactPerson: 'Mrs. Meera Patel',
        contactPhone: '+91-98765-43212',
        category: 'social'
      }
    ];

    res.json({
      success: true,
      data: {
        opportunities
      }
    });
  } catch (error) {
    console.error('Get volunteer opportunities error:', error);
    res.status(500).json({
      error: 'Failed to get volunteer opportunities',
      message: 'An error occurred while fetching volunteer opportunities'
    });
  }
});

module.exports = router; 