const Admin = require('../../models/user/Admin');
const User = require('../../models/user/User');
const StatusUser = require('../../models/user/StatusUser');
const Role = require('../../models/user/Role');

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
    // Kiểm tra email đã tồn tại chưa (User hoặc Admin)
    const existedUser = await User.findOne({ email: req.body.email });
    if (existedUser) return res.status(400).json({ error: 'Email already exists' });
    // Luôn tự động gán statusUserId là 'active'
    const activeStatus = await StatusUser.findOne({ statusUserName: 'active' });
    if (!activeStatus) return res.status(400).json({ error: 'Status active not found' });
    const statusUserId = activeStatus._id;
    // Luôn tự động gán roleId là 'admin'
    const adminRole = await Role.findOne({ roleName: 'admin' });
    if (!adminRole) return res.status(400).json({ error: 'Role admin not found' });
    const roleId = adminRole._id;
    // Tạo user và admin đồng bộ
    const user = await User.create({ ...req.body, statusUserId, roleId, userName: req.body.email });
    const admin = await Admin.create({ ...user.toObject(), _id: user._id });
    res.status(201).json({ admin });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAdminById = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) return res.status(404).json({ message: 'Admin not found' });
    res.json(admin);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateAdmin = async (req, res) => {
  try {
    const admin = await Admin.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!admin) return res.status(404).json({ message: 'Admin not found' });
    await User.findByIdAndUpdate(req.params.id, req.body); // Sync User
    res.json(admin);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteAdmin = async (req, res) => {
  try {
    const admin = await Admin.findByIdAndDelete(req.params.id);
    await User.findByIdAndDelete(req.params.id); // Sync User
    if (!admin) return res.status(404).json({ message: 'Admin not found' });
    res.json({ message: 'Admin deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find();
    res.json(admins);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 