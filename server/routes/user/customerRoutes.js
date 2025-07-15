const express = require("express");
const router = express.Router();
const customerCtrl = require("../../controllers/user/customerController");

// Tạo mới customer
router.post("/", customerCtrl.createCustomer);

// Lấy thông tin 1 customer theo id
router.get("/:id", customerCtrl.getCustomerById);

// Cập nhật thông tin customer
router.put("/:id", customerCtrl.updateCustomer);

// Xoá customer
router.delete("/:id", customerCtrl.deleteCustomer);

// Lấy danh sách tất cả customer
router.get("/", customerCtrl.getAllCustomers);

// Kiểm tra email đã tồn tại chưa (qua query ?email=...)
router.get("/check-email", customerCtrl.checkEmailExists);

// Kiểm tra mobile đã tồn tại chưa (qua query ?mobile=...)
router.get("/check-mobile", customerCtrl.checkMobileExists);

//LẤY GIỎ HÀNG của customer (thiếu trước đó)
router.get("/:id/cart", customerCtrl.getCartByCustomerId);

module.exports = router;
