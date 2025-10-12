//  shop/shop.service.js
//import model
const Shop = require("./entitties/shop.model");
const ServicePlan = require("./entitties/service-plan.model");
const ShopSubscribe = require("./entitties/shop-subscribe.model");
const CategoryShop = require("./entitties/category-shop.model");
const slugify = require("slugify");

//Shop
exports.createShop = async (body, files) => {
  // 1. Validate
  const required = ["userId", "shopName"];
  const missing = required.filter((k) => !body[k]);
  if (missing.length) {
    const err = new Error(`Missing fields: ${missing.join(", ")}`);
    err.status = 400;
    throw err;
  }

  // 2. Chuẩn hóa dữ liệu
  body.shopName = String(body.shopName).trim();
  body.shopSlug = body.shopSlug || slugify(body.shopName, { lower: true });

  // 3. Files -> gắn vào body nếu có
  if (files?.shopLogo?.[0]) body.shopLogo = files.shopLogo[0].path;
  if (files?.shopBackground?.[0])
    body.shopBackground = files.shopBackground[0].path;
  if (Array.isArray(files?.shopBanner)) {
    body.shopBanner = files.shopBanner.map((f) => f.path).filter(Boolean);
  }

  // 4. Check trùng shop (1 user chỉ 1 shop)
  const existed = await Shop.findById(body.userId);
  if (existed) {
    const err = new Error("Người dùng đã có shop");
    err.status = 409;
    throw err;
  }

  // 5. Tạo shop (Mongoose tự điền default cho các field còn lại)
  const shop = await Shop.create({
    _id: body.userId,
    ...body,
  });

  return {
    success: true,
    message: "Tạo shop thành công",
    shop,
  };
};

exports.getShopByUser = async (userId) => {
  if (!userId) {
    const err = new Error("Thiếu userId");
    err.status = 400;
    throw err;
  }

  const shop = await Shop.findById(userId);
  if (!shop) {
    const err = new Error("Không tìm thấy shop");
    err.status = 404;
    throw err;
  }

  return {
    success: true,
    message: "Lấy thông tin shop thành công",
    shop,
  };
};

exports.getShops = async (query) => {
  //console.log("Nhan tham so truyen tu shop", query);
  const {
    shopId,
    userId,
    s, // Từ khóa tìm kiếm (theo tên)
    status, // Trạng thái shop: pending / active / banned
    isMall, // Lọc shop mall
    sort = "-createdAt", // Thứ tự sắp xếp
    limit = 20, // Giới hạn kết quả
  } = query;

  const filter = {};

  // Lọc theo ID
  if (shopId) {
    const ids = Array.isArray(shopId) ? shopId : String(shopId).split(",");
    filter._id = { $in: ids.map((id) => id.trim()) };
  }

  // Lọc theo userId (vì shopId = userId nếu bạn thiết kế như vậy)
  if (userId) {
    const ids = Array.isArray(userId) ? userId : String(userId).split(",");
    filter._id = { $in: ids.map((id) => id.trim()) };
  }

  //Tìm kiếm theo tên
  if (s) {
    filter.shopName = { $regex: s, $options: "i" };
  }

  // Lọc theo trạng thái (pending, active, banned, ...)
  if (status) {
    filter.shopStatus = {
      $in: String(status)
        .split(",")
        .map((v) => v.trim()),
    };
  }

  // 5Lọc shop mall (chính hãng)
  if (isMall === "true" || isMall === true) {
    filter.shopOfficial = true;
  }

  // Sort động: có thể truyền nhiều tiêu chí, ví dụ `sort=-shopRateAvg,shopProductCount`
  let sortOption = {};

  if (typeof sort === "string" && sort.trim()) {
    sort.split(",").forEach((field) => {
      field = field.trim();
      if (!field) return;
      if (field.startsWith("-")) {
        sortOption[field.slice(1)] = -1;
      } else {
        sortOption[field] = 1;
      }
    });
  } else if (typeof sort === "object" && !Array.isArray(sort)) {
    // Nếu client gửi object kiểu { shopSoldCount: -1 }
    sortOption = sort;
  }
  // console.log("dieu kien loc in ra", sortOption);

  //Query DB
  const shops = await Shop.find(filter)
    .sort(sortOption)
    .limit(Number(limit))
    .lean();

  return {
    success: true,
    message: "Lấy danh sách shop thành công",
    shops,
  };
};

exports.updateShop = async (userId, body, files) => {
  //console.log("Nhan thong tin", userId, body, files);
  if (!userId) {
    const err = new Error("Thiếu userId");
    err.status = 400;
    throw err;
  }

  // Chuẩn hóa dữ liệu
  if (body.shopName) {
    body.shopName = String(body.shopName).trim();
    body.shopSlug = slugify(body.shopName, { lower: true });
  }

  // Files -> merge vào body nếu có
  if (files?.shopLogo?.[0]) body.shopLogo = files.shopLogo[0].path;
  if (files?.shopBackground?.[0])
    body.shopBackground = files.shopBackground[0].path;
  if (Array.isArray(files?.shopBanner)) {
    body.shopBanner = files.shopBanner.map((f) => f.path).filter(Boolean);
  }

  // Chỉ cập nhật các field hợp lệ
  /*
  const allow = [
    "shopName",
    "shopSlug",
    "shopDescription",
    "shopLogo",
    "shopBanner",
    "shopBackground",
    "shopColor",
  ];
  const dataUpdate = {};
  for (const k of allow) {
    if (body[k] !== undefined) dataUpdate[k] = body[k];
  }*/

  const updated = await Shop.findByIdAndUpdate(userId, body, {
    new: true,
  });

  if (!updated) {
    const err = new Error("Không tìm thấy shop để cập nhật");
    err.status = 404;
    throw err;
  }

  return {
    success: true,
    message: "Cập nhật shop thành công",
    shop: updated,
  };
};

exports.deleteShop = async (userId) => {
  if (!userId) {
    const err = new Error("Thiếu userId");
    err.status = 400;
    throw err;
  }

  // (Tuỳ ý) Chặn xoá nếu shop còn sản phẩm/đơn hàng…
  // const hasProduct = await Product.findOne({ shopId: userId });
  // if (hasProduct) { ... throw err 400 ... }

  const deleted = await Shop.findByIdAndDelete(userId);
  if (!deleted) {
    const err = new Error("Không tìm thấy shop để xoá");
    err.status = 404;
    throw err;
  }

  return {
    success: true,
    message: "Xoá shop thành công",
  };
};

//Service Plan
exports.createServicePlan = async (body) => {
  const {
    serviceName,
    serviceDescription,
    serviceBillingCycle,
    servicePrice,
    serviceColor,
  } = body;

  if (!serviceName || !serviceBillingCycle || servicePrice == null) {
    const err = new Error(
      "Thiếu serviceName, serviceBillingCycle hoặc servicePrice"
    );
    err.status = 400;
    throw err;
  }

  const plan = await ServicePlan.create({
    serviceName: serviceName.trim(),
    serviceDescription: serviceDescription || "",
    serviceBillingCycle,
    servicePrice,
    serviceColor: serviceColor || "#ffffff",
  });

  return {
    success: true,
    message: "Tạo gói dịch vụ thành công",
    plan,
  };
};

exports.getServicePlans = async (sort) => {
  const sortOption = !sort
    ? {}
    : sort === "oldest"
    ? { createdAt: 1 }
    : { createdAt: -1 };
  const plans = await ServicePlan.find().sort(sortOption);

  return {
    success: true,
    message: "Lấy danh sách gói dịch vụ thành công",
    plans,
  };
};

exports.updateServicePlan = async (sid, body) => {
  const dataUpdate = {};
  const allow = [
    "serviceName",
    "serviceDescription",
    "serviceBillingCycle",
    "servicePrice",
    "serviceColor",
  ];
  for (const k of allow) {
    if (body[k] !== undefined) dataUpdate[k] = body[k];
  }

  const updated = await ServicePlan.findByIdAndUpdate(sid, dataUpdate, {
    new: true,
  });

  return {
    success: true,
    message: "Cập nhật gói dịch vụ thành công",
    plan: updated,
  };
};

exports.deleteServicePlan = async (sid) => {
  // Nếu có bảng subscribe, kiểm tra tham chiếu
  if (ShopSubscribe) {
    const isUsed = await ShopSubscribe.findOne({ serviceId: sid });
    if (isUsed) {
      const err = new Error("Không thể xoá: gói đang được sử dụng bởi shop.");
      err.status = 400;
      throw err;
    }
  }

  await ServicePlan.findByIdAndDelete(sid);

  return {
    success: true,
    message: "Xoá gói dịch vụ thành công",
  };
};

//Shop subcrile
exports.createSubscription = async (body) => {
  const { shopId, serviceId, subExpirationDate, subAutoRenew, subPrice } = body;

  if (!shopId || !serviceId || !subExpirationDate || !subPrice) {
    const err = new Error("Thiếu thông tin đăng ký gói dịch vụ");
    err.status = 400;
    throw err;
  }

  const subscription = await ShopSubscribe.create({
    shopId,
    serviceId,
    subExpirationDate,
    subAutoRenew: subAutoRenew ?? false,
    subPrice,
    subStatus: "active",
  });

  return {
    success: true,
    message: "Đăng ký dịch vụ thành công",
    subscription,
  };
};

exports.getSubscriptionsByShop = async (shopId) => {
  const subscriptions = await ShopSubscribe.find({ shopId }).populate(
    "serviceId",
    "serviceName servicePrice serviceBillingCycle"
  );

  return {
    success: true,
    subscriptions,
  };
};

// shop.service.js
exports.getActiveSubscription = async (shopId) => {
  const now = new Date();
  const sub = await ShopSubscribe.findOne({
    shopId,
    subStatus: "active",
    subExpirationDate: { $gte: now },
  })
    .sort({ subExpirationDate: -1 }) // gần nhất
    .populate("serviceId", "serviceName servicePrice serviceBillingCycle");

  return { success: true, subscription: sub };
};

exports.cancelSubscription = async (subId) => {
  const updated = await ShopSubscribe.findByIdAndUpdate(
    subId,
    { subStatus: "canceled" },
    { new: true }
  );

  return {
    success: true,
    message: "Hủy đăng ký thành công",
    subscription: updated,
  };
};

//Category-Shop
// Tạo danh mục cho một shop
exports.createCategoryShop = async (body, file) => {
  const thumb = file?.path;
  if (thumb) {
    body.csThumb = thumb;
  }

  const requiredFields = ["csName", "shopId"];
  const missing = requiredFields.filter((field) => !body[field]);
  if (missing.length) {
    const err = new Error(`Missing fields: ${missing.join(", ")}`);
    err.status = 400;
    throw err;
  }

  body.csName = String(body.csName).trim();
  body.csSlug = slugify(body.csName, { lower: true });

  // chặn trùng slug trong cùng shop
  const existed = await CategoryShop.findOne({
    shopId: body.shopId,
    csName: body.csName,
  });
  if (existed) {
    const err = new Error("Danh mục này đã tồn tại trong shop");
    err.status = 409;
    throw err;
  }

  const doc = await CategoryShop.create(body);

  return {
    success: true,
    message: "Tạo danh mục shop thành công",
    categoryShop: doc,
  };
};

exports.getCategoryShops = async (query) => {
  //console.log("Nhận điều kiện lọc shop:", query);
  const { shopId, sort } = query;

  const filter = {};

  // Nếu có shopId thì kiểm tra hợp lệ và tồn tại
  if (shopId) {
    const shop = await Shop.findById(shopId).select("_id shopName");
    if (!shop) {
      const err = new Error("Không tìm thấy shop tương ứng với shopId");
      err.status = 404;
      throw err;
    }
    filter.shopId = shopId;
  }

  // Map sort options
  const sortMap = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    name_asc: { csName: 1 },
    name_desc: { csName: -1 },
  };
  const sortOption = sortMap[sort] || { createdAt: 1 };

  const items = await CategoryShop.find(filter)
    .sort(sortOption)
    .populate("shopId", "shopName")
    .lean();

  return {
    success: true,
    message: "Lấy danh mục shop thành công",
    categoryShops: items,
  };
};

// Cập nhật (csId từ params, shopId từ body)
exports.updateCategoryShop = async (csId, shopId, body, file) => {
  if (!csId || !shopId) {
    const e = new Error("Thiếu csId hoặc shopId");
    e.status = 400;
    throw e;
  }

  const dataUpdate = {};
  if (body?.csName) {
    dataUpdate.csName = body.csName;
    dataUpdate.csSlug = slugify(body.csName, { lower: true });

    // check slug trùng trong shop (khác chính nó)
    const dup = await CategoryShop.findOne({
      shopId,
      csSlug: dataUpdate.csSlug,
      _id: { $ne: csId },
    });
    if (dup) {
      const e = new Error("Slug đã tồn tại trong shop");
      e.status = 409;
      throw e;
    }
  }
  if (file) dataUpdate.csThumb = file.path;

  const updated = await CategoryShop.findOneAndUpdate(
    { _id: csId, shopId },
    dataUpdate,
    { new: true }
  );
  if (!updated) {
    const err = new Error("Không tìm thấy danh mục của shop");
    err.status = 404;
    throw err;
  }

  return {
    success: true,
    message: "Cập nhật danh mục shop thành công",
    categoryShop: updated,
  };
};

// Xoá (csId từ params, shopId từ body)
exports.deleteCategoryShop = async (csId, shopId) => {
  if (!csId || !shopId) {
    const e = new Error("Thiếu csId hoặc shopId");
    e.status = 400;
    throw e;
  }

  const deleted = await CategoryShop.findOneAndDelete({ _id: csId, shopId });
  if (!deleted) {
    const e = new Error("Không tìm thấy danh mục của shop");
    e.status = 404;
    throw e;
  }

  return { success: true, message: "Xoá danh mục shop thành công" };
};
