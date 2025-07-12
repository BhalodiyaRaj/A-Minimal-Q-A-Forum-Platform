const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: [
      'question_answer',
      'answer_comment',
      'question_comment',
      'answer_accepted',
      'answer_vote',
      'question_vote',
      'mention',
      'bounty_awarded',
      'reputation_change'
    ],
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
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  },
  answer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Answer'
  },
  comment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  isEmailSent: {
    type: Boolean,
    default: false
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ sender: 1 });

// Method to mark as read
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  return this.save();
};

// Method to mark as unread
notificationSchema.methods.markAsUnread = function() {
  this.isRead = false;
  return this.save();
};

// Method to mark email as sent
notificationSchema.methods.markEmailSent = function() {
  this.isEmailSent = true;
  return this.save();
};

// Static method to find unread notifications for a user
notificationSchema.statics.findUnreadByUser = function(userId) {
  return this.find({ recipient: userId, isRead: false })
    .populate('sender', 'username avatar')
    .populate('question', 'title')
    .populate('answer', 'content')
    .sort({ createdAt: -1 });
};

// Static method to find all notifications for a user
notificationSchema.statics.findByUser = function(userId, limit = 50) {
  return this.find({ recipient: userId })
    .populate('sender', 'username avatar')
    .populate('question', 'title')
    .populate('answer', 'content')
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to count unread notifications for a user
notificationSchema.statics.countUnreadByUser = function(userId) {
  return this.countDocuments({ recipient: userId, isRead: false });
};

// Static method to mark all notifications as read for a user
notificationSchema.statics.markAllAsRead = function(userId) {
  return this.updateMany(
    { recipient: userId, isRead: false },
    { isRead: true }
  );
};

// Static method to create notification
notificationSchema.statics.createNotification = function(data) {
  return this.create({
    recipient: data.recipient,
    sender: data.sender,
    type: data.type,
    title: data.title,
    message: data.message,
    question: data.question,
    answer: data.answer,
    comment: data.comment,
    metadata: data.metadata || {}
  });
};

module.exports = mongoose.model('Notification', notificationSchema); 