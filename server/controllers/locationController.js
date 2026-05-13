const asyncHandler = require('express-async-handler');
const Location = require('../models/Location');

// @desc    Get all locations
// @route   GET /api/locations
// @access  Public
const getLocations = asyncHandler(async (req, res) => {
    const locations = await Location.find({ isActive: true }).sort({ name: 1 });
    res.status(200).json(locations);
});

// @desc    Get all locations (for Admin - including inactive)
// @route   GET /api/locations/admin
// @access  Private/Admin
const getAdminLocations = asyncHandler(async (req, res) => {
    const locations = await Location.find({}).sort({ name: 1 });
    res.status(200).json(locations);
});

// @desc    Create a location
// @route   POST /api/locations
// @access  Private/Admin
const createLocation = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    if (!name) {
        res.status(400);
        throw new Error('Please add a location name');
    }

    const locationExists = await Location.findOne({ name });
    if (locationExists) {
        res.status(400);
        throw new Error('Location already exists');
    }

    const location = await Location.create({
        name,
        description
    });

    res.status(201).json(location);
});

// @desc    Update a location
// @route   PUT /api/locations/:id
// @access  Private/Admin
const updateLocation = asyncHandler(async (req, res) => {
    const location = await Location.findById(req.params.id);

    if (!location) {
        res.status(404);
        throw new Error('Location not found');
    }

    const updatedLocation = await Location.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
    );

    res.status(200).json(updatedLocation);
});

// @desc    Delete a location
// @route   DELETE /api/locations/:id
// @access  Private/Admin
const deleteLocation = asyncHandler(async (req, res) => {
    const location = await Location.findById(req.params.id);

    if (!location) {
        res.status(404);
        throw new Error('Location not found');
    }

    await location.deleteOne();
    res.status(200).json({ id: req.params.id });
});

module.exports = {
    getLocations,
    getAdminLocations,
    createLocation,
    updateLocation,
    deleteLocation
};
