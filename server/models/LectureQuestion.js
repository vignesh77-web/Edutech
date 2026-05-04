const mongoose = require("mongoose");

const lectureQuestionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true,
    },
    subSection: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SubSection",
        required: true,
    },
    question: {
        type: String,
        required: true,
        trim: true,
    },
    videoTimestamp: {
        type: Number, // In seconds
        default: 0,
    },
    answers: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "user",
                required: true,
            },
            answer: {
                type: String,
                required: true,
                trim: true,
            },
            createdAt: {
                type: Date,
                default: Date.now,
            },
            upvotes: {
                type: Number,
                default: 0,
            }
        }
    ],
}, { timestamps: true });

module.exports = mongoose.model("LectureQuestion", lectureQuestionSchema);
