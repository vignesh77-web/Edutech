const mongoose = require("mongoose");

const videoViewSchema = new mongoose.Schema({
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
    watchTime: {
        type: Number, // seconds
        default: 0,
    },
}, { timestamps: true });

module.exports = mongoose.model("VideoView", videoViewSchema);
