const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');

const { validateSignup } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

router.post('/signup', validateSignup, authController.signup);

router.post('/login', authController.login);

router.get('/profile', authenticateToken, authController.getProfile);

router.get('/verify', authController.verifyAccount);

module.exports = router;