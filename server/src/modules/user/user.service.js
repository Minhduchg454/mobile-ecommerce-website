//user.service
const User = require("./entities/user.model");
const UserStatus = require("./entities/user-status.model");
const Role = require("./entities/role.model");
const UserRole = require("./entities/user-role.model");
const AccountService = require("../auth/auth.service");
const Address = require("./entities/address.model");
const Bank = require("./entities/bank.model");
const PaymentAccount = require("./entities/payment-account.model");
const Balance = require("./entities/balance.model");
const Transaction = require("./entities/transaction.model");
const mongoose = require("mongoose");

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

exports.removeUserRole = async (body) => {
  const { userId, roleId, roleName } = body;

  if (!userId) {
    const err = new Error("Thiếu userId");
    err.status = 400;
    throw err;
  }

  // 1) Kiểm tra user có tồn tại và chưa bị xóa mềm không
  const user = await User.findOne({ _id: userId, isDeleted: false });
  if (!user) {
    const err = new Error("Không tìm thấy người dùng");
    err.status = 404;
    throw err;
  }

  // 2) Xác định roleId
  let targetRoleId = roleId;
  if (!targetRoleId && roleName) {
    const role = await Role.findOne({ roleName });
    if (!role) {
      const err = new Error(`Không tìm thấy vai trò: ${roleName}`);
      err.status = 404;
      throw err;
    }
    targetRoleId = role._id;
  }

  if (!targetRoleId) {
    const err = new Error("Thiếu roleId hoặc roleName");
    err.status = 400;
    throw err;
  }

  // 3) Thực hiện xóa liên kết UserRole
  // Dùng deleteOne vì chỉ cần xóa 1 bản ghi liên kết giữa user và role
  const result = await UserRole.deleteOne({
    userId: userId,
    roleId: targetRoleId,
  });

  if (result.deletedCount === 0) {
    const err = new Error("Không tìm thấy liên kết vai trò này cho người dùng");
    err.status = 404;
    throw err;
  }

  return {
    success: true,
    message: "Xóa vai trò của người dùng thành công",
    deletedCount: result.deletedCount,
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

//Bank
exports.createBank = async (body, file) => {
  const { bankName, bankCode, bankStatus } = body;
  if (!bankName || !bankCode) {
    const err = new Error("Thiếu Tên Ngân hàng hoặc Mã Ngân hàng (Bank Code)");
    err.status = 400;
    throw err;
  }

  const nameTrim = bankName.trim();
  const codeUpper = bankCode.trim().toUpperCase();

  const existing = await Bank.findOne({
    isDeleted: false,
    $or: [{ bankName: nameTrim }, { bankCode: codeUpper }],
  });

  if (existing) {
    const conflictField =
      existing.bankName === nameTrim
        ? "Tên Ngân hàng"
        : "Mã Ngân hàng (Bank Code)";
    const err = new Error(`${conflictField} đã tồn tại`);
    err.status = 400;
    throw err;
  }

  const bank = await Bank.create({
    bankName: nameTrim,
    bankCode: codeUpper,
    bankLogo: file ? file.path : "",
    bankStatus: bankStatus || "ACTIVE",
  });

  return {
    success: true,
    message: "Tạo ngân hàng thành công",
    bank,
  };
};

exports.getBank = async (query = {}) => {
  const { s, bankName, bankCode, includeDeleted, isDeleted, sort } = query;
  const filter = {};

  // 1. Lọc xóa mềm
  if (includeDeleted === "true" || includeDeleted === true) {
    if (isDeleted === "true" || isDeleted === true) filter.isDeleted = true;
    else if (isDeleted === "false" || isDeleted === false)
      filter.isDeleted = false;
  } else {
    filter.isDeleted = false;
  }

  // 2. Từ khóa s: tìm theo tên hoặc code
  if (s) {
    const keyword = String(s).trim();
    const regex = new RegExp(keyword, "i");
    filter.$or = [{ bankName: regex }, { bankCode: regex }];
  }
  if (bankName) {
    filter.bankName = bankName;
  }
  if (bankCode) {
    filter.bankCode = bankCode.toUpperCase();
  }

  // 3. Sort
  let sortOption = {};
  switch (sort) {
    case "oldest":
      sortOption = { createdAt: 1 };
      break;
    case "newest":
    default:
      sortOption = { createdAt: -1 };
      break;
    case "name_asc":
      sortOption = { bankName: 1 };
      break;
    case "name_desc":
      sortOption = { bankName: -1 };
      break;
  }

  const banks = await Bank.find(filter).sort(sortOption);

  return {
    success: true,
    message: "Lấy danh sách ngân hàng thành công",
    banks,
  };
};

exports.updateBank = async (params, body, file) => {
  const { bId } = params;
  const { bankName, bankCode, bankStatus } = body;

  if (!mongoose.isValidObjectId(bId)) {
    const err = new Error("ID ngân hàng không hợp lệ");
    err.status = 400;
    throw err;
  }

  const dataUpdate = {};

  if (bankName || bankCode) {
    let nameTrim = bankName ? bankName.trim() : undefined;
    let codeUpper = bankCode ? bankCode.trim().toUpperCase() : undefined;

    // Kiểm tra trùng lặp nếu có sự thay đổi
    if (nameTrim || codeUpper) {
      const queryCheck = {
        _id: { $ne: bId }, // loại trừ bản ghi hiện tại
        isDeleted: false,
      };
      const orConditions = [];
      if (nameTrim) orConditions.push({ bankName: nameTrim });
      if (codeUpper) orConditions.push({ bankCode: codeUpper });

      if (orConditions.length > 0) {
        queryCheck.$or = orConditions;

        const existing = await Bank.findOne(queryCheck);

        if (existing) {
          const conflictField =
            existing.bankName === nameTrim
              ? "Tên Ngân hàng"
              : "Mã Ngân hàng (Bank Code)";
          const err = new Error(`${conflictField} đã tồn tại`);
          err.status = 400;
          throw err;
        }
      }

      if (nameTrim) dataUpdate.bankName = nameTrim;
      if (codeUpper) dataUpdate.bankCode = codeUpper;
    }
  }

  if (file) {
    dataUpdate.bankLogo = file.path;
  }

  if (bankStatus) {
    dataUpdate.bankStatus = bankStatus;
  }

  if (Object.keys(dataUpdate).length === 0) {
    const err = new Error("Không có dữ liệu nào để cập nhật");
    err.status = 400;
    throw err;
  }

  const updatedBank = await Bank.findOneAndUpdate(
    { _id: bId, isDeleted: false },
    { $set: dataUpdate },
    { new: true }
  );

  if (!updatedBank) {
    const err = new Error("Không tìm thấy ngân hàng để cập nhật");
    err.status = 404;
    throw err;
  }

  return {
    success: true,
    message: "Cập nhật ngân hàng thành công",
    bank: updatedBank,
  };
};

exports.deleteBank = async (bId) => {
  await Bank.findByIdAndUpdate(bId, {
    $set: {
      isDeleted: true,
      deletedAt: new Date(),
    },
  });

  return {
    success: true,
    message: "Xóa ngân hàng thành công",
  };
};

//PaymentAccount
exports.createPaymentAccount = async (body, userId) => {
  const {
    paType,
    paBeneficiaryName,
    paAccountNumber,
    bankId,
    paIsDefault,
    paFor,
  } = body;

  // Mặc định paFor là customer nếu không truyền
  const accountScope = paFor || "customer";

  if (!paType || !paBeneficiaryName || !paAccountNumber || !userId) {
    const err = new Error(
      "Thiếu thông tin bắt buộc: Loại tài khoản, Tên thụ hưởng, hoặc Số tài khoản/ví."
    );
    err.status = 400;
    throw err;
  }

  // 1. Kiểm tra bankId (nếu có)
  if (bankId) {
    if (!mongoose.isValidObjectId(bankId)) {
      const err = new Error("ID ngân hàng không hợp lệ.");
      err.status = 400;
      throw err;
    }
    // [Suy luận] Logic kiểm tra bank tồn tại
    const bankExists = await Bank.findOne({
      _id: bankId,
      isDeleted: false,
      bankStatus: "ACTIVE",
    });
    if (!bankExists) {
      const err = new Error(
        "Ngân hàng liên kết không tồn tại hoặc không hoạt động."
      );
      err.status = 400;
      throw err;
    }
  }

  // 2. Kiểm tra trùng lặp (Thêm paFor vào điều kiện tìm kiếm)

  const existing = await PaymentAccount.findOne({
    userId: userId,
    paFor: accountScope,
    paType: paType,
    paAccountNumber: paAccountNumber.trim(),
    isDeleted: false,
  });

  if (existing) {
    const err = new Error(
      `Tài khoản này (${paAccountNumber}) đã tồn tại trong danh sách ${accountScope}.`
    );
    err.status = 400;
    throw err;
  }

  if (paIsDefault === true) {
    // Tìm và bỏ cờ mặc định của các tài khoản KHÁC thuộc CÙNG userId và CÙNG paFor
    await PaymentAccount.updateMany(
      {
        userId: userId,
        paFor: accountScope,
        paIsDefault: true,
        isDeleted: false,
      },
      { $set: { paIsDefault: false } }
    );
  }

  // 4. Tạo tài khoản
  const newAccount = await PaymentAccount.create({
    userId,
    bankId: bankId || null,
    paType: paType.trim(),
    paBeneficiaryName: paBeneficiaryName.trim(),
    paAccountNumber: paAccountNumber.trim(),
    paIsDefault: paIsDefault || false,
    paFor: accountScope,
  });

  return {
    success: true,
    message: "Tạo tài khoản thanh toán thành công",
    account: newAccount,
  };
};

exports.getPaymentAccounts = async (query = {}, userId) => {
  const { s, paType, includeDeleted, isDeleted, sort, paFor } = query;
  const filter = { userId: userId };

  // 1. Lọc xóa mềm
  if (includeDeleted === "true" || includeDeleted === true) {
    if (isDeleted === "true" || isDeleted === true) filter.isDeleted = true;
    else if (isDeleted === "false" || isDeleted === false)
      filter.isDeleted = false;
  } else {
    filter.isDeleted = false;
  }

  // 2. Lọc theo loại tài khoản (paType)
  if (paType) filter.paType = paType;
  if (paFor) filter.paFor = paFor;

  // 3. Từ khóa s: tìm theo tên thụ hưởng ( paBeneficiaryName) hoặc số tài khoản (paAccountNumber)
  if (s) {
    const keyword = String(s).trim();
    const regex = new RegExp(keyword, "i");
    filter.$or = [{ paBeneficiaryName: regex }, { paAccountNumber: regex }];
  }

  // 4. Sort
  let sortOption = { createdAt: -1 };
  if (sort === "oldest") sortOption = { createdAt: 1 };
  else if (sort === "default") sortOption = { paIsDefault: -1, createdAt: -1 };

  const accounts = await PaymentAccount.find(filter)
    .populate("bankId")
    .sort(sortOption);

  return {
    success: true,
    message: "Lấy danh sách tài khoản thanh toán thành công",
    accounts,
  };
};

/**
 * Cập nhật tài khoản thanh toán.
 */
exports.updatePaymentAccount = async (params, body, userId) => {
  const { aId } = params;
  const { paBeneficiaryName, paIsDefault, paStatus } = body;

  if (!mongoose.isValidObjectId(aId)) {
    const err = new Error("ID tài khoản không hợp lệ");
    err.status = 400;
    throw err;
  }

  const currentAccount = await PaymentAccount.findOne({
    _id: aId,
    userId: userId,
    isDeleted: false,
  });

  if (!currentAccount) {
    const err = new Error(
      "Không tìm thấy tài khoản hoặc bạn không có quyền cập nhật."
    );
    err.status = 404;
    throw err;
  }

  const dataUpdate = {};
  if (paBeneficiaryName)
    dataUpdate.paBeneficiaryName = paBeneficiaryName.trim();
  if (paStatus) dataUpdate.paStatus = paStatus;

  // Xử lý logic cập nhật paIsDefault
  if (paIsDefault !== undefined) {
    dataUpdate.paIsDefault = paIsDefault;

    // Nếu user muốn set thành mặc định (true)
    if (paIsDefault === true) {
      // Reset các tài khoản khác trong CÙNG NHÓM (paFor của tài khoản hiện tại)
      await PaymentAccount.updateMany(
        {
          userId: userId,
          paFor: currentAccount.paFor, // Lấy paFor từ DB ra để đảm bảo chính xác
          _id: { $ne: aId }, // Trừ thằng đang update ra
          paIsDefault: true,
          isDeleted: false,
        },
        { $set: { paIsDefault: false } }
      );
    }
  }

  if (Object.keys(dataUpdate).length === 0) {
    const err = new Error("Không có dữ liệu nào để cập nhật");
    err.status = 400;
    throw err;
  }

  // Thực hiện update
  const updatedAccount = await PaymentAccount.findByIdAndUpdate(
    aId,
    { $set: dataUpdate },
    { new: true }
  ).populate("bankId");

  return {
    success: true,
    message: "Cập nhật tài khoản thành công",
    account: updatedAccount,
  };
};

/**
 * Xóa mềm tài khoản thanh toán.
 */
exports.deletePaymentAccount = async (aId, userId) => {
  if (!mongoose.isValidObjectId(aId)) {
    const err = new Error("ID tài khoản không hợp lệ");
    err.status = 400;
    throw err;
  }

  const result = await PaymentAccount.findOneAndUpdate(
    { _id: aId, userId: userId, isDeleted: false },
    {
      $set: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    }
  );

  if (!result) {
    const err = new Error(
      "Không tìm thấy tài khoản hoặc bạn không có quyền xóa."
    );
    err.status = 404;
    throw err;
  }

  return {
    success: true,
    message: "Xóa tài khoản thanh toán thành công",
  };
};

/**
 * Balance
 */

exports.createBalance = async (userId, balanceFor) => {
  if (!mongoose.isValidObjectId(userId) || !balanceFor) {
    throw new Error("Thông tin userId hoặc balanceFor không hợp lệ.");
  }

  const balanceForLower = balanceFor.toLowerCase();
  const existing = await Balance.findOne({
    userId,
    balanceFor: balanceForLower,
    isDeleted: false,
  });
  if (existing) {
    throw new Error(
      `Số dư loại [${balanceForLower}] đã tồn tại cho người dùng này.`
    );
  }

  const newBalance = await Balance.create({
    userId,
    balanceFor: balanceForLower,
    balanceCurrent: 0.0,
  });

  return {
    success: true,
    message: `Khởi tạo số dư ${balanceForLower} thành công`,
    balance: newBalance,
  };
};

exports.getBalanceByUserIdAndFor = async (userId, balanceFor) => {
  if (!mongoose.isValidObjectId(userId) || !balanceFor) {
    throw new Error("Thông tin truy vấn không hợp lệ.");
  }

  const balanceForLower = balanceFor.toLowerCase();

  // 1. Tìm kiếm sổ dư hiện có
  let balance = await Balance.findOne({
    userId,
    balanceFor: balanceForLower,
    isDeleted: false,
  });

  // 2. Nếu không tìm thấy sổ dư (có thể là người dùng cũ)
  if (!balance) {
    try {
      // 3. Khởi tạo sổ dư mới (sử dụng hàm createBalance đã có)
      const newBalanceRes = await exports.createBalance(
        userId,
        balanceForLower
      );

      balance = newBalanceRes.balance;

      return {
        success: true,
        message: `Khởi tạo số dư ${balanceForLower} thành công và đã được trả về.`,
        balance,
      };
    } catch (createError) {
      console.error(
        `Lỗi khi cố gắng tạo số dư mới cho userId ${userId}:`,
        createError
      );
      const err = new Error(
        `Lỗi khi lấy hoặc tạo sổ dư ${balanceForLower}: ${createError.message}`
      );
      err.status = createError.status || 500;
      throw err;
    }
  }

  return {
    success: true,
    message: "Lấy số dư thành công",
    balance,
  };
};

exports.updateBalance = async (userId, balanceFor, amount, transInfo = {}) => {
  // 1. Khởi tạo Session Transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const balanceForLower = balanceFor.toLowerCase();
    const absAmount = Math.abs(amount);

    // Tự động xác định chiều dòng tiền
    const action = amount > 0 ? "in" : "out";

    // 2. Kiểm tra ví và số dư (đối với trừ tiền)
    // Dùng .session(session) để khóa dữ liệu trong giao dịch này
    const currentWallet = await Balance.findOne({
      userId,
      balanceFor: balanceForLower,
      isDeleted: false,
    }).session(session);

    if (!currentWallet) {
      // Tùy chọn: Tạo ví mới nếu chưa có (nếu là nạp tiền)
      // Ở đây tôi throw lỗi để an toàn
      throw new Error(`Không tìm thấy ví ${balanceForLower} của user này.`);
    }

    if (amount < 0 && currentWallet.balanceCurrent < absAmount) {
      throw new Error(`Số dư không đủ để thực hiện giao dịch.`);
    }

    const balanceBefore = currentWallet.balanceCurrent;

    // 3. Cập nhật Balance
    const updatedWallet = await Balance.findOneAndUpdate(
      { _id: currentWallet._id },
      { $inc: { balanceCurrent: amount } }, // amount có thể âm hoặc dương
      { new: true, session }
    );

    // 4. Tạo Transaction History
    // Lưu ý: create trong transaction phải truyền array [doc] và options { session }
    const newTrans = await Transaction.create(
      [
        {
          userId: userId,
          tranBalanceFor: balanceForLower,
          tranAmount: absAmount,
          tranType: transInfo.tranType,
          tranAction: action,
          tranBalanceBefore: balanceBefore,
          tranBalanceAfter: updatedWallet.balanceCurrent,
          tranDescriptions:
            transInfo.tranDescriptions || `Thay đổi số dư: ${amount}`,
          tranRelatedId: transInfo.tranRelatedId || null,
          tranRelatedModel: transInfo.tranRelatedModel || null,
        },
      ],
      { session }
    );

    // 5. Commit (Lưu thay đổi)
    await session.commitTransaction();
    session.endSession();

    return {
      success: true,
      message: "Cập nhật số dư và tạo giao dịch thành công",
      balance: updatedWallet,
      transaction: newTrans[0], // Trả về transaction vừa tạo
    };
  } catch (error) {
    // 6. Rollback (Hoàn tác nếu có lỗi)
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

//Transaction
exports.createTransaction = async (data, session = null) => {
  const opts = session ? { session } : {};
  const newTrans = await Transaction.create([data], opts);
  return newTrans[0];
};

exports.getTransactions = async (query = {}, userId) => {
  // ---------- 1. Đọc & chuẩn hoá ----------
  const {
    tranType,
    tranAction,
    tranBalanceFor,
    from,
    to,
    sort = "newest", // mặc định
    page = 1,
    limit = 10,
  } = query;

  const pageNumber = Math.max(1, parseInt(page, 10) || 1);
  const limitNumber = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
  const skip = (pageNumber - 1) * limitNumber;

  // ---------- 2. Filter ----------
  const filter = { userId: userId };

  // 2.1 Filter theo các trường nghiệp vụ
  if (tranType) filter.tranType = tranType;
  if (tranAction) filter.tranAction = tranAction;
  if (tranBalanceFor) filter.tranBalanceFor = tranBalanceFor;

  // 2.2 Filter theo thời gian (createdAt)
  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) filter.createdAt.$lte = new Date(to);
  }

  // ---------- 3. Sort ----------
  const sortOption = {};
  switch (String(sort).toLowerCase()) {
    case "oldest":
      sortOption.createdAt = 1;
      break;
    case "newest":
    default:
      sortOption.createdAt = -1;
      break;
  }

  // ---------- 4. Query ----------
  const [transactions, totalCount] = await Promise.all([
    Transaction.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNumber)
      .lean(),
    Transaction.countDocuments(filter),
  ]);

  return {
    success: true,
    message: "Lấy danh sách giao dịch thành công",
    transactions,
    totalCount,
    currentPage: pageNumber,
    limit: limitNumber,
  };
};

/**
 * Lấy chi tiết 1 giao dịch
 */
exports.getTransactionById = async (tId, userId) => {
  if (!mongoose.isValidObjectId(tId)) {
    const err = new Error("ID giao dịch không hợp lệ");
    err.status = 400;
    throw err;
  }

  const transaction = await Transaction.findOne({ _id: tId, userId: userId });

  if (!transaction) {
    const err = new Error(
      "Không tìm thấy giao dịch hoặc bạn không có quyền xem."
    );
    err.status = 404;
    throw err;
  }

  return {
    success: true,
    message: "Lấy chi tiết giao dịch thành công",
    transaction,
  };
};
