require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const mongoose = require('mongoose');
const https = require('https');
const fs = require('fs');
const SubSection = require('./models/SubSection');

mongoose.connect(process.env.MONGODB_URL).then(async () => {
    const subs = await SubSection.find({ 'resources.fileUrl': { $exists: true, $ne: null } }).lean();
    if (!subs.length) {
        console.log("No subsections with valid resource fileUrls found.");
        process.exit(0);
    }

    const resource = subs[0].resources[0];
    const url = resource.fileUrl;

    // Write full URL to file to see it completely
    fs.writeFileSync('resource_url.txt', url, 'utf8');
    console.log("Full URL written to resource_url.txt");
    console.log(`Status check pending...`);

    const req = https.get(url, (res) => {
        const status = res.statusCode;
        fs.appendFileSync('resource_url.txt', `\nStatus: ${status}\nContent-Type: ${res.headers['content-type']}\n`, 'utf8');
        console.log(`Status: ${status}`);
        if (status === 200) console.log("✅ Publicly accessible!");
        else if (status === 401) console.log("❌ Requires auth (private Cloudinary type)");
        else console.log(`⚠️  Status: ${status}`);
        process.exit(0);
    });
    req.on('error', (e) => { console.error(e.message); process.exit(1); });
});
