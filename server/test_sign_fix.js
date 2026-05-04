const cloudinary = require("cloudinary").v2;
require("dotenv").config({ path: "./server/.env" });

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
});

const url = "https://res.cloudinary.com/ddcpunh0c/image/upload/v1776151714/uploads/ravp6x97qgao4olorjp6.pdf";
const parsedUrl = new URL(url);
const pathParts = parsedUrl.pathname.split("/").filter(p => p !== "");
const resourceType = pathParts[1] || "auto";
const type = pathParts[2] || "upload";
const versionIndex = pathParts.findIndex(p => p.startsWith("v") && /^\d+$/.test(p.substring(1)));
let publicIdWithExt = "";
if (versionIndex !== -1) {
    publicIdWithExt = pathParts.slice(versionIndex + 1).join("/");
} else {
    publicIdWithExt = pathParts.slice(3).join("/");
}
const publicId = publicIdWithExt.substring(0, publicIdWithExt.lastIndexOf(".")) || publicIdWithExt;

const signedUrl = cloudinary.url(publicId, {
    resource_type: resourceType,
    type: type,
    sign_url: true,
    secure: true
});

console.log("Original URL:", url);
console.log("Extracted Public ID:", publicId);
console.log("Signed URL:", signedUrl);

// Test the signed URL access
const https = require("https");
https.get(signedUrl, (res) => {
    console.log("Status Code:", res.statusCode);
    console.log("Headers:", res.headers);
    if (res.statusCode !== 200) {
        console.log("❌ Still failing with", res.statusCode);
    } else {
        console.log("✅ SUCCESS!");
    }
    process.exit(0);
});
