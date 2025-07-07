const Customer = require('../../models/user/Customer');
const User = require('../../models/user/User');
const StatusUser = require('../../models/user/StatusUser');
const Role = require('../../models/user/Role');
const Account = require('../../models/user/Account');

exports.createCustomer = async (req, res) => {
  try {
    // Luôn tự động gán statusUserId là 'active'
    const activeStatus = await StatusUser.findOne({ statusUserName: 'active' });
    if (!activeStatus) {
      return res.status(400).json({ error: 'Status active not found' });
    }
    const statusUserId = activeStatus._id;
    // Luôn tự động gán roleId là 'customer'
    const customerRole = await Role.findOne({ roleName: 'customer' });
    if (!customerRole) {
      return res.status(400).json({ error: 'Role customer not found' });
    }
    const roleId = customerRole._id;
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
    if (existedUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    // Kiểm tra account đã tồn tại chưa (Account)
    const existedAccount = await Account.findOne({ userName: req.body.email });
    if (existedAccount) {
      return res.status(400).json({ error: 'Account already exists with this email' });
    }
    // Tạo account (username là email, password hash)
    const account = await Account.create({ userName: req.body.email, password: req.body.password });
    // Tạo user
    const user = await User.create({ ...req.body, statusUserId, roleId, userName: req.body.email });
    // Tạo customer chỉ chứa _id
    const customer = await Customer.create({ _id: user._id });
    res.status(201).json({ success: true, customer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id).populate('_id');
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateCustomer = async (req, res) => {
  try {
    // Tìm customer
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    // Cập nhật user liên kết
    const updatedUser = await User.findByIdAndUpdate(customer._id, req.body, { new: true });
    res.json({ customer: { ...customer.toObject(), _id: updatedUser } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteCustomer = async (req, res) => {
  try {
    // Tìm customer
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    // Xóa user liên kết
    const user = await User.findByIdAndDelete(customer._id);
    // Xóa account liên kết (nếu user tồn tại)
    // userName là email
    if (user && user.email) {
      await Account.findOneAndDelete({ userName: user.email });
    }
    res.json({ message: 'Customer and related User/Account deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find().populate('_id');
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 