const cloudinary = require("cloudinary").v2;
require("dotenv").config({ path: "./server/.env" });

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
});

const publicId = "uploads/ravp6x97qgao4olorjp6";

// Generate private download URL
const signedUrl = cloudinary.utils.private_download_url(publicId, "pdf", {
    resource_type: "image",
    attachment: true
});

console.log("Private Download URL:", signedUrl);

const https = require("https");
https.get(signedUrl, (res) => {
    console.log("Status Code:", res.statusCode);
    if (res.statusCode === 200) console.log("✅ SUCCESS!");
    else {
        console.log("❌ Failed:", res.headers['x-cld-error']);
    }
    process.exit(0);
});
