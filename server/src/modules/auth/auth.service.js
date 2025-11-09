// modules/auth/auth.service.js
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

//Import model
const User = require("../user/entities/user.model");
const Customer = require("../customer/entities/customer.model");
const Account = require("./entities/account.model");
const UserStatus = require("../user/entities/user-status.model");
const ShoppingCart = require("../shopping/entities/shopping-cart.model");
const Admin = require("./../admin/entities/admin.model");
const UserRole = require("../user/entities/user-role.model");
const Shop = require("../shop/entitties/shop.model");

//Import service
const userService = require("../user/user.service");
const cartService = require("../shopping/cart.service");
const shopService = require("../shop/shop.service");

//Import orders
const { OAuth2Client } = require("google-auth-library");
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES = process.env.JWT_EXPIRES || "7d";
const slugify = require("slugify");

//Dang ky tai khoan khach hang
exports.registerCustomer = async (body) => {
  const {
    firstName,
    lastName,
    dateOfBirth,
    phone,
    email,
    password,
    accountName,
  } = body;

  if (
    !firstName ||
    !lastName ||
    !dateOfBirth ||
    !email ||
    !phone ||
    !accountName ||
    !password
  ) {
    const err = new Error("Thiếu thông tin bắt buộc");
    err.status = 400;
    throw err;
  }

  const createdDocs = {
    user: null,
    customer: null,
    account: null,
    cart: null,
    userRole: null,
  };

  try {
    // 1) Check account trùng
    const exists = await Account.findOne({ accountName });
    if (exists) {
      const err = new Error("Tài khoản đã tồn tại");
      err.status = 409;
      throw err;
    }

    // 2) Lấy/ tạo status 'active'
    const activeStatus = await userService.getUserStatus({
      userStatusName: "active",
    });
    const activeStatusId = activeStatus.userStatus._id;

    // 3) Tạo giỏ hàng
    const shoppingCart = await cartService.createCart();
    createdDocs.cart = shoppingCart.cart;

    // 4) Tạo User (gọi service)
    const userRes = await userService.createUser({
      userFirstName: firstName,
      userLastName: lastName,
      userEmail: email,
      userMobile: phone,
      userDateOfBirth: dateOfBirth,
      userStatusId: activeStatusId,
    });
    createdDocs.user = userRes.user;

    // 5) Lấy / tạo role 'customer'
    const customerRole = await userService.getRole({ roleName: "customer" });

    // 6) Gán vai trò cho user
    const userRole = await UserRole.create({
      roleId: customerRole.role._id,
      userId: userRes.user._id,
    });
    createdDocs.userRole = userRole;

    // 7) Tạo Customer profile (1–1)
    const customer = await Customer.create({
      _id: userRes.user._id,
      cartId: shoppingCart.cart._id,
    });
    createdDocs.customer = customer;

    // 8) Tạo Account (hash password)
    const hash = await bcrypt.hash(password, 10);
    const account = await Account.create({
      accountName,
      accountPassword: hash,
      accountType: "password",
      userId: userRes.user._id,
    });
    createdDocs.account = account;

    return {
      success: true,
      message:
        "Tạo tài khoản thành công, vui lòng chuyển đến giao diện đăng nhập",
    };
  } catch (err) {
    console.error("Đăng ký bị lỗi:", err);
    // rollback thủ công (đảo ngược thứ tự)
    if (createdDocs.account)
      await Account.findByIdAndDelete(createdDocs.account._id);
    if (createdDocs.customer)
      await Customer.findByIdAndDelete(createdDocs.customer._id);
    if (createdDocs.userRole)
      await UserRole.findByIdAndDelete(createdDocs.userRole._id);
    if (createdDocs.user) await User.findByIdAndDelete(createdDocs.user._id);
    if (createdDocs.cart)
      await ShoppingCart.findByIdAndDelete(createdDocs.cart._id);
    throw err;
  }
};

//Dang ky tai khoan admin
exports.registerAdmin = async (body) => {
  const {
    firstName,
    lastName,
    dateOfBirth,
    phone,
    email,
    password,
    accountName,
  } = body;

  // 1) Validate
  if (
    !firstName ||
    !lastName ||
    !dateOfBirth ||
    !email ||
    !phone ||
    !accountName ||
    !password
  ) {
    const err = new Error("Thiếu thông tin bắt buộc");
    err.status = 400;
    throw err;
  }

  // theo dõi để rollback thủ công nếu có lỗi giữa chừng
  const createdDocs = {
    user: null,
    userRole: null,
    account: null,
    admin: null,
  };

  try {
    // 2) Check account trùng
    const exists = await Account.findOne({ accountName });
    if (exists) {
      const err = new Error("Tài khoản đã tồn tại");
      err.status = 409;
      throw err;
    }

    // 3) Lấy / tạo trạng thái 'active'
    const activeStatus = await userService.getUserStatus({
      userStatusName: "active",
    });
    const activeStatusId = activeStatus.userStatus._id;

    // 4) Tạo User (KHÔNG có cartId)
    const userRes = await userService.createUser({
      userFirstName: firstName,
      userLastName: lastName,
      userEmail: email,
      userMobile: phone,
      userDateOfBirth: dateOfBirth,
      userStatusId: activeStatusId,
    });
    createdDocs.user = userRes.user;

    // 5) Lấy / tạo role 'admin'
    const adminRole = await userService.getRole({ roleName: "admin" });

    // 6) Gán vai trò admin cho user
    const userRole = await UserRole.create({
      roleId: adminRole.role._id,
      userId: userRes.user._id,
    });
    createdDocs.userRole = userRole;

    // 7) Tạo Admin profile (1–1)
    const admin = await Admin.create({ _id: userRes.user._id });
    createdDocs.admin = admin;

    // 8) Tạo Account (hash password)
    const hash = await bcrypt.hash(password, 10);
    const account = await Account.create({
      accountName,
      accountPassword: hash,
      accountType: "password",
      userId: userRes.user._id,
    });
    createdDocs.account = account;

    return {
      success: true,
      message: "Tạo tài khoản admin thành công",
    };
  } catch (err) {
    console.error("Đăng ký admin bị lỗi:", err);

    // rollback thủ công (đảo ngược thứ tự tạo)
    try {
      if (createdDocs.account)
        await Account.findByIdAndDelete(createdDocs.account._id);
    } catch (_) {}
    try {
      if (createdDocs.userRole)
        await UserRole.findByIdAndDelete(createdDocs.userRole._id);
    } catch (_) {}
    try {
      if (createdDocs.user) await User.findByIdAndDelete(createdDocs.user._id);
    } catch (_) {}

    throw err;
  }
};

//Dang ky tai khoan shop

exports.registerShop = async (body, files) => {
  const { userId, shopName, shopDescription, shopIsOffical } = body;

  if (shopIsOffical) {
    body.shopIsOffical = true;
  }

  if (!userId || !shopName) {
    const err = new Error("Thiếu userId hoặc shopName");
    err.status = 400;
    throw err;
  }

  const createdDocs = { shop: null, userRole: null };

  try {
    // 1️Kiểm tra user tồn tại
    const userRes = await userService.getCurrent({ id: userId });
    if (!userRes.user) {
      const err = new Error("Người dùng không tồn tại");
      err.status = 404;
      throw err;
    }

    // 2️⃣ Kiểm tra user đã có shop chưa
    const existedShop = await Shop.findById(userId);
    if (existedShop) {
      const err = new Error("Người dùng đã có shop");
      err.status = 409;
      throw err;
    }

    // tạo slug từ tên shop
    const shopSlug = slugify(shopName, {
      lower: true, // chuyển về chữ thường
    });

    // Kiểm tra trùng tên hoặc slug
    const duplicate = await Shop.findOne({
      $or: [{ shopName: shopName.trim() }, { shopSlug }],
    });

    if (duplicate) {
      const err = new Error("Tên cửa hàng hoặc slug đã tồn tại");
      err.status = 409;
      throw err;
    }

    // 5️⃣ Đảm bảo role "shop" tồn tại
    const shopRole = await userService.getRole({ roleName: "shop" });

    // 6️⃣ Nếu user chưa có role "shop" thì gán
    const existedUserRole = await UserRole.findOne({
      userId,
      roleId: shopRole.role._id,
    });
    if (!existedUserRole) {
      const ur = await UserRole.create({ userId, roleId: shopRole.role._id });
      createdDocs.userRole = ur;
    }

    // 7️⃣ Tạo shop
    const shopRes = await shopService.createShop(body, files);
    createdDocs.shop = shopRes.shop;

    return {
      success: true,
      message: "Đăng ký shop thành công",
      shop: createdDocs.shop,
    };
  } catch (err) {
    console.error("Đăng ký shop bị lỗi:", err);

    // rollback
    try {
      if (createdDocs.shop) await Shop.findByIdAndDelete(createdDocs.shop._id);
    } catch (_) {}
    try {
      if (createdDocs.userRole)
        await UserRole.findByIdAndDelete(createdDocs.userRole._id);
    } catch (_) {}

    throw err;
  }
};

// Đổi mật khẩu
exports.changePassword = async (body) => {
  // chấp nhận cả oldPassword và oldPasword (typo)

  const { newPassword, oldPassword, uId } = body;

  // Ưu tiên id từ token (an toàn hơn), fallback về body.uId (nếu bạn chưa bật middleware)

  // 1) Validate đầu vào
  if (!uId || !oldPassword || !newPassword) {
    const err = new Error("Thiếu thông tin: uId, oldPassword, newPassword");
    err.status = 400;
    throw err;
  }
  if (typeof newPassword !== "string" || newPassword.length < 6) {
    const err = new Error("Mật khẩu mới phải từ 6 ký tự");
    err.status = 400;
    throw err;
  }

  // 2) Tìm account theo userId
  const account = await Account.findOne({ userId: uId });
  if (!account) {
    const err = new Error("Không tìm thấy tài khoản");
    err.status = 404;
    throw err;
  }

  // 3) So khớp mật khẩu cũ
  const isMatch = await bcrypt.compare(oldPassword, account.accountPassword);
  if (!isMatch) {
    const err = new Error("Mật khẩu hiện tại không đúng");
    err.status = 401;
    throw err;
  }

  // 4) Chặn trường hợp đặt lại đúng mật khẩu hiện tại (không bắt buộc nhưng nên có)
  const sameAsCurrent = await bcrypt.compare(
    newPassword,
    account.accountPassword
  );
  if (sameAsCurrent) {
    const err = new Error("Mật khẩu mới không được trùng mật khẩu hiện tại");
    err.status = 400;
    throw err;
  }

  // 5) Hash mật khẩu mới và lưu
  const SALT_ROUNDS = 10;
  const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);
  account.accountPassword = hashed;

  await account.save();

  return {
    success: true,
    message: "Đổi mật khẩu thành công",
  };
};

exports.login = async (body) => {
  const { accountName, password } = body;
  //console.log("Nhan thong tin", accountName, password);

  // 1) Validate input
  if (!accountName || !password) {
    const err = new Error(
      "Vui lòng nhập đầy đủ email/số điện thoại và mật khẩu"
    );
    err.status = 400;
    throw err;
  }

  // 2) Tìm account
  const account = await Account.findOne({ accountName });
  if (!account) {
    const err = new Error("Không tìm thấy tài khoản");
    err.status = 404;
    throw err;
  }

  // 3) So khớp mật khẩu
  //    bcrypt.compare(plain, hash)
  //So sanh mat khau

  const isMatch = await bcrypt.compare(password, account.accountPassword);
  if (!isMatch) {
    const err = new Error("Mật khẩu không đúng");
    err.status = 401;
    throw err;
  }

  // 4) Lấy thông tin user (tận dụng userService.getCurrent)
  //    getCurrent đang nhận { id }, và trả { success, user }
  const current = await userService.getCurrent({ id: account.userId });
  // Chuyển user về plain object
  const user = current.user.toObject
    ? current.user.toObject()
    : { ...current.user };

  // 5) Ký token
  const token = jwt.sign({ id: user._id, roles: user.roles }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES,
  });
  //console.log("Thong tin dang nhap tra ve", user);

  return {
    success: true,
    message: "Đăng nhập thành công",
    token,
    user,
  };
};

exports.googleLogin = async (body) => {
  const { token } = body;
  if (!token) {
    const err = new Error("Thiếu token Google");
    err.status = 400;
    throw err;
  }

  const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

  // theo dõi để rollback nếu có lỗi khi tạo mới
  const createdDocs = {
    account: null,
    customer: null,
    userRole: null,
    user: null,
    cart: null,
  };

  try {
    // 1) Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const email = (payload.email || "").trim().toLowerCase();
    const name = (payload.name || "").trim();
    const picture = payload.picture || "";

    if (!email) {
      const err = new Error("Không lấy được email từ Google");
      err.status = 400;
      throw err;
    }

    // 2) Tìm user theo email
    let user = await User.findOne({ userEmail: email }).populate(
      "userStatusId",
      "userStatusName"
    );

    if (!user) {
      // 3) Tạo mới full flow như registerCustomer (accountType = 'google')
      const activeStatus = await userService.getUserStatus({
        userStatusName: "active",
      });
      const activeStatusId = activeStatus.userStatus._id;

      const parts = name.split(" ").filter(Boolean);
      const firstName = parts[0] || "";
      const lastName = parts.slice(1).join(" ") || "";

      // tạo cart
      const cartRes = await cartService.createCart();
      createdDocs.cart = cartRes.cart;

      // tạo user
      const userRes = await userService.createUser({
        userFirstName: firstName,
        userLastName: lastName,
        userEmail: email,
        userAvatar: picture,
        userStatusId: activeStatusId,
      });
      createdDocs.user = userRes.user;
      user = userRes.user;

      // gán role 'customer'
      const customerRole = await userService.getRole({ roleName: "customer" });
      const ur = await UserRole.create({
        roleId: customerRole.role._id,
        userId: user._id,
      });
      createdDocs.userRole = ur;

      // tạo customer + gắn cart
      const customer = await Customer.create({
        _id: user._id,
        cartId: cartRes.cart._id,
      });
      createdDocs.customer = customer;

      // tạo Account Google (không cần password)
      const acc = await Account.create({
        accountName: email,
        accountType: "google",
        isOauth: true,
        userId: user._id,
      });
      createdDocs.account = acc;
    } else {
      // (Tuỳ chọn) đảm bảo có Account 'google' cho user này
      const existedAcc = await Account.findOne({
        userId: user._id,
        accountType: "google",
      });
      if (!existedAcc) {
        createdDocs.account = await Account.create({
          accountName: email,
          accountType: "google",
          isOauth: true,
          userId: user._id,
        });
      }
    }

    // 4) Lấy roles để ký JWT (đồng bộ với login)
    const userRoles = await UserRole.find({ userId: user._id })
      .populate("roleId", "roleName")
      .lean();
    const roles = userRoles.map((r) => r.roleId?.roleName).filter(Boolean);

    // 5) Ký JWT với { id, roles }
    const accessToken = jwt.sign({ id: user._id, roles }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES,
    });

    // 6) Chuẩn hoá user trả về
    const userObj = user.toObject ? user.toObject() : user;
    userObj.roles = roles;

    return {
      success: true,
      message: "Đăng nhập Google thành công",
      token: accessToken,
      user: userObj,
    };
  } catch (error) {
    // rollback nếu có tạo mới ở giữa chừng
    try {
      if (createdDocs.account)
        await Account.findByIdAndDelete(createdDocs.account._id);
    } catch (_) {}
    try {
      if (createdDocs.customer)
        await Customer.findByIdAndDelete(createdDocs.customer._id);
    } catch (_) {}
    try {
      if (createdDocs.userRole)
        await UserRole.findByIdAndDelete(createdDocs.userRole._id);
    } catch (_) {}
    try {
      if (createdDocs.user) await User.findByIdAndDelete(createdDocs.user._id);
    } catch (_) {}
    try {
      if (createdDocs.cart)
        await ShoppingCart.findByIdAndDelete(createdDocs.cart._id);
    } catch (_) {}

    console.error("Google login error:", error);
    throw error;
  }
};

exports.getAccountName = async (userId) => {
  if (!userId) {
    const err = new Error("Không có id tài khoản");
    err.status = 404;
    throw err;
  }
  const account = await Account.findOne({ userId });
  if (!account) {
    const err = new Error("Không tìm thấy tài khoản");
    err.status = 404;
    throw err;
  }
  return {
    success: true,
    mesage: "Lấy tên tài khoản thành công",
    accountName: account.accountName,
  };
};
