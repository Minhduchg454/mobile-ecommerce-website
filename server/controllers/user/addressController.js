const Address = require("../../models/user/Address");
const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const User = require("../../models/user/User");

// Tạo mới địa chỉ giao hàng
exports.createAddress = async (req, res) => {
  try {
    // 1. Kiểm tra các trường bắt buộc
    const requiredFields = ["street", "ward", "district", "country", "userId"];
    const missingFields = requiredFields.filter((field) => !req.body[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Vui lòng điền đầy đủ thông tin: ${missingFields.join(", ")}`,
      });
    }

    // 2. Kiểm tra định dạng userId
    if (!mongoose.Types.ObjectId.isValid(req.body.userId)) {
      return res.status(400).json({
        success: false,
        message: "Định dạng userId không hợp lệ.",
      });
    }

    // 3. Kiểm tra userId có tồn tại không
    const user = await User.findById(req.body.userId);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Người dùng không tồn tại.",
      });
    }

    // 4. Tạo địa chỉ mới
    const address = await Address.create({
      ...req.body,
      userId: mongoose.Types.ObjectId(req.body.userId),
    });

    return res.status(201).json({
      success: true,
      message: "Tạo địa chỉ thành công.",
      data: address,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi khi tạo địa chỉ.",
      error: err.message,
    });
  }
};

// Lấy danh sách địa chỉ của 1 user hoặc tất cả address nếu không truyền userId

exports.getAddressesByUser = async (req, res) => {
  try {
    const { userId } = req.query;

    let query = {};
    if (userId) {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({
          success: false,
          error: "Invalid userId format. Must be a 24-character hex string.",
        });
      }
      query.userId = userId;
    }

    const addresses = await Address.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: addresses,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// Cập nhật địa chỉ
exports.updateAddress = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updated = await Address.findByIdAndUpdate(id, req.body, { new: true });
  return res.json({ success: !!updated, address: updated || "Update failed" });
});

// Xóa địa chỉ
exports.deleteAddress = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deleted = await Address.findByIdAndDelete(id);
  return res.json({
    success: !!deleted,
    mes: deleted ? "Address deleted" : "Delete failed",
  });
});

// Lấy chi tiết address theo id
exports.getAddressById = async (req, res) => {
  try {
    const { id } = req.params;
    // 1. Kiểm tra id hợp lệ
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid address id format." });
    }
    // 2. Tìm address theo id
    const address = await Address.findById(id);
    if (!address) return res.status(404).json({ error: "Address not found" });
    res.json(address);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Thiết lập địa chỉ mặc định
exports.setDefaultAddress = asyncHandler(async (req, res) => {
  const { addressId, userId } = req.body;

  // Kiểm tra đầu vào
  if (!addressId || !userId) {
    return res.status(400).json({
      success: false,
      message: "Thiếu addressId hoặc userId.",
    });
  }

  if (
    !mongoose.Types.ObjectId.isValid(addressId) ||
    !mongoose.Types.ObjectId.isValid(userId)
  ) {
    return res.status(400).json({
      success: false,
      message: "Định dạng addressId hoặc userId không hợp lệ.",
    });
  }

  // Kiểm tra địa chỉ có tồn tại và thuộc user không
  const address = await Address.findOne({ _id: addressId, userId });
  if (!address) {
    return res.status(404).json({
      success: false,
      message: "Địa chỉ không tồn tại hoặc không thuộc người dùng.",
    });
  }

  // 1. Đặt tất cả địa chỉ của user về false
  await Address.updateMany({ userId }, { isDefault: false });

  // 2. Cập nhật địa chỉ được chọn là mặc định
  address.isDefault = true;
  await address.save();

  return res.status(200).json({
    success: true,
    message: "Thiết lập địa chỉ mặc định thành công.",
    data: address,
  });
});
