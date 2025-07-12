const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false
  },
  avatar: {
    url: {
      type: String,
      default: ''
    },
    public_id: {
      type: String,
      default: ''
    }
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters'],
    default: ''
  },
  role: {
    type: String,
    enum: ['guest', 'user', 'admin'],
    default: 'user'
  },
  reputation: {
    type: Number,
    default: 0
  },
  badges: [{
    type: String,
    enum: ['newbie', 'regular', 'expert', 'moderator', 'admin']
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  preferences: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    pushNotifications: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for user's questions count
userSchema.virtual('questionsCount', {
  ref: 'Question',
  localField: '_id',
  foreignField: 'author',
  count: true
});

// Virtual for user's answers count
userSchema.virtual('answersCount', {
  ref: 'Answer',
  localField: '_id',
  foreignField: 'author',
  count: true
});

// Index for better query performance
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });
userSchema.index({ reputation: -1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to generate JWT token
userSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    { 
      id: this._id,
      username: this.username,
      email: this.email,
      role: this.role
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// Method to update last seen
userSchema.methods.updateLastSeen = function() {
  this.lastSeen = new Date();
  return this.save();
};

// Method to update reputation
userSchema.methods.updateReputation = function(points) {
  this.reputation += points;
  return this.save();
};

// Method to add badge
userSchema.methods.addBadge = function(badge) {
  if (!this.badges.includes(badge)) {
    this.badges.push(badge);
    return this.save();
  }
  return this;
};

// Static method to find user by username or email
userSchema.statics.findByUsernameOrEmail = function(identifier) {
  return this.findOne({
    $or: [
      { username: identifier },
      { email: identifier }
    ]
  });
};

module.exports = mongoose.model('User', userSchema); 