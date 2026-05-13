const mongoose = require('mongoose');

const locationSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a location name'],
        unique: true,
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Location', locationSchema);
