const mongoose = require('mongoose');

const settingSchema = mongoose.Schema({
    orgName: { type: String, default: 'ระบบสิ่งของหาย-เจอ' },
    contactPhone: { type: String, default: '' },
    contactEmail: { type: String, default: '' },
    requireApproval: { type: Boolean, default: true },
    maintenanceMode: { type: Boolean, default: false },
}, { timestamps: true });

// Only one settings document — singleton pattern
settingSchema.statics.getSingleton = async function () {
    let doc = await this.findOne();
    if (!doc) doc = await this.create({});
    return doc;
};

module.exports = mongoose.model('Setting', settingSchema);
