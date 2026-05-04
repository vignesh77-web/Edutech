const mongoose = require("mongoose");
require("dotenv").config();
const SubSection = require("./models/SubSection");

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("DB connected successfully");

        const subSections = await SubSection.find().sort({_id: -1}).limit(2);
        
        console.log("RECENT SUBSECTIONS:");
        subSections.forEach(s => {
            console.log(`ID: ${s._id}`);
            console.log(`Title: ${s.title}`);
            console.log(`VideoUrl: ${s.videoUrl}`);
            console.log(`Description: ${s.description}`);
            console.log('---');
        });

        process.exit(0);
    } catch (error) {
        console.error("Error:", error.message);
        process.exit(1);
    }
};

connectDB();
