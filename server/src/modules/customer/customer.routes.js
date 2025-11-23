const router = require("express").Router();
const controller = require("./customer.controller");

router.get("/:cId/cart", controller.getCartByCustomerId);

router.get("/detail/:cId/", controller.getCustomerDetail);

module.exports = router;
