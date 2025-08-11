const User = require("../../models/user/User");
const Account = require("../../models/user/Account");
const Role = require("../../models/user/Role");
const StatusUser = require("../../models/user/StatusUser");
const ShoppingCart = require("../../models/user/ShoppingCart");
const Order = require("../../models/order/Order");
const Preview = require("../../models/user/Preview");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

// Đăng ký tài khoản mới
const register = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, mobile, password, roleId } = req.body;

  if (!firstName || !lastName || !email || !mobile || !password || !roleId)
    return res
      .status(400)
      .json({ success: false, mes: "Missing required fields" });

  if (!/^[0-9a-fA-F]{24}$/.test(roleId))
    return res
      .status(400)
      .json({ success: false, mes: "Invalid roleId format" });

  const activeStatus = await StatusUser.findOne({ statusUserName: "active" });
  if (!activeStatus)
    return res
      .status(400)
      .json({ success: false, mes: "Status active not found" });

  const existedUser = await User.findOne({ email });
  if (existedUser)
    return res.status(400).json({ success: false, mes: "User already exists" });

  const existedAccount = await Account.findOne({ userName: email });
  if (existedAccount)
    return res
      .status(400)
      .json({ success: false, mes: "Account already exists" });

  const existedMobile = await User.findOne({ mobile });
  if (existedMobile)
    return res
      .status(400)
      .json({ success: false, mes: "Mobile already exists" });

  try {
    const account = await Account.create({ userName: email, password });

    const user = await User.create({
      firstName,
      lastName,
      email,
      mobile,
      userName: email,
      roleId: mongoose.Types.ObjectId(roleId),
      statusUserId: mongoose.Types.ObjectId(activeStatus._id),
    });

    return res.status(201).json({ success: true, user });
  } catch (err) {
    await Account.deleteOne({ userName: email });
    return res
      .status(500)
      .json({ success: false, mes: "Create user failed", error: err.message });
  }
});

// Đăng nhập
// Đăng nhập
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res
      .status(400)
      .json({ success: false, mes: "Vui lòng nhập đầy đủ email và mật khẩu" });

  const account = await Account.findOne({ userName: email });
  if (!account)
    return res
      .status(404)
      .json({ success: false, mes: "Không tìm thấy tài khoản" });

  const isMatch = await account.isCorrectPassword(password);
  if (!isMatch)
    return res.status(401).json({ success: false, mes: "Mật khẩu không đúng" });

  const user = await User.findOne({ email }).populate("roleId");
  if (!user)
    return res
      .status(404)
      .json({ success: false, mes: "Không tìm thấy người dùng" });

  let roleValue = 0;
  if (user.roleId?.roleName === "admin") roleValue = 1945;

  const token = jwt.sign(
    { id: user._id, role: roleValue },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  const userObj = user.toObject();
  userObj.role = roleValue;

  return res.json({
    success: true,
    token,
    user: userObj,
    mes: "Đăng nhập thành công",
  });
});

// Lấy user hiện tại từ token
const getCurrent = asyncHandler(async (req, res) => {
  const { id } = req.user;

  const user = await User.findById(id)
    .populate("statusUserId", "statusUserName")
    .populate("roleId userName");

  if (!user)
    return res.status(404).json({ success: false, mes: "User not found" });

  let roleValue = 0;
  if (user.roleId?.roleName === "admin") roleValue = 1945;

  const userObj = user.toObject();
  userObj.role = roleValue;

  return res.json({ success: true, user: userObj });
});

// Cập nhật thông tin user
const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const avatar = req.file?.path;

  // Chỉ cho phép cập nhật những trường này (trừ email)
  const allowedFields = [
    "firstName",
    "lastName",
    "mobile",
    "roleId",
    "statusUserId",
    "gender",
    "dateOfBirth",
  ];

  const updatePayload = {};

  for (const key of allowedFields) {
    if (req.body[key] !== undefined) {
      updatePayload[key] = req.body[key];
    }
  }

  if (avatar) updatePayload.avatar = avatar;

  const updated = await User.findByIdAndUpdate(id, updatePayload, {
    new: true,
  });

  return res.json({
    success: !!updated,
    user: updated || "Update failed",
    mes: updated ? "Cập nhật người dùng thành công!" : "Cập nhật thất bại!",
  });
});

// Xoá user và toàn bộ dữ liệu liên quan
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, mes: "Invalid user id" });
  }

  const user = await User.findById(id);
  if (!user) return res.json({ success: false, mes: "User not found" });

  await Account.deleteOne({ userName: user.userName });

  const shoppingCart = await ShoppingCart.findOneAndDelete({ userId: id });
  if (shoppingCart) {
    const CartItem = require("../../models/user/CartItem");
    await CartItem.deleteMany({ shoppingCart: shoppingCart._id });
  }

  await Order.deleteMany({ customerId: id });
  await Preview.deleteMany({ customerId: id });

  await require("../../models/user/Admin").findByIdAndDelete(id);
  await require("../../models/user/Customer").findByIdAndDelete(id);

  const deleted = await User.findByIdAndDelete(id);

  return res.json({
    success: !!deleted,
    mes: deleted ? "User and all related data deleted" : "Delete failed",
  });
});

// Lấy danh sách tất cả user
const getUsers = asyncHandler(async (req, res) => {
  const { q, sort } = req.query;

  const queryObject = {};

  if (q) {
    queryObject.$or = [
      { firstName: { $regex: q, $options: "i" } },
      { lastName: { $regex: q, $options: "i" } },
      { email: { $regex: q, $options: "i" } },
    ];
  }

  let sortOption = {};
  if (sort === "oldest") {
    sortOption.createdAt = 1; // cũ nhất trước
  } else if (sort === "newest") {
    sortOption.createdAt = -1; // mới nhất trước
  }

  const users = await User.find(queryObject)
    .populate("roleId", "roleName")
    .populate("statusUserId", "statusUserName")
    .sort(sortOption);

  return res.json({ success: true, users });
});

// Lấy user theo id
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .populate("roleId")
    .populate("statusUserId", "statusUserName");

  if (!user)
    return res.status(404).json({ success: false, mes: "User not found" });
  return res.json({ success: true, user });
});

// Xuất các controller
module.exports = {
  register,
  login,
  getCurrent,
  updateUser,
  deleteUser,
  getUsers,
  getUserById,
};
