const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Question title is required'],
    trim: true,
    minlength: [10, 'Question title must be at least 10 characters long'],
    maxlength: [200, 'Question title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Question content is required'],
    minlength: [20, 'Question content must be at least 20 characters long']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [{
    type: String,
    required: true,
    trim: true,
    lowercase: true
  }],
  views: {
    type: Number,
    default: 0
  },
  votes: {
    upvotes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    downvotes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  voteCount: {
    type: Number,
    default: 0
  },
  isAnswered: {
    type: Boolean,
    default: false
  },
  acceptedAnswer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Answer'
  },
  status: {
    type: String,
    enum: ['open', 'closed', 'duplicate', 'on-hold'],
    default: 'open'
  },
  bounty: {
    amount: {
      type: Number,
      default: 0
    },
    expiresAt: {
      type: Date
    }
  },
  featured: {
    type: Boolean,
    default: false
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  editHistory: [{
    editor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    editedAt: {
      type: Date,
      default: Date.now
    },
    reason: String
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for answers count
questionSchema.virtual('answersCount', {
  ref: 'Answer',
  localField: '_id',
  foreignField: 'question',
  count: true
});

// Virtual for comments count
questionSchema.virtual('commentsCount', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'question',
  count: true
});

// Indexes for better query performance
questionSchema.index({ title: 'text', content: 'text' });
questionSchema.index({ tags: 1 });
questionSchema.index({ author: 1 });
questionSchema.index({ createdAt: -1 });
questionSchema.index({ voteCount: -1 });
questionSchema.index({ views: -1 });
questionSchema.index({ lastActivity: -1 });

// Pre-save middleware to update lastActivity
questionSchema.pre('save', function (next) {
  this.lastActivity = new Date();
  next();
});

// Method to increment views
questionSchema.methods.incrementViews = function () {
  this.views += 1;
  return this.save();
};

// Method to add vote
questionSchema.methods.addVote = function (userId, voteType) {
  const upvoteIndex = this.votes.upvotes.indexOf(userId);
  const downvoteIndex = this.votes.downvotes.indexOf(userId);

  if (voteType === 'upvote') {
    if (upvoteIndex === -1) {
      this.votes.upvotes.push(userId);
      if (downvoteIndex !== -1) {
        this.votes.downvotes.splice(downvoteIndex, 1);
      }
    } else {
      this.votes.upvotes.splice(upvoteIndex, 1);
    }
  } else if (voteType === 'downvote') {
    if (downvoteIndex === -1) {
      this.votes.downvotes.push(userId);
      if (upvoteIndex !== -1) {
        this.votes.upvotes.splice(upvoteIndex, 1);
      }
    } else {
      this.votes.downvotes.splice(downvoteIndex, 1);
    }
  }

  this.voteCount = this.votes.upvotes.length - this.votes.downvotes.length;
  return this.save();
};

// Method to accept answer
questionSchema.methods.acceptAnswer = function (answerId) {
  this.acceptedAnswer = answerId;
  this.isAnswered = true;
  return this.save();
};

// Method to add edit history
questionSchema.methods.addEditHistory = function (editorId, reason) {
  this.editHistory.push({
    editor: editorId,
    reason: reason || 'Question edited'
  });
  return this.save();
};

// Static method to find questions by tag
questionSchema.statics.findByTag = function (tag) {
  return this.find({ tags: tag.toLowerCase() })
    .populate('author', 'username avatar reputation')
    .sort({ createdAt: -1 });
};

// Static method to find unanswered questions
questionSchema.statics.findUnanswered = function () {
  return this.find({ isAnswered: false })
    .populate('author', 'username avatar reputation')
    .sort({ createdAt: -1 });
};

// Static method to find featured questions
questionSchema.statics.findFeatured = function () {
  return this.find({ featured: true })
    .populate('author', 'username avatar reputation')
    .sort({ createdAt: -1 });
};

module.exports = mongoose.model('Question', questionSchema); 