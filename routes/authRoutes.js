const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');

const { authenticateToken } = require('../middleware/auth');
const { validateSignup, validateLogin, validateResetPassword } = require('../validators/auth.validation');

router.post('/signup', validateSignup, authController.signup);

router.post('/login', validateLogin, authController.login);

router.get('/profile', authenticateToken, authController.getProfile);

router.post('/verify-email', authController.verifyEmail);
router.post('/resend-verification', authController.resendVerification);
router.post('/forgot-password', authController.forgotPassword);
router.post('/verify-reset-code', authController.verifyResetCode);
router.post('/reset-password', validateResetPassword, authController.resetPassword);
router.post('/logout', authController.logout);
module.exports = router;
