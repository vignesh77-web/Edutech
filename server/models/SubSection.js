const mongoose = require("mongoose");

const subSectionSchema = new mongoose.Schema({
    
    title:{
        type:String,
    },
    timeDuration: { type: String },
    description: {
        type:String,
    },
    videoUrl:{
        type:String,
    },
    captionUrl: {
        type: String,
        default: null,
    },
    subSectionType: {
        type: String,
        enum: ["Video", "Quiz"],
        default: "Video",
    },
    questions: [
        {
            question: { type: String },
            options: [{ type: String }],
            correctAnswer: { type: Number },
            explanation: { type: String },
        }
    ],
    resources: [
        {
            name: String,
            fileUrl: String,
        }
    ],

});

module.exports = mongoose.model("SubSection", subSectionSchema);