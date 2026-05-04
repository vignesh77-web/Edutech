const mongoose = require("mongoose");

// Define the RatingAndReview schema
const ratingAndReviewSchema = new mongoose.Schema({
	user: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: "user",
	},
	rating: {
		type: Number,
		required: true,
	},
	review: {
		type: String,
		required: true,
	},
	course: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: "Course",
		index: true,
	},
	instructorReply: {
		type: String,
		default: null,
	},
	helpfulVotes: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "user",
		}
	],
	notHelpfulVotes: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "user",
		}
	],
});

// Export the RatingAndReview model
module.exports = mongoose.model("RatingAndReview", ratingAndReviewSchema);