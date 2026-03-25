// Import the required modules
const express = require("express")
const router = express.Router()

const {
    capturePayment,
    verifyPayment,
    sendPaymentSuccessEmail,
    captureSetupFeePayment,
    verifySetupFeePayment,
    captureTestSeriesPayment,
    verifyTestSeriesPayment,
    captureSubscriptionPayment,
    verifySubscriptionPayment,
    captureAddOnPayment,
    verifyAddOnPayment
} = require("../controllers/Payments")
const { auth, isStudent, isInstructor } = require("../middlewares/auth")

router.post("/capturePayment", auth, isStudent, capturePayment)
router.post("/verifyPayment", auth, isStudent, verifyPayment)
router.post("/sendPaymentSuccessEmail", auth, isStudent, sendPaymentSuccessEmail);

router.post("/captureSetupFee", auth, isInstructor, captureSetupFeePayment);
router.post("/verifySetupFee", auth, isInstructor, verifySetupFeePayment);

router.post("/captureTestSeriesPayment", auth, isStudent, captureTestSeriesPayment);
router.post("/verifyTestSeriesPayment", auth, isStudent, verifyTestSeriesPayment);

router.post("/captureSubscriptionPayment", auth, isStudent, captureSubscriptionPayment);
router.post("/verifySubscriptionPayment", auth, isStudent, verifySubscriptionPayment);

router.post("/captureAddOnPayment", auth, captureAddOnPayment);
router.post("/verifyAddOnPayment", auth, verifyAddOnPayment);

module.exports = router