const mongoose = require("mongoose");
const Course = require("./models/Course");
const dotenv = require("dotenv");

dotenv.config();

const listAll = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("DB connected");

        const all = await Course.find({}, { courseName: 1, status: 1, category: 1 });
        console.log(`Total courses: ${all.length}`);
        all.forEach((c, i) => {
            console.log(`${i + 1}. ${c.courseName} [${c.status}] - Cat: ${c.category}`);
        });

        process.exit(0);
    } catch (error) {
        console.error("Error:", error.message);
        process.exit(1);
    }
};

listAll();
