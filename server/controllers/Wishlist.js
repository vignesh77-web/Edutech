const User = require("../models/User");
const Course = require("../models/Course");

exports.addToWishlist = async (req, res) => {
    try {
        const userId = req.user.id;
        const { courseId } = req.body;
        
        if (!courseId) {
            return res.status(400).json({ success: false, message: "Course ID is required" });
        }

        const user = await User.findById(userId);
        if (user.wishlist.includes(courseId)) {
            return res.status(200).json({ success: true, message: "Course already in wishlist" });
        }
        
        const updatedUser = await User.findByIdAndUpdate(userId, { $push: { wishlist: courseId } }, { new: true });
        
        return res.status(200).json({
            success: true,
            message: "Course added to wishlist",
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.removeFromWishlist = async (req, res) => {
    try {
        const userId = req.user.id;
        const { courseId } = req.body;
        
        if (!courseId) {
            return res.status(400).json({ success: false, message: "Course ID is required" });
        }

        await User.findByIdAndUpdate(userId, { $pull: { wishlist: courseId } }, { new: true });
        
        return res.status(200).json({
            success: true,
            message: "Course removed from wishlist",
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.getWishlist = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).populate({
            path: "wishlist",
            populate: {
                path: "instructor",
            }
        }).populate({
            path: "wishlist",
            populate: {
                path: "ratingAndReviews",
            }
        });
        
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        return res.status(200).json({
            success: true,
            data: user.wishlist,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
