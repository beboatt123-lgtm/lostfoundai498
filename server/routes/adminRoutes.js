const express = require('express');
const router = express.Router();
const {
    getStats,
    getAllUsers,
    updateUser,
    createUser,
    deleteUser
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/stats', protect, admin, getStats);
router.route('/users')
    .get(protect, admin, getAllUsers)
    .post(protect, admin, createUser);

router.route('/users/:id')
    .put(protect, admin, updateUser)
    .delete(protect, admin, deleteUser);

module.exports = router;
