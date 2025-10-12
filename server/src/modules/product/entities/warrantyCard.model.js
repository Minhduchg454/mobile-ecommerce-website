// models/WarrantyCard.js
const mongoose = require("mongoose");

const warrantyCardSchema = new mongoose.Schema(
  {
    warrantyCardCode: {
      // Theo biểu đồ: warrantyCode: NumberInt (thường là String)
      type: String, // Mã bảo hành thường là chuỗi chữ cái/số
      required: true,
      unique: true, // Mỗi mã bảo hành là duy nhất
      trim: true,
      index: true,
    },
    warrantyCardStartDate: {
      // Theo biểu đồ: startDate: Date
      type: Date,
      default: Date.now, // Mặc định là ngày tạo thẻ bảo hành
    },
    warrantyCardExpirationDate: {
      // Theo biểu đồ: expirationDate: Date
      type: Date,
      required: true, // Ngày hết hạn là bắt buộc
    },
    // Mối quan hệ với SpecificProduct (WarrantyCard thuộc về một SpecificProduct) - 1-1
    specPid: {
      type: mongoose.Schema.Types.ObjectId, // Tham chiếu đến _id của SpecificProduct
      ref: "SpecificProduct", // Tên model SpecificProduct
      required: true,
      unique: true, // Đảm bảo mỗi WarrantyCard chỉ liên kết với một SpecificProduct duy nhất
    },
  },
  {
    timestamps: true, // Tự động thêm createdAt và updatedAt
  }
);

module.exports = mongoose.model("WarrantyCard", warrantyCardSchema);
