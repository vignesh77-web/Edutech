require('dotenv').config();
const mongoose = require("mongoose");
const SubSection = require("./models/SubSection");
const Section = require("./models/Section");

mongoose.connect(process.env.MONGODB_URL).then(async () => {
    console.log("Connected to DB.");

    try {
        const subSections = await SubSection.find().sort({_id: -1}).limit(3);
        console.log("---- LATEST SUBSECTIONS ----");
        for (const s of subSections) {
            console.log("ID:", s._id);
            console.log("Title:", s.title);
            console.log("VideoUrl:", s.videoUrl);
            console.log("Length:", s.timeDuration);
            console.log("------------------------");
        }

        const sections = await Section.find().sort({_id: -1}).limit(2).populate('subSection');
        console.log("---- LATEST SECTIONS (Populated) ----");
        for (const sec of sections) {
            console.log("Section ID:", sec._id);
            console.log("Section Name:", sec.sectionName);
            console.log("SubSections:", sec.subSection.map(sub => ({
                id: sub._id,
                title: sub.title,
                video: sub.videoUrl
            })));
        }

    } catch(e) {
        console.error(e);
    }
    process.exit(0);
});
