const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tag name is required'],
    unique: true,
    trim: true,
    lowercase: true,
    minlength: [2, 'Tag name must be at least 2 characters long'],
    maxlength: [30, 'Tag name cannot exceed 30 characters'],
    match: [/^[a-z0-9-]+$/, 'Tag name can only contain lowercase letters, numbers, and hyphens']
  },
  description: {
    type: String,
    maxlength: [500, 'Tag description cannot exceed 500 characters'],
    default: ''
  },
  usageCount: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isModerated: {
    type: Boolean,
    default: false
  },
  synonyms: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  relatedTags: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tag'
  }],
  wiki: {
    excerpt: {
      type: String,
      maxlength: [1000, 'Wiki excerpt cannot exceed 1000 characters']
    },
    body: {
      type: String,
      maxlength: [10000, 'Wiki body cannot exceed 10000 characters']
    },
    lastEditor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    lastEdited: {
      type: Date
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for questions count
tagSchema.virtual('questionsCount', {
  ref: 'Question',
  localField: 'name',
  foreignField: 'tags',
  count: true
});

// Indexes for better query performance
tagSchema.index({ name: 1 });
tagSchema.index({ usageCount: -1 });
tagSchema.index({ createdAt: -1 });

// Method to increment usage count
tagSchema.methods.incrementUsage = function() {
  this.usageCount += 1;
  return this.save();
};

// Method to decrement usage count
tagSchema.methods.decrementUsage = function() {
  if (this.usageCount > 0) {
    this.usageCount -= 1;
  }
  return this.save();
};

// Method to add synonym
tagSchema.methods.addSynonym = function(synonym) {
  if (!this.synonyms.includes(synonym)) {
    this.synonyms.push(synonym);
    return this.save();
  }
  return this;
};

// Method to add related tag
tagSchema.methods.addRelatedTag = function(tagId) {
  if (!this.relatedTags.includes(tagId)) {
    this.relatedTags.push(tagId);
    return this.save();
  }
  return this;
};

// Method to update wiki
tagSchema.methods.updateWiki = function(editorId, excerpt, body) {
  this.wiki.excerpt = excerpt;
  this.wiki.body = body;
  this.wiki.lastEditor = editorId;
  this.wiki.lastEdited = new Date();
  return this.save();
};

// Static method to find popular tags
tagSchema.statics.findPopular = function(limit = 20) {
  return this.find()
    .sort({ usageCount: -1 })
    .limit(limit);
};

// Static method to find tags by name (with synonyms)
tagSchema.statics.findByNameOrSynonym = function(name) {
  return this.findOne({
    $or: [
      { name: name.toLowerCase() },
      { synonyms: name.toLowerCase() }
    ]
  });
};

// Static method to search tags
tagSchema.statics.search = function(query) {
  return this.find({
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
      { synonyms: { $regex: query, $options: 'i' } }
    ]
  }).sort({ usageCount: -1 });
};

// Static method to find unused tags
tagSchema.statics.findUnused = function() {
  return this.find({ usageCount: 0 });
};

module.exports = mongoose.model('Tag', tagSchema); 