const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const Course = require("./models/Course");
const Section = require("./models/Section");
const SubSection = require("./models/SubSection");

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("Connected to DB");

        const course = await Course.findOne({ courseName: /Python/i })
            .populate({
                path: "courseContent",
                populate: {
                    path: "subSection"
                }
            });

        if (!course) {
            console.log("Course not found");
            process.exit(0);
        }

        console.log(`Course: ${course.courseName}`);
        course.courseContent.forEach(section => {
            console.log(`Section: ${section.sectionName}`);
            section.subSection.forEach(sub => {
                console.log(`  SubSection: ${sub.title}`);
                console.log(`  Resources: ${JSON.stringify(sub.resources, null, 2)}`);
            });
        });

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

check();
