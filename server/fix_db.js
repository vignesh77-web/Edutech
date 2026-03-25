const mongoose = require("mongoose");
const Course = require("./models/Course");
const Category = require("./models/Category");
const dotenv = require("dotenv");

dotenv.config();

const fixDatabase = async () => {
    try {
        console.log("Connecting to DB...");
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("DB connected successfully.");

        // 1. Get all published courses
        const publishedCourses = await Course.find({ status: "Published" });
        console.log(`Found ${publishedCourses.length} published courses.`);

        // 2. Ensure each published course is linked in its category
        for (const course of publishedCourses) {
            if (!course.category) {
                console.log(`Course "${course.courseName}" has no category ID!`);
                continue;
            }

            console.log(`Ensuring course "${course.courseName}" is linked to category ${course.category}...`);
            await Category.findByIdAndUpdate(course.category, {
                $addToSet: { courses: course._id }
            });
        }

        // 3. Cleanup ALL categories: remove invalid references and duplicates
        const allCategories = await Category.find({});
        for (const category of allCategories) {
            console.log(`Auditing category: ${category.name}...`);
            const validCourseIds = [];

            for (const courseId of category.courses) {
                const exists = await Course.findById(courseId);
                if (exists) {
                    validCourseIds.push(courseId);
                } else {
                    console.log(`  - Removing invalid reference: ${courseId}`);
                }
            }

            // Remove duplicates and save
            const uniqueIds = [...new Set(validCourseIds.map(id => id.toString()))].map(id => new mongoose.Types.ObjectId(id));

            category.courses = uniqueIds;
            await category.save();
            console.log(`  - Category "${category.name}" now has ${category.courses.length} valid course(s).`);
        }

        console.log("\nDatabase fix completed successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Error during DB fix:", error);
        process.exit(1);
    }
};

fixDatabase();
