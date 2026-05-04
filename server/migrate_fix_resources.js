/**
 * Migration Script: Clean broken resource entries
 * Removes resources that were saved without a fileUrl due to the previous async Cloudinary bug.
 * After running this, the instructor can re-upload any PDF and it will save correctly.
 */
require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const mongoose = require('mongoose');
const SubSection = require('./models/SubSection');

async function cleanBrokenResources() {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log('✅ Connected to DB');

        // Find all subsections that have at least one resource with no fileUrl
        const all = await SubSection.find({ 'resources.0': { $exists: true } });

        let totalFixed = 0;
        let totalRemoved = 0;

        for (const sub of all) {
            const before = sub.resources.length;
            // Keep only resources that have a valid fileUrl
            sub.resources = sub.resources.filter(r => r.fileUrl && r.fileUrl.trim() !== '');
            const after = sub.resources.length;

            if (before !== after) {
                const removed = before - after;
                totalRemoved += removed;
                await sub.save();
                console.log(`🔧 Fixed SubSection "${sub.title}" — removed ${removed} broken resource(s)`);
                totalFixed++;
            }
        }

        if (totalFixed === 0) {
            console.log('ℹ️  No broken resources found. DB is clean.');
        } else {
            console.log(`\n✅ Done. Fixed ${totalFixed} subsection(s), removed ${totalRemoved} broken resource entry/entries.`);
            console.log('👉 Instructors can now re-upload PDFs and they will save correctly.');
        }

        process.exit(0);
    } catch (e) {
        console.error('❌ Error:', e.message);
        process.exit(1);
    }
}

cleanBrokenResources();
