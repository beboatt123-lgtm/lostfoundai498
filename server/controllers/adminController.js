const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Item = require('../models/Item');

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getStats = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;
    
    let start = null;
    let end = null;
    
    if (startDate) {
        start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
    } else {
        start = new Date();
        start.setDate(start.getDate() - 6);
        start.setHours(0, 0, 0, 0);
    }
    
    if (endDate) {
        end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
    } else {
        end = new Date();
        end.setHours(23, 59, 59, 999);
    }
    
    let itemQuery = {
        createdAt: { $gte: start, $lte: end }
    };
    
    // Top Card stats (matching selected timeframe)
    const totalItems = await Item.countDocuments(itemQuery);
    const lostItems = await Item.countDocuments({ ...itemQuery, type: 'lost' });
    const foundItems = await Item.countDocuments({ ...itemQuery, type: 'found' });
    const resolvedItems = await Item.countDocuments({ ...itemQuery, status: 'returned' });
    const totalUsers = await User.countDocuments({ role: 'user' }); // Users count is lifetime
    
    // Generate Chart Data dynamically based on selected date range
    let chartData = [];
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 31) {
        // Group by days
        for (let d = 0; d < diffDays; d++) {
            const date = new Date(start);
            date.setDate(start.getDate() + d);
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
            
            const label = date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
            chartData.push({ name: label, lost, found });
        }
    } else {
        // Group by months to keep charts beautiful and readable
        let current = new Date(start);
        while (current <= end) {
            const dateStart = new Date(current.getFullYear(), current.getMonth(), 1, 0, 0, 0, 0);
            const dateEnd = new Date(current.getFullYear(), current.getMonth() + 1, 1, 0, 0, 0, 0);
            
            const lost = await Item.countDocuments({
                type: 'lost',
                createdAt: { $gte: dateStart, $lt: dateEnd }
            });
            const found = await Item.countDocuments({
                type: 'found',
                createdAt: { $gte: dateStart, $lt: dateEnd }
            });
            
            const monthsThai = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
            const label = `${monthsThai[current.getMonth()]} ${current.getFullYear() + 543}`;
            chartData.push({ name: label, lost, found });
            
            // Move to next month
            current.setMonth(current.getMonth() + 1);
        }
    }
    
    res.status(200).json({
        stats: {
            totalItems,
            lostItems,
            foundItems,
            resolvedItems,
            totalUsers
        },
        chartData
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
        role: role || 'staff',
        isVerified: true  // Admin-created accounts skip email verification
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

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin (Superadmin only)
const deleteUser = asyncHandler(async (req, res) => {
    if (req.user.role !== 'superadmin') {
        res.status(403);
        throw new Error('Not authorized to delete users. Superadmin role required.');
    }

    const user = await User.findById(req.params.id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    if (user._id.toString() === req.user._id.toString()) {
        res.status(400);
        throw new Error('You cannot delete your own account');
    }

    await user.deleteOne();

    res.status(200).json({ message: 'User removed successfully' });
});

module.exports = {
    getStats,
    getAllUsers,
    updateUser,
    createUser,
    deleteUser
};
