const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const inspectLMS = async () => {
    try {
        const url = process.env.MONGODB_URL.split(".net/")[0] + ".net/lms_database";
        await mongoose.connect(url);
        console.log("Connected to lms_database");

        const db = mongoose.connection.db;
        const courses = await db.collection("courses").find({}).toArray();
        console.log("Courses in lms_database:");
        courses.forEach((c, i) => {
            console.log(`${i + 1}. ${c.courseName} [${c.status}]`);
        });

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

inspectLMS();
