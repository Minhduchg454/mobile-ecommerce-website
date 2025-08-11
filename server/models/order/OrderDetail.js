// models/OrderDetail.js
const mongoose = require("mongoose");
const Order = require("./Order");
const ProductVariation = require("../product/ProductVariation");

const orderDetailSchema = new mongoose.Schema({
  quantity: {
    type: Number, // NumberInt
    required: true,
    min: 1, // Đảm bảo số lượng ít nhất là 1
  },
  price: {
    type: Number, // NumberDouble (đây là giá của từng item hoặc giá tổng của item đó trong order detail)
    required: true,
  },
  // Mối quan hệ với Order: Mỗi OrderDetail thuộc về một Order
  orderId: {
    type: mongoose.Schema.Types.ObjectId, // Tham chiếu đến _id của Order
    ref: "Order", // Tên model mà chúng ta đang tham chiếu
    required: true,
  },
  // Bạn có thể muốn thêm một tham chiếu đến sản phẩm mà chi tiết này mô tả
  productVariationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ProductVariation", // Giả sử bạn có model Product
    required: true,
  },
});

// Định nghĩa pre-save hook để kiểm tra sự tồn tại của khóa ngoại
orderDetailSchema.pre("save", async function (next) {
  // 'this' ở đây là tài liệu OrderDetail sắp được lưu

  try {
    // 1. Kiểm tra sự tồn tại của orderId
    const orderExists = await Order.findById(this.orderId);
    if (!orderExists) {
      // Nếu Order không tồn tại, trả về lỗi
      return next(new Error("Order không tồn tại với ID đã cung cấp."));
    }

    // 2. Kiểm tra sự tồn tại của productVariationId
    const productVariationExists = await ProductVariation.findById(
      this.productVariationId
    );
    if (!productVariationExists) {
      // Nếu ProductVariation không tồn tại, trả về lỗi
      return next(
        new Error("Product Variation không tồn tại với ID đã cung cấp.")
      );
    }

    // Nếu cả hai khóa ngoại đều hợp lệ, tiếp tục quá trình lưu
    next();
  } catch (error) {
    // Xử lý các lỗi khác có thể xảy ra trong quá trình kiểm tra (ví dụ: lỗi kết nối DB)
    next(error);
  }
});

orderDetailSchema.pre("insertMany", function (docs, next) {
  Promise.all(
    docs.map(async (doc) => {
      const orderExists = await mongoose.model("Order").findById(doc.orderId);
      if (!orderExists) throw new Error(`Order không tồn tại: ${doc.orderId}`);

      const productExists = await mongoose
        .model("ProductVariation")
        .findById(doc.productVariationId);
      if (!productExists)
        throw new Error(
          `ProductVariation không tồn tại: ${doc.productVariationId}`
        );
    })
  )
    .then(() => next())
    .catch(next);
});

module.exports = mongoose.model("OrderDetail", orderDetailSchema);
