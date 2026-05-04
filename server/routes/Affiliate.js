const express = require("express")
const router = express.Router()
const { auth } = require("../middlewares/auth")
const { generateReferralCode, getAffiliateStats } = require("../controllers/Affiliate")

router.post("/generateCode", auth, generateReferralCode)
router.get("/getStats", auth, getAffiliateStats)

module.exports = router
