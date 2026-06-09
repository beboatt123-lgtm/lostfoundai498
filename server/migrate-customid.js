const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const itemSchema = new mongoose.Schema({}, { strict: false, timestamps: true });
const Item = mongoose.model('Item', itemSchema);

async function migrate() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Step 1: Rename BU→L IDs (preserve sequence number, expand to 5 digits)
    const buItems = await Item.find({ customId: /^BU\d+$/ }).sort({ createdAt: 1 });
    console.log(`\nStep 1: Found ${buItems.length} items with BU prefix to rename`);

    for (const item of buItems) {
        const num = parseInt(item.customId.replace('BU', ''));
        const newId = `L${num.toString().padStart(5, '0')}`;
        await Item.updateOne({ _id: item._id }, { $set: { customId: newId } });
        console.log(`  ${item.customId} → ${newId}  (${item.title || 'no title'})`);
    }

    // Step 2: Assign IDs to items that have no valid ID
    const noIdItems = await Item.find({
        $or: [
            { customId: { $exists: false } },
            { customId: null },
            { customId: '' },
            { customId: { $not: /^L\d+$/ } }
        ]
    }).sort({ createdAt: 1 });

    console.log(`\nStep 2: Found ${noIdItems.length} items without a valid ID`);

    if (noIdItems.length > 0) {
        const lastItem = await Item.findOne({ customId: /^L\d+$/ }).sort({ customId: -1 });
        let sequence = 1;
        if (lastItem?.customId) {
            const num = parseInt(lastItem.customId.replace('L', ''));
            if (!isNaN(num)) sequence = num + 1;
        }

        for (const item of noIdItems) {
            const newId = `L${sequence.toString().padStart(5, '0')}`;
            await Item.updateOne({ _id: item._id }, { $set: { customId: newId } });
            console.log(`  ${item._id} → ${newId}  (${item.title || 'no title'})`);
            sequence++;
        }
    }

    console.log('\nMigration complete!');
    await mongoose.disconnect();
}

migrate().catch(err => {
    console.error(err);
    process.exit(1);
});
