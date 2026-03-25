const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        price: {
            type: Number,
            required: true,
        },
        billingCycle: {
            type: String,
            enum: ["Monthly", "Yearly"],
            required: true,
        },
        features: [
            {
                type: String,
            },
        ],
        courseLimit: {
            type: Number, // 0 for unlimited, or a specific number
            default: 0,
        },
        active: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Subscription", subscriptionSchema);
