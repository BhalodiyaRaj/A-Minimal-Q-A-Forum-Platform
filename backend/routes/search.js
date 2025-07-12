const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const User = require('../models/User');
const Tag = require('../models/Tag');
const { optionalAuth } = require('../middleware/auth');
const { validateSearch, validatePagination } = require('../middleware/validation');

// @route   GET /api/search/questions
// @desc    Search questions
// @access  Public
router.get('/questions', optionalAuth, validateSearch, validatePagination, async (req, res) => {
  try {
    const { q } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        status: 'error',
        message: 'Search query must be at least 2 characters long'
      });
    }

    const filter = {
      $text: { $search: q }
    };

    const questions = await Question.find(filter)
      .populate('author', 'username avatar')
      .populate('acceptedAnswer', 'content')
      .sort({ score: { $meta: 'textScore' } })
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
        query: q,
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
    console.error('Search questions error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to search questions'
    });
  }
});

// @route   GET /api/search/users
// @desc    Search users
// @access  Public
router.get('/users', optionalAuth, validateSearch, validatePagination, async (req, res) => {
  try {
    const { q } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        status: 'error',
        message: 'Search query must be at least 2 characters long'
      });
    }

    const filter = {
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { bio: { $regex: q, $options: 'i' } }
      ]
    };

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    res.json({
      status: 'success',
      data: {
        users,
        query: q,
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
    console.error('Search users error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to search users'
    });
  }
});

// @route   GET /api/search/tags
// @desc    Search tags
// @access  Public
router.get('/tags', optionalAuth, validateSearch, validatePagination, async (req, res) => {
  try {
    const { q } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        status: 'error',
        message: 'Search query must be at least 2 characters long'
      });
    }

    const filter = {
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { synonyms: { $regex: q, $options: 'i' } }
      ]
    };

    const tags = await Tag.find(filter)
      .populate('createdBy', 'username')
      .sort({ usageCount: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Tag.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    res.json({
      status: 'success',
      data: {
        tags,
        query: q,
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
    console.error('Search tags error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to search tags'
    });
  }
});

module.exports = router; 