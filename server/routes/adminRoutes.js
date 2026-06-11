const express = require('express');
const router = express.Router();
const {
    getStats,
    getAllUsers,
    updateUser,
    createUser,
    deleteUser,
    getSettings,
    updateSettings,
    purgeOldItems,
} = require('../controllers/adminController');
const { protect, admin, adminOnly } = require('../middleware/authMiddleware');

router.get('/stats', protect, admin, getStats);

// User management — admin only (staff cannot access)
router.route('/users')
    .get(protect, adminOnly, getAllUsers)
    .post(protect, adminOnly, createUser);

router.route('/users/:id')
    .put(protect, adminOnly, updateUser)
    .delete(protect, adminOnly, deleteUser);

router.route('/settings')
    .get(protect, admin, getSettings)
    .put(protect, admin, updateSettings);

router.delete('/settings/purge', protect, admin, purgeOldItems);

module.exports = router;
