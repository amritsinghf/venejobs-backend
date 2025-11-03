const User = require('../models/User');
const { hashPassword, comparePassword, generateToken } = require('../utils/helpers');

const authController = {
  /**
   * User Signup
   * Creates a new user account and returns a JWT token for automatic login
   */
  signup: async (req, res) => {
    try {
      const { name, email, password } = req.body;

      console.log('📝 Signup attempt for:', email);

      // Check if user already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'User already exists with this email address',
          code: 'USER_EXISTS'
        });
      }

      // Hash password before saving
      const hashedPassword = await hashPassword(password);

      // Create user in database
      const user = await User.create({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword
      });

      console.log('✅ User created successfully:', user.email);

      // Generate JWT token
      const token = generateToken(user.id);

      // Send response
      res.status(201).json({
        success: true,
        message: 'Account created successfully! Welcome to Venejob.',
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            is_verified: user.is_verified,
            created_at: user.created_at
          },
          token: token
        }
      });

    } catch (error) {
      console.error('🚨 Signup error:', error);

      res.status(500).json({
        success: false,
        message: 'Unable to create account at this time',
        code: 'SIGNUP_ERROR',
        ...(process.env.NODE_ENV === 'development' && { error: error.message })
      });
    }
  },

  /**
   * User Login
   * Authenticates user credentials and returns a JWT token
   */
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required',
          code: 'MISSING_CREDENTIALS'
        });
      }

      // Find user by email
      const user = await User.findByEmail(email.toLowerCase());
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS'
        });
      }

      // Verify password
      const isPasswordValid = await comparePassword(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS'
        });
      }

      // Generate JWT token
      const token = generateToken(user.id);

      // Send response
      res.json({
        success: true,
        message: 'Login successful! Welcome back.',
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            is_verified: user.is_verified,
            created_at: user.created_at
          },
          token: token
        }
      });

    } catch (error) {
      console.error('🚨 Login error:', error);

      res.status(500).json({
        success: false,
        message: 'Unable to login at this time',
        code: 'LOGIN_ERROR',
        ...(process.env.NODE_ENV === 'development' && { error: error.message })
      });
    }
  },

  /**
   * Get User Profile
   * Returns profile data of the authenticated user
   * Assumes `authenticateToken` middleware attaches user info to `req.user`
   */
  getProfile: async (req, res) => {
    try {
      res.json({
        success: true,
        message: 'Profile retrieved successfully',
        data: { user: req.user }
      });
    } catch (error) {
      console.error('🚨 Profile error:', error);

      res.status(500).json({
        success: false,
        message: 'Unable to fetch profile',
        code: 'PROFILE_ERROR'
      });
    }
  },

  /**
   * Verify Account
   * Placeholder endpoint for email/account verification
   * Future implementation will verify user via token
   */
  verifyAccount: async (req, res) => {
    try {
      res.json({
        success: true,
        message: 'Account verification endpoint - to be implemented'
      });
    } catch (error) {
      console.error('🚨 Verification error:', error);
      res.status(500).json({
        success: false,
        message: 'Verification failed'
      });
    }
  }
};

module.exports = authController;
