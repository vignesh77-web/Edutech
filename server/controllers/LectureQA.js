const LectureQuestion = require("../models/LectureQuestion");
const Course = require("../models/Course");

exports.askQuestion = async (req, res) => {
    try {
        const { courseId, subSectionId, question, videoTimestamp } = req.body;
        const userId = req.user.id;

        if (!courseId || !subSectionId || !question) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        const newQuestion = await LectureQuestion.create({
            user: userId,
            course: courseId,
            subSection: subSectionId,
            question,
            videoTimestamp: videoTimestamp || 0,
        });

        const populatedQuestion = await LectureQuestion.findById(newQuestion._id).populate("user", "firstName lastName image");

        return res.status(200).json({
            success: true,
            message: "Question posted successfully",
            data: populatedQuestion,
        });
    } catch (error) {
        console.error("askQuestion Error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

exports.getQuestionsForLecture = async (req, res) => {
    try {
        const { subSectionId } = req.query; // or req.body depending on how it's called
        
        if (!subSectionId) {
            return res.status(400).json({ success: false, message: "subSectionId is required" });
        }

        const questions = await LectureQuestion.find({ subSection: subSectionId })
            .populate("user", "firstName lastName image accountType")
            .populate("answers.user", "firstName lastName image accountType")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            data: questions,
        });
    } catch (error) {
        console.error("getQuestionsForLecture Error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

exports.answerQuestion = async (req, res) => {
    try {
        const { questionId, answer } = req.body;
        const userId = req.user.id;

        if (!questionId || !answer) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        const updatedQuestion = await LectureQuestion.findByIdAndUpdate(
            questionId,
            {
                $push: {
                    answers: {
                        user: userId,
                        answer: answer,
                    }
                }
            },
            { new: true }
        )
        .populate("user", "firstName lastName image accountType")
        .populate("answers.user", "firstName lastName image accountType");

        if (!updatedQuestion) {
            return res.status(404).json({ success: false, message: "Question not found" });
        }

        return res.status(200).json({
            success: true,
            message: "Answer added successfully",
            data: updatedQuestion,
        });
    } catch (error) {
        console.error("answerQuestion Error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};
