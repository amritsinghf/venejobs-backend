const crypto = require('crypto');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/emailService');
const { hashPassword, comparePassword, generateToken } = require('../utils/helpers');
const { findUserByEmail, createUser, updateUser } = require('./userService');
const Role = require('../models/Role');

async function signupUser({ name, email, password, role, username }) {
    if (!name || !email || !password || !role || !username) throw new Error('MISSING_FIELDS');

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await findUserByEmail(normalizedEmail);
    if (existingUser) throw new Error('USER_EXISTS');

    const selectedRole = await Role.findByName(role.toLowerCase().trim());
    if (!selectedRole) throw new Error('INVALID_ROLE');

    const hashedPassword = await hashPassword(password);
    const verificationCode = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const user = await createUser({
        name: name.trim(),
        email: normalizedEmail,
        username: username,
        password: hashedPassword,
        role_id: selectedRole.id,
        email_verification_code: verificationCode,
        email_verification_expires_at: expiresAt
    });

    await sendVerificationEmail(email, verificationCode, name);

    return {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: selectedRole.name,
        is_verified: user.is_email_verified,
        created_at: user.created_at
    };
}

async function loginUser(email, password) {
    if (!email || !password) {
        const err = new Error('Email and password are required');
        err.code = 'MISSING_CREDENTIALS';
        throw err;
    }

    const user = await findUserByEmail(email.toLowerCase().trim());
    if (!user) {
        const err = new Error('Invalid email or password');
        err.code = 'INVALID_CREDENTIALS';
        throw err;
    }

    const valid = await comparePassword(password, user.password);
    if (!valid) {
        const err = new Error('Invalid email or password');
        err.code = 'INVALID_CREDENTIALS';
        throw err;
    }

    if (!user.is_email_verified) {
        const err = new Error('Please verify your email before logging in');
        err.code = 'EMAIL_NOT_VERIFIED';
        throw err;
    }

    const token = generateToken(user.id);
    return {
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role_id: user.role_id,
            is_verified: user.is_email_verified
        },
        token
    };
}

async function verifyEmailCode(email, code) {
    const user = await findUserByEmail(email.toLowerCase().trim());
    if (!user) throw new Error('User not found');

    if (!user.email_verification_code) throw new Error('No verification code found');
    if (new Date() > new Date(user.email_verification_expires_at))
        throw new Error('Verification code expired');

    if (user.email_verification_code !== code) throw new Error('Invalid verification code');

    const updatedUser = await updateUser(user.id, {
        is_email_verified: true,
        email_verification_code: null,
        email_verification_expires_at: null
    });

    const token = generateToken(updatedUser.id);
    return {
        user: {
            id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            role_id: updatedUser.role_id,
            is_verified: updatedUser.is_email_verified
        },
        token
    };
}

async function resendVerificationEmail(email) {
    const user = await findUserByEmail(email);
    if (!user || user.is_email_verified) return;

    const verificationCode = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await updateUser(user.id, {
        email_verification_code: verificationCode,
        email_verification_expires_at: expiresAt
    });

    await sendVerificationEmail(user.email, verificationCode, user.name || 'User');
}

async function forgotPassword(email) {
    const user = await findUserByEmail(email.toLowerCase().trim());
    if (!user) throw new Error('USER_NOT_FOUND');

    const resetCode = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await updateUser(user.id, {
        password_reset_code: resetCode,
        password_reset_expires_at: expiresAt
    });

    await sendPasswordResetEmail(user.email, resetCode, user.name || 'User');

    return { message: 'Password reset code sent to your email.' };
}

module.exports = {
    signupUser,
    loginUser,
    verifyEmailCode,
    resendVerificationEmail,
    forgotPassword
};
