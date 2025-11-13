const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');

const { validateSignup } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

router.post('/signup', validateSignup, authController.signup);

router.post('/login', authController.login);

router.get('/profile', authenticateToken, authController.getProfile);

router.post('/verify-email', authController.verifyEmail);
router.post('/resend-verification', authController.resendVerification);
router.post('/forgot-password', authController.forgotPassword);
router.post('/verifyResetCode', authController.verifyResetCode);
router.post('/resetPassword', authController.resetPassword);
router.post('/logout', authController.logout);
module.exports = router;
