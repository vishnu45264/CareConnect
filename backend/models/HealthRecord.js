const mongoose = require('mongoose');

const healthRecordSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  type: {
    type: String,
    enum: ['medication', 'metric', 'appointment'],
    required: [true, 'Record type is required']
  },
  
  // Medication specific fields
  medication: {
    name: {
      type: String,
      required: function() { return this.type === 'medication'; }
    },
    dosage: {
      type: String,
      required: function() { return this.type === 'medication'; }
    },
    frequency: {
      type: String,
      enum: ['once-daily', 'twice-daily', 'thrice-daily', 'as-needed'],
      required: function() { return this.type === 'medication'; }
    },
    instructions: String,
    startDate: {
      type: Date,
      required: function() { return this.type === 'medication'; }
    },
    endDate: Date,
    isActive: {
      type: Boolean,
      default: true
    },
    reminders: [{
      time: {
        type: String,
        required: true
      },
      isEnabled: {
        type: Boolean,
        default: true
      }
    }],
    takenHistory: [{
      date: {
        type: Date,
        required: true
      },
      time: {
        type: String,
        required: true
      },
      taken: {
        type: Boolean,
        default: true
      },
      notes: String
    }]
  },
  
  // Health metric specific fields
  metric: {
    name: {
      type: String,
      enum: ['blood-pressure', 'blood-sugar', 'weight', 'heart-rate', 'temperature', 'oxygen-saturation'],
      required: function() { return this.type === 'metric'; }
    },
    value: {
      type: String,
      required: function() { return this.type === 'metric'; }
    },
    unit: {
      type: String,
      required: function() { return this.type === 'metric'; }
    },
    status: {
      type: String,
      enum: ['normal', 'high', 'low', 'critical'],
      default: 'normal'
    },
    trend: {
      type: String,
      enum: ['improving', 'stable', 'worsening'],
      default: 'stable'
    },
    notes: String,
    measuredAt: {
      type: Date,
      default: Date.now
    }
  },
  
  // Appointment specific fields
  appointment: {
    doctor: {
      type: String,
      required: function() { return this.type === 'appointment'; }
    },
    specialty: {
      type: String,
      required: function() { return this.type === 'appointment'; }
    },
    date: {
      type: Date,
      required: function() { return this.type === 'appointment'; }
    },
    time: {
      type: String,
      required: function() { return this.type === 'appointment'; }
    },
    location: {
      type: String,
      required: function() { return this.type === 'appointment'; }
    },
    type: {
      type: String,
      enum: ['checkup', 'follow-up', 'emergency', 'consultation'],
      default: 'checkup'
    },
    status: {
      type: String,
      enum: ['scheduled', 'confirmed', 'completed', 'cancelled', 'rescheduled'],
      default: 'scheduled'
    },
    notes: String,
    reminderSent: {
      type: Boolean,
      default: false
    }
  },
  
  // Common fields
  isEmergency: {
    type: Boolean,
    default: false
  },
  tags: [String],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
healthRecordSchema.index({ user: 1, type: 1 });
healthRecordSchema.index({ user: 1, 'medication.isActive': 1 });
healthRecordSchema.index({ user: 1, 'metric.measuredAt': -1 });
healthRecordSchema.index({ user: 1, 'appointment.date': 1 });

// Virtual for medication next dose
healthRecordSchema.virtual('nextDose').get(function() {
  if (this.type !== 'medication' || !this.medication.reminders.length) return null;
  
  const now = new Date();
  const today = now.toDateString();
  const nextReminder = this.medication.reminders.find(reminder => {
    if (!reminder.isEnabled) return false;
    const reminderTime = new Date(`${today} ${reminder.time}`);
    return reminderTime > now;
  });
  
  return nextReminder ? nextReminder.time : this.medication.reminders[0]?.time;
});

// Virtual for medication last taken
healthRecordSchema.virtual('lastTaken').get(function() {
  if (this.type !== 'medication' || !this.medication.takenHistory.length) return null;
  
  const lastEntry = this.medication.takenHistory
    .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
  
  return lastEntry ? `${lastEntry.date.toDateString()} ${lastEntry.time}` : null;
});

// Method to mark medication as taken
healthRecordSchema.methods.markTaken = function(time = new Date().toLocaleTimeString()) {
  if (this.type !== 'medication') {
    throw new Error('Can only mark medications as taken');
  }
  
  this.medication.takenHistory.push({
    date: new Date(),
    time: time,
    taken: true
  });
  
  return this.save();
};

// Method to add metric reading
healthRecordSchema.methods.addMetricReading = function(value, unit, status = 'normal', notes = '') {
  if (this.type !== 'metric') {
    throw new Error('Can only add readings to metric records');
  }
  
  this.metric.value = value;
  this.metric.unit = unit;
  this.metric.status = status;
  this.metric.notes = notes;
  this.metric.measuredAt = new Date();
  
  return this.save();
};

// Method to update appointment status
healthRecordSchema.methods.updateAppointmentStatus = function(status) {
  if (this.type !== 'appointment') {
    throw new Error('Can only update appointment status');
  }
  
  this.appointment.status = status;
  return this.save();
};

// Static method to get user's active medications
healthRecordSchema.statics.getActiveMedications = function(userId) {
  return this.find({
    user: userId,
    type: 'medication',
    'medication.isActive': true
  }).sort({ 'medication.startDate': -1 });
};

// Static method to get user's recent metrics
healthRecordSchema.statics.getRecentMetrics = function(userId, limit = 10) {
  return this.find({
    user: userId,
    type: 'metric'
  })
  .sort({ 'metric.measuredAt': -1 })
  .limit(limit);
};

// Static method to get upcoming appointments
healthRecordSchema.statics.getUpcomingAppointments = function(userId) {
  const now = new Date();
  return this.find({
    user: userId,
    type: 'appointment',
    'appointment.date': { $gte: now },
    'appointment.status': { $in: ['scheduled', 'confirmed'] }
  })
  .sort({ 'appointment.date': 1 });
};

// Static method to get medication adherence
healthRecordSchema.statics.getMedicationAdherence = function(userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    {
      $match: {
        user: mongoose.Types.ObjectId(userId),
        type: 'medication',
        'medication.isActive': true
      }
    },
    {
      $unwind: '$medication.takenHistory'
    },
    {
      $match: {
        'medication.takenHistory.date': { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$medication.name',
        totalDoses: { $sum: 1 },
        takenDoses: {
          $sum: {
            $cond: ['$medication.takenHistory.taken', 1, 0]
          }
        }
      }
    },
    {
      $project: {
        medicationName: '$_id',
        adherenceRate: {
          $multiply: [
            { $divide: ['$takenDoses', '$totalDoses'] },
            100
          ]
        }
      }
    }
  ]);
};

module.exports = mongoose.model('HealthRecord', healthRecordSchema); 