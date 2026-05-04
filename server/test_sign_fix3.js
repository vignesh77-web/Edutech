const cloudinary = require("cloudinary").v2;
require("dotenv").config({ path: "./server/.env" });

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
});

const url = "https://res.cloudinary.com/ddcpunh0c/image/upload/v1776151714/uploads/ravp6x97qgao4olorjp6.pdf";
const pathParts = new URL(url).pathname.split("/").filter(p => p !== "");
const versionPart = pathParts.find(p => p.startsWith("v") && /^\d+$/.test(p.substring(1)));
const version = versionPart ? versionPart.substring(1) : undefined;
const versionIndex = pathParts.indexOf(versionPart);
const publicIdWithExt = pathParts.slice(versionIndex + 1).join("/");
const lastDotIndex = publicIdWithExt.lastIndexOf(".");
const publicId = publicIdWithExt.substring(0, lastDotIndex);
const format = publicIdWithExt.substring(lastDotIndex + 1);

const signedUrl = cloudinary.url(publicId, {
    resource_type: "image",
    type: "upload",
    version: version,
    format: format, // Include the format (pdf) explicitly
    sign_url: true,
    secure: true
});

console.log("Parsed Public ID:", publicId);
console.log("Parsed Format:", format);
console.log("Signed URL:", signedUrl);

const https = require("https");
https.get(signedUrl, (res) => {
    console.log("Status Code:", res.statusCode);
    if (res.statusCode === 200) console.log("✅ SUCCESS!");
    else {
        console.log("❌ Failed:", res.headers['x-cld-error']);
        console.log("Headers:", res.headers);
    }
    process.exit(0);
});
