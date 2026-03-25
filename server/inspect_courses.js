const mongoose = require("mongoose");
const Course = require("./models/Course");
const dotenv = require("dotenv");

dotenv.config();

const findCourses = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("DB connected");

        const myCourses = await Course.find({
            courseName: { $in: ["MERN Stack Mastery", "React Native Mobile Apps", "Python for Data Science"] }
        });

        console.log(`Found ${myCourses.length} courses:`);
        myCourses.forEach((c, i) => {
            console.log(`${i + 1}. Name: ${c.courseName}`);
            console.log(`   ID: ${c._id}`);
            console.log(`   Status: ${c.status}`);
            console.log(`   Category ID: ${c.category}`);
            console.log(`   Instructor ID: ${c.instructor}`);
        });

        process.exit(0);
    } catch (error) {
        console.error("Error:", error.message);
        process.exit(1);
    }
};

findCourses();
