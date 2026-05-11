const express = require('express');
const router = express.Router();
const {
    getStats,
    getAllUsers,
    updateUser,
    createUser
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/stats', protect, admin, getStats);
router.route('/users')
    .get(protect, admin, getAllUsers)
    .post(protect, admin, createUser);

router.put('/users/:id', protect, admin, updateUser);

module.exports = router;
