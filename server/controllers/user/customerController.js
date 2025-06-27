const Customer = require('../../models/user/Customer');
const User = require('../../models/user/User');
const StatusUser = require('../../models/user/StatusUser');
const Role = require('../../models/user/Role');
const Account = require('../../models/user/Account');

exports.createCustomer = async (req, res) => {
  try {
    // Luôn tự động gán statusUserId là 'active'
    const activeStatus = await StatusUser.findOne({ statusUserName: 'active' });
    if (!activeStatus) return res.status(400).json({ error: 'Status active not found' });
    const statusUserId = activeStatus._id;
    // Luôn tự động gán roleId là 'customer'
    const customerRole = await Role.findOne({ roleName: 'customer' });
    if (!customerRole) return res.status(400).json({ error: 'Role customer not found' });
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
    // Kiểm tra email đã tồn tại chưa (User hoặc Customer)
    const existedUser = await User.findOne({ email: req.body.email });
    if (existedUser) return res.status(400).json({ error: 'Email already exists' });
    // Kiểm tra account đã tồn tại chưa (Account)
    const existedAccount = await Account.findOne({ userName: req.body.email });
    if (existedAccount) return res.status(400).json({ error: 'Account already exists with this email' });
    // Tạo account (username là email, password hash)
    const account = await Account.create({ userName: req.body.email, password: req.body.password });
    // Tạo user và customer đồng bộ
    const user = await User.create({ ...req.body, statusUserId, roleId, userName: req.body.email });
    const customer = await Customer.create({ ...user.toObject(), _id: user._id });
    res.status(201).json({ customer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    await User.findByIdAndUpdate(req.params.id, req.body); // Sync User
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    await User.findByIdAndDelete(req.params.id); // Sync User
    const Account = require('../../models/user/Account');
    let emailToDelete = null;
    if (customer) {
      emailToDelete = customer.email;
    } else {
      // Nếu không có customer, thử tìm User theo _id
      const user = await User.findById(req.params.id);
      if (user) {
        emailToDelete = user.email;
      } else if (req.body && req.body.email) {
        emailToDelete = req.body.email;
      }
    }
    if (emailToDelete) {
      await Account.findOneAndDelete({ userName: emailToDelete }); // Sync Account
    }
    if (!customer) return res.status(404).json({ message: 'Customer not found, but related Account (if any) has been deleted.' });
    res.json({ message: 'Customer and related Account deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find();
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 