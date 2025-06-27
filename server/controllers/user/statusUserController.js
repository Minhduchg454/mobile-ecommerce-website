const StatusUser = require('../../models/user/StatusUser');
const asyncHandler = require('express-async-handler');

// Tạo mới trạng thái user
exports.createStatusUser = asyncHandler(async (req, res) => {
    // Lấy tên trạng thái từ body
    const { statusUserName } = req.body;
    if (!statusUserName) return res.status(400).json({ success: false, mes: 'Missing statusUserName' });
    // Kiểm tra trùng tên
    const existed = await StatusUser.findOne({ statusUserName });
    if (existed) return res.status(400).json({ success: false, mes: 'StatusUser already exists' });
    // Tạo mới
    const statusUser = await StatusUser.create({ statusUserName });
    return res.status(201).json({ success: true, statusUser });
});

// Lấy danh sách tất cả trạng thái user
exports.getStatusUsers = asyncHandler(async (req, res) => {
    const statusUsers = await StatusUser.find();
    return res.json({ success: true, statusUsers });
});

// Cập nhật trạng thái user
exports.updateStatusUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { statusUserName } = req.body;
    const updated = await StatusUser.findByIdAndUpdate(id, { statusUserName }, { new: true });
    return res.json({ success: !!updated, statusUser: updated || 'Update failed' });
});

// Xóa trạng thái user
exports.deleteStatusUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const deleted = await StatusUser.findByIdAndDelete(id);
    return res.json({ success: !!deleted, mes: deleted ? 'StatusUser deleted' : 'Delete failed' });
}); 