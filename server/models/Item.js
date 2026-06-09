const mongoose = require('mongoose');

const itemSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    title: {
        type: String,
        required: [true, 'Please add a title']
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    type: {
        type: String,
        enum: ['lost', 'found'],
        required: true
    },
    category: {
        type: String,
        required: [true, 'Please select a category'],
        enum: ['electronics', 'clothing', 'wallet', 'bag', 'keys', 'documents', 'pets', 'jewelry', 'glasses', 'stationery', 'health', 'sports', 'music', 'tools', 'toy', 'others']
    },
    location: {
        type: String,
        required: [true, 'Please add location details']
    },
    date: {
        type: Date,
        required: [true, 'Please add date']
    },
    images: [{
        type: String,
        required: true
    }],
    customId: {
        type: String,
        unique: true
    },
    storagePosition: {
        type: String,
        default: ''
    },
    locationMain: {
        type: String,
        required: [true, 'Please select a main location']
    },
    locationDetail: {
        type: String,
        default: ''
    },
    reporterIdCard: {
        type: String,
        required: [true, 'Please add ID card number for identity verification']
    },
    reporterPhone: {
        type: String,
        required: [true, 'Please add a contact phone number']
    },
    status: {
        type: String,
        enum: ['pending', 'open', 'resolved', 'closed', 'rejected'],
        default: 'pending'
    },
    aiTags: [{
        type: String
    }],
    aiDescription: {
        type: String
    },
    receiverName: {
        type: String,
        default: ''
    },
    receiverIdCard: {
        type: String,
        default: ''
    },
    receiverPhone: {
        type: String,
        default: ''
    },
    receiverImage: {
        type: String,
        default: ''
    },
    resolvedAt: {
        type: Date
    },
    expirationDate: {
        type: Date
    },
    notes: {
        type: String,
        default: ''
    },
    timePeriod: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

// Requirement 9: Unique ID Generation (LOST-2026-001)
itemSchema.pre('save', async function(next) {
    if (!this.isNew) return next();

    try {
        const lastItem = await this.constructor.findOne(
            { customId: /^BU\d+$/ }
        ).sort({ createdAt: -1 });

        let sequence = 1;
        if (lastItem && lastItem.customId) {
            const num = parseInt(lastItem.customId.replace('BU', ''));
            if (!isNaN(num)) sequence = num + 1;
        }

        this.customId = `BU${sequence.toString().padStart(4, '0')}`;
        next();
    } catch (err) {
        next(err);
    }
});

module.exports = mongoose.model('Item', itemSchema);
