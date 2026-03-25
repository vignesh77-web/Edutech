const mongoose = require("mongoose");
const User = require("./models/User");
const dotenv = require("dotenv");
dotenv.config();

const listUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("DB connected");
        const all = await User.find({}, { firstName: 1, lastName: 1, accountType: 1, email: 1 });
        console.log("All Users:");
        console.log(JSON.stringify(all, null, 2));
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

listUsers();
