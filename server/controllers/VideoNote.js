const VideoNote = require("../models/VideoNote");

exports.addVideoNote = async (req, res) => {
    try {
        const { courseId, subSectionId, note, timestamp } = req.body;
        const userId = req.user.id;

        if (!courseId || !subSectionId || !note) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        const newNote = await VideoNote.create({
            user: userId,
            course: courseId,
            subSection: subSectionId,
            note,
            timestamp: timestamp || 0,
        });

        return res.status(200).json({
            success: true,
            message: "Note added successfully",
            data: newNote,
        });
    } catch (error) {
        console.error("addVideoNote Error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

exports.getVideoNotes = async (req, res) => {
    try {
        const { subSectionId } = req.query;
        const userId = req.user.id;

        if (!subSectionId) {
            return res.status(400).json({ success: false, message: "subSectionId is required" });
        }

        const notes = await VideoNote.find({ subSection: subSectionId, user: userId })
            .sort({ timestamp: 1 });

        return res.status(200).json({
            success: true,
            data: notes,
        });
    } catch (error) {
        console.error("getVideoNotes Error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

exports.deleteVideoNote = async (req, res) => {
    try {
        const { noteId } = req.body;
        const userId = req.user.id;

        if (!noteId) {
            return res.status(400).json({ success: false, message: "noteId is required" });
        }

        const note = await VideoNote.findOneAndDelete({ _id: noteId, user: userId });

        if (!note) {
            return res.status(404).json({ success: false, message: "Note not found or you are not authorized" });
        }

        return res.status(200).json({
            success: true,
            message: "Note deleted",
        });
    } catch (error) {
        console.error("deleteVideoNote Error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};
