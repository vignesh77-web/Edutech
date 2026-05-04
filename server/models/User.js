// Import the Mongoose library
const mongoose = require("mongoose");

// Define the user schema using the Mongoose Schema constructor
const userSchema = new mongoose.Schema(
	{
		// Define the name field with type String, required, and trimmed
		firstName: {
			type: String,
			required: true,
			trim: true,
		},
		lastName: {
			type: String,
			required: true,
			trim: true,
		},

		// Define the email field with type String, required, and trimmed
		email: {
			type: String,
			required: true,
			trim: true,
		},

		// Define the password field with type String and required
		password: {
			type: String,
			required: true,
		},

		// Define the role field with type String and enum values of "Admin", "Student", or "Visitor"
		accountType: {
			type: String,
			enum: ["Admin", "Student", "Instructor"],
			required: true,
		},
		active: {
			type: Boolean,
			default: true,
		},
		approved: {
			type: Boolean,
			default: true,
		},
		additionalDetails: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: "Profile",
		},
		courses: [
			{
				courseId: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "Course",
				},
				enrolledAt: {
					type: Date,
					default: Date.now,
				},
				expiresAt: {
					type: Date,
				},
				paymentId: {
					type: String,
					default: null,
				},
			},
		],
		wishlist: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Course",
			},
		],
		token: {
			type: String,
		},
		resetPasswordExpires: {
			type: Date,
		},
		image: {
			type: String,
			required: true,
		},
		courseProgress: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "courseProgress",
			},
		],
		// New fields for billing and commissions
		isSetupFeePaid: {
			type: Boolean,
			default: false,
		},
		commissionTier: {
			type: String,
			enum: ["starter", "high-volume"],
			default: "starter", // 10% for starter, 5% for high-volume
		},
		hasWhiteLabelUpgrade: {
			type: Boolean,
			default: false,
		},
		activeSubscription: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Subscription",
		},
		subscriptionExpiration: {
			type: Date,
		},
		instructorStatus: {
			type: String,
			enum: ["PENDING_SETUP_PAYMENT", "ACTIVE", null],
			default: function () {
				return this.accountType === "Instructor" ? "PENDING_SETUP_PAYMENT" : null;
			}
		},
		instituteDetails: {
			instituteName: String,
			designation: String,
		},

		// Add timestamps for when the document is created and last modified
	},
	{ timestamps: true }
);

// Export the Mongoose model for the user schema, using the name "user"
module.exports = mongoose.model("user", userSchema);