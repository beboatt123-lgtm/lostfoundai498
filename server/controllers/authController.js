const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const { OAuth2Client } = require('google-auth-library');
const axios = require('axios');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');
const User = require('../models/User');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { firstname, lastname, email, password } = req.body;

    if (!firstname || !lastname || !email || !password) {
        res.status(400);
        throw new Error('Please add all fields');
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
        firstname,
        lastname,
        email,
        password: hashedPassword
    });

    if (user) {
        res.status(201).json({
            _id: user.id,
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            token: generateToken(user.id)
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
        res.json({
            _id: user.id,
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            token: generateToken(user.id)
        });
    } else {
        res.status(400);
        throw new Error('Invalid credentials');
    }
});

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
    res.status(200).json(req.user);
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.firstname = req.body.firstname || user.firstname;
        user.lastname = req.body.lastname || user.lastname;
        user.email = req.body.email || user.email;
        user.avatar = req.body.avatar || user.avatar;

        if (req.body.password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(req.body.password, salt);
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            firstname: updatedUser.firstname,
            lastname: updatedUser.lastname,
            email: updatedUser.email,
            role: updatedUser.role,
            avatar: updatedUser.avatar,
            token: generateToken(updatedUser._id)
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Google Login
// @route   POST /api/auth/google
// @access  Public
const googleLogin = asyncHandler(async (req, res) => {
    const { tokenId } = req.body;

    if (!tokenId) {
        console.error('Google Auth Error: No tokenId provided in request');
        res.status(400);
        throw new Error('Google authentication failed: No token provided');
    }

    try {
        console.log('Attempting Google Auth with token:', tokenId.substring(0, 10) + '...');
        
        // Fetch user info from Google using the access token
        const googleRes = await axios.get(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${tokenId}`);
        const { email, given_name, family_name, picture } = googleRes.data;

        console.log('Google Auth Success for email:', email);

        let user = await User.findOne({ email });

        if (!user) {
            console.log('Creating new user for:', email);
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(crypto.randomBytes(8).toString('hex'), salt);

            user = await User.create({
                firstname: given_name,
                lastname: family_name || '-',
                email,
                password: hashedPassword,
                avatar: picture,
            });
        }

        if (user.isSuspended) {
            res.status(401);
            throw new Error('บัญชีของคุณถูกระงับการใช้งาน');
        }

        res.json({
            _id: user.id,
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            token: generateToken(user.id),
        });
    } catch (error) {
        console.error('Google Auth Error Detailed:');
        if (error.response) {
            console.error('Data:', error.response.data);
            console.error('Status:', error.response.status);
        } else {
            console.error('Message:', error.message);
        }
        res.status(error.response?.status || 500);
        throw new Error(`Google authentication failed: ${error?.response?.data?.error_description || error.message}`);
    }
});
// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        res.status(404);
        throw new Error('ไม่พบผู้ใช้งานที่มีอีเมลนี้ในระบบ');
    }

    // Get reset token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    user.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // Set expire (10 minutes)
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    await user.save();

    // Create reset URL
    const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;

    const message = `คุณได้รับอีเมลนี้เนื่องจากคุณ (หรือใครบางคน) ร้องขอการรีเซ็ตรหัสผ่าน โปรดคลิกลิงก์ด้านล่างเพื่อดำเนินการต่อ:\n\n ${resetUrl}`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'การรีเซ็ตรหัสผ่าน - Lost & Found',
            message,
            html: `
                <div style="font-family: sans-serif; padding: 20px; color: #333;">
                    <h2>คำขอยืนยันการรีเซ็ตรหัสผ่าน</h2>
                    <p>คุณได้รับอีเมลนี้เนื่องจากมีการร้องขอการรีเซ็ตรหัสผ่านสำหรับบัญชีของคุณ</p>
                    <p>โปรดคลิกที่ปุ่มด้านล่างเพื่อดำเนินการเปลี่ยนรหัสผ่านใหม่ (ลิงก์นี้จะมีอายุ 10 นาที):</p>
                    <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #10b981; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">รีเซ็ตรหัสผ่าน</a>
                    <p>หากคุณไม่ได้เป็นผู้ร้องขอ โปรดเพิกเฉยต่ออีเมลฉบับนี้</p>
                </div>
            `
        });

        res.status(200).json({ success: true, message: 'ส่งอีเมลรีเซ็ตรหัสผ่านเรียบร้อยแล้ว' });
    } catch (err) {
        console.error('Email Send Error:', err);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.status(500);
        throw new Error(err.message || 'ไม่สามารถส่งอีเมลได้ กรุณาลองใหม่อีกครั้ง');
    }
});

// @desc    Reset Password
// @route   PUT /api/auth/reset-password/:resettoken
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
    // Get hashed token
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.resettoken)
        .digest('hex');

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
        res.status(400);
        throw new Error('โทเคนรีเซ็ตรหัสผ่านไม่ถูกต้องหรือหมดอายุแล้ว');
    }

    // Set new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({
        success: true,
        message: 'เปลี่ยนรหัสผ่านเรียบร้อยแล้ว กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่',
        token: generateToken(user._id)
    });
});

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

module.exports = {
    registerUser,
    loginUser,
    getMe,
    updateProfile,
    googleLogin,
    forgotPassword,
    resetPassword
};
