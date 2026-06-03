const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;

async function fixAdminVerification() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const result = await mongoose.connection.db.collection('users').updateMany(
            { role: { $in: ['admin', 'staff', 'superadmin'] } },
            { $set: { isVerified: true } }
        );

        console.log(`✅ Updated ${result.modifiedCount} admin/staff/superadmin accounts to isVerified=true`);
        
        // Also show which accounts were updated
        const users = await mongoose.connection.db.collection('users').find(
            { role: { $in: ['admin', 'staff', 'superadmin'] } },
            { projection: { email: 1, role: 1, isVerified: 1 } }
        ).toArray();
        
        console.log('\nAdmin accounts:');
        users.forEach(u => console.log(`  - ${u.email} (${u.role}) isVerified: ${u.isVerified}`));

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
    }
}

fixAdminVerification();
