const express = require("express")
const router = express.Router()
const { auth } = require("../middlewares/auth")
const { sendMessage, getMessages, getUnreadCount } = require("../controllers/ChatMessage")

router.post("/sendMessage", auth, sendMessage)
router.get("/getMessages", auth, getMessages)
router.get("/getUnreadCount", auth, getUnreadCount)

module.exports = router
