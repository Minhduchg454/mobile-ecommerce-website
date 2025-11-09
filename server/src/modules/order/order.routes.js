const router = require("express").Router();
const controller = require("./order.controller");

router.post("/", controller.createOrder);
router.get("/", controller.getOrders);

router.get("/customers/:cId", controller.getOrdersByUserId);
router.get("/count-by-status", controller.getOrderCountsByStatus);
router.get("/dash-board", controller.getOrderDashboardStats);
router.get("/shops/:shopId", controller.getOrdersByUserId);
router.put("/:orderId", controller.updateOrders);

module.exports = router;
