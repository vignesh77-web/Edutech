require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const mongoose = require('mongoose');
const https = require('https');
const SubSection = require('./models/SubSection');

mongoose.connect(process.env.MONGODB_URL).then(async () => {
    const subs = await SubSection.find({ 'resources.fileUrl': { $exists: true, $ne: null } }).lean();
    if (!subs.length) {
        console.log("No subsections with valid resource fileUrls found.");
        process.exit(0);
    }

    // Test first found resource URL
    const resource = subs[0].resources[0];
    const url = resource.fileUrl;
    console.log(`Testing URL: ${url}`);

    const req = https.get(url, (res) => {
        console.log(`Status: ${res.statusCode}`);
        console.log(`Content-Type: ${res.headers['content-type']}`);
        console.log(`Content-Length: ${res.headers['content-length']}`);
        if (res.statusCode === 200) {
            console.log("✅ URL is publicly accessible from server!");
        } else if (res.statusCode === 401) {
            console.log("❌ URL requires authentication (Cloudinary private/authenticated type)");
        } else {
            console.log(`⚠️  Unexpected status: ${res.statusCode}`);
        }
        process.exit(0);
    });

    req.on('error', (e) => {
        console.error("Request error:", e.message);
        process.exit(1);
    });
});
