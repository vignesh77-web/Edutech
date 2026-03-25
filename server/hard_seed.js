const mongoose = require("mongoose");
const Course = require("./models/Course");
const Category = require("./models/Category");
const User = require("./models/User");
const dotenv = require("dotenv");

dotenv.config();

const sampleCourses = [
    {
        courseName: "MERN Stack Mastery",
        courseDescription: "Master Full-Stack Web Development using MongoDB, Express, React, and Node.js.",
        instructor: "69983ef67f6b07b657a9b1c8",
        whatYouWillLearn: "Full stack MERN",
        price: 4999,
        tag: ["Web Development"],
        category: "699839063f3e3935f80f756e",
        thumbnail: "https://res.cloudinary.com/dqr6i9kvt/image/upload/v1707200000/EduTech/mern_thumbnail.jpg",
        status: "Published",
        instructions: ["Basic JS"],
    },
    {
        courseName: "React Native Mobile Apps",
        courseDescription: "Cross-platform mobile apps.",
        instructor: "69983ef67f6b07b657a9b1c8",
        whatYouWillLearn: "React Native",
        price: 3999,
        tag: ["Mobile Development"],
        category: "699839063f3e3935f80f7571",
        thumbnail: "https://res.cloudinary.com/dqr6i9kvt/image/upload/v1707200000/EduTech/rn_thumbnail.jpg",
        status: "Published",
        instructions: ["React"],
    },
    {
        courseName: "Python for Data Science",
        courseDescription: "Introduction to Data Science.",
        instructor: "69983ef67f6b07b657a9b1c8",
        whatYouWillLearn: "Python, Pandas",
        price: 2999,
        tag: ["Data Science"],
        category: "699839073f3e3935f80f7574",
        thumbnail: "https://res.cloudinary.com/dqr6i9kvt/image/upload/v1707200000/EduTech/python_thumbnail.jpg",
        status: "Published",
        instructions: ["None"],
    }
];

const hardSeed = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("Connected to:", mongoose.connection.name);

        for (const data of sampleCourses) {
            console.log(`Working on ${data.courseName}...`);
            // Delete if exists to ensure fresh state
            await Course.deleteMany({ courseName: data.courseName });

            const newCourse = await Course.create(data);
            console.log(`- Created ID: ${newCourse._id}`);

            // Verify immediately
            const check = await Course.findById(newCourse._id);
            if (check) {
                console.log(`- VERIFIED in DB: ${check.courseName}`);
            } else {
                console.log(`- [ERROR] NOT FOUND IMMEDIATELY AFTER CREATION!`);
            }

            // Update category
            await Category.findByIdAndUpdate(data.category, {
                $addToSet: { courses: newCourse._id }
            });
            console.log(`- Linked to category ${data.category}`);
        }

        console.log("Hard seeding complete.");
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

hardSeed();
