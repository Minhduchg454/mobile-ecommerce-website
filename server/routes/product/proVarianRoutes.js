const router = require('express').Router();
const ctrls = require('../../controllers/product/productVariationController');
const uploadCloud = require('../../config/cloudinary.config'); // middleware multer-cloudinary


// Tạo biến thể sản phẩm
router.post('/', uploadCloud.array('images', 10), ctrls.createProductVariation);

// Lấy toàn bộ biến thể sản phẩm
router.get('/', ctrls.getProductVariations);

// Lấy một biến thể theo ID
router.get('/:pvid', ctrls.getProductVariation);

// Cập nhật một biến thể
router.put('/:pvid', ctrls.updateProductVariation);

// Xoá một biến thể
router.delete('/:pvid', ctrls.deleteProductVariation);

// Upload nhiều ảnh cho biến thể (multer xử lý)
router.put('/uploadImage/:pvid', uploadCloud.array('images', 10), ctrls.uploadImagesProductVariation);

module.exports = router;