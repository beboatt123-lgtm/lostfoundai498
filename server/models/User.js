const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    firstname: {
        type: String,
        required: [true, 'Please add a first name']
    },
    lastname: {
        type: String,
        required: [true, 'Please add a last name']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Please add a password']
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'staff'],
        default: 'user'
    },
    avatar: {
        type: String,
        default: 'https://cdn-icons-png.flaticon.com/512/149/149071.png'
    },
    isSuspended: {
        type: Boolean,
        default: false
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);
