const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const inspectRaw = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("DB connected");

        const categoryId = "699839063f3e3935f80f756e";
        const cat = await mongoose.connection.db.collection("categories").findOne({ _id: new mongoose.Types.ObjectId(categoryId) });

        console.log("Raw Category document:");
        console.log(JSON.stringify(cat, null, 2));

        if (cat.courses && cat.courses.length > 0) {
            console.log("\nInspecting referenced courses:");
            for (const courseId of cat.courses) {
                const course = await mongoose.connection.db.collection("courses").findOne({ _id: courseId });
                if (course) {
                    console.log(`- ID: ${course._id}, Name: ${course.courseName}, Status: '${course.status}'`);
                } else {
                    console.log(`- ID: ${courseId} NOT FOUND in courses collection!`);
                }
            }
        }

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

inspectRaw();
