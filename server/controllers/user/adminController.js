const Admin = require('../../models/user/Admin');
const Account = require('../../models/user/Account');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');

// Đăng ký admin mới
// Tạo account và admin, kiểm tra email không trùng
exports.register = asyncHandler(async (req, res) => {
    const { firstName, lastName, email, mobile, password, roleId, statusUserId } = req.body;
    if (!firstName || !lastName || !email || !mobile || !password || !roleId || !statusUserId) {
        return res.status(400).json({ success: false, mes: 'Missing required fields' });
    }
    // Kiểm tra email đã tồn tại chưa
    const existedAdmin = await Admin.findOne({ email });
    if (existedAdmin) return res.status(400).json({ success: false, mes: 'Admin already exists' });
    // Tạo account (username là email, password hash)
    const account = await Account.create({ userName: email, password });
    // Tạo admin
    const newAdmin = await Admin.create({
        firstName,
        lastName,
        email,
        mobile,
        roleId,
        statusUserId,
        userName: account._id
    });
    return res.status(201).json({ success: true, admin: newAdmin });
});

// Lấy thông tin admin hiện tại (dựa vào token)
exports.getCurrent = asyncHandler(async (req, res) => {
    const { id } = req.user;
    // Tìm admin theo id, populate các trường liên quan
    const admin = await Admin.findById(id).populate('roleId statusUserId userName');
    if (!admin) return res.status(404).json({ success: false, mes: 'Admin not found' });
    return res.json({ success: true, admin });
});

// Cập nhật thông tin admin (chỉ cho phép cập nhật mobile, avatar)
exports.updateAdmin = asyncHandler(async (req, res) => {
    const { id } = req.user;
    // Chỉ cho phép cập nhật mobile, avatar
    const { mobile, avatar } = req.body;
    // Không cho phép cập nhật email, role, status qua API
    const updated = await Admin.findByIdAndUpdate(id, { mobile, avatar }, { new: true });
    return res.json({ success: !!updated, admin: updated || 'Update failed' });
});

// Vô hiệu hóa API xóa admin, luôn trả về lỗi 403
exports.deleteAdmin = asyncHandler(async (req, res) => {
    // Không cho phép xóa admin qua API để bảo vệ hệ thống
    return res.status(403).json({ success: false, mes: 'Deleting admin is not allowed via API!' });
}); 