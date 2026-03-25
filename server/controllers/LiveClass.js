const LiveClass = require("../models/LiveClass");
const Course = require("../models/Course");

// Create a new live class (Instructor)
exports.createLiveClass = async (req, res) => {
    try {
        const instructorId = req.user.id;
        const { title, description, courseId, scheduledAt, duration, price, meetingLink } = req.body;

        if (!title || !scheduledAt) {
            return res.status(400).json({ success: false, message: "Title and scheduled time are required" });
        }

        // Validate that the course belongs to this instructor (if provided)
        if (courseId) {
            const course = await Course.findOne({ _id: courseId, instructor: instructorId });
            if (!course) {
                return res.status(403).json({ success: false, message: "Course not found or unauthorized" });
            }
        }

        const liveClass = await LiveClass.create({
            title,
            description,
            courseId: courseId || null,
            instructorId,
            scheduledAt: new Date(scheduledAt),
            duration: duration || 60,
            price: price || 0,
            meetingLink,
            status: "upcoming",
        });

        return res.status(201).json({
            success: true,
            message: "Live class scheduled successfully",
            data: liveClass,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Get all live classes for the authenticated instructor
exports.getInstructorLiveClasses = async (req, res) => {
    try {
        const instructorId = req.user.id;

        const liveClasses = await LiveClass.find({ instructorId })
            .populate("courseId", "courseName thumbnail")
            .sort({ scheduledAt: 1 })
            .exec();

        // Auto-update status based on time
        const now = new Date();
        const updatedClasses = liveClasses.map(lc => {
            const lcObj = lc.toObject();
            const start = new Date(lcObj.scheduledAt);
            const end = new Date(start.getTime() + lcObj.duration * 60 * 1000);

            if (lcObj.status === "upcoming" && now >= start && now <= end) {
                lcObj.status = "live";
            } else if (lcObj.status !== "cancelled" && now > end) {
                lcObj.status = "completed";
            }
            return lcObj;
        });

        return res.status(200).json({ success: true, data: updatedClasses });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Update a live class (Instructor)
exports.updateLiveClass = async (req, res) => {
    try {
        const instructorId = req.user.id;
        const { liveClassId, title, description, courseId, scheduledAt, duration, price, meetingLink, status } = req.body;

        if (!liveClassId) {
            return res.status(400).json({ success: false, message: "liveClassId is required" });
        }

        const liveClass = await LiveClass.findOne({ _id: liveClassId, instructorId });
        if (!liveClass) {
            return res.status(404).json({ success: false, message: "Live class not found or unauthorized" });
        }

        const updates = {};
        if (title !== undefined) updates.title = title;
        if (description !== undefined) updates.description = description;
        if (courseId !== undefined) updates.courseId = courseId;
        if (scheduledAt !== undefined) updates.scheduledAt = new Date(scheduledAt);
        if (duration !== undefined) updates.duration = duration;
        if (price !== undefined) updates.price = price;
        if (meetingLink !== undefined) updates.meetingLink = meetingLink;
        if (status !== undefined) updates.status = status;

        const updated = await LiveClass.findByIdAndUpdate(liveClassId, updates, { new: true })
            .populate("courseId", "courseName thumbnail");

        return res.status(200).json({ success: true, message: "Live class updated", data: updated });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Delete a live class (Instructor)
exports.deleteLiveClass = async (req, res) => {
    try {
        const instructorId = req.user.id;
        const { liveClassId } = req.body;

        if (!liveClassId) {
            return res.status(400).json({ success: false, message: "liveClassId is required" });
        }

        const liveClass = await LiveClass.findOne({ _id: liveClassId, instructorId });
        if (!liveClass) {
            return res.status(404).json({ success: false, message: "Live class not found or unauthorized" });
        }

        await LiveClass.findByIdAndDelete(liveClassId);

        return res.status(200).json({ success: true, message: "Live class deleted successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Get all public (non-cancelled) upcoming live classes (Student discovery)
exports.getAllPublicLiveClasses = async (req, res) => {
    try {
        const liveClasses = await LiveClass.find({
            status: { $in: ["upcoming", "live"] },
        })
            .populate("instructorId", "firstName lastName image")
            .populate("courseId", "courseName thumbnail")
            .sort({ scheduledAt: 1 })
            .exec();

        return res.status(200).json({ success: true, data: liveClasses });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
};
