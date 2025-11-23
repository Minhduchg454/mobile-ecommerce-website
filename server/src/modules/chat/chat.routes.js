// routes/chat.js
const express = require("express");
const router = express.Router();
const chatController = require("./chat.controller");

router.post("/conversations", chatController.startConversation);

router.get("/conversations/:userId", chatController.getMyConversations);

router.post("/messages", chatController.sendMessage);

router.get("/conversations/:conver_id/messages", chatController.getMessages);

router.post("/conversations/:conver_id/read", chatController.markAsRead);
router.put("/conversations/:conver_id/hide", chatController.hideConversation);

module.exports = router;
