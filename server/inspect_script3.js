require('dotenv').config();
const mongoose = require("mongoose");
const SubSection = require("./models/SubSection");
const fs = require("fs");

mongoose.connect(process.env.MONGODB_URL).then(async () => {
    try {
        const subSections = await SubSection.find().sort({_id: -1}).limit(2).lean();
        fs.writeFileSync("output_clean.json", JSON.stringify(subSections, null, 2), "utf8");
    } catch(e) {
        console.error(e);
    }
    process.exit(0);
});
