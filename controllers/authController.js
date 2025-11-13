const {
  signupUser,
  loginUser,
  verifyEmailCode,
  resendVerificationEmail,
  forgotPassword,
  verifyResetCodeService,
  resetPasswordService
} = require('../services/authService');
const { isRateLimited } = require('../utils/rateLimiter');
const MESSAGES = require("../constants/messages");
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/emailService');
const User = require('../models/User');

const authController = {
  signup: async (req, res) => {
    try {
      const user = await signupUser(req.body);

      res.status(201).json({
        success: true,
        message: MESSAGES.CODE_SENT,
        data: { user }
      });

      setImmediate(async () => {
        try {
          await sendVerificationEmail(
            user.email,
            user.email_verification_code,
            user.name
          );
          console.log("Verification email sent to:", user.email);

        } catch (err) {
          console.error("EMAIL SEND FAILED:", err.message);

          await User.update(
            { email_send_failed: true },
            { where: { id: user.id } }
          );
        }
      });

    } catch (error) {
      console.log("SIGNUP ERROR DETAILS:", JSON.stringify(error, null, 2));

      const messages = {
        USER_EXISTS: MESSAGES.USER_EXISTS,
        USERNAME_EXISTS: MESSAGES.USERNAME_EXISTS,
        INVALID_ROLE: MESSAGES.INVALID_ROLE,
        MISSING_FIELDS: MESSAGES.MISSING_FIELDS
      };

      res.status(400).json({
        success: false,
        message: messages[error.message] || MESSAGES.SIGNUP_FAILED,
        code: error.message
      });
    }
  },


  login: async (req, res) => {
    try {
      const data = await loginUser(req.body.email, req.body.password);
      res.status(200).json({
        success: true,
        message: MESSAGES.LOGIN_SUCCESS,
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
        message: MESSAGES.EMAIL_VERIFIED_SUCCESS,
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
          message: MESSAGES.MISSING_FIELDS
        });
      }

      const normalizedEmail = email.toLowerCase().trim();

      if (isRateLimited(normalizedEmail)) {
        return res.status(429).json({
          success: false,
          message: MESSAGES.TRY_AGAIN_LATER
        });
      }

      const { status } = await resendVerificationEmail(normalizedEmail);

      if (status === MESSAGES.USER_NOT_FOUND) {
        return res.status(200).json({
          success: true,
          message: MESSAGES.RESET_SENT_IF_REGISTERED
        });
      }

      if (status === MESSAGES.ALREADY_VERIFIED) {
        return res.status(400).json({
          success: false,
          message: MESSAGES.ALREADY_VERIFIED
        });
      }

      return res.status(200).json({
        success: true,
        message: MESSAGES.CODE_SENT
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: MESSAGES.RESEND_VERIFICATION_FAILED,
        code: "RESEND_ERROR"
      });
    }
  },

  getProfile: async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: MESSAGES.UNAUTHORIZED
        });
      }

      res.status(200).json({
        success: true,
        message: MESSAGES.PROFILE_FETCHED,
        data: { user: req.user }
      });

    } catch (error) {
      console.error('Profile Error:', error);
      res.status(500).json({
        success: false,
        message: MESSAGES.PROFILE_FAILED,
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
          message: MESSAGES.MISSING_FIELDS
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
      message: MESSAGES.LOGOUT_SUCCESS
    });
  },

  verifyResetCode: async (req, res) => {
    try {
      const { email, code } = req.body;

      if (!email || !code) {
        return res.status(400).json({
          success: false,
          message: MESSAGES.MISSING_FIELDS
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
        message: MESSAGES.SOMETHING_WRONG,
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
          message: MESSAGES.MISSING_FIELDS
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
        message: MESSAGES.SOMETHING_WRONG,
        code: "RESET_PASSWORD_ERROR"
      });
    }
  }
};

module.exports = authController;
