// models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    productName: {
        type: String,
        required: true,
        trim: true
    },
    slug: { // URL thân thiện, thường được tạo từ productName
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    description: {
        type: String,
        trim: true
    },
    createAt: { // createAt trong biểu đồ
        type: Date,
        default: Date.now // Tự động điền ngày hiện tại khi tạo
    },
    rating: { // Điểm đánh giá trung bình
        type: Number, // NumberInt
        default: 0,
        min: 0,
        max: 5 // Điểm đánh giá thường từ 0 đến 5
    },
    totalRating: { // Tổng số lượt đánh giá hoặc tổng điểm để tính rating trung bình
        type: Number, // NumberDouble
        default: 0
    },
    // Mối quan hệ với ProductCategory (Product "Thuộc danh mục" ProductCategory)
    categoryId: { // Đặt tên trường là 'category'
        type: mongoose.Schema.Types.ObjectId, // Tham chiếu đến _id của ProductCategory
        ref: 'ProductCategory', // Tên model ProductCategory
        required: true
    },
    // Mối quan hệ với Brand (Product "Thuộc thương hiệu" Brand)
    brandId: {
        type: mongoose.Schema.Types.ObjectId, // Tham chiếu đến _id của Brand
        ref: 'Brand', // Tên model Brand
        required: true
    }
}
);





module.exports = mongoose.model('Product', productSchema);