const express = require('express');
const router = express.Router();
const Tag = require('../models/Tag');
const Question = require('../models/Question');
const { authenticateToken, optionalAuth, requireAdmin } = require('../middleware/auth');
const { validateTag, validateSearch, validatePagination, validateObjectId } = require('../middleware/validation');

// @route   GET /api/tags
// @desc    Get all tags with pagination and filtering
// @access  Public
router.get('/', optionalAuth, validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    const sort = { usageCount: -1 };

    // Search functionality
    if (req.query.q) {
      filter.$or = [
        { name: { $regex: req.query.q, $options: 'i' } },
        { description: { $regex: req.query.q, $options: 'i' } }
      ];
    }

    // Filter by usage count
    if (req.query.minUsage) {
      filter.usageCount = { $gte: parseInt(req.query.minUsage) };
    }

    // Sort options
    switch (req.query.sort) {
      case 'name':
        sort.name = 1;
        break;
      case 'newest':
        sort.createdAt = -1;
        break;
      case 'oldest':
        sort.createdAt = 1;
        break;
      default:
        sort.usageCount = -1;
    }

    const tags = await Tag.find(filter)
      .populate('createdBy', 'username')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Tag.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    res.json({
      status: 'success',
      data: {
        tags,
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
    console.error('Get tags error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get tags'
    });
  }
});

// @route   GET /api/tags/popular
// @desc    Get popular tags
// @access  Public
router.get('/popular', optionalAuth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const tags = await Tag.findPopular(limit);

    res.json({
      status: 'success',
      data: {
        tags
      }
    });
  } catch (error) {
    console.error('Get popular tags error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get popular tags'
    });
  }
});

// @route   GET /api/tags/:name
// @desc    Get a specific tag by name
// @access  Public
router.get('/:name', optionalAuth, async (req, res) => {
  try {
    const { name } = req.params;
    const tag = await Tag.findByNameOrSynonym(name)
      .populate('createdBy', 'username')
      .populate('relatedTags', 'name description usageCount');

    if (!tag) {
      return res.status(404).json({
        status: 'error',
        message: 'Tag not found'
      });
    }

    // Get questions using this tag
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const questions = await Question.find({ tags: tag.name })
      .populate('author', 'username avatar reputation')
      .populate('acceptedAnswer', 'content')
      .sort({ lastActivity: -1 })
      .skip(skip)
      .limit(limit);

    const totalQuestions = await Question.countDocuments({ tags: tag.name });
    const totalPages = Math.ceil(totalQuestions / limit);

    res.json({
      status: 'success',
      data: {
        tag,
        questions,
        pagination: {
          page,
          limit,
          total: totalQuestions,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get tag error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get tag'
    });
  }
});

// @route   POST /api/tags
// @desc    Create a new tag (admin only)
// @access  Private
router.post('/', authenticateToken, requireAdmin, validateTag, async (req, res) => {
  try {
    const { name, description } = req.body;

    // Check if tag already exists
    const existingTag = await Tag.findOne({ name: name.toLowerCase() });
    if (existingTag) {
      return res.status(400).json({
        status: 'error',
        message: 'Tag already exists'
      });
    }

    const tag = new Tag({
      name: name.toLowerCase(),
      description,
      createdBy: req.user._id
    });

    await tag.save();

    await tag.populate('createdBy', 'username');

    res.status(201).json({
      status: 'success',
      message: 'Tag created successfully',
      data: {
        tag
      }
    });
  } catch (error) {
    console.error('Create tag error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create tag'
    });
  }
});

// @route   PUT /api/tags/:id
// @desc    Update a tag (admin only)
// @access  Private
router.put('/:id', authenticateToken, requireAdmin, validateObjectId, validateTag, async (req, res) => {
  try {
    const { name, description } = req.body;

    const tag = await Tag.findById(req.params.id);

    if (!tag) {
      return res.status(404).json({
        status: 'error',
        message: 'Tag not found'
      });
    }

    // Check if new name conflicts with existing tag
    if (name.toLowerCase() !== tag.name) {
      const existingTag = await Tag.findOne({ name: name.toLowerCase() });
      if (existingTag) {
        return res.status(400).json({
          status: 'error',
          message: 'Tag name already exists'
        });
      }
    }

    tag.name = name.toLowerCase();
    tag.description = description;

    await tag.save();

    await tag.populate('createdBy', 'username');

    res.json({
      status: 'success',
      message: 'Tag updated successfully',
      data: {
        tag
      }
    });
  } catch (error) {
    console.error('Update tag error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update tag'
    });
  }
});

// @route   DELETE /api/tags/:id
// @desc    Delete a tag (admin only)
// @access  Private
router.delete('/:id', authenticateToken, requireAdmin, validateObjectId, async (req, res) => {
  try {
    const tag = await Tag.findById(req.params.id);

    if (!tag) {
      return res.status(404).json({
        status: 'error',
        message: 'Tag not found'
      });
    }

    // Check if tag is being used
    if (tag.usageCount > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot delete tag that is being used'
      });
    }

    await Tag.findByIdAndDelete(req.params.id);

    res.json({
      status: 'success',
      message: 'Tag deleted successfully'
    });
  } catch (error) {
    console.error('Delete tag error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete tag'
    });
  }
});

// @route   GET /api/tags/search/:query
// @desc    Search tags
// @access  Public
router.get('/search/:query', optionalAuth, async (req, res) => {
  try {
    const { query } = req.params;
    const tags = await Tag.search(query);

    res.json({
      status: 'success',
      data: {
        tags
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

// @route   GET /api/tags/unused
// @desc    Get unused tags (admin only)
// @access  Private
router.get('/unused', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const tags = await Tag.findUnused();

    res.json({
      status: 'success',
      data: {
        tags
      }
    });
  } catch (error) {
    console.error('Get unused tags error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get unused tags'
    });
  }
});

// @route   POST /api/tags/:id/synonym
// @desc    Add synonym to a tag (admin only)
// @access  Private
router.post('/:id/synonym', authenticateToken, requireAdmin, validateObjectId, async (req, res) => {
  try {
    const { synonym } = req.body;

    if (!synonym || typeof synonym !== 'string') {
      return res.status(400).json({
        status: 'error',
        message: 'Synonym is required'
      });
    }

    const tag = await Tag.findById(req.params.id);

    if (!tag) {
      return res.status(404).json({
        status: 'error',
        message: 'Tag not found'
      });
    }

    await tag.addSynonym(synonym.toLowerCase());

    res.json({
      status: 'success',
      message: 'Synonym added successfully',
      data: {
        tag
      }
    });
  } catch (error) {
    console.error('Add synonym error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to add synonym'
    });
  }
});

// @route   POST /api/tags/:id/related
// @desc    Add related tag (admin only)
// @access  Private
router.post('/:id/related', authenticateToken, requireAdmin, validateObjectId, async (req, res) => {
  try {
    const { relatedTagId } = req.body;

    if (!relatedTagId) {
      return res.status(400).json({
        status: 'error',
        message: 'Related tag ID is required'
      });
    }

    const tag = await Tag.findById(req.params.id);
    const relatedTag = await Tag.findById(relatedTagId);

    if (!tag) {
      return res.status(404).json({
        status: 'error',
        message: 'Tag not found'
      });
    }

    if (!relatedTag) {
      return res.status(404).json({
        status: 'error',
        message: 'Related tag not found'
      });
    }

    await tag.addRelatedTag(relatedTagId);

    await tag.populate('relatedTags', 'name description usageCount');

    res.json({
      status: 'success',
      message: 'Related tag added successfully',
      data: {
        tag
      }
    });
  } catch (error) {
    console.error('Add related tag error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to add related tag'
    });
  }
});

module.exports = router; 