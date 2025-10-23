//user.service
const User = require("./entities/user.model");
const UserStatus = require("./entities/user-status.model");
const ShoppingCart = require("../shopping/entities/shopping-cart.model");
const Role = require("./entities/role.model");
const UserRole = require("./entities/user-role.model");
const AccountService = require("../auth/auth.service");
const Address = require("./entities/address.model");

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

  const account = await AccountService.getAccountName(id);
  if (account.success) {
    userObj.accountName = account.accountName;
  }

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
  //console.log("Nhan du lieu duoc gui", uId, body, file);

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

/**
 * Address
 */

exports.createAddress = async (body) => {
  // bắt buộc
  const required = [
    "addressUserName",
    "addressNumberPhone",
    "addressStreet",
    "addressWard",
    "addressDistrict",
    "addressCity",
    "addressCountry",
    "userId",
  ];
  const missing = required.filter((f) => !body[f]);
  if (missing.length) {
    const err = new Error(`Missing fields: ${missing.join(", ")}`);
    err.status = 400;
    throw err;
  }

  if (body.addressIsDefault === true) {
    await Address.updateMany(
      { userId: body.userId, addressIsDefault: true },
      { $set: { addressIsDefault: false } }
    );
  }

  const doc = await Address.create(body);

  return {
    success: true,
    message: "Tạo địa chỉ thành công",
    address: doc,
  };
};

/**
 * query hỗ trợ:
 * - userId: lọc theo user
 * - q: tìm theo tên/ngõ/đường/phường/quận/thành phố/quốc gia/số điện thoại (regex)
 * - sort: newest|oldest|name_asc|name_desc|default_first
 */
exports.getAddresses = async (query = {}) => {
  // console.log("Duoc goi dia chi", query);
  const { userId, q, sort } = query;

  const filter = {};
  if (userId) filter.userId = userId;

  if (q && String(q).trim()) {
    const kw = String(q).trim();
    filter.$or = [
      { addressUserName: { $regex: kw, $options: "i" } },
      { addressNumberPhone: { $regex: kw, $options: "i" } },
      { addressStreet: { $regex: kw, $options: "i" } },
      { addressWard: { $regex: kw, $options: "i" } },
      { addressDistrict: { $regex: kw, $options: "i" } },
      { addressCity: { $regex: kw, $options: "i" } },
      { addressCountry: { $regex: kw, $options: "i" } },
    ];
  }

  const sortMap = {
    newest: { _id: -1 }, // dùng _id thay createdAt (schema chưa bật timestamps)
    oldest: { _id: 1 },
    name_asc: { addressUserName: 1 },
    name_desc: { addressUserName: -1 },
    default_first: { addressIsDefault: -1, _id: -1 },
  };
  const sortOption = sortMap[sort] || { addressIsDefault: -1, _id: -1 };

  const items = await Address.find(filter)
    .sort(sortOption)
    .lean()
    .populate(
      "userId",
      "userFirstName userLastName userAvatar userGender userDateOfBirth"
    );

  return {
    success: true,
    message: "Lấy danh sách địa chỉ thành công",
    addresses: items,
  };
};

// addressId từ params, userId từ body hoặc params tuỳ router
exports.updateAddress = async (addressId, userId, body) => {
  //console.log("Nhan cap nhat thong tin", addressId, userId, body);
  if (!addressId || !userId) {
    const e = new Error("Thiếu addressId hoặc userId");
    e.status = 400;
    throw e;
  }

  // Nếu gán mặc định cho địa chỉ này, hạ cờ các địa chỉ khác trước
  if (typeof body.addressIsDefault !== "undefined" && body.addressIsDefault) {
    await Address.updateMany(
      { userId, _id: { $ne: addressId }, addressIsDefault: true },
      { $set: { addressIsDefault: false } }
    );
  }

  const updated = await Address.findOneAndUpdate(
    { _id: addressId, userId },
    body,
    { new: true }
  );

  if (!updated) {
    const err = new Error("Không tìm thấy địa chỉ của người dùng");
    err.status = 404;
    throw err;
  }

  return {
    success: true,
    message: "Cập nhật địa chỉ thành công",
    address: updated,
  };
};

// addressId từ params, userId từ body/params
exports.deleteAddress = async (addressId, userId) => {
  if (!addressId || !userId) {
    const e = new Error("Thiếu addressId hoặc userId");
    e.status = 400;
    throw e;
  }

  const deleted = await Address.findOneAndDelete({ _id: addressId, userId });
  if (!deleted) {
    const e = new Error("Không tìm thấy địa chỉ của người dùng");
    e.status = 404;
    throw e;
  }

  return { success: true, message: "Xoá địa chỉ thành công" };
};
