const mongoose = require("mongoose");

const affiliateSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
    referralCode: {
        type: String,
        required: true,
        unique: true,
    },
    referrals: [
        {
            referredUser: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
            course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
            status: { type: String, enum: ["Pending", "Completed"], default: "Pending" },
            commission: { type: Number, default: 0 },
        }
    ],
    totalEarnings: {
        type: Number,
        default: 0,
    },
}, { timestamps: true });

module.exports = mongoose.model("Affiliate", affiliateSchema);
