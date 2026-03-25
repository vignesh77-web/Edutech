const mongoose = require("mongoose");
const Category = require("./models/Category");
const User = require("./models/User");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("DB connected successfully");

        const categories = await Category.find({}, { name: 1, _id: 1 });
        const instructors = await User.find({ accountType: "Instructor" }, { firstName: 1, lastName: 1, _id: 1 });

        console.log("CATEGORIES:", JSON.stringify(categories, null, 2));
        console.log("INSTRUCTORS:", JSON.stringify(instructors, null, 2));

        process.exit(0);
    } catch (error) {
        console.error("Error:", error.message);
        process.exit(1);
    }
};

connectDB();
