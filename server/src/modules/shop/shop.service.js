//  shop/shop.service.js
//import model
const Shop = require("./entitties/shop.model");
const ServicePlan = require("./entitties/service-plan.model");
const ShopSubscribe = require("./entitties/shop-subscribe.model");
const CategoryShop = require("./entitties/category-shop.model");
const slugify = require("slugify");
const UserService = require("../user/user.service");
const NotificationService = require("../notification/notification.service");
const OrderService = require("../order/order.service");
const productService = require("../product/product.service");
const { formatCurrency } = require("../../ultils/databaseHelpers");
const { getSystemOwnerId } = require("../../ultils/systemOwner");
const mongoose = require("mongoose");

//Shop
// shop.service.js

exports.createShop = async (body, files, io) => {
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

  const notiData = {
    recipientId: body.userId,
    recipientRole: "shop",
    title: "Tạo cửa hàng thành công!",
    message: `Cửa hàng "${shop.shopName}" đã được tạo. Bắt đầu kinh doanh ngay!`,
    link: `/shop/${shop.shopSlug}`,
    type: "SHOP_CREATED",
    sourceId: shop._id,
    sourceModel: "Shop",
  };

  try {
    await NotificationService.createNotificationAndEmit(notiData, io);
  } catch (err) {
    console.error("[Thông báo] Lỗi khi gửi tạo shop:", err.message);
  }

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
function getStatusText(status) {
  const map = {
    approved: "Đã được duyệt",
    blocked: "Đã bị khóa",
    pending: "Đang chờ duyệt",
  };
  return map[status] || status;
}

exports.getShops = async (query) => {
  const {
    shopId,
    userId,
    s, // Từ khóa tìm kiếm (theo tên)
    status, // Trạng thái shop: pending / active / banned
    isMall, // Lọc shop mall
    sort = "-createdAt", // Thứ tự sắp xếp
    limit, // Giới hạn kết quả
    includeSubscription,
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

  if (shops.length === 0) {
    return {
      success: true,
      message: "Lấy danh sách shop thành công",
      shops: [],
    };
  }

  const shopIds = shops.map((shop) => shop._id);

  // Đảm bảo dữ liệu gói là chính xác nhất trước khi đọc
  await syncExpiredActiveSubscriptions(shopIds);

  // === BƯỚC 2: GẮN SUBSCRIPTION NẾU CÓ FLAG ===
  if (includeSubscription === "true" || includeSubscription === true) {
    // 1. Tìm tất cả các gói đăng ký active cho các shops này
    const activeSubs = await ShopSubscribe.find({
      shopId: { $in: shopIds },
      subStatus: "active",
    })
      .populate(
        "serviceId",
        "serviceName servicePrice serviceBillingCycle serviceFeatures serviceDescription serviceColor"
      )
      .lean();

    // 2. Map subs theo shopId để dễ tra cứu
    const subsMap = activeSubs.reduce((acc, sub) => {
      acc[sub.shopId] = sub;
      return acc;
    }, {});

    // 3. Gắn subscription vào từng shop
    shops.forEach((shop) => {
      shop.activeSubscription = subsMap[shop._id] || null;

      if (shop.activeSubscription) {
        shop.currentService = shop.activeSubscription.serviceId || null;
      } else {
        shop.currentService = null;
      }
    });
  }

  return {
    success: true,
    message: "Lấy danh sách shop thành công",
    shops,
  };
};

exports.updateShop = async (userId, body, files, io) => {
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

  // Cập nhật shop trong DB
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
  if (payload.shopStatus || payload.isDeleted) {
    recalculateAndSyncShopProducts(updated._id);
  }

  // Gửi thông báo khi thay đổi trạng thái
  if (payload.shopStatus) {
    const notiData = {
      recipientId: userId,
      recipientRole: "shop",
      title: `Cập nhật trạng thái cửa hàng`,
      message: `Trạng thái cửa hàng đã được thay đổi thành: "${getStatusText(
        payload.shopStatus
      )}"`,
      type: "SHOP_STATUS_UPDATE",
      sourceId: updated._id,
      sourceModel: "Shop",
    };

    try {
      await NotificationService.createNotificationAndEmit(notiData, io);
    } catch (err) {
      console.error("[Lỗi] Gửi thông báo thất bại:", err.message);
    }
  }

  await syncExpiredActiveSubscriptions([updated._id]);

  const activeSub = await ShopSubscribe.findOne({
    shopId: updated._id,
    subStatus: "active",
  }).populate(
    "serviceId",
    "serviceName servicePrice serviceBillingCycle serviceFeatures serviceDescription serviceColor"
  );

  const shopPlain = updated.toObject();

  shopPlain.activeSubscription = activeSub || null;
  shopPlain.currentService = activeSub?.serviceId || null;

  return {
    success: true,
    message: "Cập nhật shop thành công",
    shop: shopPlain,
  };
};

exports.deleteShop = async (userId, body, io) => {
  const { isAdmin } = body || {};

  if (!userId) {
    const err = new Error("Thiếu userId");
    err.status = 400;
    throw err;
  }

  if (!isAdmin) {
    //1.1 Kiểm tra đơn hàng chưa hoàn tất
    const orderStats = await OrderService.getOrderCountsByStatus({
      shopId: userId,
    });

    if (orderStats.success && orderStats.counts) {
      const pendingCount = orderStats.counts["Pending"] || 0;
      const confirmedCount = orderStats.counts["Confirmed"] || 0;
      const shippingCount = orderStats.counts["Shipping"] || 0;
      const totalActiveOrders = pendingCount + confirmedCount + shippingCount;

      if (totalActiveOrders > 0) {
        const err = new Error(
          `Không thể xoá shop vì còn ${totalActiveOrders} đơn hàng chưa hoàn tất.`
        );
        err.status = 400;
        throw err;
      }
    }

    // 1.2 Kiểm tra số dư
    try {
      const balanceResult = await UserService.getBalanceByUserIdAndFor(
        userId,
        "shop"
      );

      if (balanceResult?.success && balanceResult?.balance) {
        const currentBalance = balanceResult.balance.balanceCurrent || 0;

        if (currentBalance > 0) {
          const formattedMoney = formatCurrency(currentBalance);

          const err = new Error(
            `Ví cửa hàng vẫn còn dư ${formattedMoney}. Vui lòng rút hết tiền trước khi xóa shop.`
          );
          err.status = 400;
          throw err;
        }
      }
    } catch (error) {
      if (error.status === 400) throw error;

      console.error("[Delete Shop] Lỗi kiểm tra số dư:", error);
      const err = new Error("Lỗi hệ thống khi kiểm tra số dư ví shop.");
      err.status = 500;
      throw err;
    }
  }

  const deleted = await Shop.findByIdAndUpdate(
    userId,
    {
      $set: {
        isDeleted: true,
        deletedAt: new Date(),
        ...(isAdmin && { shopStatus: "blocked" }),
      },
    },
    { new: true }
  );

  if (!deleted) {
    const err = new Error("Không tìm thấy shop để xoá");
    err.status = 404;
    throw err;
  }
  await productService.syncShopStatusToProducts(userId, false);

  // 3.1 Xóa role
  try {
    const SHOP_ROLE_NAME = "shop";
    const roleResult = await UserService.getRole({ roleName: SHOP_ROLE_NAME });
    const shopRole = roleResult.role;

    if (shopRole) {
      if (UserService.removeUserRole) {
        await UserService.removeUserRole({
          userId: userId,
          roleId: shopRole._id,
        });
      }
    }
  } catch (error) {
    console.error(
      `[Role Sync] Lỗi khi xóa vai trò 'shop' cho user ${userId}:`,
      error.message
    );
  }

  //Xoa so du
  try {
    const balanceFor = "shop";
    await UserService.deleteBalance(userId, balanceFor);
  } catch (error) {
    console.error(
      `[Delete Balance] Lỗi khi xóa ví 'shop' cho user ${userId}:`,
      error.message
    );
  }

  // 3.2 Chuẩn bị nội dung thông báo tùy ngữ cảnh
  const notiTitle = isAdmin
    ? "Cửa hàng đã bị xóa bởi Admin"
    : "Cửa hàng đã bị xóa";
  const notiMessage = isAdmin
    ? `Cửa hàng "${deleted.shopName}" đã bị Quản trị viên xóa.`
    : `Cửa hàng "${deleted.shopName}" của bạn đã xoá thành công.`;

  const notiData = {
    recipientId: userId,
    recipientRole: "shop",
    title: notiTitle,
    message: notiMessage,
    link: `/user/notifications`,
    type: "SHOP_DELETED",
    sourceId: deleted._id,
    sourceModel: "Shop",
  };

  try {
    await NotificationService.createNotificationAndEmit(notiData, io);
  } catch (err) {
    console.error("[Thông báo] Lỗi khi gửi xóa shop:", err.message);
  }

  return {
    success: true,
    message: isAdmin
      ? "Đã cưỡng chế xóa shop thành công"
      : "Xoá shop thành công",
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
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { shopId, serviceId, subExpirationDate, subAutoRenew, subPrice } =
      body;
    const systemId = await getSystemOwnerId();

    if (!shopId || !serviceId || !subExpirationDate || subPrice == null) {
      const err = new Error("Thiếu thông tin đăng ký gói dịch vụ");
      err.status = 400;
      throw err;
    }

    const subscription = await ShopSubscribe.create(
      [
        {
          shopId,
          serviceId,
          subExpirationDate: new Date(subExpirationDate),
          subAutoRenew: subAutoRenew ?? false,
          subPrice,
          subStatus: "active",
        },
      ],
      { session }
    ).then((res) => res[0]);

    await UserService.updateBalance(
      systemId,
      "admin",
      subPrice,
      {
        tranType: "service_payment",
        tranDescriptions: `Thu phí gói dịch vụ từ shop ${shopId}`,
        tranRelatedId: subscription._id,
        tranRelatedModel: "ShopSubscribe",
      },
      session
    );

    // 3. Tăng subscriber count

    await exports.incrementSubscriberCount(serviceId, 1);

    await session.commitTransaction();
    await recalculateAndSyncShopProducts(shopId);

    return {
      success: true,
      message: "Đăng ký dịch vụ thành công",
      subscription,
    };
  } catch (error) {
    await session.abortTransaction();

    if (subscription?._id) {
      try {
        await exports.incrementSubscriberCount(serviceId, -1);
      } catch (e) {
        console.error("Không thể rollback subscriber count:", e);
      }
    }

    throw error;
  } finally {
    session.endSession();
  }
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

/**
 */
// === HÀM PHỤ TRỢ ===
// Tính lại và đồng bộ trạng thái sản phẩm của shop dựa trên trạng thái shop và gói dịch vụ
const recalculateAndSyncShopProducts = async (shopId) => {
  try {
    // 1. Lấy thông tin Shop
    const shop = await Shop.findById(shopId).select("shopStatus isDeleted");
    if (!shop || shop.isDeleted) {
      await productService.syncShopStatusToProducts(shopId, false);
      return;
    }

    // 2. Nếu shop bị khóa/chờ duyệt -> Ẩn ngay, không cần check gói
    if (shop.shopStatus !== "approved") {
      await productService.syncShopStatusToProducts(shopId, false);
      return;
    }

    // 3. Nếu shop Approved -> Kiểm tra xem còn gói Active không
    const now = new Date();
    const activeSub = await ShopSubscribe.findOne({
      shopId: shopId,
      subStatus: "active",
      subExpirationDate: { $gt: now },
    });

    const isShopActive = !!activeSub;

    // 4. Gọi ProductService để update
    await productService.syncShopStatusToProducts(shopId, isShopActive);
  } catch (error) {
    console.error(`[Sync Product] Lỗi đồng bộ shop ${shopId}:`, error.message);
  }
};

//Dam bao dong bo cac goi het han truoc khi tra danh sach shop
const syncExpiredActiveSubscriptions = async (shopIds) => {
  if (!shopIds || shopIds.length === 0) return;

  const now = new Date();

  // 1. Tìm các gói active có thời hạn hết trong quá khứ
  const subscriptions = await ShopSubscribe.find({
    shopId: { $in: shopIds },
    subStatus: "active",
    subExpirationDate: { $lt: now },
  }).select("_id shopId"); // Lấy thêm shopId

  if (subscriptions.length === 0) return;

  const toUpdateIds = subscriptions.map((sub) => sub._id);

  // Lấy danh sách Shop ID bị hết hạn để update sản phẩm
  const expiredShopIds = [
    ...new Set(subscriptions.map((s) => String(s.shopId))),
  ];

  // 2. Thực hiện cập nhật trạng thái gói trong DB
  const bulkOps = toUpdateIds.map((id) => ({
    updateOne: {
      filter: { _id: id },
      update: { $set: { subStatus: "expired" } },
    },
  }));

  try {
    await ShopSubscribe.bulkWrite(bulkOps, { ordered: false });
    Promise.all(
      expiredShopIds.map((sId) =>
        productService.syncShopStatusToProducts(sId, false)
      )
    ).catch((err) =>
      console.error("Lỗi update product status khi expire:", err)
    );
  } catch (error) {
    console.error(
      "[Sync] Lỗi khi cập nhật trạng thái expired trong getShops:",
      error
    );
  }
};

// Đồng bộ trạng thái expired cho một danh sách subscription đã lấy sẵn
const syncExpiredSubscriptionsInList = async (
  subscriptions,
  now = new Date()
) => {
  if (!subscriptions || subscriptions.length === 0) return;

  const expiredSubs = subscriptions.filter(
    (sub) =>
      sub._id && sub.subExpirationDate < now && sub.subStatus !== "expired"
  );

  if (expiredSubs.length === 0) return;

  const toUpdate = expiredSubs.map((sub) => sub._id);

  const expiredShopIds = [...new Set(expiredSubs.map((s) => String(s.shopId)))];

  const bulkOps = toUpdate.map((id) => ({
    updateOne: {
      filter: { _id: id },
      update: { $set: { subStatus: "expired" } },
    },
  }));

  try {
    await ShopSubscribe.bulkWrite(bulkOps, { ordered: false });
    expiredShopIds.forEach((sId) => {
      productService
        .syncShopStatusToProducts(sId, false)
        .catch((e) => console.error(`Lỗi sync shop ${sId}:`, e));
    });
  } catch (error) {
    console.error("[Sync] Lỗi khi cập nhật trạng thái expired:", error);
  }
};

// === HÀM DÀNH CHO CRON JOB: QUÉT TOÀN BỘ HỆ THỐNG ===
exports.scanAndSyncExpiredSubscriptions = async () => {
  const now = new Date();
  console.log(
    `[Cron Scan] Bắt đầu quét gói hết hạn lúc ${now.toISOString()}...`
  );

  const BATCH_SIZE = 500; // Có thể tăng lên 500-1000 nếu server mạnh

  try {
    let processedSubs = 0;
    let processedShops = 0;

    // Tạo cursor với batchSize nhỏ để driver tự fetch từng lô từ server
    const cursor = ShopSubscribe.find({
      subStatus: "active",
      subExpirationDate: { $lt: now },
    })
      .select("_id shopId")
      .batchSize(BATCH_SIZE) // Quan trọng: driver sẽ fetch từng batch này
      .lean()
      .cursor(); // Trả về Cursor (stream)

    let batch = [];
    let currentShopIds = new Set();

    for await (const sub of cursor) {
      batch.push(sub);
      currentShopIds.add(String(sub.shopId));

      // Khi đủ một batch đầy (hoặc cuối cùng)
      if (batch.length === BATCH_SIZE || cursor.closed) {
        if (batch.length > 0) {
          const subIds = batch.map((s) => s._id);

          // Update trạng thái expired
          await ShopSubscribe.updateMany(
            { _id: { $in: subIds } },
            { $set: { subStatus: "expired" } }
          );

          processedSubs += batch.length;

          // Đồng bộ sản phẩm cho các shop trong batch này
          const syncPromises = Array.from(currentShopIds).map((shopId) =>
            recalculateAndSyncShopProducts(shopId).catch((err) =>
              console.error(
                `[Cron Scan] Lỗi đồng bộ shop ${shopId}:`,
                err.message
              )
            )
          );
          await Promise.all(syncPromises);
          processedShops += currentShopIds.size;

          console.log(
            `[Cron Scan] Đã xử lý ${batch.length} subscription (tổng: ${processedSubs}), ${currentShopIds.size} shop (tổng: ${processedShops})`
          );

          // Reset cho batch tiếp theo
          batch = [];
          currentShopIds = new Set();
        }
      }
    }

    console.log(
      `[Cron Scan] Hoàn tất. Tổng: ${processedSubs} subscription expired, ${processedShops} shop đồng bộ.`
    );
  } catch (error) {
    console.error("[Cron Scan] Lỗi nghiêm trọng:", error);
  }
};

//Subscription
exports.getSubscriptions = async (query = {}) => {
  const { shopId, serviceId, subStatus, s, sort, page = 1, limit } = query;

  // === 1. LỌC (TRỪ subStatus) ===
  const filter = {};

  if (shopId) {
    filter.shopId = Array.isArray(shopId) ? { $in: shopId } : shopId;
  }

  if (serviceId) {
    filter.serviceId = Array.isArray(serviceId)
      ? { $in: serviceId }
      : serviceId;
  }

  const now = new Date();

  // === TÌM KIẾM SERVICE ===
  if (s) {
    const keyword = String(s).trim();
    const regex = new RegExp(keyword, "i");
    const matchedPlans = await ServicePlan.find({
      $or: [{ serviceName: regex }, { serviceDescription: regex }],
    }).select("_id");

    const serviceIdsFromSearch = matchedPlans.map((p) => p._id);
    if (!serviceIdsFromSearch.length) {
      return {
        success: true,
        message: "Không tìm thấy kết quả.",
        subscriptions: [],
        meta: { total: 0, page: 1, limit: null, totalPages: 0 },
      };
    }

    if (filter.serviceId) {
      const existing = Array.isArray(filter.serviceId.$in)
        ? filter.serviceId.$in
        : [filter.serviceId];
      const intersect = existing.filter((id) =>
        serviceIdsFromSearch.some((sId) => String(sId) === String(id))
      );
      if (!intersect.length) {
        return {
          success: true,
          message: "Không tìm thấy kết quả.",
          subscriptions: [],
          meta: { total: 0, page: 1, limit: null, totalPages: 0 },
        };
      }
      filter.serviceId = { $in: intersect };
    } else {
      filter.serviceId = { $in: serviceIdsFromSearch };
    }
  }

  // === SORT ===
  let sortOption = { createdAt: -1 };
  switch (sort) {
    case "oldest":
      sortOption = { createdAt: 1 };
      break;
    case "newest":
      sortOption = { createdAt: -1 };
      break;
    case "exp_asc":
      sortOption = { subExpirationDate: 1 };
      break;
    case "exp_desc":
      sortOption = { subExpirationDate: -1 };
      break;
  }

  // === PHÂN TRANG ===
  const p = Math.max(1, parseInt(page, 10) || 1);
  let lim = parseInt(limit, 10);
  if (!limit || lim <= 0) lim = 0;
  else lim = Math.max(1, lim);
  const skip = lim === 0 ? 0 : (p - 1) * lim;

  // === LẤY DANH SÁCH ===
  let queryBuilder = ShopSubscribe.find(filter).sort(sortOption);
  if (lim > 0) queryBuilder = queryBuilder.skip(skip).limit(lim);

  let subs = await queryBuilder
    .populate(
      "serviceId",
      "serviceName servicePrice serviceBillingCycle serviceFeatures serviceDescription serviceColor"
    )
    .populate("shopId", "shopName shopLogo shopOfficial");

  // === 2. CẬP NHẬT EXPIRED ===
  await syncExpiredSubscriptionsInList(subs, now); // TRUYỀN now

  // Cập nhật memory
  subs.forEach((sub) => {
    if (sub.subExpirationDate < now && sub.subStatus !== "expired") {
      sub.subStatus = "expired";
    }
  });

  // === 3. LỌC subStatus (SAU KHI CẬP NHẬT) ===
  let finalSubs = subs;
  if (subStatus) {
    finalSubs = subs.filter((sub) => sub.subStatus === subStatus);
  }

  // === META ===
  const totalAfterStatusFilter = finalSubs.length;
  const meta = {
    total: totalAfterStatusFilter,
    page: p,
    limit: lim === 0 ? null : lim,
    totalPages: lim === 0 ? 1 : Math.ceil(totalAfterStatusFilter / lim),
  };

  return {
    success: true,
    message: "Lấy danh sách đăng ký thành công",
    subscriptions: finalSubs,
    meta,
  };
};

exports.cancelSubscription = async (subId) => {
  const updated = await ShopSubscribe.findByIdAndUpdate(
    subId,
    { subStatus: "canceled" },
    { new: true }
  );

  // Thêm kiểm tra
  if (!updated) {
    const err = new Error("Không tìm thấy đăng ký gói dịch vụ để hủy");
    err.status = 404;
    throw err;
  }

  // LẤY serviceId TỪ BẢN GHI VỪA CẬP NHẬT
  const serviceIdToUpdate = updated.serviceId;

  // Truyền serviceId chính xác vào hàm cập nhật số lượng
  await exports.incrementSubscriberCount(serviceIdToUpdate, -1);

  return {
    success: true,
    message: "Hủy đăng ký thành công",
    subscription: updated,
  };
};

// servicePlan.service.js
exports.incrementSubscriberCount = async (serviceId, amount = 1) => {
  if (!serviceId) return;

  try {
    const plan = await ServicePlan.findById(serviceId).select(
      "serviceSubscriberCount"
    );
    if (!plan) return;
    const current = plan.serviceSubscriberCount || 0;
    const newCount = current + amount;

    if (newCount < 0) {
      await ServicePlan.findByIdAndUpdate(serviceId, {
        serviceSubscriberCount: 0,
      });
    } else {
      await ServicePlan.findByIdAndUpdate(serviceId, {
        $inc: { serviceSubscriberCount: amount },
      });
    }
  } catch (error) {
    if (
      error.name === "ValidationError" &&
      error.errors?.serviceSubscriberCount
    ) {
      return;
    }
    throw error;
  }
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

  // Truy vấn
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
