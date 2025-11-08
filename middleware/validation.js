const { body, validationResult } = require('express-validator');

const validateSignup = [
  body('name')
    .trim()
    .notEmpty().withMessage('Full name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),

  body('email')
    .trim()
    .normalizeEmail()
    .isEmail().withMessage('Please provide a valid email address')
    .isLength({ max: 255 })
    .withMessage('Email must not exceed 255 characters'),

  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
    .matches(/\d/).withMessage('Password must contain at least one number')
    .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('Password must contain at least one special character'),

  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const combinedMessage = errors.array().map(err => err.msg).join(', ');

      return res.status(400).json({
        success: false,
        message: combinedMessage 
      });
    }

    next();
  }
];

// Validation rules for user login
const validateLogin = [
  body('email')
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage('Please provide a valid email address'),

  body('password')
    .notEmpty()
    .withMessage('Password is required'),

  // Validation error handler
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array().map(error => ({
          field: error.param,
          message: error.msg
        }))
      });
    }

    next();
  }
];

module.exports = {
  validateSignup,
  validateLogin
};
