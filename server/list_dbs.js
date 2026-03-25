const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const listDBs = async () => {
    try {
        const url = process.env.MONGODB_URL.split(".net/")[0] + ".net/";
        console.log("Connecting to cluster (no DB selected)...");
        await mongoose.connect(url);

        const admin = mongoose.connection.db.admin();
        const dbs = await admin.listDatabases();
        console.log("Databases on cluster:");
        dbs.databases.forEach(db => {
            console.log(`- ${db.name}`);
        });

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

listDBs();
