const Customer = require("../../models/user/Customer");
const Admin = require("../../models/user/Admin");
const User = require("../../models/user/User");
const StatusUser = require("../../models/user/StatusUser");
const Role = require("../../models/user/Role");
const Account = require("../../models/user/Account");

exports.createCustomer = async (req, res) => {
  try {
    const activeStatus = await StatusUser.findOne({ statusUserName: "active" });
    if (!activeStatus)
      return res.status(400).json({ error: "Status active not found" });

    const customerRole = await Role.findOne({ roleName: "customer" });
    if (!customerRole)
      return res.status(400).json({ error: "Role customer not found" });

    const statusUserId = activeStatus._id;
    const roleId = customerRole._id;

    const requiredFields = [
      "firstName",
      "lastName",
      "email",
      "mobile",
      "password",
    ];
    const missingFields = requiredFields.filter((field) => !req.body[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        error: `Missing required field(s): ${missingFields.join(", ")}`,
      });
    }

    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailRegex.test(req.body.email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const existedUser = await User.findOne({ email: req.body.email });
    if (existedUser) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const existedAccount = await Account.findOne({ userName: req.body.email });
    if (existedAccount) {
      return res
        .status(400)
        .json({ error: "Account already exists with this email" });
    }

    try {
      const account = await Account.create({
        userName: req.body.email,
        password: req.body.password,
      });

      const user = await User.create({
        ...req.body,
        statusUserId,
        roleId,
        userName: req.body.email,
      });

      const customer = await Customer.create({ _id: user._id });

      return res.status(201).json({ success: true, customer });
    } catch (err) {
      await Account.deleteOne({ userName: req.body.email });
      return res
        .status(500)
        .json({ error: "Tạo tài khoản thất bại: " + err.message });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id).populate("_id");
    if (!customer)
      return res.status(404).json({ message: "Customer not found" });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer)
      return res.status(404).json({ message: "Customer not found" });

    const updatedUser = await User.findByIdAndUpdate(customer._id, req.body, {
      new: true,
    });

    res.json({ customer: { ...customer.toObject(), _id: updatedUser } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ XÓA TOÀN BỘ: Customer → Admin → User → Account
exports.deleteCustomer = async (req, res) => {
  try {
    const userId = req.params.id;

    // Xoá Customer nếu có
    await Customer.deleteOne({ _id: userId });

    // Xoá Admin nếu có (dự phòng nếu user đổi role)
    await Admin.deleteOne({ _id: userId });

    // Xoá User
    const user = await User.findByIdAndDelete(userId);

    // Xoá Account nếu tìm được email
    if (user && user.email) {
      await Account.deleteOne({ userName: user.email });
    }

    res.json({ message: "Customer (và các liên kết) đã bị xoá" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find().populate("_id");
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.checkEmailExists = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email)
      return res.status(400).json({ exists: false, error: "Missing email" });

    const existedUser = await User.findOne({ email });
    return res.json({ exists: !!existedUser });
  } catch (err) {
    res.status(500).json({ exists: false, error: err.message });
  }
};

exports.checkMobileExists = async (req, res) => {
  try {
    const { mobile } = req.query;
    if (!mobile)
      return res.status(400).json({ exists: false, error: "Missing mobile" });

    const existedUser = await User.findOne({ mobile });
    return res.json({ exists: !!existedUser });
  } catch (err) {
    res.status(500).json({ exists: false, error: err.message });
  }
};
