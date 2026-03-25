const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const inspectLMSDeep = async () => {
    try {
        const url = process.env.MONGODB_URL.split(".net/")[0] + ".net/lms_database";
        await mongoose.connect(url);
        console.log("Connected to lms_database");

        const db = mongoose.connection.db;
        const courses = await db.collection("courses").find({}).toArray();
        console.log("Raw Courses in lms_database:");
        courses.forEach((c, i) => {
            console.log(`${i + 1}. ${JSON.stringify(c, null, 2)}`);
        });

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

inspectLMSDeep();
