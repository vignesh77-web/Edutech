const Announcement = require("../models/Announcement");
const Course = require("../models/Course");

exports.createAnnouncement = async (req, res) => {
    try {
        const { courseId, title, content } = req.body;
        const userId = req.user.id;

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ success: false, message: "Course not found" });
        }

        if (course.instructor.toString() !== userId) {
            return res.status(403).json({ success: false, message: "Only the instructor can post announcements" });
        }

        const announcement = await Announcement.create({
            course: courseId,
            instructor: userId,
            title,
            content,
        });

        return res.status(200).json({
            success: true,
            message: "Announcement posted",
            data: announcement,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.getCourseAnnouncements = async (req, res) => {
    try {
        const { courseId } = req.query;
        const announcements = await Announcement.find({ course: courseId }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            data: announcements,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
