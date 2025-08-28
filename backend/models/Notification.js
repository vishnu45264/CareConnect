const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['request_accepted', 'request_completed', 'request_cancelled', 'reminder', 'system'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  relatedRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Request'
  },
  relatedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  }
}, {
  timestamps: true
});

// Index for efficient queries
notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

// Static method to create notification
notificationSchema.statics.createNotification = async function(data) {
  try {
    const notification = new this(data);
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Method to mark as read
notificationSchema.methods.markAsRead = async function() {
  this.isRead = true;
  return await this.save();
};

// Method to get public profile
notificationSchema.methods.getPublicProfile = function() {
  return {
    _id: this._id,
    type: this.type,
    title: this.title,
    message: this.message,
    isRead: this.isRead,
    priority: this.priority,
    createdAt: this.createdAt,
    relatedRequest: this.relatedRequest,
    relatedUser: this.relatedUser
  };
};

module.exports = mongoose.model('Notification', notificationSchema);
