const Affiliate = require("../models/Affiliate");
const crypto = require("crypto");

exports.generateReferralCode = async (req, res) => {
    try {
        const userId = req.user.id;
        let affiliate = await Affiliate.findOne({ user: userId });

        if (!affiliate) {
            const referralCode = crypto.randomBytes(4).toString("hex").toUpperCase();
            affiliate = await Affiliate.create({
                user: userId,
                referralCode,
            });
        }

        return res.status(200).json({
            success: true,
            data: affiliate,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAffiliateStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const affiliate = await Affiliate.findOne({ user: userId }).populate("referrals.referredUser", "firstName lastName");

        if (!affiliate) {
            return res.status(404).json({ success: false, message: "Affiliate profile not found" });
        }

        return res.status(200).json({
            success: true,
            data: affiliate,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// This would be called during payment verification if a referral cookie/param exists
exports.recordReferralSale = async (userId, referralCode, courseId, price) => {
    try {
        const affiliate = await Affiliate.findOne({ referralCode });
        if (!affiliate) return;

        const commission = price * 0.1; // 10% commission

        affiliate.referrals.push({
            referredUser: userId,
            course: courseId,
            status: "Completed",
            commission,
        });

        affiliate.totalEarnings += commission;
        await affiliate.save();
    } catch (error) {
        console.error("Error recording referral sale:", error);
    }
};
