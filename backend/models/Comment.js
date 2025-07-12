const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    minlength: [2, 'Comment content must be at least 2 characters long'],
    maxlength: [500, 'Comment content cannot exceed 500 characters']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
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

// Indexes for better query performance
commentSchema.index({ question: 1 });
commentSchema.index({ answer: 1 });
commentSchema.index({ author: 1 });
commentSchema.index({ createdAt: -1 });
commentSchema.index({ parentComment: 1 });

// Validation to ensure comment belongs to either question or answer
commentSchema.pre('save', function (next) {
  if (!this.question && !this.answer) {
    return next(new Error('Comment must belong to either a question or an answer'));
  }
  if (this.question && this.answer) {
    return next(new Error('Comment cannot belong to both question and answer'));
  }
  next();
});

// Method to add vote
commentSchema.methods.addVote = function (userId, voteType) {
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

// Method to add edit history
commentSchema.methods.addEditHistory = function (editorId, reason) {
  this.editHistory.push({
    editor: editorId,
    reason: reason || 'Comment edited'
  });
  this.isEdited = true;
  this.lastEdited = new Date();
  return this.save();
};

// Static method to find comments by question
commentSchema.statics.findByQuestion = function (questionId) {
  return this.find({ question: questionId })
    .populate('author', 'username avatar')
    .sort({ createdAt: 1 });
};

// Static method to find comments by answer
commentSchema.statics.findByAnswer = function (answerId) {
  return this.find({ answer: answerId })
    .populate('author', 'username avatar')
    .sort({ createdAt: 1 });
};

module.exports = mongoose.model('Comment', commentSchema); 