const {
  signupUser,
  loginUser,
  verifyEmailCode,
  resendVerificationEmail,
  forgotPassword,
  verifyResetCodeService,
  resetPasswordService
} = require('../services/auth.service');
const { isRateLimited } = require('../utils/rateLimiter');
const AUTH_MESSAGES = require("../commonMessages/authMessages");
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/emailService');
const { User } = require("../models");

const authController = {
  signup: async (req, res) => {
    try {
      const { user, verificationCode } = await signupUser(req.body);

      // DO NOT await → API fast
      sendVerificationEmail(user.email, verificationCode, user.name)
        .then(() => console.log("Email sent"))
        .catch(err => console.error("Email send failed:", err));

      return res.status(201).json({
        success: true,
        message: AUTH_MESSAGES.CODE_SENT,
        data: { user }
      });

    } catch (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
  },

  login: async (req, res) => {
    try {
      const data = await loginUser(req.body.email, req.body.password);
      res.status(200).json({
        success: true,
        message: AUTH_MESSAGES.LOGIN_SUCCESS,
        data
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error.message,
        code: error.code || "LOGIN_ERROR"
      });
    }
  },

  verifyEmail: async (req, res) => {
    try {
      const data = await verifyEmailCode(req.body.email, req.body.code);
      res.status(200).json({
        success: true,
        message: AUTH_MESSAGES.EMAIL_VERIFIED_SUCCESS,
        data
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
        code: "VERIFICATION_FAILED"
      });
    }
  },

  resendVerification: async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: AUTH_MESSAGES.MISSING_FIELDS
        });
      }

      const normalizedEmail = email.toLowerCase().trim();

      if (isRateLimited(normalizedEmail)) {
        return res.status(429).json({
          success: false,
          message: AUTH_MESSAGES.TRY_AGAIN_LATER
        });
      }

      const { status } = await resendVerificationEmail(normalizedEmail);

      if (status === AUTH_MESSAGES.USER_NOT_FOUND) {
        return res.status(200).json({
          success: true,
          message: AUTH_MESSAGES.RESET_SENT_IF_REGISTERED
        });
      }

      if (status === AUTH_MESSAGES.ALREADY_VERIFIED) {
        return res.status(400).json({
          success: false,
          message: AUTH_MESSAGES.ALREADY_VERIFIED
        });
      }

      return res.status(200).json({
        success: true,
        message: AUTH_MESSAGES.CODE_SENT
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: AUTH_MESSAGES.RESEND_VERIFICATION_FAILED,
        code: "RESEND_ERROR"
      });
    }
  },

  getProfile: async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: AUTH_MESSAGES.UNAUTHORIZED
        });
      }

      res.status(200).json({
        success: true,
        message: AUTH_MESSAGES.PROFILE_FETCHED,
        data: { user: req.user }
      });

    } catch (error) {
      console.error('Profile Error:', error);
      res.status(500).json({
        success: false,
        message: AUTH_MESSAGES.PROFILE_FAILED,
        code: "PROFILE_ERROR"
      });
    }
  },

  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: AUTH_MESSAGES.MISSING_FIELDS
        });
      }

      const response = await forgotPassword(email);

      res.status(200).json({
        success: true,
        message: response.message
      });

      if (response.shouldSendEmail) {
        setImmediate(async () => {
          try {
            await sendPasswordResetEmail(
              response.email,
              response.resetCode,
              response.name
            );
            console.log("Password reset email sent to:", response.email);

          } catch (err) {
            console.error("Password Reset Email Failed:", err.message);

            await User.update(
              { email_send_failed: true },
              { where: { id: response.userId } }
            );
          }
        });
      }

    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  },


  logout: async (req, res) => {
    res.status(200).json({
      success: true,
      message: AUTH_MESSAGES.LOGOUT_SUCCESS
    });
  },

  verifyResetCode: async (req, res) => {
    try {
      const { email, code } = req.body;

      if (!email || !code) {
        return res.status(400).json({
          success: false,
          message: AUTH_MESSAGES.MISSING_FIELDS
        });
      }

      const result = await verifyResetCodeService(email, code);

      return res.status(result.success ? 200 : 400).json({
        success: result.success,
        message: result.message
      });

    } catch (error) {
      console.log("RESET CODE ERROR:", error);

      return res.status(500).json({
        success: false,
        message: AUTH_MESSAGES.SOMETHING_WRONG,
        code: "VERIFY_RESET_CODE_ERROR"
      });
    }
  },

  resetPassword: async (req, res) => {
    try {
      const { email, newPassword } = req.body;

      if (!email || !newPassword) {
        return res.status(400).json({
          success: false,
          message: AUTH_MESSAGES.MISSING_FIELDS
        });
      }

      const result = await resetPasswordService(email, newPassword);

      return res.status(result.success ? 200 : 400).json({
        success: result.success,
        message: result.message
      });

    } catch (error) {
      console.log("RESET PASSWORD ERROR:", error);

      return res.status(500).json({
        success: false,
        message: AUTH_MESSAGES.SOMETHING_WRONG,
        code: "RESET_PASSWORD_ERROR"
      });
    }
  }
};

module.exports = authController;
