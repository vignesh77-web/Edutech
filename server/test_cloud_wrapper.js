const fs = require('fs');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});

async function run() {
    fs.writeFileSync("test.txt", "1234567890".repeat(100)); // create a small dummy file
    try {
        const res = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_large("test.txt", {
                resource_type: "auto",
                folder: "test",
                chunk_size: 6000000
            }, (error, result) => {
                if (error) return reject(error);
                resolve(result);
            });
        });
        console.log("SUCCESS WITH CALLBACK:", res.secure_url);
    } catch(e) {
        console.log("ERROR:", e);
    }
}
run();
