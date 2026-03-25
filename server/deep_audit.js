const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const audit = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("Connected to:", mongoose.connection.name);

        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        console.log("Collections found:", collections.map(c => c.name));

        for (const col of collections) {
            const count = await db.collection(col.name).countDocuments();
            console.log(`- ${col.name}: ${count} docs`);

            // Search for course if it looks like a course-related collection
            if (col.name.toLowerCase().includes("course")) {
                const sample = await db.collection(col.name).findOne({
                    $or: [
                        { courseName: "MERN Stack Mastery" },
                        { status: "Published" }
                    ]
                });
                if (sample) {
                    console.log(`  [!] FOUND A MATCH in ${col.name}: ${sample.courseName}`);
                }
            }
        }

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

audit();
