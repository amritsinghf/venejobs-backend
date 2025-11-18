const crypto = require('crypto');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/emailService');
const { hashPassword, comparePassword, generateToken } = require('../utils/helpers');
const { User, Role } = require("../models");
const MESSAGES = require("../commonMessages/authMessages");

async function signupUser({ name, email, password, role, username }) {

    if (!name || !email || !password || !role || !username) {
        throw new Error(MESSAGES.MISSING_FIELDS);
    }

    const existingUsername = await User.findOne({ where: { username } });
    if (existingUsername) throw new Error(MESSAGES.USERNAME_EXISTS);

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ where: { email: normalizedEmail } });
    if (existingUser) throw new Error(MESSAGES.USER_EXISTS);

    const userRole = await Role.findOne({ where: { name: role.toLowerCase().trim() } });
    if (!userRole) throw new Error(MESSAGES.INVALID_ROLE);

    const hashedPassword = await hashPassword(password, 10);

    const verificationCode = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const user = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        username,
        password: hashedPassword,
        role_id: userRole.id,
        email_verification_code: verificationCode,
        email_verification_expires_at: expiresAt,
        email_send_failed: false
    });

    return {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: userRole.name,
        is_verified: user.is_email_verified,
        created_at: user.created_at,
        email_verification_code: verificationCode
    };
}


async function loginUser(email, password) {

    if (!email || !password) {
        const error = new Error(MESSAGES.MISSING_CREDENTIALS);
        error.code = MESSAGES.MISSING_CREDENTIALS;
        throw error;
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ where: { email: normalizedEmail } });
    if (!user) {
        const error = new Error(MESSAGES.INVALID_CREDENTIALS);
        error.code = MESSAGES.INVALID_CREDENTIALS;
        throw error;
    }

    const validPassword = await comparePassword(password, user.password);
    if (!validPassword) {
        const error = new Error(MESSAGES.INVALID_CREDENTIALS);
        error.code = MESSAGES.INVALID_CREDENTIALS;
        throw error;
    }

    if (!user.is_email_verified) {
        const error = new Error(MESSAGES.EMAIL_NOT_VERIFIED);
        error.code = MESSAGES.EMAIL_NOT_VERIFIED;
        throw error;
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
    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ where: { email: normalizedEmail } });
    if (!user) throw new Error(MESSAGES.USER_NOT_FOUND);

    if (!user.email_verification_code) {
        throw new Error(MESSAGES.NO_CODE);
    }

    if (new Date() > new Date(user.email_verification_expires_at)) {
        throw new Error(MESSAGES.CODE_EXPIRED);
    }

    if (user.email_verification_code !== code) {
        throw new Error(MESSAGES.INVALID_CODE);
    }

    user.is_email_verified = true;
    user.email_verification_code = null;
    user.email_verification_expires_at = null;
    await user.save();

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

async function resendVerificationEmail(email) {
    const user = await User.findOne({ where: { email } });

    // If user not found - do not reveal
    if (!user) {
        return { status: "NO_USER" };
    }
    // If already verified - tell controller
    if (user.is_email_verified) {
        return { status: "ALREADY_VERIFIED" };
    }

    // Generate new code
    const verificationCode = crypto.randomInt(100000, 999999).toString();
    user.email_verification_code = verificationCode;
    user.email_verification_expires_at = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    // Send email
    await sendVerificationEmail(user.email, verificationCode, user.name ?? "User");

    return { status: "CODE_SENT" };
}

async function forgotPassword(email) {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ where: { email: normalizedEmail } });

    if (!user) {
        return {
            message: MESSAGES.RESET_SENT_IF_REGISTERED,
            shouldSendEmail: false
        };
    }

    if (!user.is_email_verified) {
        return {
            message: MESSAGES.EMAIL_VERIFY_FIRST,
            shouldSendEmail: false
        };
    }

    const resetCode = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    user.password_reset_code = resetCode;
    user.password_reset_expires_at = expiresAt;
    await user.save();

    return {
        message: MESSAGES.RESET_SENT_MESSAGE,
        shouldSendEmail: true,
        email: user.email,
        resetCode,
        name: user.name || "User",
        userId: user.id
    };
}



async function verifyResetCodeService(email, code) {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ where: { email: normalizedEmail } });

    if (!user) {
        return {
            success: false,
            message: MESSAGES.INVALID_OR_EXPIRED_RESET_CODE
        };
    }

    if (!user.is_email_verified) {
        return {
            success: false,
            message: MESSAGES.EMAIL_VERIFY_FIRST
        };
    }

    if (!user.password_reset_code || user.password_reset_code !== code) {
        return {
            success: false,
            message: MESSAGES.INVALID_RESET_CODE
        };
    }

    if (new Date() > new Date(user.password_reset_expires_at)) {
        return {
            success: false,
            message: MESSAGES.RESET_CODE_EXPIRED
        };
    }

    return {
        success: true,
        message: MESSAGES.CODE_VERIFIED_SUCCESS
    };
}

async function resetPasswordService(email, newPassword) {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ where: { email: normalizedEmail } });

    if (!user) {
        return {
            success: false,
            message: MESSAGES.INVALID_RESET
        };
    }

    if (!user.is_email_verified) {
        return {
            success: false,
            message: MESSAGES.EMAIL_VERIFY_FIRST
        };
    }

    if (!user.password_reset_code) {
        return {
            success: false,
            message: MESSAGES.INVALID_RESET
        };
    }

    if (new Date() > new Date(user.password_reset_expires_at)) {
        return {
            success: false,
            message: MESSAGES.RESET_CODE_EXPIRED
        };
    }

    const hashedPassword = await hashPassword(newPassword, 10);

    user.password = hashedPassword;
    user.password_reset_code = null;
    user.password_reset_expires_at = null;
    await user.save();

    return {
        success: true,
        message: MESSAGES.RESET_SUCCESS
    };
}


module.exports = {
    signupUser,
    loginUser,
    verifyEmailCode,
    resendVerificationEmail,
    forgotPassword,
    verifyResetCodeService,
    resetPasswordService
};
