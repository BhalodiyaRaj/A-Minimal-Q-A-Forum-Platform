const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { authenticateToken } = require('../middleware/auth');
const { validateObjectId } = require('../middleware/validation');
const NotificationService = require('../utils/notificationService');

// Initialize notification service
let notificationService;
router.use((req, res, next) => {
  notificationService = new NotificationService(req.app.get('io'));
  next();
});

// @route   GET /api/notifications
// @desc    Get all notifications for the current user
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const notifications = await Notification.findByUser(req.user._id, limit + skip);
    const total = await Notification.countDocuments({ recipient: req.user._id });
    const totalPages = Math.ceil(total / limit);

    // Apply pagination
    const paginatedNotifications = notifications.slice(skip, skip + limit);

    res.json({
      status: 'success',
      data: {
        notifications: paginatedNotifications,
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
    console.error('Get notifications error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get notifications'
    });
  }
});

// @route   GET /api/notifications/unread
// @desc    Get unread notifications for the current user
// @access  Private
router.get('/unread', authenticateToken, async (req, res) => {
  try {
    const notifications = await Notification.findUnreadByUser(req.user._id);

    res.json({
      status: 'success',
      data: {
        notifications
      }
    });
  } catch (error) {
    console.error('Get unread notifications error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get unread notifications'
    });
  }
});

// @route   GET /api/notifications/count
// @desc    Get unread notification count for the current user
// @access  Private
router.get('/count', authenticateToken, async (req, res) => {
  try {
    const count = await notificationService.getUnreadCount(req.user._id);

    res.json({
      status: 'success',
      data: {
        count
      }
    });
  } catch (error) {
    console.error('Get notification count error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get notification count'
    });
  }
});

// @route   PUT /api/notifications/:id/read
// @desc    Mark a notification as read
// @access  Private
router.put('/:id/read', authenticateToken, validateObjectId, async (req, res) => {
  try {
    const notification = await notificationService.markAsRead(req.params.id, req.user._id);

    res.json({
      status: 'success',
      message: 'Notification marked as read',
      data: {
        notification
      }
    });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to mark notification as read'
    });
  }
});

// @route   PUT /api/notifications/read-all
// @desc    Mark all notifications as read for the current user
// @access  Private
router.put('/read-all', authenticateToken, async (req, res) => {
  try {
    await notificationService.markAllAsRead(req.user._id);

    res.json({
      status: 'success',
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to mark all notifications as read'
    });
  }
});

// @route   DELETE /api/notifications/:id
// @desc    Delete a notification
// @access  Private
router.delete('/:id', authenticateToken, validateObjectId, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        status: 'error',
        message: 'Notification not found'
      });
    }

    // Check if user owns the notification
    if (notification.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'You can only delete your own notifications'
      });
    }

    await Notification.findByIdAndDelete(req.params.id);

    res.json({
      status: 'success',
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete notification'
    });
  }
});

// @route   DELETE /api/notifications
// @desc    Delete all notifications for the current user
// @access  Private
router.delete('/', authenticateToken, async (req, res) => {
  try {
    await Notification.deleteMany({ recipient: req.user._id });

    res.json({
      status: 'success',
      message: 'All notifications deleted successfully'
    });
  } catch (error) {
    console.error('Delete all notifications error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete all notifications'
    });
  }
});

module.exports = router; 