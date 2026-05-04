const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const SubSection = require("./models/SubSection");

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("Connected to DB");
        const subSecs = await SubSection.find({ "resources.fileUrl": { $exists: true } });
        console.log(`Found ${subSecs.length} SubSections with resources.`);
        
        for (const sub of subSecs) {
            console.log(`\n=== SubSection: ${sub.title} ===`);
            for (const res of sub.resources) {
                console.log(`Resource: ${res.name}`);
                console.log(`URL: ${res.fileUrl}`);
                const parts = res.fileUrl.split("/");
                console.log(`Parts[4] (Resource Type): ${parts[4]}`);
                console.log(`Parts[5] (Type): ${parts[5]}`);
            }
        }
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

check();
