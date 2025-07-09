const Admin = require("../../models/user/Admin");
const User = require("../../models/user/User");
const StatusUser = require("../../models/user/StatusUser");
const Role = require("../../models/user/Role");
const Account = require("../../models/user/Account");

exports.createAdmin = async (req, res) => {
  try {
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
    if (existedUser)
      return res.status(400).json({ error: "Email already exists" });

    const existedAccount = await Account.findOne({ userName: req.body.email });
    if (existedAccount)
      return res
        .status(400)
        .json({ error: "Account already exists with this email" });

    const existedMobile = await User.findOne({ mobile: req.body.mobile });
    if (existedMobile)
      return res.status(400).json({ error: "Mobile already exists" });

    const activeStatus = await StatusUser.findOne({ statusUserName: "active" });
    if (!activeStatus)
      return res.status(400).json({ error: "Status active not found" });
    const statusUserId = activeStatus._id;

    const adminRole = await Role.findOne({ roleName: "admin" });
    if (!adminRole)
      return res.status(400).json({ error: "Role admin not found" });
    const roleId = adminRole._id;

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

      const admin = await Admin.create({ _id: user._id });

      return res.status(201).json({ success: true, admin });
    } catch (err) {
      await Account.deleteOne({ userName: req.body.email });
      return res
        .status(500)
        .json({ error: "Tạo tài khoản thất bại: " + err.message });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAdminById = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id).populate("_id");
    if (!admin) return res.status(404).json({ message: "Admin not found" });
    res.json(admin);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateAdmin = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const updatedUser = await User.findByIdAndUpdate(admin._id, req.body, {
      new: true,
    });
    res.json({ admin: { ...admin.toObject(), _id: updatedUser } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ XÓA TOÀN BỘ: Admin → Customer → User → Account
exports.deleteAdmin = async (req, res) => {
  try {
    const userId = req.params.id;

    // Xoá Admin nếu có
    await Admin.deleteOne({ _id: userId });

    // Xoá Customer nếu có (dự phòng nếu role từng đổi)
    await require("../../models/user/Customer").deleteOne({ _id: userId });

    // Xoá User
    const user = await User.findByIdAndDelete(userId);

    // Xoá Account nếu tìm được email
    if (user && user.email) {
      await Account.deleteOne({ userName: user.email });
    }

    res.json({ message: "Admin (và các liên kết) đã bị xoá" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().populate("_id");
    res.json(admins);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
