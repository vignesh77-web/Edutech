const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true,
        },
        instructorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
        },
        amount: {
            type: Number,
            required: true,
        },
        platformCommission: {
            type: Number,
            required: true,
        },
        instructorEarnings: {
            type: Number,
            required: true,
        },
        type: {
            type: String,
            enum: ["Course", "TestSeries", "Subscription", "LiveClass", "SetupFee", "WhiteLabel"],
            required: true,
        },
        status: {
            type: String,
            enum: ["Success", "Failed", "Pending"],
            default: "Pending",
        },
        razorpayDetails: {
            orderId: String,
            paymentId: String,
            signature: String,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);
