const cloudinary = require("cloudinary").v2;
require("dotenv").config({ path: "./server/.env" });

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
});

const url = "https://res.cloudinary.com/ddcpunh0c/image/upload/v1776151714/uploads/ravp6x97qgao4olorjp6.pdf";
const https = require("https");

https.get(url, (res) => {
    console.log("Status Code:", res.statusCode);
    console.log("X-Cld-Error:", res.headers['x-cld-error']);
    process.exit(0);
});
