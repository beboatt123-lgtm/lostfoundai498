const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Item = require('../models/Item');

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getStats = asyncHandler(async (req, res) => {
    const totalItems = await Item.countDocuments();
    const lostItems = await Item.countDocuments({ type: 'lost' });
    const foundItems = await Item.countDocuments({ type: 'found' });
    const resolvedItems = await Item.countDocuments({ status: 'returned' });
    const totalUsers = await User.countDocuments({ role: 'user' });

    // Last 7 days stats (simplified)
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);

        const nextDate = new Date(date);
        nextDate.setDate(date.getDate() + 1);

        const lost = await Item.countDocuments({
            type: 'lost',
            createdAt: { $gte: date, $lt: nextDate }
        });
        const found = await Item.countDocuments({
            type: 'found',
            createdAt: { $gte: date, $lt: nextDate }
        });

        const dayName = date.toLocaleDateString('th-TH', { weekday: 'long' });
        last7Days.push({ name: dayName, lost, found });
    }

    res.status(200).json({
        stats: {
            totalItems,
            lostItems,
            foundItems,
            resolvedItems,
            totalUsers
        },
        chartData: last7Days
    });
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = asyncHandler(async (req, res) => {
    const { search, role, status } = req.query;
    let query = {};

    if (role && role !== 'all') {
        query.role = role;
    }

    if (status === 'suspended') {
        query.isSuspended = true;
    } else if (status === 'active') {
        query.isSuspended = false;
    }

    if (search) {
        query.$or = [
            { firstname: { $regex: search, $options: 'i' } },
            { lastname: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
        ];
    }

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });
    res.status(200).json(users);
});

// @desc    Update user status/role
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    const { role, isSuspended } = req.body;

    if (role) user.role = role;
    if (typeof isSuspended !== 'undefined') user.isSuspended = isSuspended;

    const updatedUser = await user.save();

    res.status(200).json({
        _id: updatedUser._id,
        firstname: updatedUser.firstname,
        lastname: updatedUser.lastname,
        email: updatedUser.email,
        role: updatedUser.role,
        isSuspended: updatedUser.isSuspended
    });
});

// @desc    Create a new user (Staff/Admin)
// @route   POST /api/admin/users
// @access  Private/Admin
const createUser = asyncHandler(async (req, res) => {
    const { firstname, lastname, email, password, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
        firstname,
        lastname,
        email,
        password: hashedPassword,
        role: role || 'staff'
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            role: user.role
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

module.exports = {
    getStats,
    getAllUsers,
    updateUser,
    createUser
};
