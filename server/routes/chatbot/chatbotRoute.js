// routes/chatbot.js
const {
    getResponse
} = require('../../controllers/chatbot/chatbotController');

const express = require('express');

const router = express.Router();

router.post('/send-message', getResponse);

module.exports = router;