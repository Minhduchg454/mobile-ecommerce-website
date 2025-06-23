const router = require('express').Router();
const ctrls = require('../../controllers/product/specificationsController');

// Tạo mới Specification
router.post('/', ctrls.createSpecification);

// Lấy danh sách Specification
router.get('/', ctrls.getSpecifications);

// Cập nhật Specification
router.put('/:id', ctrls.updateSpecification);

// Xoá Specification
router.delete('/:id', ctrls.deleteSpecification);

module.exports = router;