require('dotenv').config();
const mongoose = require('mongoose');
const SubSection = require('./models/SubSection');

async function checkResourceUrls() {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log('✓ Connected to MongoDB\n');

        // Find all subsections with resources
        const subsections = await SubSection.find({ 'resources.0': { $exists: true } });
        
        console.log(`Found ${subsections.length} subsections with resources\n`);
        
        let badUrlCount = 0;
        let goodUrlCount = 0;

        subsections.forEach((sub, index) => {
            console.log(`\n[${index + 1}] Subsection: ${sub.title}`);
            sub.resources.forEach((resource, rIndex) => {
                const hasBadUrl = resource.fileUrl.includes('/v1/');
                const urlPreview = resource.fileUrl.substring(0, 80) + '...';
                
                if (hasBadUrl) {
                    console.log(`  ❌ Resource ${rIndex + 1}: ${resource.name}`);
                    console.log(`     URL: ${urlPreview}`);
                    console.log(`     ⚠️  This URL has FAILED UPLOAD indicator (v1)`);
                    badUrlCount++;
                } else {
                    console.log(`  ✓ Resource ${rIndex + 1}: ${resource.name}`);
                    console.log(`     URL: ${urlPreview}`);
                    goodUrlCount++;
                }
            });
        });

        console.log(`\n\n═══ SUMMARY ═══`);
        console.log(`✓ Good URLs (proper timestamp):  ${goodUrlCount}`);
        console.log(`❌ Bad URLs (v1 failed upload):  ${badUrlCount}`);
        console.log(`\n📝 NOTE: Delete and re-upload resources with BAD URLs`);
        console.log(`   Use the "Delete Resource" button in the lecture edit modal`);

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

checkResourceUrls();
