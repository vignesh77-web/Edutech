const mongoose = require("mongoose");

const testSeriesSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        instructor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        tests: [
            {
                title: String,
                questions: [
                    {
                        question: String,
                        options: [String],
                        correctAnswer: Number,
                    },
                ],
            },
        ],
        studentsEnrolled: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "user",
            },
        ],
        status: {
            type: String,
            enum: ["Draft", "Published"],
            default: "Draft",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("TestSeries", testSeriesSchema);
