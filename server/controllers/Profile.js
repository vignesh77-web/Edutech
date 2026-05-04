const Course = require("../models/Course");
const CourseProgress = require("../models/CourseProgress");
const Profile = require("../models/Profile");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const { uploadImageToCloudinary } = require("../utils/imageUploader");
const { convertSecondsToDuration } = require("../utils/secToDuration");
// Method for updating a profile
exports.updateProfile = async (req, res) => {
	try {
		const { dateOfBirth = "", about = "", contactNumber } = req.body;
		const id = req?.user.id;

		// Find the profile by id
		const userDetails = await User.findById(id);
		const profile = await Profile.findById(userDetails?.additionalDetails);

		// Update the profile fields
		profile.dateOfBirth = dateOfBirth;
		profile.about = about;
		profile.contactNumber = contactNumber;

		// Save the updated profile
		await profile?.save();

		return res.json({
			success: true,
			message: "Profile updated successfully",
			profile,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			success: false,
			error: error.message,
		});
	}
};

exports.deleteAccount = async (req, res) => {
	try {
		// TODO: Find More on Job Schedule
		// const job = schedule.scheduleJob("10 * * * * *", function () {
		// 	console.log("The answer to life, the universe, and everything!");
		// });
		// console.log(job);
		console.log("Printing ID: ", req.user.id);
		const id = req.user.id;

		const user = await User.findById({ _id: id });
		if (!user) {
			return res.status(404).json({
				success: false,
				message: "User not found",
			});
		}
		// Delete Assosiated Profile with the User
		await Profile.findByIdAndDelete({ _id: user.additionalDetails });
		
		// Unenroll User From All the Enrolled Courses
		const Course = require("../models/Course");
		if (user.courses && user.courses.length > 0) {
			for (const courseObj of user.courses) {
				const courseId = courseObj.courseId ? courseObj.courseId : courseObj;
				await Course.findByIdAndUpdate(courseId, {
					$pull: { studentsEnrolled: id },
				});
			}
		}

		// Delete User's CourseProgress
		if (user.courseProgress && user.courseProgress.length > 0) {
			const CourseProgress = require("../models/CourseProgress");
			await CourseProgress.deleteMany({ _id: { $in: user.courseProgress } });
		}

		// Now Delete User
		await User.findByIdAndDelete({ _id: id });
		res.status(200).json({
			success: true,
			message: "User deleted successfully",
		});
	} catch (error) {
		console.log(error);
		res
			.status(500)
			.json({ success: false, message: "User Cannot be deleted successfully" });
	}
};

exports.getAllUserDetails = async (req, res) => {
	try {
		const id = req.user.id;
		const userDetails = await User.findById(id)
			.populate("additionalDetails")
			.exec();
		console.log(userDetails);
		res.status(200).json({
			success: true,
			message: "User Data fetched successfully",
			data: userDetails,
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

exports.updateDisplayPicture = async (req, res) => {
	try {
		const displayPicture = req.files.displayPicture
		const userId = req.user.id
		const image = await uploadImageToCloudinary(
			displayPicture,
			process.env.FOLDER_NAME,
			1000,
			1000
		)
		console.log(image)
		const updatedProfile = await User.findByIdAndUpdate(
			{ _id: userId },
			{ image: image.secure_url },
			{ new: true }
		)
		res.send({
			success: true,
			message: `Image Updated successfully`,
			data: updatedProfile,
		})
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: error.message,
		})
	}
};

exports.getEnrolledCourses = async (req, res) => {
	try {
		const userId = req.user.id

		// First, get the raw user to understand courses structure
		let userDetails = await User.findOne({ _id: userId })

		if (!userDetails) {
			return res.status(400).json({
				success: false,
				message: `Could not find user with id: ${userId}`,
			})
		}

		const rawCourses = userDetails.courses;

		// Determine which courses are new-style (objects with courseId) vs legacy (plain ObjectIds)
		const newStyleIds = rawCourses.filter(c => c.courseId).map(c => c.courseId);
		const legacyIds = rawCourses.filter(c => !c.courseId && c._id && !c.expiresAt && !c.enrolledAt);

		// Build a map of courseId -> metadata (for expiration tracking)
		const metaMap = {};
		rawCourses.forEach(c => {
			if (c.courseId) {
				metaMap[c.courseId.toString()] = { enrolledAt: c.enrolledAt, expiresAt: c.expiresAt };
			}
		});

		// Collect all course IDs to populate
		const allCourseIds = [
			...newStyleIds.map(id => id.toString()),
			...legacyIds.map(c => c.toString()),
		];

		// Fetch all courses with nested content
		const Course = require("../models/Course");
		const populatedCourses = await Course.find({ _id: { $in: allCourseIds } })
			.populate({ path: "courseContent", populate: { path: "subSection" } })
			.exec();

		const enrolledCourses = [];
		for (const course of populatedCourses) {
			const courseObj = course.toObject();
			const meta = metaMap[courseObj._id.toString()] || {};

			let totalDurationInSeconds = 0;
			let SubsectionLength = 0;

			if (courseObj.courseContent) {
				for (const section of courseObj.courseContent) {
					for (const sub of section.subSection) {
						totalDurationInSeconds += parseInt(sub.timeDuration) || 0;
						SubsectionLength++;
					}
				}
			}

			courseObj.totalDuration = convertSecondsToDuration(totalDurationInSeconds);

			let courseProgressDoc = await CourseProgress.findOne({
				courseID: courseObj._id,
				userId: userId,
			});
			const completedCount = courseProgressDoc?.completedVideos.length || 0;

			if (SubsectionLength === 0) {
				courseObj.progressPercentage = 100;
			} else {
				const multiplier = Math.pow(10, 2);
				courseObj.progressPercentage =
					Math.round((completedCount / SubsectionLength) * 100 * multiplier) / multiplier;
			}

			const now = new Date();
			const expiresAt = meta.expiresAt ? new Date(meta.expiresAt) : null;
			const diffInDays = expiresAt ? Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24)) : null;
			const isExpiringSoon = diffInDays !== null && diffInDays <= 7 && diffInDays > 0;

			enrolledCourses.push({
				...courseObj,
				enrolledAt: meta.enrolledAt || null,
				expiresAt: meta.expiresAt || null,
				isExpiringSoon,
				daysLeft: diffInDays,
			});
		}

		return res.status(200).json({
			success: true,
			data: enrolledCourses,
		})
	} catch (error) {
		console.error(error)
		return res.status(500).json({
			success: false,
			message: error.message,
		})
	}
};

exports.instructorDashboard = async (req, res) => {
	try {
		const instructorId = req.user.id;
		const courses = await Course.find({ instructor: instructorId });

		const stats = await Promise.all(courses.map(async (course) => {
			const totalStudents = course.studentsEnrolled.length;

			// Find all successful transactions for this specific course
			// Note: We'll filter all transactions by instructor first, then find relevant ones.
			// Ideally, Transaction model should have courseId, but we'll work with what we have.
			const transactions = await Transaction.find({
				instructorId: instructorId,
				status: "Success",
			});

			// If Transaction doesn't have courseId, we'll need to be careful.
			// Re-calculating based on assumptions from the existing code.
			const instructorEarnings = transactions.reduce((acc, curr) => acc + curr.instructorEarnings, 0);
			const totalRevenue = transactions.reduce((acc, curr) => acc + curr.amount, 0);

			return {
				_id: course._id,
				courseName: course.courseName,
				courseDescription: course.courseDescription,
				totalStudentsEnrolled: totalStudents,
				totalAmountGenerated: totalRevenue,
				instructorEarnings: instructorEarnings,
			}
		}));

		// Get last 5 successful transactions for Recent Activity
		const recentTransactions = await Transaction.find({
			instructorId: instructorId,
			status: "Success"
		})
			.sort({ createdAt: -1 })
			.limit(5)
			.populate("userId", "firstName lastName image");

		res.status(200).json({
			courses: stats,
			recentTransactions: recentTransactions
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ success: false, message: "Internal Server Error" });
	}
};