// controllers/user/user____.js
// Controller xử lý các chức năng liên quan đến User: đăng ký, đăng nhập, lấy thông tin, cập nhật, xóa, ...
const User = require('../../models/user/User');
const Account = require('../../models/user/Account');
const Role = require('../../models/user/Role');
const StatusUser = require('../../models/user/StatusUser');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Đăng ký tài khoản mới (chỉ cần email không trùng, không xác thực gmail)
const register = asyncHandler(async (req, res) => {
    const { firstName, lastName, email, mobile, password, roleId, statusUserId } = req.body;
    if (!firstName || !lastName || !email || !mobile || !password || !roleId || !statusUserId) {
        return res.status(400).json({ success: false, mes: 'Missing required fields' });
    }
    // Kiểm tra email đã tồn tại chưa
    const existedUser = await User.findOne({ email });
    if (existedUser) return res.status(400).json({ success: false, mes: 'User already exists' });
    // Tạo account (username là email, password hash)
    const account = await Account.create({ userName: email, password });
    // Tạo user
    const newUser = await User.create({
        firstName,
        lastName,
        email,
        mobile,
        roleId,
        statusUserId,
        userName: account._id
    });
    return res.status(201).json({ success: true, user: newUser });
});

// Đăng nhập (chỉ cần đúng email và password)
const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, mes: 'Missing email or password' });
    // Tìm user theo email, populate roleId để lấy roleName
    const user = await User.findOne({ email }).populate('userName roleId');
    if (!user) return res.status(404).json({ success: false, mes: 'User not found' });
    // Kiểm tra mật khẩu
    const isMatch = await user.userName.isCorrectPassword(password);
    if (!isMatch) return res.status(401).json({ success: false, mes: 'Invalid password' });
    // Xác định role: nếu roleName === 'admin' thì role = 1945, ngược lại role = 0
    let roleValue = 0;
    let roleName = user.roleId && user.roleId.roleName ? user.roleId.roleName : '';
    if (roleName === 'admin') {
        roleValue = 1945;
    }
    // Log để debug nếu cần
    console.log('Login user:', user.email, '| roleName:', roleName, '| roleValue:', roleValue);
    // Tạo access token (ví dụ dùng JWT)
    const token = jwt.sign({ id: user._id, role: roleValue }, process.env.JWT_SECRET, { expiresIn: '1d' });
    return res.json({ success: true, token, user });
});

// Lấy thông tin user hiện tại (dựa vào token)
const getCurrent = asyncHandler(async (req, res) => {
    const { id } = req.user;
    const user = await User.findById(id).populate('roleId statusUserId userName');
    if (!user) return res.status(404).json({ success: false, mes: 'User not found' });
    return res.json({ success: true, user });
});

// Cập nhật thông tin user (chỉ cho phép cập nhật một số trường)
const updateUser = asyncHandler(async (req, res) => {
    const { id } = req.user;
    const { firstName, lastName, mobile, avatar } = req.body;
    const updated = await User.findByIdAndUpdate(id, { firstName, lastName, mobile, avatar }, { new: true });
    return res.json({ success: !!updated, user: updated || 'Update failed' });
});

// Xóa user (chỉ admin)
const deleteUser = asyncHandler(async (req, res) => {
    const { uid } = req.params;
    // Tìm user để lấy account id
    const user = await User.findById(uid);
    if (!user) return res.json({ success: false, mes: 'User not found' });
    // Xóa account liên kết
    await Account.findByIdAndDelete(user.userName);
    // Xóa user
    const deleted = await User.findByIdAndDelete(uid);
    return res.json({ success: !!deleted, mes: deleted ? 'User and account deleted' : 'Delete failed' });
});

// Lấy danh sách tất cả user (chỉ admin)
const getUsers = asyncHandler(async (req, res) => {
    const users = await User.find().populate('roleId statusUserId userName');
    return res.json({ success: true, users });
});

// Xuất các hàm controller
module.exports = {
    register, // Đăng ký
    login, // Đăng nhập
    getCurrent, // Lấy user hiện tại
    updateUser, // Cập nhật user
    deleteUser, // Xóa user
    getUsers // Lấy danh sách user
};
