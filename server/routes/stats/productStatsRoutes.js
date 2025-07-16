const router = require("express").Router();
const ctrls = require("../../controllers/stats/statsProductController");

router.get("/sold", ctrls.getTotalSoldProducts);

module.exports = router;
