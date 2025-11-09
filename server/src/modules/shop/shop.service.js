//  shop/shop.service.js
//import model
const Shop = require("./entitties/shop.model");
const ServicePlan = require("./entitties/service-plan.model");
const ShopSubscribe = require("./entitties/shop-subscribe.model");
const CategoryShop = require("./entitties/category-shop.model");
const slugify = require("slugify");

//Shop
// shop.service.js

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

  // 4. Check trùng shop (1 user chỉ 1 shop "chưa bị xoá")
  const existed = await Shop.findOne({
    _id: body.userId,
    isDeleted: false,
  });
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

  const shop = await Shop.findOne({ _id: userId, isDeleted: false });
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
  const {
    shopId,
    userId,
    s, // Từ khóa tìm kiếm (theo tên)
    status, // Trạng thái shop: pending / active / banned
    isMall, // Lọc shop mall
    sort = "-createdAt", // Thứ tự sắp xếp
    limit, // Giới hạn kết quả
  } = query;

  const filter = {};

  // luôn chỉ lấy shop chưa bị xoá (tương đương trước đây xoá cứng)
  filter.isDeleted = false;

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

  // Tìm kiếm theo tên
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

  // Lọc shop mall (chính hãng)
  if (isMall === "true" || isMall === true) {
    filter.shopIsOfficial = true;
  }

  // Sort động
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
    sortOption = sort;
  }

  const shops = await Shop.find(filter)
    .sort(sortOption)
    .limit(limit ? Number(limit) : 0)
    .lean();

  return {
    success: true,
    message: "Lấy danh sách shop thành công",
    shops,
  };
};

exports.updateShop = async (userId, body, files) => {
  if (!userId) {
    const err = new Error("Thiếu userId");
    err.status = 400;
    throw err;
  }

  const payload = { ...body };

  // Chuẩn hóa tên shop
  if (payload.shopName) {
    payload.shopName = String(payload.shopName).trim();
    payload.shopSlug = slugify(payload.shopName, { lower: true });
  }

  // ========== LOGO ==========
  if (files?.shopLogo?.[0]) {
    payload.shopLogo = files.shopLogo[0].path;
  }

  // ========== BACKGROUND ==========
  if (files?.shopBackground?.[0]) {
    payload.shopBackground = files.shopBackground[0].path;
  } else {
    if (Object.prototype.hasOwnProperty.call(payload, "shopBackground")) {
      // giữ nguyên giá trị FE gửi (có thể là "")
    }
  }

  // ========== BANNER ==========
  if (Array.isArray(files?.shopBanner) && files.shopBanner.length > 0) {
    payload.shopBanner = files.shopBanner.map((f) => f.path).filter(Boolean);
  } else {
    if (Object.prototype.hasOwnProperty.call(payload, "shopBanner")) {
      if (
        typeof payload.shopBanner === "string" &&
        payload.shopBanner.trim() === "[]"
      ) {
        payload.shopBanner = [];
      }
    }
  }

  // Chỉ update shop chưa bị xoá
  const updated = await Shop.findOneAndUpdate(
    { _id: userId, isDeleted: false },
    payload,
    { new: true }
  );

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

  // Xoá mềm: đánh dấu isDeleted + deletedAt
  const deleted = await Shop.findByIdAndUpdate(
    userId,
    {
      $set: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    },
    { new: true }
  );

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

exports.incrementShopSoldCount = async (shopId, qty = 1) => {
  if (!shopId) {
    const err = new Error("Thiếu shopId");
    err.status = 400;
    throw err;
  }

  const qtyNum = Math.max(1, Math.floor(qty));

  const updated = await Shop.findOneAndUpdate(
    { _id: shopId, isDeleted: false },
    { $inc: { shopSoldCount: qtyNum } },
    { new: true, select: "shopSoldCount" }
  );

  if (!updated) {
    const err = new Error("Không tìm thấy shop");
    err.status = 404;
    throw err;
  }

  return {
    success: true,
    message: "Cập nhật số lượng bán thành công",
    shopSoldCount: updated.shopSoldCount,
  };
};

//Service Plan
// helper chuẩn hoá serviceFeatures

// Chuẩn hoá mảng quyền lợi
const normalizeFeatures = (features) => {
  if (!Array.isArray(features)) return [];

  return features
    .filter((f) => f && f.key && f.label)
    .map((f) => {
      const typeList = ["string", "number", "boolean"];
      const normalizedType = typeList.includes(f.type) ? f.type : "string";

      const obj = {
        key: String(f.key).trim(),
        label: String(f.label).trim(),
        value:
          f.value === null || f.value === undefined
            ? ""
            : String(f.value).trim(),
        type: normalizedType,
      };

      if (f.unit !== undefined && f.unit !== null) {
        obj.unit = String(f.unit).trim();
      }

      return obj;
    });
};

// =============== CREATE =================
exports.createServicePlan = async (body) => {
  const {
    serviceName,
    serviceDescription,
    serviceBillingCycle,
    servicePrice,
    serviceColor,
    serviceFeatures,
  } = body;

  if (!serviceName || !serviceBillingCycle || servicePrice == null) {
    const err = new Error(
      "Thiếu serviceName, serviceBillingCycle hoặc servicePrice"
    );
    err.status = 400;
    throw err;
  }

  const trimmedName = String(serviceName).trim();

  // kiểm tra trùng (name + billingCycle) trong các gói chưa xoá
  const existing = await ServicePlan.findOne({
    serviceName: trimmedName,
    serviceBillingCycle,
    isDeleted: false,
  });

  if (existing) {
    const err = new Error(
      "Gói với tên này và chu kỳ này đã tồn tại (vui lòng chọn tên khác hoặc chu kỳ khác)"
    );
    err.status = 400;
    throw err;
  }

  const plan = await ServicePlan.create({
    serviceName: trimmedName,
    serviceDescription: serviceDescription || "",
    serviceBillingCycle,
    servicePrice,
    serviceColor: serviceColor || "#ffffff",
    serviceFeatures: normalizeFeatures(serviceFeatures),
  });

  return {
    success: true,
    message: "Tạo gói dịch vụ thành công",
    plan,
  };
};

// =============== GET LIST =================
exports.getServicePlans = async (query = {}) => {
  const { s, includeDeleted, isDeleted, sort } = query;

  const filter = {};

  // 1. Lọc xóa mềm
  if (includeDeleted === "true" || includeDeleted === true) {
    if (isDeleted === "true" || isDeleted === true) filter.isDeleted = true;
    else if (isDeleted === "false" || isDeleted === false)
      filter.isDeleted = false;
  } else {
    filter.isDeleted = false;
  }

  // 2. Keyword
  if (s) {
    const keyword = String(s).trim();
    const regex = new RegExp(keyword, "i");
    filter.$or = [{ serviceName: regex }, { serviceDescription: regex }];
  }

  // 4. Sort
  let sortOption = {};
  switch (sort) {
    case "oldest":
      sortOption = { createdAt: 1 };
      break;
    case "newest":
      sortOption = { createdAt: -1 };
      break;
    case "name_asc":
      sortOption = { serviceName: 1 };
      break;
    case "name_desc":
      sortOption = { serviceName: -1 };
      break;
    case "price_asc":
      sortOption = { servicePrice: 1 };
      break;
    case "price_desc":
      sortOption = { servicePrice: -1 };
      break;
    case "billingCycle_monthly":
      filter.serviceBillingCycle = "monthly";
      sortOption = { createdAt: -1 };
      break;
    case "billingCycle_yearly":
      filter.serviceBillingCycle = "yearly";
      sortOption = { createdAt: -1 };
      break;
    default:
      sortOption = { createdAt: -1 };
      break;
  }

  const plans = await ServicePlan.find(filter).sort(sortOption);

  return {
    success: true,
    message: "Lấy danh sách gói dịch vụ thành công",
    plans,
  };
};

// =============== UPDATE =================
exports.updateServicePlan = async (sid, body) => {
  const {
    serviceName,
    serviceDescription,
    serviceBillingCycle,
    servicePrice,
    serviceColor,
    serviceFeatures,
  } = body;
  console.log("Duoc goi", body, sid);

  // lấy gói hiện tại để tính newName / newCycle
  const current = await ServicePlan.findOne({ _id: sid, isDeleted: false });
  if (!current) {
    const err = new Error("Không tìm thấy gói dịch vụ để cập nhật");
    err.status = 404;
    throw err;
  }

  const newName =
    serviceName !== undefined
      ? String(serviceName).trim()
      : current.serviceName;

  const newCycle =
    serviceBillingCycle !== undefined
      ? serviceBillingCycle
      : current.serviceBillingCycle;

  // check trùng (name + billing) với gói khác
  const existing = await ServicePlan.findOne({
    _id: { $ne: sid },
    serviceName: newName,
    serviceBillingCycle: newCycle,
    isDeleted: false,
  });

  if (existing) {
    const err = new Error("Tên gói + chu kỳ này đã được sử dụng bởi gói khác");
    err.status = 400;
    throw err;
  }

  const dataUpdate = {};

  if (serviceName !== undefined) {
    dataUpdate.serviceName = newName;
  }
  if (serviceDescription !== undefined) {
    dataUpdate.serviceDescription = serviceDescription;
  }
  if (serviceBillingCycle !== undefined) {
    dataUpdate.serviceBillingCycle = newCycle;
  }
  if (servicePrice !== undefined) {
    dataUpdate.servicePrice = servicePrice;
  }
  if (serviceColor !== undefined) {
    dataUpdate.serviceColor = serviceColor;
  }
  if (serviceFeatures !== undefined) {
    dataUpdate.serviceFeatures = normalizeFeatures(serviceFeatures);
  }

  const updated = await ServicePlan.findOneAndUpdate(
    { _id: sid, isDeleted: false },
    dataUpdate,
    { new: true }
  );

  if (!updated) {
    const err = new Error("Không tìm thấy gói dịch vụ để cập nhật");
    err.status = 404;
    throw err;
  }

  return {
    success: true,
    message: "Cập nhật gói dịch vụ thành công",
    plan: updated,
  };
};

// =============== DELETE (SOFT) =================
exports.deleteServicePlan = async (sid) => {
  // Nếu có ShopSubscribe thì dùng typeof để không bị ReferenceError
  if (typeof ShopSubscribe !== "undefined" && ShopSubscribe) {
    const isUsed = await ShopSubscribe.findOne({ serviceId: sid });
    if (isUsed) {
      const err = new Error("Không thể xoá gói vì đang được sử dụng bởi shop.");
      err.status = 400;
      throw err;
    }
  }

  const deleted = await ServicePlan.findByIdAndUpdate(
    sid,
    {
      $set: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    },
    { new: true }
  );

  if (!deleted) {
    const err = new Error("Không tìm thấy gói dịch vụ để xoá");
    err.status = 404;
    throw err;
  }

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
  const { shopId, sort, s } = query;
  const filter = {};

  // Nếu có shopId → kiểm tra hợp lệ
  if (shopId) {
    const shop = await Shop.findById(shopId).select("_id shopName");
    if (!shop) {
      const err = new Error("Không tìm thấy shop tương ứng với shopId");
      err.status = 404;
      throw err;
    }
    filter.shopId = shopId;
  }

  // Nếu có từ khóa tìm kiếm (theo csName)
  if (s && typeof s === "string" && s.trim() !== "") {
    // Tìm tên danh mục chứa 1 phần chuỗi từ khóa (không phân biệt hoa/thường)
    filter.csName = { $regex: s.trim(), $options: "i" };
  }

  // Sắp xếp
  const sortMap = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    name_asc: { csName: 1 },
    name_desc: { csName: -1 },
  };
  const sortOption = sortMap[sort] || { createdAt: 1 };

  // ⚙️ Truy vấn
  const items = await CategoryShop.find(filter)
    .sort(sortOption)
    .populate("shopId", "shopName")
    .lean();

  return {
    success: true,
    message: "Lấy danh mục shop thành công",
    categoryShops: items,
    count: items.length,
  };
};

// Cập nhật (csId từ params, shopId từ body)
exports.updateCategoryShop = async (csId, shopId, body, file) => {
  //console.log("Duoc goi cap nhat", body);
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
exports.deleteCategoryShop = async (csId) => {
  //console.log("Giu lieu gui den", csId);
  if (!csId) {
    const e = new Error("Thiếu csId");
    e.status = 400;
    throw e;
  }

  const deleted = await CategoryShop.findOneAndDelete({ _id: csId });
  if (!deleted) {
    const e = new Error("Không tìm thấy danh mục của shop");
    e.status = 404;
    throw e;
  }

  return { success: true, message: "Xoá danh mục shop thành công" };
};

// =============== SHOP DASHBOARD FOR ADMIN =================
exports.getShopDashboardStats = async (query = {}) => {
  const { limit } = query;
  const match = { isDeleted: false };

  // Nếu có truyền limit thì giới hạn, không thì lấy hết
  const limitNum = parseInt(limit, 10);
  const hasLimit = !isNaN(limitNum) && limitNum > 0;

  const [result] = await Shop.aggregate([
    { $match: match },
    {
      $facet: {
        // 1) Tóm tắt tổng quan
        summary: [
          {
            $group: {
              _id: null,
              totalShops: { $sum: 1 },
              pendingCount: {
                $sum: {
                  $cond: [{ $eq: ["$shopStatus", "pending"] }, 1, 0],
                },
              },
              approvedCount: {
                $sum: {
                  $cond: [{ $eq: ["$shopStatus", "approved"] }, 1, 0],
                },
              },
              blockedCount: {
                $sum: {
                  $cond: [{ $eq: ["$shopStatus", "blocked"] }, 1, 0],
                },
              },
              officialCount: {
                $sum: {
                  $cond: [{ $eq: ["$shopIsOfficial", true] }, 1, 0],
                },
              },
              totalSold: { $sum: "$shopSoldCount" },
              totalProducts: { $sum: "$shopProductCount" },
              avgRating: { $avg: "$shopRateAvg" },
            },
          },
        ],

        // 2) Gom theo trạng thái shop
        byStatus: [
          {
            $group: {
              _id: "$shopStatus",
              count: { $sum: 1 },
              totalSold: { $sum: "$shopSoldCount" },
              totalProducts: { $sum: "$shopProductCount" },
              avgRating: { $avg: "$shopRateAvg" },
            },
          },
        ],

        // 3) Gom theo shopIsOfficial (Mall / thường)
        byOfficial: [
          {
            $group: {
              _id: "$shopIsOfficial",
              count: { $sum: 1 },
              totalSold: { $sum: "$shopSoldCount" },
              totalProducts: { $sum: "$shopProductCount" },
            },
          },
        ],

        // 4) Top shop bán nhiều nhất
        topSold: [
          { $sort: { shopSoldCount: -1, _id: 1 } },
          ...(hasLimit ? [{ $limit: limitNum }] : []),
          {
            $project: {
              shopName: 1,
              shopLogo: 1,
              shopSlug: 1,
              shopStatus: 1,
              shopIsOfficial: 1,
              shopSoldCount: 1,
              shopProductCount: 1,
              shopRateAvg: 1,
              shopRateCount: 1,
              shopCreateAt: 1,
            },
          },
        ],

        // 5) Top shop bán ít nhất
        bottomSold: [
          { $sort: { shopSoldCount: 1, _id: 1 } },
          ...(hasLimit ? [{ $limit: limitNum }] : []),
          {
            $project: {
              shopName: 1,
              shopLogo: 1,
              shopSlug: 1,
              shopStatus: 1,
              shopIsOfficial: 1,
              shopSoldCount: 1,
              shopProductCount: 1,
              shopRateAvg: 1,
              shopRateCount: 1,
              shopCreateAt: 1,
            },
          },
        ],
      },
    },
    {
      $project: {
        summary: { $arrayElemAt: ["$summary", 0] },
        byStatus: 1,
        byOfficial: 1,
        topSold: 1,
        bottomSold: 1,
      },
    },
  ]);

  const safeSummary = result?.summary || {
    totalShops: 0,
    pendingCount: 0,
    approvedCount: 0,
    blockedCount: 0,
    officialCount: 0,
    totalSold: 0,
    totalProducts: 0,
    avgRating: 0,
  };

  return {
    success: true,
    message: "Lấy thống kê shop cho hệ thống thành công",
    data: {
      summary: safeSummary,
      byStatus: result?.byStatus || [],
      byOfficial: result?.byOfficial || [],
      topSold: result?.topSold || [],
      bottomSold: result?.bottomSold || [],
    },
  };
};
