const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Question = require('../models/Question');
const Answer = require('../models/Answer');
const { authenticateToken, optionalAuth, requireAdmin } = require('../middleware/auth');
const { validateObjectId, validatePagination } = require('../middleware/validation');

// @route   GET /api/users
// @desc    Get all users with pagination and filtering
// @access  Public
router.get('/', optionalAuth, validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    const sort = { reputation: -1 };

    // Search functionality
    if (req.query.q) {
      filter.$or = [
        { username: { $regex: req.query.q, $options: 'i' } },
        { bio: { $regex: req.query.q, $options: 'i' } }
      ];
    }

    // Filter by role
    if (req.query.role) {
      filter.role = req.query.role;
    }

    // Filter by reputation
    if (req.query.minReputation) {
      filter.reputation = { $gte: parseInt(req.query.minReputation) };
    }

    // Sort options
    switch (req.query.sort) {
      case 'username':
        sort.username = 1;
        break;
      case 'newest':
        sort.createdAt = -1;
        break;
      case 'oldest':
        sort.createdAt = 1;
        break;
      case 'lastSeen':
        sort.lastSeen = -1;
        break;
      default:
        sort.reputation = -1;
    }

    const users = await User.find(filter)
      .select('-password')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    res.json({
      status: 'success',
      data: {
        users,
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
    console.error('Get users error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get users'
    });
  }
});

// @route   GET /api/users/:id
// @desc    Get a specific user by ID
// @access  Public
router.get('/:id', optionalAuth, validateObjectId, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('questionsCount')
      .populate('answersCount');

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get user'
    });
  }
});

// @route   GET /api/users/:id/questions
// @desc    Get all questions by a specific user
// @access  Public
router.get('/:id/questions', optionalAuth, validateObjectId, validatePagination, async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    const questions = await Question.find({ author: id })
      .populate('author', 'username avatar reputation')
      .populate('acceptedAnswer', 'content')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Question.countDocuments({ author: id });
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
        user: {
          id: user._id,
          username: user.username,
          avatar: user.avatar,
          reputation: user.reputation
        },
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
    console.error('Get user questions error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get user questions'
    });
  }
});

// @route   GET /api/users/:id/answers
// @desc    Get all answers by a specific user
// @access  Public
router.get('/:id/answers', optionalAuth, validateObjectId, validatePagination, async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    const answers = await Answer.find({ author: id })
      .populate('author', 'username avatar reputation')
      .populate('question', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Answer.countDocuments({ author: id });
    const totalPages = Math.ceil(total / limit);

    // Add user vote status if authenticated
    if (req.user) {
      answers.forEach(answer => {
        answer.userVote = answer.votes.upvotes.includes(req.user._id) ? 'upvote' :
                         answer.votes.downvotes.includes(req.user._id) ? 'downvote' : null;
      });
    }

    res.json({
      status: 'success',
      data: {
        answers,
        user: {
          id: user._id,
          username: user.username,
          avatar: user.avatar,
          reputation: user.reputation
        },
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
    console.error('Get user answers error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get user answers'
    });
  }
});

// @route   GET /api/users/:id/activity
// @desc    Get user activity (questions and answers)
// @access  Public
router.get('/:id/activity', optionalAuth, validateObjectId, validatePagination, async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Get questions and answers
    const questions = await Question.find({ author: id })
      .select('title createdAt voteCount views')
      .sort({ createdAt: -1 });

    const answers = await Answer.find({ author: id })
      .populate('question', 'title')
      .select('content createdAt voteCount isAccepted question')
      .sort({ createdAt: -1 });

    // Combine and sort by date
    const activities = [
      ...questions.map(q => ({ ...q.toObject(), type: 'question' })),
      ...answers.map(a => ({ ...a.toObject(), type: 'answer' }))
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Apply pagination
    const total = activities.length;
    const totalPages = Math.ceil(total / limit);
    const paginatedActivities = activities.slice(skip, skip + limit);

    res.json({
      status: 'success',
      data: {
        activities: paginatedActivities,
        user: {
          id: user._id,
          username: user.username,
          avatar: user.avatar,
          reputation: user.reputation
        },
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
    console.error('Get user activity error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get user activity'
    });
  }
});

// @route   PUT /api/users/:id/role
// @desc    Update user role (admin only)
// @access  Private
router.put('/:id/role', authenticateToken, requireAdmin, validateObjectId, async (req, res) => {
  try {
    const { role } = req.body;

    if (!['guest', 'user', 'admin'].includes(role)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid role'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.json({
      status: 'success',
      message: 'User role updated successfully',
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update user role'
    });
  }
});

// @route   PUT /api/users/:id/reputation
// @desc    Update user reputation (admin only)
// @access  Private
router.put('/:id/reputation', authenticateToken, requireAdmin, validateObjectId, async (req, res) => {
  try {
    const { points, reason } = req.body;

    if (typeof points !== 'number') {
      return res.status(400).json({
        status: 'error',
        message: 'Points must be a number'
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    await user.updateReputation(points);

    // Notify user about reputation change
    const NotificationService = require('../utils/notificationService');
    const notificationService = new NotificationService(req.app.get('io'));
    await notificationService.notifyReputationChange(user._id, points, reason || 'Reputation adjusted by admin');

    res.json({
      status: 'success',
      message: 'User reputation updated successfully',
      data: {
        user: {
          id: user._id,
          username: user.username,
          reputation: user.reputation
        }
      }
    });
  } catch (error) {
    console.error('Update user reputation error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update user reputation'
    });
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete a user (admin only)
// @access  Private
router.delete('/:id', authenticateToken, requireAdmin, validateObjectId, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Check if user is admin
    if (user.role === 'admin') {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot delete admin user'
      });
    }

    // Delete user's questions and answers (optional - you might want to keep them)
    await Question.deleteMany({ author: user._id });
    await Answer.deleteMany({ author: user._id });

    await User.findByIdAndDelete(req.params.id);

    res.json({
      status: 'success',
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete user'
    });
  }
});

// @route   GET /api/users/leaderboard
// @desc    Get user leaderboard by reputation
// @access  Public
router.get('/leaderboard', optionalAuth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const period = req.query.period || 'all'; // all, week, month

    let dateFilter = {};
    if (period === 'week') {
      dateFilter = { createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } };
    } else if (period === 'month') {
      dateFilter = { createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } };
    }

    const users = await User.find(dateFilter)
      .select('username avatar reputation badges createdAt')
      .sort({ reputation: -1 })
      .limit(limit);

    res.json({
      status: 'success',
      data: {
        users,
        period
      }
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get leaderboard'
    });
  }
});

module.exports = router; 