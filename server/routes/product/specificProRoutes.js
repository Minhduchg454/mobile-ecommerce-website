const router = require('express').Router()
const ctrls = require('../../controllers/product/specificProductController')

// Tạo mới sản phẩm cụ thể
router.post('/', ctrls.createSpecificProduct)

// Lấy tất cả sản phẩm cụ thể
router.get('/', ctrls.getSpecificProducts)

// Lấy chi tiết một sản phẩm cụ thể
router.get('/:spid', ctrls.getSpecificProduct)

// Lay tất cả sản phẩm cụ thể theo ID biến thể
router.get('/variation/:pvid', ctrls.getSpecificProductsByVariationId);


// Cập nhật một sản phẩm cụ thể
router.put('/:spid', ctrls.updateSpecificProduct)

// Xoá một sản phẩm cụ thể
router.delete('/:spid', ctrls.deleteSpecificProduct)

module.exports = router