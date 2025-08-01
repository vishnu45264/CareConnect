const express = require('express');
const HealthRecord = require('../models/HealthRecord');
const { protect } = require('../middleware/auth');
const { validateHealthRecord, validatePagination } = require('../middleware/validation');

const router = express.Router();

// @route   POST /api/health
// @desc    Create a new health record
// @access  Private
router.post('/', protect, validateHealthRecord, async (req, res) => {
  try {
    const { type, medication, metric, appointment } = req.body;

    // Create health record
    const healthRecord = new HealthRecord({
      user: req.user._id,
      type,
      medication,
      metric,
      appointment
    });

    await healthRecord.save();

    res.status(201).json({
      success: true,
      message: 'Health record created successfully',
      data: {
        healthRecord
      }
    });
  } catch (error) {
    console.error('Health record creation error:', error);
    res.status(500).json({
      error: 'Health record creation failed',
      message: 'An error occurred while creating the health record'
    });
  }
});

// @route   GET /api/health
// @desc    Get user's health records
// @access  Private
router.get('/', protect, validatePagination, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      type,
      sort = 'createdAt',
      order = 'desc'
    } = req.query;

    const skip = (page - 1) * limit;
    const sortOrder = order === 'asc' ? 1 : -1;

    // Build query
    const query = { user: req.user._id };
    if (type) query.type = type;

    // Get health records
    const healthRecords = await HealthRecord.find(query)
      .sort({ [sort]: sortOrder })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await HealthRecord.countDocuments(query);

    res.json({
      success: true,
      data: {
        healthRecords,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get health records error:', error);
    res.status(500).json({
      error: 'Failed to get health records',
      message: 'An error occurred while fetching health records'
    });
  }
});

// @route   GET /api/health/medications
// @desc    Get user's active medications
// @access  Private
router.get('/medications', protect, async (req, res) => {
  try {
    const medications = await HealthRecord.getActiveMedications(req.user._id);

    res.json({
      success: true,
      data: {
        medications
      }
    });
  } catch (error) {
    console.error('Get medications error:', error);
    res.status(500).json({
      error: 'Failed to get medications',
      message: 'An error occurred while fetching medications'
    });
  }
});

// @route   GET /api/health/metrics
// @desc    Get user's recent health metrics
// @access  Private
router.get('/metrics', protect, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const metrics = await HealthRecord.getRecentMetrics(req.user._id, parseInt(limit));

    res.json({
      success: true,
      data: {
        metrics
      }
    });
  } catch (error) {
    console.error('Get metrics error:', error);
    res.status(500).json({
      error: 'Failed to get metrics',
      message: 'An error occurred while fetching health metrics'
    });
  }
});

// @route   GET /api/health/appointments
// @desc    Get user's upcoming appointments
// @access  Private
router.get('/appointments', protect, async (req, res) => {
  try {
    const appointments = await HealthRecord.getUpcomingAppointments(req.user._id);

    res.json({
      success: true,
      data: {
        appointments
      }
    });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({
      error: 'Failed to get appointments',
      message: 'An error occurred while fetching appointments'
    });
  }
});

// @route   GET /api/health/adherence
// @desc    Get medication adherence statistics
// @access  Private
router.get('/adherence', protect, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const adherence = await HealthRecord.getMedicationAdherence(req.user._id, parseInt(days));

    res.json({
      success: true,
      data: {
        adherence
      }
    });
  } catch (error) {
    console.error('Get adherence error:', error);
    res.status(500).json({
      error: 'Failed to get adherence data',
      message: 'An error occurred while fetching adherence statistics'
    });
  }
});

// @route   GET /api/health/:id
// @desc    Get a specific health record
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const healthRecord = await HealthRecord.findById(req.params.id);

    if (!healthRecord) {
      return res.status(404).json({
        error: 'Health record not found',
        message: 'The requested health record was not found'
      });
    }

    // Check if user owns this record
    if (healthRecord.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only view your own health records'
      });
    }

    res.json({
      success: true,
      data: {
        healthRecord
      }
    });
  } catch (error) {
    console.error('Get health record error:', error);
    res.status(500).json({
      error: 'Failed to get health record',
      message: 'An error occurred while fetching the health record'
    });
  }
});

// @route   PUT /api/health/:id
// @desc    Update a health record
// @access  Private
router.put('/:id', protect, validateHealthRecord, async (req, res) => {
  try {
    const healthRecord = await HealthRecord.findById(req.params.id);

    if (!healthRecord) {
      return res.status(404).json({
        error: 'Health record not found',
        message: 'The requested health record was not found'
      });
    }

    // Check if user owns this record
    if (healthRecord.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only update your own health records'
      });
    }

    // Update health record
    const updatedHealthRecord = await HealthRecord.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Health record updated successfully',
      data: {
        healthRecord: updatedHealthRecord
      }
    });
  } catch (error) {
    console.error('Update health record error:', error);
    res.status(500).json({
      error: 'Health record update failed',
      message: 'An error occurred while updating the health record'
    });
  }
});

// @route   POST /api/health/:id/taken
// @desc    Mark medication as taken
// @access  Private
router.post('/:id/taken', protect, async (req, res) => {
  try {
    const healthRecord = await HealthRecord.findById(req.params.id);

    if (!healthRecord) {
      return res.status(404).json({
        error: 'Health record not found',
        message: 'The requested health record was not found'
      });
    }

    // Check if user owns this record
    if (healthRecord.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only update your own health records'
      });
    }

    // Check if it's a medication record
    if (healthRecord.type !== 'medication') {
      return res.status(400).json({
        error: 'Invalid record type',
        message: 'You can only mark medications as taken'
      });
    }

    // Mark as taken
    await healthRecord.markTaken();

    res.json({
      success: true,
      message: 'Medication marked as taken successfully'
    });
  } catch (error) {
    console.error('Mark medication taken error:', error);
    res.status(500).json({
      error: 'Failed to mark medication as taken',
      message: 'An error occurred while marking the medication as taken'
    });
  }
});

// @route   POST /api/health/:id/reading
// @desc    Add a new metric reading
// @access  Private
router.post('/:id/reading', protect, async (req, res) => {
  try {
    const { value, unit, status, notes } = req.body;

    if (!value || !unit) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Value and unit are required for metric readings'
      });
    }

    const healthRecord = await HealthRecord.findById(req.params.id);

    if (!healthRecord) {
      return res.status(404).json({
        error: 'Health record not found',
        message: 'The requested health record was not found'
      });
    }

    // Check if user owns this record
    if (healthRecord.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only update your own health records'
      });
    }

    // Check if it's a metric record
    if (healthRecord.type !== 'metric') {
      return res.status(400).json({
        error: 'Invalid record type',
        message: 'You can only add readings to metric records'
      });
    }

    // Add reading
    await healthRecord.addMetricReading(value, unit, status, notes);

    res.json({
      success: true,
      message: 'Metric reading added successfully'
    });
  } catch (error) {
    console.error('Add metric reading error:', error);
    res.status(500).json({
      error: 'Failed to add metric reading',
      message: 'An error occurred while adding the metric reading'
    });
  }
});

// @route   POST /api/health/:id/status
// @desc    Update appointment status
// @access  Private
router.post('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        error: 'Status required',
        message: 'Please provide a status'
      });
    }

    const healthRecord = await HealthRecord.findById(req.params.id);

    if (!healthRecord) {
      return res.status(404).json({
        error: 'Health record not found',
        message: 'The requested health record was not found'
      });
    }

    // Check if user owns this record
    if (healthRecord.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only update your own health records'
      });
    }

    // Check if it's an appointment record
    if (healthRecord.type !== 'appointment') {
      return res.status(400).json({
        error: 'Invalid record type',
        message: 'You can only update appointment status'
      });
    }

    // Update status
    await healthRecord.updateAppointmentStatus(status);

    res.json({
      success: true,
      message: 'Appointment status updated successfully'
    });
  } catch (error) {
    console.error('Update appointment status error:', error);
    res.status(500).json({
      error: 'Failed to update appointment status',
      message: 'An error occurred while updating the appointment status'
    });
  }
});

// @route   DELETE /api/health/:id
// @desc    Delete a health record
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const healthRecord = await HealthRecord.findById(req.params.id);

    if (!healthRecord) {
      return res.status(404).json({
        error: 'Health record not found',
        message: 'The requested health record was not found'
      });
    }

    // Check if user owns this record
    if (healthRecord.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only delete your own health records'
      });
    }

    await HealthRecord.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Health record deleted successfully'
    });
  } catch (error) {
    console.error('Delete health record error:', error);
    res.status(500).json({
      error: 'Health record deletion failed',
      message: 'An error occurred while deleting the health record'
    });
  }
});

module.exports = router; 