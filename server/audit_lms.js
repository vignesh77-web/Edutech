const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const auditLMS = async () => {
    try {
        const url = process.env.MONGODB_URL.split(".net/")[0] + ".net/lms_database";
        console.log("Connecting to lms_database...");
        await mongoose.connect(url);

        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        console.log("Collections in lms_database:", collections.map(c => c.name));

        for (const col of collections) {
            const count = await db.collection(col.name).countDocuments();
            console.log(`- ${col.name}: ${count} docs`);
        }

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

auditLMS();
