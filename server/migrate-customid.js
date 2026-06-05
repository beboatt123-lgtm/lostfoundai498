const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const itemSchema = new mongoose.Schema({}, { strict: false, timestamps: true });
const Item = mongoose.model('Item', itemSchema);

async function migrate() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Get all items without a valid BU id, sorted by createdAt
    const items = await Item.find({
        $or: [
            { customId: { $exists: false } },
            { customId: null },
            { customId: '' },
            { customId: { $not: /^BU\d+$/ } }
        ]
    }).sort({ createdAt: 1 });

    console.log(`Found ${items.length} items to migrate`);

    // Find highest existing BU number
    const lastItem = await Item.findOne({ customId: /^BU\d+$/ }).sort({ createdAt: -1 });
    let sequence = 1;
    if (lastItem?.customId) {
        const num = parseInt(lastItem.customId.replace('BU', ''));
        if (!isNaN(num)) sequence = num + 1;
    }

    for (const item of items) {
        const newId = `BU${sequence.toString().padStart(4, '0')}`;
        await Item.updateOne({ _id: item._id }, { $set: { customId: newId } });
        console.log(`${item._id} → ${newId} (${item.title || 'no title'})`);
        sequence++;
    }

    console.log('Migration complete!');
    await mongoose.disconnect();
}

migrate().catch(err => {
    console.error(err);
    process.exit(1);
});
