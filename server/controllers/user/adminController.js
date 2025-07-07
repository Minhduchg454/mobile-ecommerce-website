const Admin = require('../../models/user/Admin');
const User = require('../../models/user/User');
const StatusUser = require('../../models/user/StatusUser');
const Role = require('../../models/user/Role');
const Account = require('../../models/user/Account');

exports.createAdmin = async (req, res) => {
  try {
    // Kiểm tra các trường required
    const requiredFields = ['firstName', 'lastName', 'email', 'mobile', 'password'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({ error: `Missing required field(s): ${missingFields.join(', ')}` });
    }
    // Kiểm tra định dạng email hợp lệ
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailRegex.test(req.body.email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    // Kiểm tra email đã tồn tại chưa (User)
    const existedUser = await User.findOne({ email: req.body.email });
    if (existedUser) return res.status(400).json({ error: 'Email already exists' });
    // Kiểm tra account đã tồn tại chưa (Account)
    const existedAccount = await Account.findOne({ userName: req.body.email });
    if (existedAccount) return res.status(400).json({ error: 'Account already exists with this email' });
    // Kiểm tra mobile đã tồn tại chưa (User)
    const existedMobile = await User.findOne({ mobile: req.body.mobile });
    if (existedMobile) return res.status(400).json({ error: 'Mobile already exists' });
    // Luôn tự động gán statusUserId là 'active'
    const activeStatus = await StatusUser.findOne({ statusUserName: 'active' });
    if (!activeStatus) return res.status(400).json({ error: 'Status active not found' });
    const statusUserId = activeStatus._id;
    // Luôn tự động gán roleId là 'admin'
    const adminRole = await Role.findOne({ roleName: 'admin' });
    if (!adminRole) return res.status(400).json({ error: 'Role admin not found' });
    const roleId = adminRole._id;
    // Tạo account (username là email, password hash)
    await Account.create({ userName: req.body.email, password: req.body.password });
    // Tạo user
    const user = await User.create({ ...req.body, statusUserId, roleId, userName: req.body.email });
    // Tạo admin chỉ chứa _id
    const admin = await Admin.create({ _id: user._id });
    res.status(201).json({ admin });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAdminById = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id).populate('_id');
    if (!admin) return res.status(404).json({ message: 'Admin not found' });
    res.json(admin);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateAdmin = async (req, res) => {
  try {
    // Tìm admin
    const admin = await Admin.findById(req.params.id);
    if (!admin) return res.status(404).json({ message: 'Admin not found' });
    // Cập nhật user liên kết
    const updatedUser = await User.findByIdAndUpdate(admin._id, req.body, { new: true });
    res.json({ admin: { ...admin.toObject(), _id: updatedUser } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteAdmin = async (req, res) => {
  try {
    // Tìm admin
    const admin = await Admin.findByIdAndDelete(req.params.id);
    if (!admin) return res.status(404).json({ message: 'Admin not found' });
    // Xóa user liên kết
    const user = await User.findByIdAndDelete(admin._id);
    // Xóa account liên kết (nếu user tồn tại)
    // userName là email
    if (user && user.email) {
      await Account.findOneAndDelete({ userName: user.email });
    }
    res.json({ message: 'Admin and related User/Account deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().populate('_id');
    res.json(admins);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 