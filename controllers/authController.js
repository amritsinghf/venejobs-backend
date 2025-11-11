const {
  signupUser,
  loginUser,
  verifyEmailCode,
  resendVerificationEmail,
  forgotPassword
} = require('../services/authService');

const { isRateLimited } = require('../utils/rateLimiter');

const authController = {
  signup: async (req, res) => {
    try {
      const data = await signupUser(req.body);
      res.status(201).json({
        success: true,
        message: 'Account created. Please verify your email.',
        data: { user: data }
      });
    } catch (error) {
      const messages = {
        USER_EXISTS: 'User already exists with this email.',
        INVALID_ROLE: 'Invalid role provided.',
        MISSING_FIELDS: 'All fields (name, email, password, role) are required.'
      };
      res.status(400).json({
        success: false,
        message: messages[error.message] || 'Signup failed',
        code: error.message
      });
    }
  },

  login: async (req, res) => {
    try {
      const data = await loginUser(req.body.email, req.body.password);
      res.status(200).json({ success: true, message: 'Login successful', data });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error.message,
        code: error.code || 'LOGIN_ERROR'
      });
    }
  },

  verifyEmail: async (req, res) => {
    try {
      const data = await verifyEmailCode(req.body.email, req.body.code);
      res.status(200).json({
        success: true,
        message: 'Email verified successfully',
        data
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
        code: 'VERIFICATION_FAILED'
      });
    }
  },

  resendVerification: async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email is required'
        });
      }

      const normalizedEmail = email.toLowerCase().trim();

      // rate limiter - 1 request/minute
      if (isRateLimited(normalizedEmail)) {
        return res.status(429).json({
          success: false,
          message: 'Please wait 1 minute before requesting again.'
        });
      }

      await resendVerificationEmail(normalizedEmail);
      res.status(200).json({
        success: true,
        message: 'If this email is registered, a new verification code has been sent.'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
        code: 'RESEND_ERROR'
      });
    }
  },
  getProfile: async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized - user not found in token'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Profile retrieved successfully',
        data: { user: req.user }
      });
    } catch (error) {
      console.error('Profile Error:', error);
      res.status(500).json({
        success: false,
        message: 'Unable to fetch profile',
        code: 'PROFILE_ERROR'
      });
    }
  },
  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email is required'
        });
      }

      const response = await forgotPassword(email);
      res.status(200).json({ success: true, message: response.message });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  logout: async (req, res) => {
    try {
      res.status(200).json({
        success: true,
        message: 'Logout successful.'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Logout failed',
        error: error.message
      });
    }
  }
};

module.exports = authController;
