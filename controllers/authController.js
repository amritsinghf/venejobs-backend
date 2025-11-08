const User = require('../models/User');
const Role = require('../models/Role');

const { hashPassword, comparePassword, generateToken } = require('../utils/helpers');

const authController = {
  signup: async (req, res) => {
    try {
      const { name, email, password, role } = req.body;

      if (!email || !password || !name || !role) {
        return res.status(400).json({
          success: false,
          message: 'All fields (name, email, password, role) are required',
          code: 'MISSING_FIELDS',
        });
      }

      const existingUser = await User.findByEmail(email.toLowerCase().trim());
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'User already exists with this email address',
          code: 'USER_EXISTS',
          errors: [{ field: 'email', message: 'Email already registered' }]
        });
      }

      const hashedPassword = await hashPassword(password);

      const selectedRole = await Role.findByName(role.toLowerCase().trim());
      if (!selectedRole) {
        return res.status(400).json({
          success: false,
          message: `Invalid role: ${role}`,
          code: 'INVALID_ROLE',
          errors: [{ field: 'role', message: 'Role not found in system' }]
        });
      }

      const user = await User.create({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role_id: selectedRole.id
      });

      const token = generateToken(user.id);

      return res.status(201).json({
        success: true,
        message: 'Account created successfully! Welcome to Venejob.',
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: selectedRole.name,
            is_verified: user.is_verified,
            created_at: user.created_at
          },
          token
        }
      });

    } catch (error) {
      console.error('🚨 Signup error:', error);

      return res.status(500).json({
        success: false,
        message: 'Unable to create account at this time',
        code: 'SIGNUP_ERROR',
        errors: [{ message: error.message }]
      });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required',
          code: 'MISSING_CREDENTIALS'
        });
      }

      const user = await User.findByEmail(email.toLowerCase());
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS'
        });
      }

      const isPasswordValid = await comparePassword(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS'
        });
      }

      const token = generateToken(user.id);

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

  verifyAccount: async (req, res) => {
    try {
      res.json({
        success: true,
        message: 'Account verification endpoint - to be implemented'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Verification failed'
      });
    }
  }
};

module.exports = authController;
