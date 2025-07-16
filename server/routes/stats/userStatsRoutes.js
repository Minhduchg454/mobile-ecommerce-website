const router = require("express").Router();
const ctrls = require("../../controllers/stats/statsUserController");

router.get("/new", ctrls.getUserStats); // ?from=2025-07-01&to=2025-07-15&type=day|month|year

module.exports = router;
