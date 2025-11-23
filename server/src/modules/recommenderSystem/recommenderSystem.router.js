const router = require("express").Router();
const controller = require("./recommenderSystem.controller");

router.get("/:userId", controller.getRecommendationsForUser);

module.exports = router;
