const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const Tag = require('../models/Tag');
const { authenticateToken, optionalAuth, requireUser, canVote } = require('../middleware/auth');
const { validateQuestion, validateVote, validateSearch, validatePagination, validateObjectId } = require('../middleware/validation');
const NotificationService = require('../utils/notificationService');

// Initialize notification service
let notificationService;
router.use((req, res, next) => {
  notificationService = new NotificationService(req.app.get('io'));
  next();
});

// @route   GET /api/questions
// @desc    Get all questions with pagination and filtering
// @access  Public
router.get('/', optionalAuth, validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    const sort = {};

    // Filter by status
    if (req.query.status) {
      filter.status = req.query.status;
    }

    // Filter by tags
    if (req.query.tags) {
      const tags = req.query.tags.split(',').map(tag => tag.toLowerCase());
      filter.tags = { $in: tags };
    }

    // Filter by answered/unanswered
    if (req.query.answered !== undefined) {
      filter.isAnswered = req.query.answered === 'true';
    }

    // Filter by featured
    if (req.query.featured !== undefined) {
      filter.featured = req.query.featured === 'true';
    }

    // Search functionality
    if (req.query.q) {
      filter.$text = { $search: req.query.q };
    }

    // Sort options
    switch (req.query.sort) {
      case 'newest':
        sort.createdAt = -1;
        break;
      case 'oldest':
        sort.createdAt = 1;
        break;
      case 'votes':
        sort.voteCount = -1;
        break;
      case 'views':
        sort.views = -1;
        break;
      case 'activity':
        sort.lastActivity = -1;
        break;
      default:
        sort.lastActivity = -1;
    }

    const questions = await Question.find(filter)
      .populate('author', 'username avatar reputation')
      .populate('acceptedAnswer', 'content')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Question.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    // Add user vote status if authenticated
    if (req.user) {
      questions.forEach(question => {
        question.userVote = question.votes.upvotes.includes(req.user._id) ? 'upvote' :
                           question.votes.downvotes.includes(req.user._id) ? 'downvote' : null;
      });
    }

    res.json({
      status: 'success',
      data: {
        questions,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get questions'
    });
  }
});

// @route   GET /api/questions/unanswered
// @desc    Get unanswered questions
// @access  Public
router.get('/unanswered', optionalAuth, validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const questions = await Question.findUnanswered()
      .populate('acceptedAnswer', 'content')
      .skip(skip)
      .limit(limit);

    const total = await Question.countDocuments({ isAnswered: false });
    const totalPages = Math.ceil(total / limit);

    // Add user vote status if authenticated
    if (req.user) {
      questions.forEach(question => {
        question.userVote = question.votes.upvotes.includes(req.user._id) ? 'upvote' :
                           question.votes.downvotes.includes(req.user._id) ? 'downvote' : null;
      });
    }

    res.json({
      status: 'success',
      data: {
        questions,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get unanswered questions error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get unanswered questions'
    });
  }
});

// @route   GET /api/questions/featured
// @desc    Get featured questions
// @access  Public
router.get('/featured', optionalAuth, validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const questions = await Question.findFeatured()
      .populate('acceptedAnswer', 'content')
      .skip(skip)
      .limit(limit);

    const total = await Question.countDocuments({ featured: true });
    const totalPages = Math.ceil(total / limit);

    // Add user vote status if authenticated
    if (req.user) {
      questions.forEach(question => {
        question.userVote = question.votes.upvotes.includes(req.user._id) ? 'upvote' :
                           question.votes.downvotes.includes(req.user._id) ? 'downvote' : null;
      });
    }

    res.json({
      status: 'success',
      data: {
        questions,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get featured questions error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get featured questions'
    });
  }
});

// @route   GET /api/questions/:id
// @desc    Get a specific question by ID
// @access  Public
router.get('/:id', optionalAuth, validateObjectId, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('author', 'username avatar reputation bio')
      .populate('acceptedAnswer', 'content author')
      .populate('editHistory.editor', 'username');

    if (!question) {
      return res.status(404).json({
        status: 'error',
        message: 'Question not found'
      });
    }

    // Increment views
    await question.incrementViews();

    // Add user vote status if authenticated
    if (req.user) {
      question.userVote = question.votes.upvotes.includes(req.user._id) ? 'upvote' :
                         question.votes.downvotes.includes(req.user._id) ? 'downvote' : null;
    }

    res.json({
      status: 'success',
      data: {
        question
      }
    });
  } catch (error) {
    console.error('Get question error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get question'
    });
  }
});

// @route   POST /api/questions
// @desc    Create a new question
// @access  Private
router.post('/', authenticateToken, requireUser, validateQuestion, async (req, res) => {
  try {
    const { title, content, tags } = req.body;

    // Process tags - create if they don't exist
    const processedTags = [];
    for (const tagName of tags) {
      let tag = await Tag.findOne({ name: tagName.toLowerCase() });
      if (!tag) {
        tag = new Tag({
          name: tagName.toLowerCase(),
          createdBy: req.user._id
        });
        await tag.save();
      }
      processedTags.push(tag.name);
      await tag.incrementUsage();
    }

    const question = new Question({
      title,
      content,
      tags: processedTags,
      author: req.user._id
    });

    await question.save();

    // Populate author info
    await question.populate('author', 'username avatar reputation');

    res.status(201).json({
      status: 'success',
      message: 'Question created successfully',
      data: {
        question
      }
    });
  } catch (error) {
    console.error('Create question error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create question'
    });
  }
});

// @route   PUT /api/questions/:id
// @desc    Update a question
// @access  Private (owner or admin)
router.put('/:id', authenticateToken, validateObjectId, validateQuestion, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        status: 'error',
        message: 'Question not found'
      });
    }

    // Check ownership or admin role
    if (question.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'You can only edit your own questions'
      });
    }

    const { title, content, tags } = req.body;

    // Process tags
    const processedTags = [];
    for (const tagName of tags) {
      let tag = await Tag.findOne({ name: tagName.toLowerCase() });
      if (!tag) {
        tag = new Tag({
          name: tagName.toLowerCase(),
          createdBy: req.user._id
        });
        await tag.save();
      }
      processedTags.push(tag.name);
      await tag.incrementUsage();
    }

    // Add edit history
    await question.addEditHistory(req.user._id, 'Question updated');

    question.title = title;
    question.content = content;
    question.tags = processedTags;

    await question.save();

    await question.populate('author', 'username avatar reputation');

    res.json({
      status: 'success',
      message: 'Question updated successfully',
      data: {
        question
      }
    });
  } catch (error) {
    console.error('Update question error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update question'
    });
  }
});

// @route   DELETE /api/questions/:id
// @desc    Delete a question
// @access  Private (owner or admin)
router.delete('/:id', authenticateToken, validateObjectId, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        status: 'error',
        message: 'Question not found'
      });
    }

    // Check ownership or admin role
    if (question.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'You can only delete your own questions'
      });
    }

    // Decrement tag usage
    for (const tagName of question.tags) {
      const tag = await Tag.findOne({ name: tagName });
      if (tag) {
        await tag.decrementUsage();
      }
    }

    await Question.findByIdAndDelete(req.params.id);

    res.json({
      status: 'success',
      message: 'Question deleted successfully'
    });
  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete question'
    });
  }
});

// @route   POST /api/questions/:id/vote
// @desc    Vote on a question
// @access  Private
router.post('/:id/vote', authenticateToken, validateObjectId, validateVote, canVote, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        status: 'error',
        message: 'Question not found'
      });
    }

    // Check if user is voting on their own question
    if (question.author.toString() === req.user._id.toString()) {
      return res.status(400).json({
        status: 'error',
        message: 'You cannot vote on your own question'
      });
    }

    const { voteType } = req.body;

    await question.addVote(req.user._id, voteType);

    // Notify question author about the vote
    await notificationService.notifyVote('question', question._id, req.user._id, voteType);

    res.json({
      status: 'success',
      message: 'Vote recorded successfully',
      data: {
        voteCount: question.voteCount,
        userVote: voteType
      }
    });
  } catch (error) {
    console.error('Vote question error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to vote on question'
    });
  }
});

// @route   POST /api/questions/:id/accept-answer/:answerId
// @desc    Accept an answer for a question
// @access  Private (question owner)
router.post('/:id/accept-answer/:answerId', authenticateToken, validateObjectId, async (req, res) => {
  try {
    const Answer = require('../models/Answer');
    
    const question = await Question.findById(req.params.id);
    const answer = await Answer.findById(req.params.answerId);

    if (!question) {
      return res.status(404).json({
        status: 'error',
        message: 'Question not found'
      });
    }

    if (!answer) {
      return res.status(404).json({
        status: 'error',
        message: 'Answer not found'
      });
    }

    // Check if user owns the question
    if (question.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'You can only accept answers for your own questions'
      });
    }

    // Check if answer belongs to the question
    if (answer.question.toString() !== question._id.toString()) {
      return res.status(400).json({
        status: 'error',
        message: 'Answer does not belong to this question'
      });
    }

    // Accept the answer
    await question.acceptAnswer(answer._id);
    await answer.accept();

    // Notify answer author
    await notificationService.notifyAnswerAccepted(answer._id, req.user._id);

    res.json({
      status: 'success',
      message: 'Answer accepted successfully',
      data: {
        acceptedAnswer: answer._id
      }
    });
  } catch (error) {
    console.error('Accept answer error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to accept answer'
    });
  }
});

// @route   GET /api/questions/tags/:tag
// @desc    Get questions by tag
// @access  Public
router.get('/tags/:tag', optionalAuth, validatePagination, async (req, res) => {
  try {
    const { tag } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const questions = await Question.findByTag(tag)
      .populate('acceptedAnswer', 'content')
      .skip(skip)
      .limit(limit);

    const total = await Question.countDocuments({ tags: tag.toLowerCase() });
    const totalPages = Math.ceil(total / limit);

    // Add user vote status if authenticated
    if (req.user) {
      questions.forEach(question => {
        question.userVote = question.votes.upvotes.includes(req.user._id) ? 'upvote' :
                           question.votes.downvotes.includes(req.user._id) ? 'downvote' : null;
      });
    }

    res.json({
      status: 'success',
      data: {
        questions,
        tag,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get questions by tag error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get questions by tag'
    });
  }
});

module.exports = router; 