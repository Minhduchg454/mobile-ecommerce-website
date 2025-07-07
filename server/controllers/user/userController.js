// controllers/user/userController.js
// Controller xử lý các chức năng liên quan đến User: đăng ký, đăng nhập, lấy thông tin, cập nhật, xóa, ...
const User = require('../../models/user/User');
const Account = require('../../models/user/Account');
const Role = require('../../models/user/Role');
const StatusUser = require('../../models/user/StatusUser');
const ShoppingCart = require('../../models/user/ShoppingCart');
const Order = require('../../models/order/Order');
const Preview = require('../../models/user/Preview');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// Đăng ký tài khoản mới (chỉ cần email không trùng, không xác thực gmail)
const register = asyncHandler(async (req, res) => {
    let { firstName, lastName, email, mobile, password, roleId } = req.body;
    // Chỉ bắt buộc các trường sau:
    if (!firstName || !lastName || !email || !mobile || !password || !roleId) {
        return res.status(400).json({ success: false, mes: 'Missing required fields' });
    }
    // Kiểm tra roleId hợp lệ trước khi ép kiểu ObjectId
    if (!/^[0-9a-fA-F]{24}$/.test(roleId)) {
        return res.status(400).json({ success: false, mes: 'Invalid roleId format. Must be a 24-character hex string.' });
    }
    // Luôn tự động gán statusUserId là 'active'
    const activeStatus = await StatusUser.findOne({ statusUserName: 'active' });
    if (!activeStatus) return res.status(400).json({ success: false, mes: 'Status active not found' });
    const statusUserId = activeStatus._id;
    // Kiểm tra email đã tồn tại chưa (User)
    const existedUser = await User.findOne({ email });
    if (existedUser) return res.status(400).json({ success: false, mes: 'User already exists' });
    // Kiểm tra account đã tồn tại chưa (Account)
    const existedAccount = await Account.findOne({ userName: email });
    if (existedAccount) {
        return res.status(400).json({ success: false, mes: 'Account already exists with this email' });
    }
    // Kiểm tra mobile đã tồn tại chưa (User)
    const existedMobile = await User.findOne({ mobile });
    if (existedMobile) return res.status(400).json({ success: false, mes: 'Mobile already exists' });
    // Tạo account (username là email, password hash)
    const account = await Account.create({ userName: email, password });
    // Tạo user (ép kiểu ObjectId cho roleId và statusUserId)
    const newUser = await User.create({
        firstName,
        lastName,
        email,
        mobile,
        roleId: mongoose.Types.ObjectId(roleId),
        statusUserId: mongoose.Types.ObjectId(statusUserId),
        userName: email
    });
    return res.status(201).json({ success: true, user: newUser });
});

// Đăng nhập (chỉ cần đúng email và password)
const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, mes: 'Missing email or password' });
    // Tìm account theo userName (email)
    const account = await Account.findOne({ userName: email });
    if (!account) return res.status(404).json({ success: false, mes: 'Account not found' });
    // Kiểm tra mật khẩu
    const isMatch = await account.isCorrectPassword(password);
    if (!isMatch) return res.status(401).json({ success: false, mes: 'Invalid password' });
    // Tìm user theo email
    const user = await User.findOne({ email }).populate('roleId');
    if (!user) return res.status(404).json({ success: false, mes: 'User not found' });
    // Xác định role: nếu roleName === 'admin' thì role = 1945, ngược lại role = 0
    let roleValue = 0;
    let roleName = user.roleId && user.roleId.roleName ? user.roleId.roleName : '';
    if (roleName === 'admin') {
        roleValue = 1945;
    }
    // Tạo access token (ví dụ dùng JWT)
    const token = jwt.sign({ id: user._id, role: roleValue }, process.env.JWT_SECRET, { expiresIn: '1d' });
    // Đảm bảo user trả về có trường role là số
    const userObj = user.toObject();
    userObj.role = roleValue;
    return res.json({ success: true, token, user: userObj });
});

// Lấy thông tin user hiện tại (dựa vào token)
const getCurrent = asyncHandler(async (req, res) => {
    // Bắt đầu xử lý request lấy user hiện tại
    try {
        // Lấy id từ req.user (nếu middleware không gán đúng sẽ lỗi ở đây)
        const { id } = req.user;
        // Truy vấn DB lấy user theo id, populate roleId và userName
        const user = await User.findById(id).populate('roleId userName');
        // Nếu không tìm thấy user, trả về 404
        if (!user) return res.status(404).json({ success: false, mes: 'User not found' });
        // Đảm bảo user trả về có trường role là số
        let roleValue = 0;
        let roleName = user.roleId && user.roleId.roleName ? user.roleId.roleName : '';
        if (roleName === 'admin') {
            roleValue = 1945;
        }
        const userObj = user.toObject();
        userObj.role = roleValue;
        // Trả về user thành công
        return res.json({ success: true, user: userObj });
    } catch (err) {
        // Log lỗi chi tiết nếu có exception
        console.error('Lỗi khi xử lý /users/current:', err);
        res.status(500).json({ success: false, mes: 'Server error', error: err.message });
    }
});

// Cập nhật thông tin user (chỉ cho phép cập nhật một số trường)
const updateUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { firstName, lastName, mobile, avatar } = req.body;
    const updated = await User.findByIdAndUpdate(id, { firstName, lastName, mobile, avatar }, { new: true });
    return res.json({ success: !!updated, user: updated || 'Update failed' });
});

// Xóa user (chỉ admin)
const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, mes: 'Invalid user id' });
    }
    // Tìm user để lấy account id
    const user = await User.findById(id);
    if (!user) return res.json({ success: false, mes: 'User not found' });
    // Xóa account liên kết
    await Account.findOneAndDelete({ userName: user.userName });

    // Xóa shopping cart liên quan
    const shoppingCart = await ShoppingCart.findOneAndDelete({ userId: id });

    // Xóa cart items liên quan nếu có shopping cart
    if (shoppingCart) {
        const CartItem = require('../../models/user/CartItem');
        await CartItem.deleteMany({ shoppingCart: shoppingCart._id });
    }

    // Xóa orders liên quan
    await Order.deleteMany({ customerId: id });

    // Xóa previews (đánh giá) liên quan
    await Preview.deleteMany({ customerId: id });

    // Xóa user
    const deleted = await User.findByIdAndDelete(id);
    // Xóa admin/customer liên kết (nếu có)
    const Admin = require('../../models/user/Admin');
    const Customer = require('../../models/user/Customer');
    await Admin.findByIdAndDelete(id);
    await Customer.findByIdAndDelete(id);
    return res.json({ success: !!deleted, mes: deleted ? 'User and all related data deleted' : 'Delete failed' });
});

// Lấy danh sách tất cả user (chỉ admin)
const getUsers = asyncHandler(async (req, res) => {
    const users = await User.find().populate('roleId userName');
    return res.json({ success: true, users });
});

// Lấy user theo id (không cần token)
const getUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).populate('roleId');
    if (!user) return res.status(404).json({ success: false, mes: 'User not found' });
    return res.json({ success: true, user });
});

// Xuất các hàm controller
module.exports = {
    // User functions
    register, // Đăng ký
    login, // Đăng nhập
    getCurrent, // Lấy user hiện tại
    updateUser, // Cập nhật user
    deleteUser, // Xóa user
    getUsers, // Lấy danh sách user
    getUserById,
}; 