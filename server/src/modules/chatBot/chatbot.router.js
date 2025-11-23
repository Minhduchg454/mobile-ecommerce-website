const router = require("express").Router();
const controller = require("./chatbot.controller");

router.post("/send-message", controller.getResponse);

module.exports = router;
