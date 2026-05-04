const cloudinary = require("cloudinary").v2;
require("dotenv").config({ path: "./server/.env" });
const https = require("https");

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
});

const publicId = "uploads/ravp6x97qgao4olorjp6";
const version = "1776151714";
const format = "pdf";

async function test(resource_type, type, useVersion, useFormat) {
    const options = {
        resource_type,
        type,
        sign_url: true,
        secure: true
    };
    if (useVersion) options.version = version;
    if (useFormat) options.format = format;

    const url = cloudinary.url(publicId, options);
    
    return new Promise((resolve) => {
        const req = https.get(url, (res) => {
            resolve({ 
                success: res.statusCode === 200, 
                status: res.statusCode, 
                url,
                error: res.headers['x-cld-error']
            });
        });
        req.on('error', (e) => resolve({ success: false, error: e.message, url }));
    });
}

async function run() {
    const resourceTypes = ["image", "raw"];
    const types = ["upload", "authenticated", "private"];
    const versionOpts = [true, false];
    const formatOpts = [true, false];

    console.log("Starting Brute Force Cloudinary Access Test...");
    
    for (const rt of resourceTypes) {
        for (const t of types) {
            for (const v of versionOpts) {
                for (const f of formatOpts) {
                    const res = await test(rt, t, v, f);
                    if (res.success) {
                        console.log(`✅ SUCCESS! rt=${rt}, t=${t}, v=${v}, f=${f}`);
                        console.log(`URL: ${res.url}`);
                        return;
                    } else {
                        // console.log(`❌ Fail (${res.status}): rt=${rt}, t=${t}, v=${v}, f=${f} -> ${res.error}`);
                    }
                }
            }
        }
    }
    console.log("Final check: Testing NO signature (Public URL)");
    const publicUrl = `https://res.cloudinary.com/${process.env.CLOUD_NAME}/${resourceTypes[0]}/${types[0]}/v${version}/${publicId}.${format}`;
    const pRes = await new Promise(r => https.get(publicUrl, (res) => r(res.statusCode)));
    console.log(`Public URL Status: ${pRes}`);
}

run();
