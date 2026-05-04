const RatingAndReview = require("../models/RatingAndRaview");
const Course = require("../models/Course");
const { mongo, default: mongoose } = require("mongoose");

//createRating
exports.createRating = async (req, res) => {
    try{

        //get user id
        const userId = req.user.id;

        //fetchdata from req body
        const {rating, review, courseId} = req.body;

        //check if user is enrolled or not
        const courseDetails = await Course.findOne(
                                    {_id:courseId,
                                    studentsEnrolled: {$elemMatch: {$eq: userId} },
                                });

        if(!courseDetails) {
            return res.status(404).json({
                success:false,
                message:'Student is not enrolled in the course',
            });
        }

        //check if user already reviewed the course
        const alreadyReviewed = await RatingAndReview.findOne({
                                                user:userId,
                                                course:courseId,
                                            });
        if(alreadyReviewed) {
            return res.status(403).json({
                success:false,
                message:'Course is already reviewed by the user',
            });
        }

        //create rating and review
        const ratingReview = await RatingAndReview.create({
                                        rating, review, 
                                        course:courseId,
                                        user:userId,
                                    });
       
        //update course with this rating/review
        const updatedCourseDetails = await Course.findByIdAndUpdate({_id:courseId},
                                    {
                                        $push: {
                                            ratingAndReviews: ratingReview._id,
                                        }
                                    },
                                    {new: true});
        console.log(updatedCourseDetails);

        //return response
        return res.status(200).json({
            success:true,
            message:"Rating and Review created Successfully",
            ratingReview,
        })
    }
    catch(error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}

//getAverageRating
exports.getAverageRating = async (req, res) => {
    try {

        //get course ID
        const courseId = req.body.courseId;

        //calculate avg rating
        const result = await RatingAndReview.aggregate([
            {
                $match:{
                    course: new mongoose.Types.ObjectId(courseId),
                },
            },
            {
                $group:{
                    _id:null,
                    averageRating: { $avg: "$rating"},
                }
            }
        ])

        //return rating
        if(result.length > 0) {

            return res.status(200).json({
                success:true,
                averageRating: result[0].averageRating,
            })

        }
        
        //if no rating/Review exist
        return res.status(200).json({
            success:true,
            message:'Average Rating is 0, no ratings given till now',
            averageRating:0,
        })
    }
    catch(error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}


//getAllRatingAndReviews

exports.getAllRating = async (req, res) => {
    try{
        const allReviews = await RatingAndReview.find({})
                                .sort({rating: "desc"})
                                .populate({
                                    path:"user",
                                    select:"firstName lastName email image",
                                })
                                .populate({
                                    path:"course",
                                    select: "courseName",
                                })
                                .exec();

        return res.status(200).json({
            success:true,
            message:"All reviews fetched successfully",
            data:allReviews,
        });
    }   
    catch(error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    } 
}

exports.getInstructorReviews = async (req, res) => {
    try {
        const userId = req.user.id;
        const userCourses = await Course.find({ instructor: userId });
        const courseIds = userCourses.map(c => c._id);
        
        const reviews = await RatingAndReview.find({ course: { $in: courseIds } })
                                .sort({createdAt: "desc"})
                                .populate("user", "firstName lastName email image")
                                .populate("course", "courseName")
                                .exec();
                                
        return res.status(200).json({
            success: true,
            data: reviews,
        });
    } catch(error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

exports.addReplyToReview = async (req, res) => {
    try {
        const { reviewId, reply } = req.body;
        const userId = req.user.id;

        if (!reviewId || !reply) {
            return res.status(400).json({
                success: false,
                message: "Review ID and reply text are required",
            });
        }

        const reviewData = await RatingAndReview.findById(reviewId).populate('course');

        if (!reviewData) {
            return res.status(404).json({
                success: false,
                message: "Review not found",
            });
        }

        // Check if the current user is the instructor of the course
        if (reviewData.course.instructor.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to reply to this review",
            });
        }

        reviewData.instructorReply = reply;
        await reviewData.save();

        return res.status(200).json({
            success: true,
            message: "Reply added successfully",
            data: reviewData,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

exports.toggleHelpful = async (req, res) => {
    try {
        const { reviewId } = req.body;
        const userId = req.user.id;

        const reviewData = await RatingAndReview.findById(reviewId);
        if (!reviewData) {
            return res.status(404).json({ success: false, message: "Review not found" });
        }

        // Remove from notHelpful if present
        reviewData.notHelpfulVotes = reviewData.notHelpfulVotes.filter(id => id.toString() !== userId);

        if (reviewData.helpfulVotes.includes(userId)) {
            // Already upvoted, so remove it
            reviewData.helpfulVotes = reviewData.helpfulVotes.filter(id => id.toString() !== userId);
        } else {
            // Add to upvotes
            reviewData.helpfulVotes.push(userId);
        }

        await reviewData.save();

        return res.status(200).json({
            success: true,
            message: "Vote updated",
            data: reviewData,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

exports.toggleNotHelpful = async (req, res) => {
    try {
        const { reviewId } = req.body;
        const userId = req.user.id;

        const reviewData = await RatingAndReview.findById(reviewId);
        if (!reviewData) {
            return res.status(404).json({ success: false, message: "Review not found" });
        }

        // Remove from helpful if present
        reviewData.helpfulVotes = reviewData.helpfulVotes.filter(id => id.toString() !== userId);

        if (reviewData.notHelpfulVotes.includes(userId)) {
            // Already downvoted, so remove it
            reviewData.notHelpfulVotes = reviewData.notHelpfulVotes.filter(id => id.toString() !== userId);
        } else {
            // Add to downvotes
            reviewData.notHelpfulVotes.push(userId);
        }

        await reviewData.save();

        return res.status(200).json({
            success: true,
            message: "Vote updated",
            data: reviewData,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}