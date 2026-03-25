const mongoose = require("mongoose");
const Category = require("./models/Category");
const Course = require("./models/Course");
require("dotenv").config();

async function verify() {
    await mongoose.connect(process.env.MONGODB_URL);

    // Find the course
    const course = await Course.findOne({ courseName: "Why Internship is Important for Students" });
    if (!course) {
        console.log("❌ Course NOT found in DB");
        process.exit(0);
    }
    console.log("✅ Course found:", course.courseName, "(ID:", course._id + ")");
    console.log("   Status:", course.status);
    console.log("   Category ID on course:", course.category);

    // Find category and check if course is in it
    const cat = await Category.findOne({ name: "Career Development" });
    console.log("\nCareer Development category ID:", cat._id);
    const isLinked = cat.courses.map(String).includes(String(course._id));
    console.log("Course linked to category:", isLinked ? "✅ YES" : "❌ NO");

    if (!isLinked) {
        console.log("Linking course to category...");
        await Category.findByIdAndUpdate(cat._id, { $push: { courses: course._id } });
        console.log("✅ Linked successfully");
    }

    process.exit(0);
}

verify().catch(e => { console.error(e.message); process.exit(1); });
