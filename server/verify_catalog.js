const mongoose = require("mongoose");
const Category = require("./models/Category");
const Course = require("./models/Course");
const dotenv = require("dotenv");

dotenv.config();

const verifyData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("DB connected");

        const categories = await Category.find({}).populate("courses");

        categories.forEach(cat => {
            console.log(`Category: ${cat.name} (${cat._id})`);
            console.log(`Course count: ${cat.courses.length}`);
            cat.courses.forEach(course => {
                console.log(`  - Course: ${course.courseName}, Status: ${course.status}`);
            });
        });

        process.exit(0);
    } catch (error) {
        console.error("Error:", error.message);
        process.exit(1);
    }
};

verifyData();
