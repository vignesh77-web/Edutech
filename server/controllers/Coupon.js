const Coupon = require("../models/Coupon");
const Course = require("../models/Course");

exports.createCoupon = async (req, res) => {
    try {
        const { code, discountPercentage, courseId, expiryDate, maxUses } = req.body;
        const instructorId = req.user.id;

        if (!code || !discountPercentage || !expiryDate || !maxUses) {
            return res.status(400).json({ success: false, message: "All required fields must be provided" });
        }

        // Validate course if provided
        if (courseId) {
            const course = await Course.findById(courseId);
            if (!course || course.instructor.toString() !== instructorId) {
                return res.status(403).json({ success: false, message: "Invalid course or unauthorized" });
            }
        }

        // Check if code already exists
        const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
        if (existingCoupon) {
            return res.status(400).json({ success: false, message: "Coupon code already exists" });
        }

        const coupon = await Coupon.create({
            code: code.toUpperCase(),
            discountPercentage,
            courseId: courseId || null,
            instructorId,
            expiryDate,
            maxUses,
        });

        return res.status(200).json({ success: true, message: "Coupon created successfully", data: coupon });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};

exports.getInstructorCoupons = async (req, res) => {
    try {
        const instructorId = req.user.id;
        const coupons = await Coupon.find({ instructorId }).populate("courseId", "courseName").sort({ createdAt: -1 });
        return res.status(200).json({ success: true, data: coupons });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};

exports.deleteCoupon = async (req, res) => {
    try {
        const { couponId } = req.body;
        const instructorId = req.user.id;

        const coupon = await Coupon.findById(couponId);
        if (!coupon) {
            return res.status(404).json({ success: false, message: "Coupon not found" });
        }

        if (coupon.instructorId.toString() !== instructorId) {
            return res.status(403).json({ success: false, message: "Unauthorized to delete this coupon" });
        }

        await Coupon.findByIdAndDelete(couponId);
        return res.status(200).json({ success: true, message: "Coupon deleted successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};

exports.applyCoupon = async (req, res) => {
    try {
        const { code, courseIds } = req.body;

        if (!code || !courseIds || courseIds.length === 0) {
            return res.status(400).json({ success: false, message: "Coupon code and course details are required" });
        }

        const coupon = await Coupon.findOne({ code: code.toUpperCase() });
        if (!coupon) {
            return res.status(404).json({ success: false, message: "Invalid coupon code" });
        }

        if (!coupon.active || new Date(coupon.expiryDate) < new Date() || coupon.usedCount >= coupon.maxUses) {
            return res.status(400).json({ success: false, message: "Coupon has expired, is inactive, or max usage reached" });
        }

        // Validate courses
        let applicable = false;
        let discountDetails = {};

        for (const cId of courseIds) {
            const course = await Course.findById(cId);
            if (!course) continue;

            // Apply coupon if no courseId specified (applies to ALL instructor's courses) OR if exact courseId matches
            if ((!coupon.courseId && course.instructor.toString() === coupon.instructorId.toString()) || 
                (coupon.courseId && coupon.courseId.toString() === cId.toString())) {
                applicable = true;
                discountDetails[cId] = {
                    discountPercentage: coupon.discountPercentage,
                    discountAmount: (course.price * coupon.discountPercentage) / 100
                };
            }
        }

        if (!applicable) {
            return res.status(400).json({ success: false, message: "Coupon is not applicable to any of the selected courses" });
        }

        return res.status(200).json({ 
            success: true, 
            message: "Coupon applied successfully",
            discountPercentage: coupon.discountPercentage,
            discountDetails,
            couponId: coupon._id
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};
