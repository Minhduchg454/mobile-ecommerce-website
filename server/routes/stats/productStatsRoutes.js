const router = require("express").Router();
const ctrls = require("../../controllers/stats/statsProductController");

router.get("/sold", ctrls.getTotalSoldProducts); // ?from=2025-07-01&to=2025-07-15&type=day|month|year

module.exports = router;
