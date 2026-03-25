const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const inspectEduTech = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("Connected to EduTech");

        const db = mongoose.connection.db;
        const courses = await db.collection("courses").find({}).toArray();
        console.log("Courses in EduTech:");
        courses.forEach((c, i) => {
            console.log(`${i + 1}. _id: ${c._id}, courseName: ${c.courseName}, status: ${c.status}`);
        });

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

inspectEduTech();
