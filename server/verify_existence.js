const cloudinary = require("cloudinary").v2;
require("dotenv").config({ path: "./server/.env" });

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
});

async function verify() {
    const list = [
        "uploads/ravp6x97qgao4olorjp6",
        "uploads/aampsf8wxfouozd6a8vc",
        "uploads/ravp6x97qgao4olorjp6.pdf"
    ];
    
    for (const id of list) {
        console.log(`Checking ID: ${id}`);
        try {
            const res = await cloudinary.api.resource(id, { resource_type: "image" });
            console.log(`  ✅ Found as image! Type: ${res.type}`);
        } catch (e) {
            try {
                const res = await cloudinary.api.resource(id, { resource_type: "raw" });
                console.log(`  ✅ Found as raw! Type: ${res.type}`);
            } catch (e2) {
                console.log(`  ❌ Not found.`);
            }
        }
    }
    process.exit(0);
}
verify();
