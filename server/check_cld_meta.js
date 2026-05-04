const cloudinary = require("cloudinary").v2;
require("dotenv").config({ path: "./server/.env" });

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
});

async function check() {
    try {
        const publicId = "uploads/ravp6x97qgao4olorjp6";
        console.log("Checking metadata for:", publicId);
        
        // Try as image
        try {
            const res = await cloudinary.api.resource(publicId, { resource_type: "image" });
            console.log("Found as IMAGE");
            console.log("Type:", res.type);
            console.log("Access Mode:", res.access_mode);
        } catch(e) {
            console.log("Not found as image or access denied");
        }

        // Try as raw
        try {
            const res = await cloudinary.api.resource(publicId, { resource_type: "raw" });
            console.log("Found as RAW");
            console.log("Type:", res.type);
            console.log("Access Mode:", res.access_mode);
        } catch(e) {
            console.log("Not found as raw or access denied");
        }

        process.exit(0);
    } catch(e) {
        console.error(e);
        process.exit(1);
    }
}
check();
