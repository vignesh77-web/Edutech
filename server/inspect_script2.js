require('dotenv').config();
const mongoose = require("mongoose");
const SubSection = require("./models/SubSection");

mongoose.connect(process.env.MONGODB_URL).then(async () => {
    try {
        const subSections = await SubSection.find().sort({_id: -1}).limit(2).lean();
        console.log(JSON.stringify(subSections, null, 2));
    } catch(e) {
        console.error(e);
    }
    process.exit(0);
});
