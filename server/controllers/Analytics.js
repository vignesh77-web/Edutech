const VideoView = require("../models/VideoView");
const Course = require("../models/Course");
const SubSection = require("../models/SubSection");

exports.logVideoView = async (req, res) => {
    try {
        const { courseId, subSectionId, watchTime } = req.body;
        const userId = req.user.id;

        // Find or create view log for this user/subsection
        let view = await VideoView.findOne({ user: userId, course: courseId, subSection: subSectionId });
        
        if (view) {
            // Update watch time if new time is greater (optional logic: accumulate or max)
            view.watchTime = Math.max(view.watchTime, watchTime);
            await view.save();
        } else {
            view = await VideoView.create({
                user: userId,
                course: courseId,
                subSection: subSectionId,
                watchTime,
            });
        }

        return res.status(200).json({ success: true, data: view });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.getInstructorAnalytics = async (req, res) => {
    try {
        const instructorId = req.user.id;
        const courses = await Course.find({ instructor: instructorId });
        const courseIds = courses.map(c => c._id);

        const analytics = await VideoView.aggregate([
            { $match: { course: { $in: courseIds } } },
            {
                $group: {
                    _id: "$course",
                    totalWatchTime: { $sum: "$watchTime" },
                    totalViews: { $count: {} },
                }
            },
            {
                $lookup: {
                    from: "courses",
                    localField: "_id",
                    foreignField: "_id",
                    as: "courseDetails"
                }
            },
            { $unwind: "$courseDetails" },
            {
                $project: {
                    courseName: "$courseDetails.courseName",
                    totalWatchTime: 1,
                    totalViews: 1,
                }
            }
        ]);

        return res.status(200).json({
            success: true,
            data: analytics,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
