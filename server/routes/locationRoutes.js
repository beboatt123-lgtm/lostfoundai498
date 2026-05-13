const express = require('express');
const router = express.Router();
const {
    getLocations,
    getAdminLocations,
    createLocation,
    updateLocation,
    deleteLocation
} = require('../controllers/locationController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .get(getLocations)
    .post(protect, admin, createLocation);

router.get('/admin', protect, admin, getAdminLocations);

router.route('/:id')
    .put(protect, admin, updateLocation)
    .delete(protect, admin, deleteLocation);

module.exports = router;
