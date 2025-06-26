const Address = require('../../models/user/Address');
const asyncHandler = require('express-async-handler');

// Tạo mới địa chỉ giao hàng
exports.createAddress = asyncHandler(async (req, res) => {
    // Lấy dữ liệu từ body
    const { street, ward, district, country, isDefault, userId } = req.body;
    if (!street || !ward || !district || !country || !userId) {
        return res.status(400).json({ success: false, mes: 'Missing required fields' });
    }
    // Tạo mới address
    const address = await Address.create({ street, ward, district, country, isDefault, userId });
    return res.status(201).json({ success: true, address });
});

// Lấy danh sách địa chỉ của 1 user
exports.getAddresses = asyncHandler(async (req, res) => {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ success: false, mes: 'Missing userId' });
    const addresses = await Address.find({ userId });
    return res.json({ success: true, addresses });
});

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