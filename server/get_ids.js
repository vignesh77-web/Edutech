const mongoose = require("mongoose");
const Category = require("./models/Category");
const User = require("./models/User");
require("dotenv").config();

async function getIds() {
    await mongoose.connect(process.env.MONGODB_URL);
    const cat = await Category.findOne({ name: "Career Development" });
    console.log("Career Development category ID:", cat ? cat._id : "NOT FOUND");
    const instructor = await User.findOne({ accountType: "Instructor" });
    console.log("Instructor ID:", instructor ? instructor._id : "NOT FOUND");
    process.exit(0);
}
getIds().catch(e => { console.error(e); process.exit(1); });
