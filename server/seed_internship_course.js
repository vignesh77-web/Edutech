const mongoose = require("mongoose");
const Course = require("./models/Course");
const Category = require("./models/Category");
const User = require("./models/User");
require("dotenv").config();

const CAREER_DEV_CATEGORY_ID = "69c11c67e4c1220c2791d871";
const INSTRUCTOR_ID = "69983ef67f6b07b657a9b1c8";

const courseData = {
    courseName: "Why Internship is Important for Students",
    courseDescription:
        "This course dives deep into why internships are a critical stepping stone for students entering the workforce. Learn how to find, apply for, and make the most out of internship opportunities.",
    instructor: INSTRUCTOR_ID,
    whatYouWillLearn:
        "Understand the real-world value of internships, how to build a strong resume, ace interviews, network with professionals, and convert your internship into a full-time job offer.",
    price: 0,
    tag: ["Career Development", "Internship", "Professional Skills", "Students"],
    category: CAREER_DEV_CATEGORY_ID,
    thumbnail:
        "https://res.cloudinary.com/dqr6i9kvt/image/upload/v1707200000/EduTech/internship_thumbnail.jpg",
    status: "Published",
    instructions: [
        "No prior experience required",
        "Suitable for college students and fresh graduates",
        "Eagerness to build a professional career",
    ],
};

async function seed() {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("Connected to MongoDB");

        const existing = await Course.findOne({ courseName: courseData.courseName });
        if (existing) {
            console.log(`Course "${courseData.courseName}" already exists. Skipping.`);
            process.exit(0);
        }

        const newCourse = await Course.create(courseData);
        console.log(`✅ Created course: ${newCourse.courseName} (ID: ${newCourse._id})`);

        // Link course to instructor
        await User.findByIdAndUpdate(INSTRUCTOR_ID, {
            $push: { courses: newCourse._id },
        });
        console.log("✅ Linked to instructor");

        // Link course to Career Development category
        const updatedCat = await Category.findByIdAndUpdate(
            CAREER_DEV_CATEGORY_ID,
            { $push: { courses: newCourse._id } },
            { new: true }
        );
        console.log(
            `✅ Linked to category: ${updatedCat.name} — now has ${updatedCat.courses.length} course(s)`
        );

        process.exit(0);
    } catch (err) {
        console.error("Error:", err.message);
        process.exit(1);
    }
}

seed();
