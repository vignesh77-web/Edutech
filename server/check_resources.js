require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const mongoose = require('mongoose');
const SubSection = require('./models/SubSection');

mongoose.connect(process.env.MONGODB_URL).then(async () => {
    const subs = await SubSection.find({ 'resources.0': { $exists: true } }).lean();
    if (!subs.length) {
        console.log("No subsections with resources found.");
    }
    for (const s of subs) {
        console.log(`\nSubSection: "${s.title}"`);
        s.resources.forEach(r => {
            console.log(`  name: ${r.name}`);
            console.log(`  fileUrl: ${r.fileUrl || 'MISSING'}`);
        });
    }
    process.exit(0);
});
