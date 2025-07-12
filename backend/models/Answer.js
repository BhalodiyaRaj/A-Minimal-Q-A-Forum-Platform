const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Answer content is required'],
    minlength: [20, 'Answer content must be at least 20 characters long']
  },
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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
  isAccepted: {
    type: Boolean,
    default: false
  },
  isEdited: {
    type: Boolean,
    default: false
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
  }],
  lastEdited: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for comments count
answerSchema.virtual('commentsCount', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'answer',
  count: true
});

// Indexes for better query performance
answerSchema.index({ question: 1 });
answerSchema.index({ author: 1 });
answerSchema.index({ createdAt: -1 });
answerSchema.index({ voteCount: -1 });
answerSchema.index({ isAccepted: 1 });

// Method to add vote
answerSchema.methods.addVote = function (userId, voteType) {
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
answerSchema.methods.accept = function () {
  this.isAccepted = true;
  return this.save();
};

// Method to unaccept answer
answerSchema.methods.unaccept = function () {
  this.isAccepted = false;
  return this.save();
};

// Method to add edit history
answerSchema.methods.addEditHistory = function (editorId, reason) {
  this.editHistory.push({
    editor: editorId,
    reason: reason || 'Answer edited'
  });
  this.isEdited = true;
  this.lastEdited = new Date();
  return this.save();
};

// Static method to find answers by question
answerSchema.statics.findByQuestion = function (questionId) {
  return this.find({ question: questionId })
    .populate('author', 'username avatar reputation')
    .populate('question', 'title')
    .sort({ isAccepted: -1, voteCount: -1, createdAt: -1 });
};

// Static method to find accepted answers
answerSchema.statics.findAccepted = function () {
  return this.find({ isAccepted: true })
    .populate('author', 'username avatar reputation')
    .populate('question', 'title');
};

module.exports = mongoose.model('Answer', answerSchema); 