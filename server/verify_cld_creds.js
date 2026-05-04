const cloudinary = require("cloudinary").v2;
require("dotenv").config({ path: "./server/.env" });

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
});

async function check() {
    try {
        console.log("Testing Cloudinary API credentials...");
        const res = await cloudinary.api.resource_types();
        console.log("✅ Credentials are VALID!");
        console.log("Resource Types:", res.resource_types);
        process.exit(0);
    } catch (e) {
        console.log("❌ Credentials are INVALID!");
        console.error("Error:", e.message);
        process.exit(1);
    }
}
check();
