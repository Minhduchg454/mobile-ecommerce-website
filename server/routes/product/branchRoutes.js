const express = require('express')
const router = express.Router()
const {
    createNewBrand,
    getBrands,
    updateBrand,
    deleteBrand
} = require('../../controllers/product/brandController') // đường dẫn phù hợp với project bạn

// Route GET - lấy danh sách thương hiệu
router.get('/', getBrands)

// Route POST - tạo thương hiệu mới
router.post('/', createNewBrand)

// Route PUT - cập nhật thương hiệu theo ID
router.put('/:bid', updateBrand)

// Route DELETE - xóa thương hiệu theo ID
router.delete('/:bid', deleteBrand)

module.exports = router