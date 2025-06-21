// Khai báo bảng dữ liệu Brand
const Brand = require('../../models/product/Brand')
// Khai báo các hàm xử lý liên quan đến Brand, không cần dùng try/catch vì đã sử dụng express-async-handler
const asyncHandler = require('express-async-handler')


const createNewBrand = asyncHandler(async (req, res) => {
    const response = await Brand.create(req.body)
    return res.json({
        success: response ? true : false, // Kiểm tra xem response có dữ liệu hay không, nếu có là true, nếu không thì false
        createdBrand: response ? response : 'Cannot create new brand' // Trả về dữ liệu brand mới tạo, nếu không có thì trả về thông báo lỗi
    })
})

const getBrands = asyncHandler(async (req, res) => {
    const response = await Brand.find()
    return res.json({
        success: response ? true : false,
        brands: response ? response : 'Cannot get brand'
    })
})


const updateBrand = asyncHandler(async (req, res) => {
    const { bid } = req.params
    const response = await Brand.findByIdAndUpdate(bid, req.body, { new: true })
    return res.json({
        success: response ? true : false,
        updatedBrand: response ? response : 'Cannot update brand'
    })
})

const deleteBrand = asyncHandler(async (req, res) => {
    const { bid } = req.params
    const response = await Brand.findByIdAndDelete(bid)
    return res.json({
        success: response ? true : false,
        deletedBrand: response ? response : 'Cannot delete brand'
    })
})

module.exports = {
    createNewBrand,
    getBrands,
    updateBrand,
    deleteBrand
}