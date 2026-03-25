const mongoose = require("mongoose");
const Course = require("./models/Course");
const dotenv = require("dotenv");
dotenv.config();

const testDashboard = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        const instructorId = "69983ef67f6b07b657a9b1c8";
        const courses = await Course.find({ instructor: instructorId });
        console.log(`Instructor ${instructorId} has ${courses.length} course(s).`);
        courses.forEach((c, i) => {
            console.log(`${i + 1}. ${c.courseName} [${c.status}]`);
        });
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

testDashboard();
