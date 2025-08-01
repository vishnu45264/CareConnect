const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  senior: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Senior user is required']
  },
  volunteer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  category: {
    type: String,
    enum: [
      'grocery',
      'medical',
      'transportation',
      'home-maintenance',
      'companionship',
      'technology',
      'meal-preparation',
      'medication'
    ],
    required: [true, 'Category is required']
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high'],
    required: [true, 'Urgency level is required'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  schedule: {
    preferredDate: {
      type: Date,
      required: [true, 'Preferred date is required']
    },
    preferredTime: {
      type: String,
      enum: ['morning', 'afternoon', 'evening', 'flexible'],
      required: [true, 'Preferred time is required']
    },
    duration: {
      type: String,
      enum: ['1-hour', '2-hours', '3-hours', '4-hours', 'half-day', 'full-day'],
      required: [true, 'Duration is required']
    },
    actualDate: {
      type: Date,
      default: null
    },
    actualTime: {
      type: String,
      default: null
    }
  },
  location: {
    address: {
      type: String,
      required: [true, 'Location address is required']
    },
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        default: [0, 0]
      }
    }
  },
  budget: {
    type: String,
    default: null
  },
  specialRequirements: {
    type: String,
    maxlength: [500, 'Special requirements cannot be more than 500 characters']
  },
  compensation: {
    amount: {
      type: Number,
      default: 0
    },
    currency: {
      type: String,
      default: 'INR'
    },
    isPaid: {
      type: Boolean,
      default: false
    },
    paidAt: {
      type: Date,
      default: null
    }
  },
  rating: {
    seniorRating: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
        default: null
      },
      comment: {
        type: String,
        maxlength: [300, 'Comment cannot be more than 300 characters']
      },
      ratedAt: {
        type: Date,
        default: null
      }
    },
    volunteerRating: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
        default: null
      },
      comment: {
        type: String,
        maxlength: [300, 'Comment cannot be more than 300 characters']
      },
      ratedAt: {
        type: Date,
        default: null
      }
    }
  },
  timeline: {
    createdAt: {
      type: Date,
      default: Date.now
    },
    acceptedAt: {
      type: Date,
      default: null
    },
    startedAt: {
      type: Date,
      default: null
    },
    completedAt: {
      type: Date,
      default: null
    },
    cancelledAt: {
      type: Date,
      default: null
    }
  },
  messages: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    message: {
      type: String,
      required: true,
      maxlength: [500, 'Message cannot be more than 500 characters']
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
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

// Index for geospatial queries
requestSchema.index({ 'location.coordinates': '2dsphere' });

// Index for status queries
requestSchema.index({ status: 1 });

// Index for category queries
requestSchema.index({ category: 1 });

// Index for urgency queries
requestSchema.index({ urgency: 1 });

// Index for senior queries
requestSchema.index({ senior: 1 });

// Index for volunteer queries
requestSchema.index({ volunteer: 1 });

// Index for date queries
requestSchema.index({ 'schedule.preferredDate': 1 });

// Virtual for request age
requestSchema.virtual('age').get(function() {
  const now = new Date();
  const created = new Date(this.createdAt);
  const diffTime = Math.abs(now - created);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Method to update status
requestSchema.methods.updateStatus = function(newStatus) {
  this.status = newStatus;
  
  switch (newStatus) {
    case 'accepted':
      this.timeline.acceptedAt = new Date();
      break;
    case 'in-progress':
      this.timeline.startedAt = new Date();
      break;
    case 'completed':
      this.timeline.completedAt = new Date();
      break;
    case 'cancelled':
      this.timeline.cancelledAt = new Date();
      break;
  }
  
  return this.save();
};

// Method to add message
requestSchema.methods.addMessage = function(senderId, message) {
  this.messages.push({
    sender: senderId,
    message: message
  });
  return this.save();
};

// Method to rate request
requestSchema.methods.rateRequest = function(raterId, rating, comment) {
  if (raterId.toString() === this.senior.toString()) {
    this.rating.seniorRating = {
      rating,
      comment,
      ratedAt: new Date()
    };
  } else if (raterId.toString() === this.volunteer.toString()) {
    this.rating.volunteerRating = {
      rating,
      comment,
      ratedAt: new Date()
    };
  }
  
  return this.save();
};

// Static method to find nearby requests
requestSchema.statics.findNearby = function(coordinates, maxDistance = 10, filters = {}) {
  const query = {
    'location.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: coordinates
        },
        $maxDistance: maxDistance * 1000 // Convert km to meters
      }
    },
    status: 'pending'
  };
  
  // Apply additional filters
  if (filters.category) query.category = filters.category;
  if (filters.urgency) query.urgency = filters.urgency;
  if (filters.maxBudget) query['compensation.amount'] = { $lte: filters.maxBudget };
  
  return this.find(query)
    .populate('senior', 'name age rating location')
    .sort({ urgency: -1, createdAt: -1 });
};

// Static method to get request statistics
requestSchema.statics.getStats = function(userId, role) {
  const matchStage = role === 'senior' 
    ? { senior: mongoose.Types.ObjectId(userId) }
    : { volunteer: mongoose.Types.ObjectId(userId) };
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalCompensation: { $sum: '$compensation.amount' }
      }
    }
  ]);
};

module.exports = mongoose.model('Request', requestSchema); 