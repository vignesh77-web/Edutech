const mongoose = require("mongoose");

const videoNoteSchema = new mongoose.Schema({
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
    note: {
        type: String,
        required: true,
        trim: true,
    },
    timestamp: {
        type: Number, // In seconds
        required: true,
        default: 0,
    },
}, { timestamps: true });

module.exports = mongoose.model("VideoNote", videoNoteSchema);
