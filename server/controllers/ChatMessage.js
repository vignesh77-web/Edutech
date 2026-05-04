const ChatMessage = require("../models/ChatMessage");

exports.sendMessage = async (req, res) => {
    try {
        const { recipientId, courseId, message } = req.body;
        const senderId = req.user.id;

        const chat = await ChatMessage.create({
            sender: senderId,
            recipient: recipientId,
            course: courseId,
            message,
        });

        return res.status(200).json({
            success: true,
            data: chat,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.getMessages = async (req, res) => {
    try {
        const userId = req.user.id;
        const { otherUserId } = req.query;

        const messages = await ChatMessage.find({
            $or: [
                { sender: userId, recipient: otherUserId },
                { sender: otherUserId, recipient: userId }
            ]
        }).sort({ createdAt: 1 });

        return res.status(200).json({
            success: true,
            data: messages,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.getUnreadCount = async (req, res) => {
    try {
        const userId = req.user.id;
        const count = await ChatMessage.countDocuments({ recipient: userId, read: false });

        return res.status(200).json({
            success: true,
            count,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
