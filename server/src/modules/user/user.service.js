//user.service
const User = require("./entities/user.model");
const UserStatus = require("./entities/user-status.model");
const ShoppingCart = require("../cart/entities/shopping-cart.model");
const Role = require("./entities/role.model");
const UserRole = require("./entities/user-role.model");

exports.createUser = async (body, file) => {
  // 1) Gắn file (nếu có) vào body
  if (file?.userAvatar?.[0]) {
    body.userAvatar = file.userAvatar[0].path;
  }

  // 2) Validate tối thiểu
  const required = ["userFirstName", "userLastName"];
  const missing = required.filter((k) => !body[k]);
  if (missing.length) {
    const err = new Error(`Missing fields: ${missing.join(", ")}`);
    err.status = 400;
    throw err;
  }

  // 3) Chuẩn hoá những field cần thiết
  body.userFirstName = String(body.userFirstName).trim();
  body.userLastName = String(body.userLastName).trim();
  if (body.userEmail)
    body.userEmail = String(body.userEmail).trim().toLowerCase();
  if (body.userMobile) body.userMobile = String(body.userMobile).trim();

  // 4) Chỉ pick các field hợp lệ (tránh “rác” từ client)
  const allow = [
    "userFirstName",
    "userLastName",
    "userEmail",
    "userMobile",
    "userGender",
    "userDateOfBirth",
    "userStatusId",
    "cartId",
    "userAvatar", // từ files
  ];
  const payload = {};
  for (const k of allow) {
    if (body[k] !== undefined) payload[k] = body[k];
  }

  // 5) Tạo user (schema sẽ tự áp default cho field không truyền)
  const user = await User.create(payload);

  return {
    success: true,
    message: "Tạo người dùng thành công",
    user,
  };
};

exports.getUserStatus = async (body) => {
  const { userStatusName } = body;
  const statusDoc = await UserStatus.findOneAndUpdate(
    { userStatusName },
    { $setOnInsert: { userStatusName } }, // chỉ set nếu insert
    { new: true, upsert: true } // trả về doc mới, nếu chưa có thì tạo
  );

  return {
    success: true,
    userStatus: statusDoc,
  };
};

const { Types } = require("mongoose");

//Get current
exports.getCurrent = async (body, userToken) => {
  let { id, userEmail, userMobile } = body;
  if (userToken) {
    id = userToken.id;
  }

  // Chuẩn hoá nhẹ
  if (typeof userEmail === "string") userEmail = userEmail.trim().toLowerCase();
  if (typeof userMobile === "string") userMobile = userMobile.trim();

  // Xây mảng điều kiện OR
  const orConds = [];
  if (id) {
    // chỉ push nếu id hợp lệ để tránh cast error
    if (Types.ObjectId.isValid(id)) {
      orConds.push({ _id: new Types.ObjectId(id) });
    }
  }
  if (userEmail) orConds.push({ userEmail });
  if (userMobile) orConds.push({ userMobile });

  if (orConds.length === 0) {
    const err = new Error(
      "Thiếu tham số: cần ít nhất một trong id | userEmail | userMobile"
    );
    err.status = 400;
    throw err;
  }

  // 1) Lấy thông tin user theo $or
  const user = await User.findOne({ $or: orConds }).populate(
    "userStatusId",
    "userStatusName"
  );

  if (!user) {
    const err = new Error("Tài khoản không tồn tại");
    err.status = 404;
    throw err;
  }

  // 2) Lấy danh sách roles của user
  const userRoles = await UserRole.find({ userId: user._id })
    .populate("roleId", "roleName")
    .lean();

  // 3) Chuyển roleName thành mảng string
  const roles = userRoles.map((r) => r.roleId?.roleName).filter(Boolean);

  // 4) Trả về thông tin user kèm roles
  const userObj = user.toObject();
  userObj.roles = roles;

  return {
    success: true,
    user: userObj,
  };
};

exports.getRole = async (body) => {
  const { roleName } = body;
  const roleDoc = await Role.findOneAndUpdate(
    { roleName },
    { $setOnInsert: { roleName } }, // chỉ set nếu insert
    { new: true, upsert: true } // trả về doc mới, nếu chưa có thì tạo
  );

  return {
    success: true,
    role: roleDoc,
  };
};

exports.updateUser = async (uId, body, file) => {
  if (!uId) {
    const err = new Error("Thiếu uId");
    err.status = 400;
    throw err;
  }

  // 1) Gắn file (nếu có) vào body
  if (file?.path) {
    body.userAvatar = file.path;
  }

  // 2) Chuẩn hoá field text
  if (body.userFirstName)
    body.userFirstName = String(body.userFirstName).trim();
  if (body.userLastName) body.userLastName = String(body.userLastName).trim();
  if (body.userEmail)
    body.userEmail = String(body.userEmail).trim().toLowerCase();
  if (body.userMobile) body.userMobile = String(body.userMobile).trim();

  // 3) Chỉ cho phép update các field hợp lệ
  const allow = [
    "userFirstName",
    "userLastName",
    "userEmail",
    "userMobile",
    "userGender",
    "userDateOfBirth",
    "userStatusId",
    "cartId",
    "userAvatar",
  ];

  const dataUpdate = {};
  for (const k of allow) {
    if (body[k] !== undefined) dataUpdate[k] = body[k];
  }

  if (!Object.keys(dataUpdate).length) {
    const err = new Error("Không có dữ liệu nào để cập nhật");
    err.status = 400;
    throw err;
  }

  // 4) Thực hiện update
  const updated = await User.findByIdAndUpdate(uId, dataUpdate, { new: true });
  if (!updated) {
    const err = new Error("Không tìm thấy user để cập nhật");
    err.status = 404;
    throw err;
  }

  return {
    success: true,
    message: "Cập nhật user thành công",
    user: updated,
  };
};
