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
    }
}, {
    timestamps: true
});

// Requirement 9: Unique ID Generation (LOST-2026-001)
itemSchema.pre('save', async function(next) {
    if (!this.isNew) return next();
    
    try {
        const year = new Date().getFullYear();
        const typePrefix = this.type.toUpperCase();
        
        // Find the last item of this type in this year
        const lastItem = await this.constructor.findOne({
            type: this.type,
            createdAt: {
                $gte: new Date(`${year}-01-01`),
                $lte: new Date(`${year}-12-31`)
            }
        }).sort({ createdAt: -1 });
        
        let sequence = 1;
        if (lastItem && lastItem.customId) {
            const parts = lastItem.customId.split('-');
            const lastSeq = parseInt(parts[parts.length - 1]);
            if (!isNaN(lastSeq)) {
                sequence = lastSeq + 1;
            }
        }
        
        this.customId = `${typePrefix}-${year}-${sequence.toString().padStart(3, '0')}`;
        next();
    } catch (err) {
        next(err);
    }
});

module.exports = mongoose.model('Item', itemSchema);
