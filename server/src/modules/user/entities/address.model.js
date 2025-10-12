const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  addressUserName: {
    type: String, // tên người nhận
    required: true,
    trim: true,
  },
  addressNumberPhone: {
    type: String, // số điện thoại người nhận
    required: true,
    trim: true,
  },
  addressStreet: {
    type: String, // Địa chỉ đường/phố
    required: true,
    trim: true,
  },
  addressWard: {
    type: String, // Phường/xã
    required: true,
    trim: true,
  },
  addressDistrict: {
    type: String, // Quận/huyện
    required: true,
    trim: true,
  },
  addressCountry: {
    type: String, // Quốc gia
    required: true,
    trim: true,
  },
  addressIsDefault: {
    type: Boolean, // Đánh dấu địa chỉ mặc định
    default: false,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId, // Tham chiếu đến _id của User
    ref: "User",
    required: true,
  },
});

module.exports = mongoose.model("Address", addressSchema);
