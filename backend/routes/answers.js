const express = require('express');
const router = express.Router();
const Answer = require('../models/Answer');
const Question = require('../models/Question');
const { authenticateToken, optionalAuth, requireUser, canVote } = require('../middleware/auth');
const { validateAnswer, validateVote, validateObjectId } = require('../middleware/validation');
const NotificationService = require('../utils/notificationService');

// Initialize notification service
let notificationService;
router.use((req, res, next) => {
  notificationService = new NotificationService(req.app.get('io'));
  next();
});

// @route   GET /api/answers/count
// @desc    Get total answers count
// @access  Public
router.get('/count', async (req, res) => {
  try {
    const count = await Answer.countDocuments();
    
    res.json({
      status: 'success',
      data: {
        count
      }
    });
  } catch (error) {
    console.error('Get answers count error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get answers count'
    });
  }
});

// @route   GET /api/answers/question/:questionId
// @desc    Get all answers for a specific question
// @access  Public
router.get('/question/:questionId', optionalAuth, validateObjectId, async (req, res) => {
  try {
    const { questionId } = req.params;
    
    // Check if question exists
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({
        status: 'error',
        message: 'Question not found'
      });
    }

    // Get all answers for this question first
    const allAnswers = await Answer.findByQuestion(questionId);
    
    // Apply approval filtering
    let answers;
    if (req.user) {
      // For authenticated users, show:
      // 1. All approved answers
      // 2. Their own unapproved answers
      // 3. All answers if they are the question owner
      if (question.author.toString() === req.user._id.toString()) {
        // Question owner sees all answers
        answers = allAnswers;
      } else {
        // Other users see approved answers + their own unapproved answers
        answers = allAnswers.filter(answer => 
          answer.isApproved || answer.author.toString() === req.user._id.toString()
        );
      }
    } else {
      // Non-authenticated users see only approved answers
      answers = allAnswers.filter(answer => answer.isApproved);
    }

    // Add user vote status if authenticated
    if (req.user) {
      answers.forEach(answer => {
        answer.voteCount = answer.votesCount;
        answer.userVote = answer.votes.upvotes.includes(req.user._id) ? 'upvote' :
                         answer.votes.downvotes.includes(req.user._id) ? 'downvote' : null;
      });
    }

    res.json({
      status: 'success',
      data: {
        answers,
        question: {
          id: question._id,
          title: question.title,
          isAnswered: question.isAnswered,
          acceptedAnswer: question.acceptedAnswer
        }
      }
    });
  } catch (error) {
    console.error('Get answers error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get answers'
    });
  }
});

// @route   GET /api/answers/:id
// @desc    Get a specific answer by ID
// @access  Public
router.get('/:id', optionalAuth, validateObjectId, async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id)
      .populate('author', 'username avatar reputation bio')
      .populate('question', 'title')
      .populate('editHistory.editor', 'username');

    if (!answer) {
      return res.status(404).json({
        status: 'error',
        message: 'Answer not found'
      });
    }

    // Add user vote status if authenticated
    if (req.user) {
      answer.userVote = answer.votes.upvotes.includes(req.user._id) ? 'upvote' :
                       answer.votes.downvotes.includes(req.user._id) ? 'downvote' : null;
    }

    answer.voteCount = answer.votesCount;

    res.json({
      status: 'success',
      data: {
        answer
      }
    });
  } catch (error) {
    console.error('Get answer error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get answer'
    });
  }
});

// @route   POST /api/answers
// @desc    Create a new answer
// @access  Private
router.post('/', authenticateToken, requireUser, validateAnswer, async (req, res) => {
  try {
    const { content, questionId } = req.body;

    // Check if question exists
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({
        status: 'error',
        message: 'Question not found'
      });
    }

    // Check if question is closed
    if (question.status === 'closed') {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot answer a closed question'
      });
    }

    const answer = new Answer({
      content,
      question: questionId,
      author: req.user._id,
      isApproved: false
    });

    await answer.save();

    // Increment question's answerCount
    await Question.findByIdAndUpdate(questionId, { $inc: { answerCount: 1 } });

    // Populate author info
    await answer.populate('author', 'username avatar reputation');

    // Notify question author about the new answer
    await notificationService.notifyQuestionAnswered(questionId, answer._id, req.user._id);

    res.status(201).json({
      status: 'success',
      message: 'Answer created successfully',
      data: {
        answer
      }
    });
  } catch (error) {
    console.error('Create answer error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create answer'
    });
  }
});

// @route   PUT /api/answers/:id
// @desc    Update an answer
// @access  Private (owner or admin)
router.put('/:id', authenticateToken, validateObjectId, validateAnswer, async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);

    if (!answer) {
      return res.status(404).json({
        status: 'error',
        message: 'Answer not found'
      });
    }

    // Check ownership or admin role
    if (answer.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'You can only edit your own answers'
      });
    }

    const { content } = req.body;

    // Add edit history
    await answer.addEditHistory(req.user._id, 'Answer updated');

    answer.content = content;
    await answer.save();

    await answer.populate('author', 'username avatar reputation');

    res.json({
      status: 'success',
      message: 'Answer updated successfully',
      data: {
        answer
      }
    });
  } catch (error) {
    console.error('Update answer error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update answer'
    });
  }
});

// @route   DELETE /api/answers/:id
// @desc    Delete an answer
// @access  Private (owner or admin)
router.delete('/:id', authenticateToken, validateObjectId, async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);

    if (!answer) {
      return res.status(404).json({
        status: 'error',
        message: 'Answer not found'
      });
    }

    // Check ownership or admin role
    if (answer.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'You can only delete your own answers'
      });
    }

    // Check if answer is accepted
    if (answer.isAccepted) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot delete an accepted answer'
      });
    }

    // Decrement question's answerCount
    await Question.findByIdAndUpdate(answer.question, { $inc: { answerCount: -1 } });

    await Answer.findByIdAndDelete(req.params.id);

    res.json({
      status: 'success',
      message: 'Answer deleted successfully'
    });
  } catch (error) {
    console.error('Delete answer error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete answer'
    });
  }
});

// @route   POST /api/answers/:id/vote
// @desc    Vote on an answer
// @access  Private
router.post('/:id/vote', authenticateToken, validateObjectId, validateVote, canVote, async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);

    if (!answer) {
      return res.status(404).json({
        status: 'error',
        message: 'Answer not found'
      });
    }

    // Check if user is voting on their own answer
    if (answer.author.toString() === req.user._id.toString()) {
      return res.status(400).json({
        status: 'error',
        message: 'You cannot vote on your own answer'
      });
    }

    const { voteType } = req.body;

    await answer.addVote(req.user._id, voteType);

    // Notify answer author about the vote
    await notificationService.notifyVote('answer', answer._id, req.user._id, voteType);

    res.json({
      status: 'success',
      message: 'Vote recorded successfully',
      data: {
        voteCount: answer.voteCount,
        userVote: voteType
      }
    });
  } catch (error) {
    console.error('Vote answer error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to vote on answer'
    });
  }
});

// @route   POST /api/answers/:id/accept
// @desc    Accept an answer (question owner only)
// @access  Private
router.post('/:id/accept', authenticateToken, validateObjectId, async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id).populate('question');

    if (!answer) {
      return res.status(404).json({
        status: 'error',
        message: 'Answer not found'
      });
    }

    const question = answer.question;

    // Check if user owns the question
    if (question.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'You can only accept answers for your own questions'
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

// @route   POST /api/answers/:id/unaccept
// @desc    Unaccept an answer (question owner only)
// @access  Private
router.post('/:id/unaccept', authenticateToken, validateObjectId, async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id).populate('question');

    if (!answer) {
      return res.status(404).json({
        status: 'error',
        message: 'Answer not found'
      });
    }

    const question = answer.question;

    // Check if user owns the question
    if (question.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'You can only unaccept answers for your own questions'
      });
    }

    // Unaccept the answer
    question.acceptedAnswer = null;
    question.isAnswered = false;
    await question.save();
    await answer.unaccept();

    res.json({
      status: 'success',
      message: 'Answer unaccepted successfully'
    });
  } catch (error) {
    console.error('Unaccept answer error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to unaccept answer'
    });
  }
});

// Add approve answer route
// @route   POST /api/answers/:id/approve
// @desc    Approve an answer (question owner only)
// @access  Private
router.post('/:id/approve', authenticateToken, async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id).populate('question');
    if (!answer) {
      return res.status(404).json({ status: 'error', message: 'Answer not found' });
    }
    const question = answer.question;
    if (question.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ status: 'error', message: 'Only the question owner can approve answers' });
    }
    answer.isApproved = true;
    await answer.save();
    
    res.json({ status: 'success', message: 'Answer approved', data: { answer } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to approve answer' });
  }
});

// @route   GET /api/answers/user/:userId
// @desc    Get all answers by a specific user
// @access  Public
router.get('/user/:userId', optionalAuth, validateObjectId, async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Apply approval filtering
    let filter = { author: userId };
    if (!req.user || req.user._id.toString() !== userId.toString()) {
      // Show only approved answers to public
      filter.isApproved = true;
    }
    // If user is viewing their own answers, show all (approved and unapproved)

    const answers = await Answer.find(filter)
      .populate('author', 'username avatar reputation')
      .populate('question', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Answer.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    // Add user vote status if authenticated
    if (req.user) {
      answers.forEach(answer => {
        answer.voteCount = answer.votesCount;
        answer.userVote = answer.votes.upvotes.includes(req.user._id) ? 'upvote' :
                         answer.votes.downvotes.includes(req.user._id) ? 'downvote' : null;
      });
    }

    res.json({
      status: 'success',
      data: {
        answers,
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

module.exports = router; 