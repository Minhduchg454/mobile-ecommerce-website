const router = require("express").Router();
const controller = require("./customer.controller");

router.get("/:cId/cart", controller.getCartByCustomerId);

module.exports = router;
