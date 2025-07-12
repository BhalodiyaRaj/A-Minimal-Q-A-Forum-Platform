const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticateToken, requireUser } = require('../middleware/auth');
const { validateRegister, validateLogin, validateProfileUpdate } = require('../middleware/validation');
const { uploadAvatar, handleUploadError } = require('../middleware/upload');
const { deleteImage } = require('../utils/cloudinary');

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', validateRegister, async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findByUsernameOrEmail(username);
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'User already exists'
      });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password
    });

    await user.save();

    // Generate JWT token
    const token = user.generateAuthToken();

    // Remove password from response
    const userResponse = {
      id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar.url || user.avatar, // Handle both new and old format
      bio: user.bio,
      role: user.role,
      reputation: user.reputation,
      badges: user.badges,
      createdAt: user.createdAt
    };

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: {
        user: userResponse,
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Registration failed'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', validateLogin, async (req, res) => {
  try {
    const { identifier, password } = req.body;

    // Find user by username or email
    const user = await User.findByUsernameOrEmail(identifier).select('+password');
    
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    // Update last seen
    await user.updateLastSeen();

    // Generate JWT token
    const token = user.generateAuthToken();

    // Remove password from response
    const userResponse = {
      id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar.url || user.avatar, // Handle both new and old format
      bio: user.bio,
      role: user.role,
      reputation: user.reputation,
      badges: user.badges,
      lastSeen: user.lastSeen,
      createdAt: user.createdAt
    };

    res.json({
      status: 'success',
      message: 'Login successful',
      data: {
        user: userResponse,
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Login failed'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('questionsCount')
      .populate('answersCount');

    const userResponse = {
      id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar.url || user.avatar, // Handle both new and old format
      bio: user.bio,
      role: user.role,
      reputation: user.reputation,
      badges: user.badges,
      isVerified: user.isVerified,
      lastSeen: user.lastSeen,
      preferences: user.preferences,
      questionsCount: user.questionsCount,
      answersCount: user.answersCount,
      createdAt: user.createdAt
    };

    res.json({
      status: 'success',
      data: {
        user: userResponse
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get profile'
    });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authenticateToken, uploadAvatar, handleUploadError, validateProfileUpdate, async (req, res) => {
  try {
    const { bio } = req.body;
    const updateData = {};

    if (bio !== undefined) updateData.bio = bio;

    // Handle avatar upload
    if (req.file) {
      // Delete old avatar from Cloudinary if exists
      const currentUser = await User.findById(req.user._id);
      if (currentUser.avatar && currentUser.avatar.public_id) {
        await deleteImage(currentUser.avatar.public_id);
      }

      // Update avatar with new Cloudinary data
      updateData.avatar = {
        url: req.file.path,
        public_id: req.file.filename
      };
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    );

    const userResponse = {
      id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar.url || user.avatar, // Handle both new and old format
      bio: user.bio,
      role: user.role,
      reputation: user.reputation,
      badges: user.badges,
      createdAt: user.createdAt
    };

    res.json({
      status: 'success',
      message: 'Profile updated successfully',
      data: {
        user: userResponse
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update profile'
    });
  }
});

// @route   POST /api/auth/avatar
// @desc    Upload user avatar
// @access  Private
router.post('/avatar', authenticateToken, uploadAvatar, handleUploadError, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No avatar file provided'
      });
    }

    // Delete old avatar from Cloudinary if exists
    const currentUser = await User.findById(req.user._id);
    if (currentUser.avatar && currentUser.avatar.public_id) {
      await deleteImage(currentUser.avatar.public_id);
    }

    // Update avatar with new Cloudinary data
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        avatar: {
          url: req.file.path,
          public_id: req.file.filename
        }
      },
      { new: true, runValidators: true }
    );

    const userResponse = {
      id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar.url || user.avatar, // Handle both new and old format
      bio: user.bio,
      role: user.role,
      reputation: user.reputation,
      badges: user.badges,
      createdAt: user.createdAt
    };

    res.json({
      status: 'success',
      message: 'Avatar uploaded successfully',
      data: {
        user: userResponse
      }
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to upload avatar'
    });
  }
});

// @route   DELETE /api/auth/avatar
// @desc    Delete user avatar
// @access  Private
router.delete('/avatar', authenticateToken, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    
    // Delete avatar from Cloudinary if exists
    if (currentUser.avatar && currentUser.avatar.public_id) {
      await deleteImage(currentUser.avatar.public_id);
    }

    // Remove avatar from user
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        avatar: {
          url: '',
          public_id: ''
        }
      },
      { new: true, runValidators: true }
    );

    const userResponse = {
      id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar.url || user.avatar, // Handle both new and old format
      bio: user.bio,
      role: user.role,
      reputation: user.reputation,
      badges: user.badges,
      createdAt: user.createdAt
    };

    res.json({
      status: 'success',
      message: 'Avatar deleted successfully',
      data: {
        user: userResponse
      }
    });
  } catch (error) {
    console.error('Avatar delete error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete avatar'
    });
  }
});

// @route   PUT /api/auth/preferences
// @desc    Update user notification preferences
// @access  Private
router.put('/preferences', authenticateToken, async (req, res) => {
  try {
    const { emailNotifications, pushNotifications } = req.body;
    const updateData = {};

    if (emailNotifications !== undefined) {
      updateData['preferences.emailNotifications'] = emailNotifications;
    }
    if (pushNotifications !== undefined) {
      updateData['preferences.pushNotifications'] = pushNotifications;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      status: 'success',
      message: 'Preferences updated successfully',
      data: {
        preferences: user.preferences
      }
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update preferences'
    });
  }
});

// @route   POST /api/auth/refresh
// @desc    Refresh JWT token
// @access  Private
router.post('/refresh', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const token = user.generateAuthToken();

    res.json({
      status: 'success',
      message: 'Token refreshed successfully',
      data: {
        token
      }
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to refresh token'
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // Update last seen
    await req.user.updateLastSeen();

    res.json({
      status: 'success',
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Logout failed'
    });
  }
});

// @route   GET /api/auth/check-username/:username
// @desc    Check if username is available
// @access  Public
router.get('/check-username/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const existingUser = await User.findOne({ username });

    res.json({
      status: 'success',
      data: {
        available: !existingUser
      }
    });
  } catch (error) {
    console.error('Check username error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to check username'
    });
  }
});

// @route   GET /api/auth/check-email/:email
// @desc    Check if email is available
// @access  Public
router.get('/check-email/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const existingUser = await User.findOne({ email });

    res.json({
      status: 'success',
      data: {
        available: !existingUser
      }
    });
  } catch (error) {
    console.error('Check email error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to check email'
    });
  }
});

module.exports = router; 