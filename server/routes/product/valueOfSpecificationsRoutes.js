const router = require("express").Router();
const ctrls = require("../../controllers/product/valueOfSpecificationsController");

// Create new value
router.post("/", ctrls.createValueOfSpec);

// Get all values
router.get("/", ctrls.getAllValuesOfSpecs);

// Get values for a specific variation
router.get("/variation/:variationId", ctrls.getValuesByVariation);

// Update value
router.put("/:id", ctrls.updateValueOfSpec);

// Delete value
router.delete("/:id", ctrls.deleteValueOfSpec);

router.post("/product", ctrls.createValueOfSpecForProduct);

router.get("/product/:productId", ctrls.getValuesByProduct);

router.put("/product/:id", ctrls.updateValueOfSpecForProduct);

router.delete("/product/:id", ctrls.deleteValueOfSpecForProduct);

module.exports = router;
