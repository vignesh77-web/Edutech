const mongoose = require("mongoose");

const liveClassSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        courseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
        },
        instructorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true,
        },
        scheduledAt: {
            type: Date,
            required: true,
        },
        duration: {
            type: Number, // in minutes
            required: true,
            default: 60,
        },
        price: {
            type: Number,
            default: 0, // 0 means free for enrolled students
        },
        meetingLink: {
            type: String,
            trim: true,
        },
        status: {
            type: String,
            enum: ["upcoming", "live", "completed", "cancelled"],
            default: "upcoming",
        },
        registeredStudents: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "user",
            }
        ],
    },
    { timestamps: true }
);

module.exports = mongoose.model("LiveClass", liveClassSchema);
