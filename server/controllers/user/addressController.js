const Address = require('../../models/user/Address');
const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const User = require('../../models/user/User');

// Tạo mới địa chỉ giao hàng
exports.createAddress = async (req, res) => {
  try {
    // 1. Kiểm tra các trường required
    const requiredFields = ['street', 'ward', 'district', 'country', 'userId'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({ error: `Missing required field(s): ${missingFields.join(', ')}` });
    }
    // 2. Ép kiểu ObjectId cho userId, trả về lỗi nếu không hợp lệ
    if (!mongoose.Types.ObjectId.isValid(req.body.userId)) {
      return res.status(400).json({ error: 'Invalid userId format. Must be a 24-character hex string.' });
    }
    // 3. Kiểm tra userId có tồn tại trong User không
    const user = await User.findById(req.body.userId);
    if (!user) {
      return res.status(400).json({ error: 'userId does not exist' });
    }
    // 4. Tạo address mới
    const address = await Address.create({ ...req.body, userId: mongoose.Types.ObjectId(req.body.userId) });
    res.status(201).json({ address });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Lấy danh sách địa chỉ của 1 user hoặc tất cả address nếu không truyền userId
exports.getAddressesByUser = async (req, res) => {
  try {
    const userId = req.query.userId;
    let addresses;
    if (userId) {
      // Nếu có userId, kiểm tra hợp lệ và trả về address của user đó
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ error: 'Invalid userId format. Must be a 24-character hex string.' });
      }
      addresses = await Address.find({ userId: mongoose.Types.ObjectId(userId) });
    } else {
      // Nếu không có userId, trả về tất cả address
      addresses = await Address.find();
    }
    res.json(addresses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Cập nhật địa chỉ
exports.updateAddress = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updated = await Address.findByIdAndUpdate(id, req.body, { new: true });
    return res.json({ success: !!updated, address: updated || 'Update failed' });
});

// Xóa địa chỉ
exports.deleteAddress = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const deleted = await Address.findByIdAndDelete(id);
    return res.json({ success: !!deleted, mes: deleted ? 'Address deleted' : 'Delete failed' });
});

// Lấy chi tiết address theo id
exports.getAddressById = async (req, res) => {
  try {
    const { id } = req.params;
    // 1. Kiểm tra id hợp lệ
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid address id format.' });
    }
    // 2. Tìm address theo id
    const address = await Address.findById(id);
    if (!address) return res.status(404).json({ error: 'Address not found' });
    res.json(address);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 