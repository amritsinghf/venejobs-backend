const { body, validationResult } = require('express-validator');

const validateSignup = [
  body('name')
    .trim()
    .notEmpty().withMessage('Please enter your full name.')
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters.'),

  body('email')
    .trim()
    .isEmail().withMessage('Please enter a valid email address.')
    .isLength({ max: 255 })
    .withMessage('Email cannot be longer than 255 characters.')
    .customSanitizer(value => value.toLowerCase()),

  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.')
    .matches(/[A-Z]/).withMessage('Password must include at least one uppercase letter.')
    .matches(/[a-z]/).withMessage('Password must include at least one lowercase letter.')
    .matches(/\d/).withMessage('Password must include at least one number.')
    .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('Password must include at least one special character.'),

  body('username')
    .trim()
    .notEmpty().withMessage('Please choose a username.')
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters.'),

  body('role')
    .trim()
    .notEmpty().withMessage('Please select a role.'),

  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg
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
    .withMessage('Please enter a valid email address.'),

  body('password')
    .notEmpty()
    .withMessage('Please enter your password.'),

  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg
      });
    }

    next();
  }
];

const validateResetPassword = [
  body("newPassword")
    .notEmpty().withMessage("Please enter a new password.")
    .isLength({ min: 8 }).withMessage("Password must be at least 8 characters long.")
    .matches(/[A-Z]/).withMessage("Password must include at least one uppercase letter.")
    .matches(/[a-z]/).withMessage("Password must include at least one lowercase letter.")
    .matches(/\d/).withMessage("Password must include at least one number.")
    .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage("Password must include at least one special character."),

  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg
      });
    }

    next();
  }
];



module.exports = {
  validateSignup,
  validateLogin,
  validateResetPassword
};
