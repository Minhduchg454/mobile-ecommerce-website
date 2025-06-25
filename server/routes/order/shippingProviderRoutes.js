// routes/shippingProviders.js
const express = require('express');
const {
    getAllShippingProviders,
    getShippingProviderById,
    createShippingProvider,
    updateShippingProvider,
    deleteShippingProvider
} = require('../../controllers/order/shippingProviderController'); // Đảm bảo đường dẫn này đúng

const router = express.Router();

// Route cho việc lấy tất cả nhà cung cấp và tạo mới nhà cung cấp
// GET /api/shippingproviders        (Lấy tất cả)
// POST /api/shippingproviders       (Tạo mới)
router.route('/')
    .get(getAllShippingProviders)
    .post(createShippingProvider);

// Route cho việc thao tác với một nhà cung cấp cụ thể theo ID
// GET /api/shippingproviders/:id    (Lấy theo ID)
// PUT /api/shippingproviders/:id    (Cập nhật theo ID)
// DELETE /api/shippingproviders/:id (Xóa theo ID)
router.route('/:id')
    .get(getShippingProviderById)
    .put(updateShippingProvider)
    .delete(deleteShippingProvider);

module.exports = router;