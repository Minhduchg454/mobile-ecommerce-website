// routes/user/brand.js
// Định nghĩa các route liên quan đến Brand (Thương hiệu)
const router = require('express').Router()
//const ctrls = require('../../controllers/product/brandController')
const ctrls = require('../controllers/product/brandController')
const { verifyAccessToken, isAdmin } = require('../middlewares/verifyToken')

// Tạo mới một thương hiệu (chỉ admin)
router.post('/', [verifyAccessToken, isAdmin], ctrls.createNewBrand)

// Lấy danh sách tất cả thương hiệu
router.get('/', ctrls.getBrands)

// Cập nhật thông tin thương hiệu (chỉ admin)
router.put('/:bid', [verifyAccessToken, isAdmin], ctrls.updateBrand)

// Xóa thương hiệu (chỉ admin)
router.delete('/:bid', [verifyAccessToken, isAdmin], ctrls.deleteBrand)

module.exports = router