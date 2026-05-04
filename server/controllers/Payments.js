const { instance } = require("../config/razorpay");
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const { courseEnrollmentEmail } = require("../mail/templates/courseEnrollmentEmail");
const { default: mongoose } = require("mongoose");
const { paymentSuccessEmail } = require("../mail/templates/paymentSuccessEmail");
const crypto = require("crypto");
const CourseProgress = require("../models/CourseProgress");
const Coupon = require("../models/Coupon");

//initiate the razorpay order
exports.capturePayment = async (req, res) => {
    const { courses } = req.body;
    const userId = req.user.id;

    console.log("CAPTURE PAYMENT REQUEST courses:", courses);
    console.log("CAPTURE PAYMENT REQUEST userId:", userId);

    if (!courses || courses.length === 0) {
        return res.json({ success: false, message: "Please provide Course Id" });
    }

    let totalAmount = 0;

    for (const course_id of courses) {
        let course;
        try {

            course = await Course.findById(course_id);
            if (!course) {
                return res.status(200).json({ success: false, message: "Could not find the course" });
            }

            const uid = new mongoose.Types.ObjectId(userId);
            if (course.studentsEnrolled.includes(uid)) {
                return res.status(200).json({ success: false, message: "Student is already Enrolled" });
            }

            totalAmount += course.price;
        }
        catch (error) {
            console.log(error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    const { couponCode } = req.body;
    let discountAmount = 0;
    if (couponCode) {
        const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
        if (coupon && coupon.active && new Date(coupon.expiryDate) > new Date() && coupon.usedCount < coupon.maxUses) {
            for (const course_id of courses) {
                const course = await Course.findById(course_id);
                if (course) {
                    if ((!coupon.courseId && course.instructor.toString() === coupon.instructorId.toString()) || 
                        (coupon.courseId && coupon.courseId.toString() === course_id.toString())) {
                        discountAmount += (course.price * coupon.discountPercentage) / 100;
                    }
                }
            }
        }
    }

    totalAmount -= discountAmount;
    if (totalAmount < 1) totalAmount = 1; // Minimum amount for razorpay

    const currency = "INR";
    const options = {
        amount: Math.round(totalAmount * 100),
        currency,
        receipt: `rcpt_${Math.random().toString(36).substring(2, 12)}`,
        notes: {
            couponCode: couponCode || "",
        }
    }

    try {
        const paymentResponse = await instance.orders.create(options);
        res.json({
            success: true,
            data: paymentResponse,
            key: process.env.RAZORPAY_KEY,
        })
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Could not Initiate Order" });
    }

}


const TestSeries = require("../models/TestSeries");
const Subscription = require("../models/Subscription");

// Verify the payment for courses
exports.verifyPayment = async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, courses, couponCode } = req.body;
    const userId = req.user.id;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !courses || !userId) {
        return res.status(200).json({ success: false, message: "Payment Failed" });
    }

    let body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_SECRET)
        .update(body.toString())
        .digest("hex");

    if (expectedSignature === razorpay_signature) {
        await enrollStudents(courses, userId, res, couponCode, razorpay_payment_id, razorpay_order_id, razorpay_signature);
        return res.status(200).json({ success: true, message: "Payment Verified" });
    }
    return res.status(200).json({ success: false, message: "Payment Failed" });
};

// ... skipped intermediate export functions using regex or search... wait, I must supply the exact target block.
// I will just supply the whole enrollStudents block instead to make sure it matches. 
// Ah, `TargetContent` must perfectly match the original lines. I'll split into two separate replace calls using multi_replace_file_content if I need to modify two spots, or I'll just supply two `replace_file_content` calls. 


// Handle Test Series Payment
exports.captureTestSeriesPayment = async (req, res) => {
    const { testSeriesId } = req.body;
    const userId = req.user.id;

    try {
        const testSeries = await TestSeries.findById(testSeriesId);
        if (!testSeries) return res.status(404).json({ success: false, message: "Test Series not found" });

        const options = {
            amount: testSeries.price * 100,
            currency: "INR",
            receipt: `ts_${userId.slice(-6)}_${Date.now()}`,
        };

        const paymentResponse = await instance.orders.create(options);
        res.json({ success: true, data: paymentResponse });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.verifyTestSeriesPayment = async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, testSeriesId } = req.body;
    const userId = req.user.id;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_SECRET)
        .update(body.toString())
        .digest("hex");

    if (expectedSignature === razorpay_signature) {
        const testSeries = await TestSeries.findByIdAndUpdate(testSeriesId, { $push: { studentsEnrolled: userId } }).populate("instructor");

        const instructor = testSeries.instructor;
        const commissionRate = instructor.commissionTier === "high-volume" ? 0.05 : 0.10;
        const platformCommission = testSeries.price * commissionRate;

        await Transaction.create({
            userId,
            instructorId: instructor._id,
            amount: testSeries.price,
            platformCommission,
            instructorEarnings: testSeries.price - platformCommission,
            type: "TestSeries",
            status: "Success",
            razorpayDetails: { orderId: razorpay_order_id, paymentId: razorpay_payment_id, signature: razorpay_signature },
        });

        return res.status(200).json({ success: true, message: "Test Series Purchased" });
    }
    res.status(400).json({ success: false, message: "Verification failed" });
};


// Handle Subscription Payment
exports.captureSubscriptionPayment = async (req, res) => {
    const { subscriptionId, courseId } = req.body;
    const userId = req.user.id;

    try {
        let subscription;
        if (subscriptionId === "renewal-plan") {
            // Find or create a default renewal plan
            subscription = await Subscription.findOne({ name: "Account-Wide Renewal" });
            if (!subscription) {
                subscription = await Subscription.create({
                    name: "Account-Wide Renewal",
                    price: 4999,
                    billingCycle: "Yearly",
                    courseLimit: 0,
                    testSeriesAccess: false,
                    prioritySupport: false,
                    liveClassAddons: false,
                });
            }
        } else {
            subscription = await Subscription.findById(subscriptionId);
        }

        if (!subscription) return res.status(404).json({ success: false, message: "Subscription not found" });

        const options = {
            amount: subscription.price * 100,
            currency: "INR",
            receipt: `sub_${userId.slice(-6)}_${Date.now()}`,
            notes: {
                courseId: courseId || null,
            }
        };

        const paymentResponse = await instance.orders.create(options);
        res.json({ success: true, data: paymentResponse });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.verifySubscriptionPayment = async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, subscriptionId, courseId } = req.body;
    const userId = req.user.id;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_SECRET)
        .update(body.toString())
        .digest("hex");

    if (expectedSignature === razorpay_signature) {
        let subscription;
        if (subscriptionId === "renewal-plan") {
            subscription = await Subscription.findOne({ name: "Account-Wide Renewal" });
        } else {
            subscription = await Subscription.findById(subscriptionId);
        }

        // Calculate expiration
        const expirationDate = new Date();
        if (subscription.billingCycle === "Monthly") {
            expirationDate.setMonth(expirationDate.getMonth() + 1);
        } else {
            expirationDate.setFullYear(expirationDate.getFullYear() + 1);
        }

        // Get user to iterate over their enrolled courses
        const user = await User.findById(userId);

        // Extend all existing course enrollments by 2 years
        const extendedCourses = user.courses.map(course => {
            let currentExpiry = course.expiresAt ? new Date(course.expiresAt) : new Date();
            // If already expired, start 2 years from today. If active, add 2 years to existing expiry.
            if (currentExpiry < new Date()) {
                currentExpiry = new Date();
            }
            currentExpiry.setFullYear(currentExpiry.getFullYear() + 2);
            return {
                ...course.toObject(),
                expiresAt: currentExpiry
            };
        });

        // Update User
        await User.findByIdAndUpdate(userId, {
            activeSubscription: subscriptionId,
            subscriptionExpiration: expirationDate,
            courses: extendedCourses
        });

        // Record Transaction
        await Transaction.create({
            userId,
            amount: subscription.price,
            platformCommission: subscription.price,
            instructorEarnings: 0,
            type: "Subscription",
            status: "Success",
            razorpayDetails: { orderId: razorpay_order_id, paymentId: razorpay_payment_id, signature: razorpay_signature },
        });

        return res.status(200).json({ success: true, message: "Subscription Activated" });
    }
    res.status(400).json({ success: false, message: "Verification failed" });
};

// Handle Add-on Payments (Live Class, White-label)
exports.captureAddOnPayment = async (req, res) => {
    const { type, amount } = req.body; // type: "LiveClass" or "WhiteLabel"
    const userId = req.user.id;

    const options = {
        amount: amount * 100,
        currency: "INR",
        receipt: `addon_${userId.slice(-6)}_${Date.now()}`,
    };

    try {
        const paymentResponse = await instance.orders.create(options);
        res.json({ success: true, data: paymentResponse });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.verifyAddOnPayment = async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, type, amount, instructorId } = req.body;
    const userId = req.user.id;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_SECRET)
        .update(body.toString())
        .digest("hex");

    if (expectedSignature === razorpay_signature) {
        let platformCommission = amount;
        let instructorEarnings = 0;

        if (type === "LiveClass") {
            const instructor = await User.findById(instructorId);
            const commissionRate = instructor.commissionTier === "high-volume" ? 0.05 : 0.10;
            platformCommission = amount * commissionRate;
            instructorEarnings = amount - platformCommission;
        } else if (type === "WhiteLabel") {
            await User.findByIdAndUpdate(userId, { hasWhiteLabelUpgrade: true });
        }

        await Transaction.create({
            userId,
            instructorId: instructorEarnings > 0 ? instructorId : null,
            amount,
            platformCommission,
            instructorEarnings,
            type,
            status: "Success",
            razorpayDetails: { orderId: razorpay_order_id, paymentId: razorpay_payment_id, signature: razorpay_signature },
        });

        return res.status(200).json({ success: true, message: `${type} Payment Verified` });
    }
    res.status(400).json({ success: false, message: "Verification failed" });
};

const Transaction = require("../models/Transaction");

// Capture setup fee payment for instructors
exports.captureSetupFeePayment = async (req, res) => {
    const userId = req.user.id;
    const amount = 5000; // ₹5,000 setup fee

    const user = await User.findById(userId);
    if (!user || user.accountType !== "Instructor") {
        return res.status(400).json({ success: false, message: "Only instructors can pay setup fee" });
    }

    if (user.isSetupFeePaid) {
        return res.status(400).json({ success: false, message: "Setup fee already paid" });
    }

    const options = {
        amount: amount * 100,
        currency: "INR",
        receipt: `setup_${userId.slice(-6)}_${Date.now()}`,
    };

    try {
        const paymentResponse = await instance.orders.create(options);
        res.json({
            success: true,
            data: paymentResponse,
            key: process.env.RAZORPAY_KEY,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Could not Initiate Setup Fee Payment" });
    }
};

// Verify setup fee payment
exports.verifySetupFeePayment = async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const userId = req.user.id;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_SECRET)
        .update(body.toString())
        .digest("hex");

    if (expectedSignature === razorpay_signature) {
        // Update user status
        await User.findByIdAndUpdate(userId, {
            isSetupFeePaid: true,
            instructorStatus: "ACTIVE",
            approved: true
        });

        // Record transaction
        await Transaction.create({
            userId,
            amount: 5000,
            platformCommission: 5000, // Setup fee goes entirely to platform
            instructorEarnings: 0,
            type: "SetupFee",
            status: "Success",
            razorpayDetails: {
                orderId: razorpay_order_id,
                paymentId: razorpay_payment_id,
                signature: razorpay_signature,
            },
        });

        return res.status(200).json({ success: true, message: "Setup Fee Verified" });
    }
    return res.status(400).json({ success: false, message: "Setup Fee Payment Verification Failed" });
};

const enrollStudents = async (courses, userId, res, couponCode = null, razorpay_payment_id = null, razorpay_order_id = null, razorpay_signature = null) => {

    if (!courses || !userId) {
        return res.status(400).json({ success: false, message: "Please Provide data for Courses or UserId" });
    }

    let couponData = null;
    if (couponCode) {
        couponData = await Coupon.findOne({ code: couponCode.toUpperCase() });
    }

    for (const courseId of courses) {
        try {
            //find the course and enroll the student in it
            const enrolledCourse = await Course.findOneAndUpdate(
                { _id: courseId },
                { $push: { studentsEnrolled: userId } },
                { new: true },
            ).populate("instructor");

            if (!enrolledCourse) {
                return res.status(500).json({ success: false, message: "Course not Found" });
            }

            // Calculate Commission
            const instructor = enrolledCourse.instructor;
            const commissionRate = instructor.commissionTier === "high-volume" ? 0.05 : 0.10;
            
            let finalPrice = enrolledCourse.price;
            if (couponData && ((!couponData.courseId && instructor._id.toString() === couponData.instructorId.toString()) || (couponData.courseId && couponData.courseId.toString() === courseId.toString()))) {
                finalPrice -= (enrolledCourse.price * couponData.discountPercentage) / 100;
            }

            const platformCommission = finalPrice * commissionRate;
            const instructorEarnings = finalPrice - platformCommission;

            // Record Transaction
            await Transaction.create({
                userId,
                instructorId: instructor._id,
                courseId: courseId,
                amount: finalPrice,
                platformCommission,
                instructorEarnings,
                type: "Course",
                status: "Success",
                razorpayDetails: { orderId: razorpay_order_id, paymentId: razorpay_payment_id, signature: razorpay_signature },
            });

            const courseProgress = await CourseProgress.create({
                courseID: courseId,
                userId: userId,
                completedVideos: [],
            })

            // Calculate Expiration (2 years)
            const enrolledAt = new Date();
            const expiresAt = new Date();
            expiresAt.setFullYear(expiresAt.getFullYear() + 2);

            //find the student and add the course to their list of enrolledCOurses
            const enrolledStudent = await User.findByIdAndUpdate(userId,
                {
                    $push: {
                        courses: {
                            courseId: courseId,
                            enrolledAt: enrolledAt,
                            expiresAt: expiresAt,
                            paymentId: razorpay_payment_id,
                        },
                        courseProgress: courseProgress._id,
                    }
                }, { new: true })

            ///bachhe ko mail send kardo
            await mailSender(
                enrolledStudent.email,
                `Successfully Enrolled into ${enrolledCourse.courseName}`,
                courseEnrollmentEmail(enrolledCourse.courseName, `${enrolledStudent.firstName}`)
            )
        }
        catch (error) {
            console.log(error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    if (couponData) {
        await Coupon.findByIdAndUpdate(couponData._id, { $inc: { usedCount: 1 } });
    }
}



exports.sendPaymentSuccessEmail = async (req, res) => {
    const { orderId, paymentId, amount } = req.body;

    const userId = req.user.id;

    if (!orderId || !paymentId || !amount || !userId) {
        return res.status(400).json({ success: false, message: "Please provide all the fields" });
    }

    try {
        //student ko dhundo
        const enrolledStudent = await User.findById(userId);
        await mailSender(
            enrolledStudent.email,
            `Payment Recieved`,
            paymentSuccessEmail(`${enrolledStudent.firstName}`,
                amount / 100, orderId, paymentId)
        )
    }
    catch (error) {
        console.log("error in sending mail", error)
        return res.status(500).json({ success: false, message: "Could not send email" })
    }
}

exports.requestRefund = async (req, res) => {
    try {
        const { courseId } = req.body;
        const userId = req.user.id;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        const courseRecord = user.courses.find(c => c.courseId.toString() === courseId.toString());
        if (!courseRecord) {
            return res.status(400).json({ success: false, message: "User is not enrolled in this course" });
        }

        const enrolledAt = new Date(courseRecord.enrolledAt);
        const daysSinceEnrollment = (new Date() - enrolledAt) / (1000 * 60 * 60 * 24);

        if (daysSinceEnrollment > 30) {
            return res.status(400).json({ success: false, message: "Refund window (30 days) has expired." });
        }

        if (!courseRecord.paymentId) {
            return res.status(400).json({ success: false, message: "No payment record found for refund. This course may have been free." });
        }

        const transaction = await Transaction.findOne({
            userId,
            courseId,
            type: "Course",
            status: "Success"
        }).sort({ createdAt: -1 });

        if (!transaction) {
            return res.status(404).json({ success: false, message: "Transaction details not found." });
        }

        try {
            await instance.payments.refund(courseRecord.paymentId, {
                amount: Math.round(transaction.amount * 100),
                speed: "normal"
            });
        } catch (razorpayError) {
            console.error("Razorpay Refund Error: ", razorpayError);
            return res.status(500).json({ success: false, message: "Failed to process refund with payment gateway.", error: razorpayError.message });
        }

        // Remove from user's course list
        await User.findByIdAndUpdate(userId, {
            $pull: { courses: { courseId: courseId } }
        });

        // Remove from Course's studentsEnrolled
        await Course.findByIdAndUpdate(courseId, {
            $pull: { studentsEnrolled: userId }
        });

        // Delete CourseProgress if it exists
        if (courseRecord.courseProgress) {
            await CourseProgress.findByIdAndDelete(courseRecord.courseProgress);
            await User.findByIdAndUpdate(userId, {
                $pull: { courseProgress: courseRecord.courseProgress }
            });
        }

        transaction.status = "Failed";
        await transaction.save();

        return res.status(200).json({ success: true, message: "Refund processed successfully. Access to course removed." });

    } catch (error) {
        console.error("Refund error:", error);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
};