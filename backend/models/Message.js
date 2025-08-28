const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  request: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Request',
    required: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['volunteer_to_senior', 'senior_to_volunteer'],
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient querying
messageSchema.index({ sender: 1, recipient: 1, request: 1 });
messageSchema.index({ recipient: 1, isRead: 1 });

// Static method to create a message
messageSchema.statics.createMessage = async function(data) {
  const message = new this(data);
  return await message.save();
};

// Instance method to mark as read
messageSchema.methods.markAsRead = async function() {
  this.isRead = true;
  return await this.save();
};

module.exports = mongoose.model('Message', messageSchema);
