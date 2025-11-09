//user.service
const User = require("./entities/user.model");
const UserStatus = require("./entities/user-status.model");
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
  const user = await User.findOne({
    $or: orConds,
    isDeleted: false,
  }).populate("userStatusId", "userStatusName");

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

exports.getUsers = async (query = {}) => {
  const {
    s, // từ khóa tìm kiếm
    roleName, // lọc theo vai trò
    statusName, // lọc theo trạng thái
    gender,
    userId,
    isDeleted,
    includeDeleted,
    page = 1,
    limit, // nếu không truyền -> lấy tất cả
    sort = "-createdAt",
  } = query;

  const filter = {};

  // ====== 1. Từ khóa tìm kiếm ======
  if (s) {
    const keyword = String(s).trim();
    const regex = new RegExp(keyword, "i");
    filter.$or = [
      { userFirstName: regex },
      { userLastName: regex },
      { userEmail: regex },
      { userMobile: regex },
    ];
  }
  if (userId) {
    filter._id = userId;
  }

  // ====== 2. Lọc trạng thái ======
  if (statusName) {
    const st = await UserStatus.findOne({ userStatusName: statusName }).lean();
    if (st) filter.userStatusId = st._id;
    else return { success: true, users: [], total: 0 };
  }

  // ====== 3. Lọc giới tính ======
  if (gender && ["male", "female", "other"].includes(gender)) {
    filter.userGender = gender;
  }

  // ====== 4. Lọc xóa mềm ======
  if (includeDeleted === "true" || includeDeleted === true) {
    if (isDeleted === "true" || isDeleted === true) filter.isDeleted = true;
    else if (isDeleted === "false" || isDeleted === false)
      filter.isDeleted = false;
  } else {
    filter.isDeleted = false;
  }

  // ====== 5. Lọc vai trò ======
  let userIds = null;
  if (roleName) {
    const role = await Role.findOne({ roleName }).lean();
    if (!role) return { success: true, users: [], total: 0, page, limit: 0 };
    const userRoles = await UserRole.find({ roleId: role._id }).lean();
    userIds = userRoles.map((ur) => ur.userId);
    if (!userIds.length)
      return { success: true, users: [], total: 0, page, limit: 0 };
    filter._id = { $in: userIds };
  }

  // ====== 6. Phân trang & limit ======
  const pageNum = Math.max(1, parseInt(page));
  const total = await User.countDocuments(filter);

  let limitNum;
  let skip = 0;

  if (limit === undefined || limit === null || limit === "" || limit === "0") {
    // Không truyền limit => lấy toàn bộ
    limitNum = total;
  } else {
    limitNum = Math.max(1, parseInt(limit));
    skip = (pageNum - 1) * limitNum;
  }

  // ====== 7. Truy vấn danh sách ======
  const users = await User.find(filter)
    .populate("userStatusId", "userStatusName")
    .sort(sort)
    .skip(skip)
    .limit(limitNum)
    .lean();

  // ====== 8. Gắn roles ======
  const ids = users.map((u) => u._id);
  const allRoles = await UserRole.find({ userId: { $in: ids } })
    .populate("roleId", "roleName")
    .lean();

  const roleMap = {};
  allRoles.forEach((r) => {
    const key = String(r.userId);
    if (!roleMap[key]) roleMap[key] = [];
    if (r.roleId?.roleName) roleMap[key].push(r.roleId.roleName);
  });

  const result = users.map((u) => ({
    ...u,
    roles: roleMap[String(u._id)] || [],
  }));

  return {
    success: true,
    total,
    page: pageNum,
    limit: limitNum,
    users: result,
  };
};

// Xóa mềm user
exports.deleteUser = async (uId) => {
  if (!uId) {
    const err = new Error("Thiếu uId");
    err.status = 400;
    throw err;
  }

  const user = await User.findById(uId);
  if (!user || user.isDeleted) {
    const err = new Error("Không tìm thấy user hoặc user đã bị xóa");
    err.status = 404;
    throw err;
  }

  user.isDeleted = true;
  user.deletedAt = new Date();
  await user.save();

  return {
    success: true,
    message: "Xóa tài khoản (soft delete) thành công",
  };
};

exports.updateUser = async (uId, body, file) => {
  if (!uId) {
    const err = new Error("Thiếu uId");
    err.status = 400;
    throw err;
  }

  // 1) Gắn file (nếu có)
  if (file?.path) {
    body.userAvatar = file.path;
  }

  // 2) Chuẩn hoá dữ liệu text
  if (body.userFirstName)
    body.userFirstName = String(body.userFirstName).trim();
  if (body.userLastName) body.userLastName = String(body.userLastName).trim();
  if (body.userEmail)
    body.userEmail = String(body.userEmail).trim().toLowerCase();
  if (body.userMobile) body.userMobile = String(body.userMobile).trim();

  // 3) Nếu có statusName thì tìm hoặc tạo UserStatus tương ứng
  if (body.statusName) {
    const statusDoc = await UserStatus.findOneAndUpdate(
      { userStatusName: body.statusName },
      { $setOnInsert: { userStatusName: body.statusName } },
      { new: true, upsert: true }
    );
    body.userStatusId = statusDoc._id;
    delete body.statusName; // tránh để field lạ trong schema
  }

  // 4) Chỉ cho phép update các field hợp lệ
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

  // 5) Cập nhật user
  const updated = await User.findByIdAndUpdate(uId, dataUpdate, { new: true })
    .populate("userStatusId", "userStatusName")
    .lean();

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

  // Xác định group: customer hay shop
  const scopeFor = body.addressFor || "customer";

  if (body.addressIsDefault === true) {
    await Address.updateMany(
      {
        userId: body.userId,
        addressFor: scopeFor,
        isDeleted: false,
        addressIsDefault: true,
      },
      { $set: { addressIsDefault: false } }
    );
  }

  const doc = await Address.create({
    ...body,
    addressFor: scopeFor,
  });

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
  const { userId, q, sort, addressFor } = query;

  const filter = { isDeleted: false };
  if (userId) filter.userId = userId;
  if (addressFor) filter.addressFor = addressFor;

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
    newest: { _id: -1 },
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
  if (!addressId || !userId) {
    const e = new Error("Thiếu addressId hoặc userId");
    e.status = 400;
    throw e;
  }

  // Lấy bản hiện tại để biết nó thuộc group nào
  const current = await Address.findOne({
    _id: addressId,
    userId,
    isDeleted: false,
  });
  if (!current) {
    const err = new Error("Không tìm thấy địa chỉ của người dùng");
    err.status = 404;
    throw err;
  }

  const scopeFor = body.addressFor || current.addressFor || "customer";

  if (typeof body.addressIsDefault !== "undefined" && body.addressIsDefault) {
    await Address.updateMany(
      {
        userId,
        addressFor: scopeFor,
        isDeleted: false,
        _id: { $ne: addressId },
        addressIsDefault: true,
      },
      { $set: { addressIsDefault: false } }
    );
  }

  const updated = await Address.findOneAndUpdate(
    { _id: addressId, userId, isDeleted: false },
    { ...body, addressFor: scopeFor },
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

  const current = await Address.findOne({
    _id: addressId,
    userId,
    isDeleted: false,
  });
  if (!current) {
    const e = new Error("Không tìm thấy địa chỉ của người dùng");
    e.status = 404;
    throw e;
  }

  const updated = await Address.findOneAndUpdate(
    { _id: addressId, userId, isDeleted: false },
    {
      $set: {
        isDeleted: true,
        deletedAt: new Date(),
        addressIsDefault: false,
      },
    },
    { new: true } // tra ve ban ghi sau cap nhat
  );

  return { success: true, message: "Xoá địa chỉ (mềm) thành công" };
};
