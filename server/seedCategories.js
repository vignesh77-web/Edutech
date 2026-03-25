const mongoose = require("mongoose");
require("dotenv").config();

const Category = require("./models/Category");

const categories = [
    {
        name: "Web Development",
        description:
            "Learn HTML, CSS, JavaScript, React, Node.js and build full-stack web applications from scratch.",
    },
    {
        name: "Mobile Development",
        description:
            "Build iOS and Android apps using React Native, Flutter, and modern mobile development tools.",
    },
    {
        name: "Data Science",
        description:
            "Master data analysis, visualization, machine learning, and statistical modeling with Python and R.",
    },
    {
        name: "Artificial Intelligence",
        description:
            "Explore machine learning, deep learning, NLP, computer vision, and cutting-edge AI techniques.",
    },
    {
        name: "Cloud Computing",
        description:
            "Get certified in AWS, Azure, and Google Cloud. Learn DevOps, Docker, Kubernetes, and CI/CD pipelines.",
    },
    {
        name: "Cybersecurity",
        description:
            "Understand ethical hacking, network security, penetration testing, and how to protect digital assets.",
    },
    {
        name: "UI/UX Design",
        description:
            "Design beautiful user interfaces and experiences using Figma, Adobe XD, and design thinking principles.",
    },
    {
        name: "Business & Finance",
        description:
            "Learn entrepreneurship, digital marketing, financial planning, and business strategy to grow your career.",
    },
    {
        name: "Career Development",
        description:
            "Build your professional skills, learn resume writing, interview preparation, and personal branding.",
    },
];

async function seedCategories() {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("Connected to MongoDB");

        // Remove existing categories
        const existing = await Category.find({});
        if (existing.length > 0) {
            console.log(`Found ${existing.length} existing categories. Skipping duplicates.`);
        }

        let inserted = 0;
        for (const cat of categories) {
            const exists = await Category.findOne({ name: cat.name });
            if (!exists) {
                await Category.create(cat);
                console.log(`✅ Created: ${cat.name}`);
                inserted++;
            } else {
                console.log(`⏭️  Already exists: ${cat.name}`);
            }
        }

        console.log(`\nDone! ${inserted} new categories added.`);
        process.exit(0);
    } catch (err) {
        console.error("Error:", err.message);
        process.exit(1);
    }
}

seedCategories();
