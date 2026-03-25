const mongoose = require("mongoose");
const Course = require("./models/Course");
const Category = require("./models/Category");
const User = require("./models/User");
const dotenv = require("dotenv");

dotenv.config();

const sampleCourses = [
    {
        courseName: "MERN Stack Mastery",
        courseDescription: "Master Full-Stack Web Development using MongoDB, Express, React, and Node.js. Build real-world projects from scratch.",
        instructor: "69983ef67f6b07b657a9b1c8",
        whatYouWillLearn: "You will learn how to build scalable web applications, handle authentication, manage state with Redux, and deploy your apps.",
        price: 4999,
        tag: ["Web Development", "MERNStack", "React", "NodeJS"],
        category: "699839063f3e3935f80f756e",
        thumbnail: "https://res.cloudinary.com/dqr6i9kvt/image/upload/v1707200000/EduTech/mern_thumbnail.jpg",
        status: "Published",
        instructions: ["Basic HTML/CSS knowledge required", "JavaScript fundamentals recommended", "Willingness to learn"],
    },
    {
        courseName: "React Native Mobile Apps",
        courseDescription: "Build beautiful cross-platform mobile applications for iOS and Android using a single React codebase.",
        instructor: "69983ef67f6b07b657a9b1c8",
        whatYouWillLearn: "Master mobile UI components, navigation, native features, and publishing apps to App Store and Play Store.",
        price: 3999,
        tag: ["Mobile Development", "ReactNative", "AppDevelopment"],
        category: "699839063f3e3935f80f7571",
        thumbnail: "https://res.cloudinary.com/dqr6i9kvt/image/upload/v1707200000/EduTech/rn_thumbnail.jpg",
        status: "Published",
        instructions: ["React knowledge is a plus", "Computer with Node.js installed"],
    },
    {
        courseName: "Python for Data Science",
        courseDescription: "Unlock the power of data with Python. Learn NumPy, Pandas, Matplotlib, and Scikit-Learn for data analysis.",
        instructor: "69983ef67f6b07b657a9b1c8",
        whatYouWillLearn: "Understand data cleaning, visualization, statistical analysis, and basic machine learning algorithms with Python.",
        price: 2999,
        tag: ["Data Science", "Python", "Machine Learning"],
        category: "699839073f3e3935f80f7574",
        thumbnail: "https://res.cloudinary.com/dqr6i9kvt/image/upload/v1707200000/EduTech/python_thumbnail.jpg",
        status: "Published",
        instructions: ["No prior programming experience needed", "Interest in data analysis"],
    }
];

const seedDB = async () => {
    try {
        console.log("Attempting to connect to MongoDB...");
        await mongoose.connect(process.env.MONGODB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("DB connected successfully to:", mongoose.connection.name);

        for (const courseData of sampleCourses) {
            // Check if course already exists
            const existingCourse = await Course.findOne({ courseName: courseData.courseName });
            if (existingCourse) {
                console.log(`Course "${courseData.courseName}" already exists. Skipping.`);
                continue;
            }

            console.log(`Creating course: ${courseData.courseName}...`);
            // Create Course
            const newCourse = await Course.create(courseData);
            console.log(`Created course with ID: ${newCourse._id}`);

            // Update Instructor
            await User.findByIdAndUpdate(courseData.instructor, {
                $push: { courses: newCourse._id }
            });
            console.log(`Updated instructor: ${courseData.instructor}`);

            // Update Category
            const updatedCategory = await Category.findByIdAndUpdate(courseData.category, {
                $push: { courses: newCourse._id }
            }, { new: true });
            console.log(`Updated category: ${updatedCategory.name} (ID: ${courseData.category})`);
            console.log(`Category now has ${updatedCategory.courses.length} courses.`);
        }

        console.log("Seeding process finished.");
        process.exit(0);
    } catch (error) {
        console.error("Error during seeding:", error);
        process.exit(1);
    }
};

seedDB();
