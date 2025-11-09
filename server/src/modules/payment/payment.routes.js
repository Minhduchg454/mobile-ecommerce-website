const router = require("express").Router();
const controller = require("./payment.controller");

router.post("/vnpay/create-payment", controller.createPaymentVNpay);
router.get("/vnpay_return", controller.vnpayReturn);
router.get("/vnpay_ipn", controller.vnpayIPN);
router.post("/", controller.createPayment);
router.get("/", controller.getPayments);
router.get("/:paymentId", controller.getPaymentById);
router.put("/:paymentId", controller.updatePayment);
router.delete("/:paymentId", controller.deletePayment);

module.exports = router;
