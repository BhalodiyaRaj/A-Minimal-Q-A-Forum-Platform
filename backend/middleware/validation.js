const { body, param, query, validationResult } = require('express-validator');

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Validation rules for user registration
const validateRegister = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  handleValidationErrors
];

// Validation rules for user login
const validateLogin = [
  body('identifier')
    .notEmpty()
    .withMessage('Username or email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// Validation rules for question creation
const validateQuestion = [
  body('title')
    .trim()
    .isLength({ min: 10, max: 200 })
    .withMessage('Question title must be between 10 and 200 characters'),
  body('content')
    .trim()
    .isLength({ min: 20 })
    .withMessage('Question content must be at least 20 characters long'),
  body('tags')
    .isArray({ min: 1, max: 5 })
    .withMessage('Question must have between 1 and 5 tags'),
  body('tags.*')
    .trim()
    .isLength({ min: 2, max: 30 })
    .withMessage('Each tag must be between 2 and 30 characters')
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Tags can only contain lowercase letters, numbers, and hyphens'),
  handleValidationErrors
];

// Validation rules for answer creation
const validateAnswer = [
  body('content')
    .trim()
    .isLength({ min: 20 })
    .withMessage('Answer content must be at least 20 characters long'),
  handleValidationErrors
];

// Validation rules for comment creation
const validateComment = [
  body('content')
    .trim()
    .isLength({ min: 2, max: 500 })
    .withMessage('Comment content must be between 2 and 500 characters'),
  handleValidationErrors
];

// Validation rules for voting
const validateVote = [
  body('voteType')
    .isIn(['upvote', 'downvote'])
    .withMessage('Vote type must be either upvote or downvote'),
  handleValidationErrors
];

// Validation rules for user profile update
const validateProfileUpdate = [
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters'),
  body('avatar')
    .optional()
    .isURL()
    .withMessage('Avatar must be a valid URL'),
  handleValidationErrors
];

// Validation rules for search queries
const validateSearch = [
  query('q')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Search query must be at least 2 characters long'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];

// Validation rules for pagination
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];

// Validation rules for MongoDB ObjectId
const validateObjectId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
  handleValidationErrors
];

// Validation rules for tag creation
const validateTag = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 30 })
    .withMessage('Tag name must be between 2 and 30 characters')
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Tag name can only contain lowercase letters, numbers, and hyphens'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Tag description cannot exceed 500 characters'),
  handleValidationErrors
];

// Validation rules for notification preferences
const validateNotificationPreferences = [
  body('emailNotifications')
    .optional()
    .isBoolean()
    .withMessage('emailNotifications must be a boolean'),
  body('pushNotifications')
    .optional()
    .isBoolean()
    .withMessage('pushNotifications must be a boolean'),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateRegister,
  validateLogin,
  validateQuestion,
  validateAnswer,
  validateComment,
  validateVote,
  validateProfileUpdate,
  validateSearch,
  validatePagination,
  validateObjectId,
  validateTag,
  validateNotificationPreferences
}; 