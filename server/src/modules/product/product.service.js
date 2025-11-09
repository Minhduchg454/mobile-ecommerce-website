const Product = require("./entities/product.model");
const Brand = require("./entities/brand.model");
const Category = require("./entities/category.model");
const slugify = require("slugify");
const ProductVariation = require("./entities/productVariation.model");
const SpecificProduct = require("./entities/specificProduct.model");
const Theme = require("./entities/theme.model");
const ProductTheme = require("./entities/product-theme.model");
const { Types } = require("mongoose");
const { ObjectId } = require("mongoose").Types;
const ShopService = require("../shop/shop.service");
const mongoose = require("mongoose");

/**
 Backend sử dụng MongoDB, nhưng module ObjectId (thường từ mongodb hoặc mongoose) không được import trong file product.service.js. Điều này khiến việc parse after cursor thất bại, và backend không thể tạo điều kiện $or để lọc các bản ghi tiếp theo.
 */

/*
 *Category service
 */
exports.createCategory = async (body, file) => {
  const { categoryName } = body;
  if (!categoryName || !file) {
    const err = new Error("Thiếu tên danh mục hoặc hình ảnh đại diện");
    err.status = 400;
    throw err;
  }

  const slug = slugify(categoryName, { lower: true });

  const existing = await Category.findOne({
    isDeleted: false,
    $or: [{ categoryNameName: categoryName.trim() }, { categorySlug: slug }],
  });

  if (existing) {
    const conflictField =
      existing.categoryName === categoryName.trim() ? "Tên" : "Slug";
    const err = new Error(`${conflictField} danh mục đã tồn tại`);
    err.status = 400;
    throw err;
  }

  const category = await Category.create({
    categoryName,
    categorySlug: slug,
    categoryThumb: file.path,
  });

  return {
    success: true,
    message: "Tạo danh mục thành công",
    category,
  };
};

// services/category.service.js (hoặc file bạn đang dùn

exports.getCategory = async (query = {}) => {
  const {
    s, // từ khóa tìm kiếm
    adminId, // lọc theo admin tạo
    includeDeleted,
    isDeleted,
    sort,
  } = query;

  const filter = {};

  // 1. Lọc xóa mềm
  if (includeDeleted === "true" || includeDeleted === true) {
    // được phép thấy cả deleted / not deleted
    if (isDeleted === "true" || isDeleted === true) filter.isDeleted = true;
    else if (isDeleted === "false" || isDeleted === false)
      filter.isDeleted = false;
    // nếu không truyền isDeleted thì không filter field này
  } else {
    // mặc định chỉ lấy chưa xóa
    filter.isDeleted = false;
  }

  // 2. Từ khóa s: tìm theo tên hoặc slug
  if (s) {
    const keyword = String(s).trim();
    const regex = new RegExp(keyword, "i"); // không phân biệt hoa/thường
    filter.$or = [{ categoryName: regex }, { categorySlug: regex }];
  }

  // 3. Lọc theo adminId (nếu cần)
  if (adminId && mongoose.isValidObjectId(adminId)) {
    filter.adminId = adminId;
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
      sortOption = { categoryName: 1 };
      break;
    case "name_desc":
      sortOption = { categoryName: -1 };
      break;
    default:
      // mặc định: mới nhất
      sortOption = { createdAt: -1 };
      break;
  }

  const categories = await Category.find(filter).sort(sortOption);

  return {
    success: true,
    message: "Lấy danh sách danh mục thành công",
    categories,
  };
};

exports.updateCategory = async (params, body, file) => {
  const { cId } = params;
  const { categoryName } = body;

  if (!mongoose.isValidObjectId(cId)) {
    const err = new Error("ID danh mục không hợp lệ");
    err.status = 400;
    throw err;
  }

  const dataUpdate = {};

  if (categoryName) {
    const nameTrim = categoryName.trim();
    const slug = slugify(nameTrim, { lower: true });

    const existing = await Category.findOne({
      _id: { $ne: cId }, // loại bản ghi hiện tại
      isDeleted: false,
      $or: [{ categoryName: nameTrim }, { categorySlug: slug }],
    });

    if (existing) {
      const conflictField =
        existing.categoryName === nameTrim ? "Tên danh mục" : "Slug danh mục";
      const err = new Error(`${conflictField} đã tồn tại`);
      err.status = 400;
      throw err;
    }

    dataUpdate.categoryName = nameTrim;
    dataUpdate.categorySlug = slug;
  }

  if (file) {
    dataUpdate.categoryThumb = file.path;
  }

  // Nếu không có gì để update
  if (Object.keys(dataUpdate).length === 0) {
    const err = new Error("Không có dữ liệu nào để cập nhật");
    err.status = 400;
    throw err;
  }

  const updatedCategory = await Category.findOneAndUpdate(
    { _id: cId, isDeleted: false },
    { $set: dataUpdate },
    { new: true }
  );

  if (!updatedCategory) {
    const err = new Error("Không tìm thấy danh mục để cập nhật");
    err.status = 404;
    throw err;
  }

  return {
    success: true,
    message: "Cập nhật danh mục thành công",
    category: updatedCategory,
  };
};

exports.deteleCategory = async (cId) => {
  const isUsed = await Product.findOne({ categoryId: cId });

  if (isUsed) {
    const err = new Error(
      "Không thể xoá danh mục vì đang được sử dụng bởi sản phẩm."
    );
    err.status = 400;
    throw err;
  }
  await Category.findByIdAndUpdate(cId, {
    $set: {
      isDeleted: true,
      deletedAt: new Date(),
    },
  });

  return {
    success: true,
    message: "Xóa danh mục thành công",
  };
};

/*
 *Brand service
 */

exports.createBrand = async (body, file) => {
  const { brandName } = body;
  if (!brandName || !file) {
    const err = new Error("Thiếu tên thương hiệu hoặc hình ảnh đại diện");
    err.status = 400;
    throw err;
  }
  const slug = slugify(brandName.trim(), { lower: true });

  const existing = await Brand.findOne({
    isDeleted: false,
    $or: [{ brandName: brandName.trim() }, { brandSlug: slug }],
  });

  if (existing) {
    const conflictField =
      existing.brandName === brandName.trim() ? "Tên" : "Slug";
    const err = new Error(`${conflictField} thương hiệu đã tồn tại`);
    err.status = 400;
    throw err;
  }

  const brand = await Brand.create({
    brandName,
    brandSlug: slug,
    brandLogo: file.path,
  });

  return {
    success: true,
    message: "Tạo thương hiệu thành công",
    brand,
  };
};

// Nhớ đảm bảo file này đã có:
// const mongoose = require("mongoose");
// const Brand = require("...");

exports.getBrand = async (query = {}) => {
  const { s, brandName, includeDeleted, isDeleted, sort } = query;

  console.log("Gia tri loc nhan duoc", query);
  const filter = {};

  // 1. Lọc xóa mềm
  if (includeDeleted === "true" || includeDeleted === true) {
    // được phép thấy cả deleted / not deleted
    if (isDeleted === "true" || isDeleted === true) filter.isDeleted = true;
    else if (isDeleted === "false" || isDeleted === false)
      filter.isDeleted = false;
    // nếu không truyền isDeleted thì không filter field này
  } else {
    // mặc định chỉ lấy chưa xóa
    filter.isDeleted = false;
  }

  // 2. Từ khóa s: tìm theo tên hoặc slug
  if (s) {
    const keyword = String(s).trim();
    const regex = new RegExp(keyword, "i"); // không phân biệt hoa/thường
    filter.$or = [{ brandName: regex }, { brandSlug: regex }];
  }
  if (brandName) {
    filter.brandName = brandName;
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
      sortOption = { brandName: 1 };
      break;
    case "name_desc":
      sortOption = { brandName: -1 };
      break;
    default:
      // mặc định: mới nhất
      sortOption = { createdAt: -1 };
      break;
  }

  const brands = await Brand.find(filter).sort(sortOption);

  return {
    success: true,
    message: "Lấy danh sách thương hiệu thành công",
    brands,
  };
};

exports.updateBrand = async (params, body, file) => {
  const { bId } = params;
  const { brandName } = body;

  if (!mongoose.isValidObjectId(bId)) {
    const err = new Error("ID thương hiệu không hợp lệ");
    err.status = 400;
    throw err;
  }

  const dataUpdate = {};

  if (brandName) {
    const nameTrim = brandName.trim();
    const slug = slugify(nameTrim, { lower: true });

    const existing = await Brand.findOne({
      _id: { $ne: bId }, // loại trừ bản ghi hiện tại
      isDeleted: false,
      $or: [{ brandName: nameTrim }, { brandSlug: slug }],
    });

    if (existing) {
      const conflictField =
        existing.brandName === nameTrim
          ? "Tên thương hiệu"
          : "Slug thương hiệu";
      const err = new Error(`${conflictField} đã tồn tại`);
      err.status = 400;
      throw err;
    }

    dataUpdate.brandName = nameTrim;
    dataUpdate.brandSlug = slug;
  }

  if (file) {
    dataUpdate.brandLogo = file.path;
  }

  // Nếu chẳng có gì để update
  if (Object.keys(dataUpdate).length === 0) {
    const err = new Error("Không có dữ liệu nào để cập nhật");
    err.status = 400;
    throw err;
  }

  const updatedBrand = await Brand.findOneAndUpdate(
    { _id: bId, isDeleted: false },
    { $set: dataUpdate },
    { new: true }
  );

  if (!updatedBrand) {
    const err = new Error("Không tìm thấy thương hiệu để cập nhật");
    err.status = 404;
    throw err;
  }

  return {
    success: true,
    message: "Cập nhật thương hiệu thành công",
    brand: updatedBrand,
  };
};

exports.deleteBrand = async (bid) => {
  const isUsed = await Product.findOne({ brandId: bid });
  if (isUsed) {
    const err = new Error(
      "Không thể xoá thương hiệu vì đang được sử dụng bởi sản phẩm."
    );
    err.status = 400;
    throw err;
  }

  await Brand.findByIdAndUpdate(bid, {
    $set: {
      isDeleted: true,
      deletedAt: new Date(),
    },
  });

  return {
    success: true,
    message: "Xoá thương hiệu thành công",
  };
};

/**
 *Product
 */
// services/product.service.js
const parseBlocks = (raw) => {
  try {
    const b = JSON.parse(raw || "[]");
    return Array.isArray(b) ? b : [];
  } catch {
    return [];
  }
};

exports.createProduct = async (reqBody, files = {}) => {
  const body = { ...reqBody };
  //console.log("Nhận thông tin đăng ký", reqBody);
  // thumbnail
  if (files?.productThumb?.[0]?.path) {
    body.productThumb = files.productThumb[0].path;
  }

  const blocks = parseBlocks(body.blocks);
  const mediaFiles = files?.blockFiles || [];
  const mediaBlocks = blocks.filter(
    (b) => b.type === "image" || b.type === "video"
  );

  if (mediaFiles.length !== mediaBlocks.length) {
    const err = new Error(
      `Số file (${mediaFiles.length}) không khớp số block media (${mediaBlocks.length}).`
    );
    err.status = 400;
    throw err;
  }

  let mediaIndex = 0;

  body.productContentBlocks = blocks.map((b, idx) => {
    if (b.type === "image" || b.type === "video") {
      const f = mediaFiles[mediaIndex++];
      return {
        type: b.type,
        url: f?.path || "",
        content: b.content || "",
        alt: b.alt || "",
        order: Number.isFinite(b.order) ? Number(b.order) : idx,
      };
    }
    if (b.type === "videoUrl") {
      return {
        type: "videoUrl",
        url: b?.url || "",
        content: b.content || "",
        alt: b.alt || "",
        order: Number.isFinite(b.order) ? Number(b.order) : idx,
      };
    }
    return {
      type: "text",
      content: b.content || "",
      order: Number.isFinite(b.order) ? Number(b.order) : idx,
    };
  });

  // slug
  if (!body.productSlug && body.productName) {
    body.productSlug = slugify(body.productName, { lower: true, strict: true });
  }

  // validate
  const required = ["productName", "categoryId", "shopId", "productThumb"];
  const missing = required.filter((k) => !body[k]);
  if (missing.length) {
    const err = new Error(`Missing fields: ${missing.join(", ")}`);
    err.status = 400;
    throw err;
  }

  const product = await Product.create(body);
  if (exports.recalcShopAggregates) {
    await exports.recalcShopAggregates(product.shopId).catch(() => {});
  }

  return { success: true, message: "Tạo sản phẩm thành công", product };
};

exports.getProductById = async (params) => {
  const { pId } = params;

  if (!pId) {
    const err = new Error("Thiếu tham số pId");
    err.status = 400;
    throw err;
  }

  const product = await Product.findOne({
    _id: pId,
    isDeleted: { $ne: true },
  })
    .populate("shopId", "shopName shopSlug shopLogo shopOfficial")
    .populate("brandId", "brandName brandSlug")
    .populate("categoryId", "categoryName categorySlug")
    .populate("categoryShopId", "categoryShopName categoryShopSlug")
    .lean();

  if (!product) {
    const err = new Error("Không tìm thấy sản phẩm");
    err.status = 404;
    throw err;
  }

  return {
    success: true,
    message: "Lấy thông tin sản phẩm thành công",
    product,
  };
};

const b64 = {
  encode: (obj) => Buffer.from(JSON.stringify(obj)).toString("base64"),
  decode: (str) =>
    JSON.parse(Buffer.from(String(str), "base64").toString("utf8")),
};

// chuyển query ?brandId=...&brandId=... hoặc "a,b" -> mảng ObjectId/string
const toList = (v) => {
  if (v == null) return [];
  if (Array.isArray(v)) return v;
  const s = String(v);
  if (!s.trim()) return [];
  return s.split(",").map((x) => x.trim());
};

exports.getProducts = async (query) => {
  const {
    s,
    brandId,
    categoryShopId,
    categoryId,
    themeId,
    shopId,
    limit = 20,
    sortKey = "createdAt",
    sortDir = "desc",
    hasSale,
    hasMall,
    after,
    excludeIds,
    status,
    viewer,
  } = query;

  const filter = { isDeleted: { $ne: true } };

  // loại trừ các id
  const eIds = toList(excludeIds);
  if (eIds.length) {
    filter._id = { ...(filter._id || {}), $nin: eIds };
  }

  const role = viewer || "public";

  // ===== ROLE & productStatus =====
  if (role === "admin") {
    if (status) {
      filter.productStatus = {
        $in: String(status)
          .split(",")
          .map((v) => v.trim()),
      };
    }
  } else if (role === "shop") {
    if (status) {
      filter.productStatus = {
        $in: String(status)
          .split(",")
          .map((v) => v.trim()),
      };
    }
  } else {
    // Khách hàng / public: CHỈ thấy sản phẩm đã duyệt
    filter.productStatus = "approved";
  }

  // chỉ lấy sản phẩm đã có variationId
  filter.variationId = { $ne: null };

  // --- Search theo tên ---
  if (s) filter.productName = { $regex: s, $options: "i" };

  // --- Các filter theo id (hỗ trợ string, mảng, "a,b") ---
  const bIds = toList(brandId);
  if (bIds.length) filter.brandId = { $in: bIds };

  const csIds = toList(categoryShopId);
  if (csIds.length) filter.categoryShopId = { $in: csIds };

  const cIds = toList(categoryId);
  if (cIds.length) filter.categoryId = { $in: cIds };

  const sIds = toList(shopId);
  if (sIds.length) filter.shopId = { $in: sIds };

  // --- Lọc theo sale ---
  if (hasSale === "true" || hasSale === true) {
    filter.productIsOnSale = true;
  }

  // --- Lọc theo theme ---
  const tIds = toList(themeId);
  if (tIds.length) {
    const productThemeLinks = await ProductTheme.find({
      themeId: { $in: tIds },
    }).select("productId");

    const productIds = productThemeLinks.map((l) => l.productId);
    if (!productIds.length) {
      return {
        success: true,
        message: "Không tìm thấy sản phẩm thuộc theme này",
        total: 0,
        products: [],
        pageInfo: { hasMore: false, nextCursor: null },
      };
    }

    filter._id = { $in: productIds };
  }

  // ====== LỌC SHOP THEO ROLE (DÙNG TỐI ĐA 1 LẦN QUERY CHO PUBLIC) ======
  let approvedShops = null;
  let approvedShopIds = null;

  if (role === "public") {
    // 1 lần duy nhất cho public
    const approvedShopsRes = await ShopService.getShops({
      status: "approved",
      // không truyền limit ⇒ trong getShops .limit(0) => lấy hết
    });

    approvedShops = approvedShopsRes.shops || [];
    approvedShopIds = approvedShops.map((s) => String(s._id));

    if (!approvedShopIds.length) {
      return {
        success: true,
        message: "Không có shop được duyệt",
        total: 0,
        products: [],
        pageInfo: { hasMore: false, nextCursor: null },
      };
    }

    // Áp filter: chỉ lấy sản phẩm thuộc shop đã duyệt
    if (filter.shopId && filter.shopId.$in) {
      const allowed = filter.shopId.$in.filter((id) =>
        approvedShopIds.includes(String(id))
      );
      filter.shopId = { $in: allowed };
    } else {
      filter.shopId = { $in: approvedShopIds };
    }
  }

  // --- Lọc theo Mall (shopOfficial = true) ---
  if (hasMall === "true" || hasMall === true) {
    if (role === "public") {
      // Dùng lại approvedShops đã query phía trên, không gọi DB lần 2
      const mallShopIds = (approvedShops || [])
        .filter((s) => s.shopIsOfficial === true)
        .map((s) => String(s._id));

      if (!mallShopIds.length) {
        return {
          success: true,
          message: "Không có shop mall đã duyệt",
          total: 0,
          products: [],
          pageInfo: { hasMore: false, nextCursor: null },
        };
      }

      // giao với filter.shopId (hiện tại đã là approved shops)
      if (filter.shopId && filter.shopId.$in) {
        const allowed = filter.shopId.$in.filter((id) =>
          mallShopIds.includes(String(id))
        );
        filter.shopId = { $in: allowed };
      } else {
        filter.shopId = { $in: mallShopIds };
      }
    } else {
      // Admin / shop nhưng muốn lọc Mall → query riêng, vì trên không gọi approvedShops
      const mallResult = await ShopService.getShops({
        isMall: true,
        limit: 500,
      });
      const mallShops = mallResult.shops || [];
      const mallShopIds = mallShops.map((s) => String(s._id));

      if (!mallShopIds.length) {
        return {
          success: true,
          message: "Không có shop mall",
          total: 0,
          products: [],
          pageInfo: { hasMore: false, nextCursor: null },
        };
      }

      if (filter.shopId && filter.shopId.$in) {
        const allowed = filter.shopId.$in.filter((id) =>
          mallShopIds.includes(String(id))
        );
        filter.shopId = { $in: allowed };
      } else {
        filter.shopId = { $in: mallShopIds };
      }
    }
  }

  // --- Giới hạn an toàn ---
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);

  // --- Mapping các trường sort trong DB ---
  const mapSort = {
    createdAt: "productCreateAt",
    sold: "productSoldCount",
    rating: "productRateAvg",
    discount: "productDiscountPercent",
    price: "productMinPrice",
  };
  const field = mapSort[sortKey] || "productCreateAt";
  const dir = String(sortDir).toLowerCase() === "asc" ? 1 : -1;
  const sortObj = { [field]: dir, _id: dir };

  // --- Cursor filter (keyset pagination) ---
  if (after) {
    try {
      const { id, field: fvRaw } = b64.decode(after);
      const afterId = new ObjectId(id);

      let fv = null;
      if (field === "productCreateAt") {
        fv = isNaN(Date.parse(fvRaw)) ? null : new Date(fvRaw);
      } else {
        const n = Number(fvRaw);
        fv = Number.isFinite(n) ? n : null;
      }

      if (fv !== null) {
        const cmp = dir === -1 ? "$lt" : "$gt";
        filter.$or = [
          { [field]: { [cmp]: fv } },
          { [field]: fv, _id: { [cmp]: afterId } },
        ];
      } else {
        filter._id = { [dir === -1 ? "$lt" : "$gt"]: afterId };
      }
    } catch (e) {
      console.error("Invalid cursor:", e);
    }
  }

  // --- Truy vấn ---
  const items = await Product.find(filter)
    .populate("brandId", "brandName brandSlug")
    .populate("categoryId", "categoryName categorySlug")
    .populate("shopId", "shopName shopSlug shopLogo shopOfficial shopStatus")
    .sort(sortObj)
    .limit(limitNum + 1)
    .lean();

  const hasMore = items.length > limitNum;
  if (hasMore) items.pop();

  const last = items[items.length - 1] || null;
  const nextCursor = last
    ? b64.encode({
        id: String(last._id),
        field:
          field === "productCreateAt"
            ? (last.productCreateAt &&
                last.productCreateAt.toISOString &&
                last.productCreateAt.toISOString()) ||
              null
            : Number(last[field] ?? 0),
      })
    : null;

  return {
    success: true,
    message: "Lấy danh sách sản phẩm thành công",
    total: items.length,
    products: items,
    pageInfo: { hasMore, nextCursor },
  };
};

exports.updateProduct = async (params, reqBody, files = {}) => {
  const { pId } = params;
  const body = { ...reqBody };

  const product = await Product.findOne({
    _id: pId,
    isDeleted: { $ne: true },
  });
  if (!product) {
    const err = new Error("Không tìm thấy sản phẩm");
    err.status = 404;
    throw err;
  }

  // 1) Thumbnail (nếu có file mới)
  if (files?.productThumb?.[0]?.path) {
    body.productThumb = files.productThumb[0].path; // đường dẫn (ví dụ Cloudinary URL)
  } else {
    //Nếu không gửi gì bỏ qua
    if (!Object.prototype.hasOwnProperty.call(files, "productThumb")) {
      // Nếu không có file upload và KHÔNG có field text productThumb trong body,
      // body.productThumb sẽ là undefined => DB giữ nguyên
      // Nếu có field text productThumb="" thì body.productThumb === "" -> DB set ""
      // => Không cần làm gì thêm ở đây, chỉ giải thích.
    }
  }

  // 2) Blocks: nếu client gửi "blocks" => coi như thay toàn bộ mảng
  if (typeof body.blocks !== "undefined") {
    const blocks = parseBlocks(body.blocks);

    const mediaFiles = files?.blockFiles || [];
    const mediaBlocks = blocks.filter(
      (b) => b.type === "image" || b.type === "video"
    );

    let productContentBlocks = [];

    if (mediaFiles.length > 0) {
      // 2A) Chế độ reupload media: số file phải khớp số media blocks
      if (mediaFiles.length !== mediaBlocks.length) {
        const err = new Error(
          `Số file (${mediaFiles.length}) không khớp số block media (${mediaBlocks.length}).`
        );
        err.status = 400;
        throw err;
      }

      let mediaIndex = 0;
      productContentBlocks = blocks.map((b, idx) => {
        const orderVal = Number.isFinite(b.order) ? Number(b.order) : idx;

        if (b.type === "image" || b.type === "video") {
          const f = mediaFiles[mediaIndex++];
          return {
            type: b.type,
            url: f?.path || "",
            content: b.content || "",
            alt: b.alt || "",
            order: orderVal,
          };
        }
        if (b.type === "videoUrl") {
          return {
            type: "videoUrl",
            url: b?.url || "",
            content: b.content || "",
            alt: b.alt || "",
            order: Number.isFinite(b.order) ? Number(b.order) : idx,
          };
        }
        // text block
        return {
          type: "text",
          content: b.content || "",
          order: orderVal,
        };
      });
    } else {
      // 2B) Chế độ không reupload: dùng URL từ block (yêu cầu media block phải có url)
      productContentBlocks = blocks.map((b, idx) => {
        const orderVal = Number.isFinite(b.order) ? Number(b.order) : idx;
        if (b.type === "image" || b.type === "video") {
          if (!b.url || !String(b.url).startsWith("http")) {
            const err = new Error(
              `Block media thiếu URL ở vị trí ${idx}. Gửi lại 'url' hoặc upload file mới qua 'blockFiles'.`
            );
            err.status = 400;
            throw err;
          }
          return {
            type: b.type,
            url: b.url,
            content: b.content || "",
            alt: b.alt || "",
            order: orderVal,
          };
        }
        return {
          type: "text",
          content: b.content || "",
          order: orderVal,
        };
      });
    }

    body.productContentBlocks = productContentBlocks;
  }

  // 3) Slug (nếu đổi tên)
  if (body.productName) {
    body.productSlug = slugify(body.productName, { lower: true, strict: true });
  }

  // 4) Cập nhật
  const updatedProduct = await Product.findOneAndUpdate(
    { _id: pId, isDeleted: { $ne: true } },
    body,
    { new: true }
  );

  // 5) Re-aggregate (nếu có)
  if (exports.recalcShopAggregates) {
    await exports.recalcShopAggregates(updatedProduct.shopId).catch(() => {});
  }

  return {
    success: true,
    message: "Cập nhật sản phẩm thành công",
    product: updatedProduct,
  };
};

/**
 * Thống kê sản phẩm cho Dashboard
 */
exports.getProductStats = async (params) => {
  // Xây dựng filter động
  console.log("Tham so nhan duoc truy van");
  const { shopId } = params;
  const filter = { isDeleted: { $ne: true } };

  if (shopId) {
    // Chỉ thêm shopId nếu có truyền vào
    filter.shopId = new Types.ObjectId(shopId);
  }

  const stats = await Product.aggregate([
    // Bước 1: Lọc theo shop (nếu có)
    { $match: filter },

    // Bước 2: Dùng $facet để tính nhiều chỉ số song song
    {
      $facet: {
        totalProducts: [{ $count: "count" }],

        outOfStock: [
          { $match: { productStockQuantity: 0 } },
          { $count: "count" },
        ],

        inStock: [
          { $match: { productStockQuantity: { $gt: 0 } } },
          { $count: "count" },
        ],

        onSale: [{ $match: { productIsOnSale: true } }, { $count: "count" }],

        noVariation: [
          {
            $lookup: {
              from: "productvariations",
              localField: "_id",
              foreignField: "productId",
              as: "variations",
              pipeline: [{ $match: { isDeleted: { $ne: true } } }],
            },
          },
          { $match: { variations: { $size: 0 } } },
          { $count: "count" },
        ],
      },
    },

    // Bước 3: Chuẩn hóa output
    {
      $project: {
        totalProducts: {
          $ifNull: [{ $arrayElemAt: ["$totalProducts.count", 0] }, 0],
        },
        outOfStock: {
          $ifNull: [{ $arrayElemAt: ["$outOfStock.count", 0] }, 0],
        },
        inStock: { $ifNull: [{ $arrayElemAt: ["$inStock.count", 0] }, 0] },
        onSale: { $ifNull: [{ $arrayElemAt: ["$onSale.count", 0] }, 0] },
        noVariation: {
          $ifNull: [{ $arrayElemAt: ["$noVariation.count", 0] }, 0],
        },
      },
    },
  ]);

  const result = stats[0] || {
    totalProducts: 0,
    outOfStock: 0,
    inStock: 0,
    onSale: 0,
    noVariation: 0,
  };

  return {
    success: true,
    message: shopId
      ? "Thống kê sản phẩm của shop thành công"
      : "Thống kê toàn hệ thống thành công",
    stats: result,
    scope: shopId ? "shop" : "global",
    shopId: shopId || null,
  };
};

//Lay danh sach san pham kem bien the
exports.getShopProductsWithVariations = async (query = {}) => {
  const {
    shopId,
    s,
    brandId,
    categoryId,
    hasSale,
    status,
    sortKey = "createdAt",
    sortDir = "desc",
  } = query;
  console.log("Nhan truy van", query);

  if (!shopId) {
    const err = new Error("Thiếu shopId");
    err.status = 400;
    throw err;
  }

  const filter = {
    shopId: new Types.ObjectId(shopId),
    isDeleted: { $ne: true },
  };
  // --- Tìm kiếm theo tên ---
  if (s) filter.productName = { $regex: s, $options: "i" };
  // --- Lọc theo brand/category ---
  if (brandId) filter.brandId = new Types.ObjectId(brandId);
  if (categoryId) filter.categoryId = new Types.ObjectId(categoryId);
  if (status) filter.productStatus = status;

  if (sortKey === "isOutOfStock") {
    filter.productStockQuantity = 0;
  }

  // --- Lọc sản phẩm đang sale ---
  if (hasSale === "true" || hasSale === true) {
    filter.productIsOnSale = true;
  }

  // --- Mapping sort ---
  const mapSort = {
    createdAt: "productCreateAt",
    sold: "productSoldCount",
    rating: "productRateAvg",
    discount: "productDiscountPercent",
    price: "productMinPrice",
  };
  const field = mapSort[sortKey] || "productCreateAt";
  const dir = String(sortDir).toLowerCase() === "asc" ? 1 : -1;
  const sortObj = { [field]: dir, _id: dir };

  const products = await Product.aggregate([
    { $match: filter },

    // JOIN biến thể
    {
      $lookup: {
        from: "productvariations",
        localField: "_id",
        foreignField: "productId",
        as: "variations",
        pipeline: [
          { $match: { isDeleted: { $ne: true } } },
          { $sort: { createdAt: -1 } },
          {
            $project: {
              pvName: 1,
              pvPrice: 1,
              pvOriginalPrice: 1,
              pvStockQuantity: 1,
              pvSoldCount: 1,
              pvImages: 1,
              createdAt: 1,
            },
          },
        ],
      },
    },

    // JOIN categoryId -> categoryInfo
    {
      $lookup: {
        from: "categories",
        localField: "categoryId",
        foreignField: "_id",
        as: "categoryInfo",
        pipeline: [
          {
            $match: { isDeleted: { $ne: true } },
          },
          {
            $project: {
              _id: 1,
              categoryName: 1,
              categorySlug: 1,
            },
          },
        ],
      },
    },
    { $unwind: { path: "$categoryInfo", preserveNullAndEmptyArrays: true } },

    {
      $lookup: {
        from: "categoryshops",
        localField: "categoryShopId",
        foreignField: "_id",
        as: "categoryShopInfo",
        pipeline: [
          {
            $project: {
              _id: 1,
              csName: 1,
              csSlug: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: { path: "$categoryShopInfo", preserveNullAndEmptyArrays: true },
    },
    {
      $lookup: {
        from: "brands",
        localField: "brandId",
        foreignField: "_id",
        as: "brandInfo",
        pipeline: [
          {
            $project: {
              _id: 1,
              brandName: 1,
              brandSlug: 1,
            },
          },
        ],
      },
    },
    { $unwind: { path: "$brandInfo", preserveNullAndEmptyArrays: true } },

    // SORT
    { $sort: sortObj },

    // PROJECT cuối
    {
      $project: {
        productName: 1,
        productSlug: 1,
        productThumb: 1,
        productMinPrice: 1,
        productMinOriginalPrice: 1,
        productRateAvg: 1,
        productSoldCount: 1,
        productStockQuantity: 1,
        productDiscountPercent: 1,
        productIsOnSale: 1,
        productContentBlocks: 1,
        productDescription: 1,
        productStatus: 1,
        variations: 1,
        createdAt: "$productCreateAt",
        categoryShopId: {
          _id: "$categoryShopInfo._id",
          csName: "$categoryShopInfo.csName",
          csSlug: "$categoryShopInfo.csSlug",
        },

        // thay vì trả categoryInfo + categoryId tách biệt
        categoryId: {
          _id: "$categoryInfo._id",
          categoryName: "$categoryInfo.categoryName",
          categorySlug: "$categoryInfo.categorySlug",
        },

        // thay vì trả brandInfo + brandId tách biệt
        brandId: {
          _id: "$brandInfo._id",
          brandName: "$brandInfo.brandName",
          brandSlug: "$brandInfo.brandSlug",
        },
      },
    },
  ]);

  return {
    success: true,
    message: "Lấy sản phẩm + biến thể + block thành công",
    count: products.length,
    products,
  };
};

/**
 * BLOCK
 */

//PATCH /api/product/68e74119cdda439f62c1629f/block/68e74119cdda439f62c162a1
/**
  type=image
  content=Hình mới nhất
  order=7
  (blockFile)=<upload file .jpg>
 */
exports.updateProductBlock = async (params, body) => {
  const { pId, blockId } = params;

  const updated = await Product.findOneAndUpdate(
    { _id: pId, "productContentBlocks._id": blockId },
    {
      $set: {
        "productContentBlocks.$.content": body.content,
        "productContentBlocks.$.url": body.url,
        "productContentBlocks.$.alt": body.alt,
        "productContentBlocks.$.order": body.order,
      },
    },
    { new: true }
  );

  if (!updated)
    throw new Error("Không tìm thấy sản phẩm hoặc block để cập nhật");

  return {
    success: true,
    message: "Cập nhật block thành công",
    product: updated,
  };
};

//DELETE /api/product/68e74119cdda439f62c1629f/block/68e74119cdda439f62c162a3
exports.deleteProductBlock = async (params) => {
  const { pId, blockId } = params;

  const updated = await Product.findByIdAndUpdate(
    pId,
    { $pull: { productContentBlocks: { _id: blockId } } },
    { new: true }
  );

  if (!updated) throw new Error("Không tìm thấy sản phẩm hoặc block để xóa");

  return {
    success: true,
    message: "Xóa block thành công",
    product: updated,
  };
};

//POST /api/v1/catalog/product/68e74119cdda439f62c1629f/block
exports.addProductBlock = async (params, body, files = {}) => {
  const { pId } = params;
  const prod = await Product.findById(pId).select("productContentBlocks");
  if (!prod) throw new Error("Không tìm thấy sản phẩm");

  const reqOrder = Number(body.order);
  let order = Number.isFinite(reqOrder) ? reqOrder : getNextOrder(prod);

  // Nếu trùng order, đẩy lên vị trí cuối (max + 10)
  const exists = (prod.productContentBlocks || []).some(
    (b) => Number(b.order) === order
  );
  if (exists) order = getNextOrder(prod);

  const newBlock = {
    type: body.type,
    content: body.content || "",
    url: files?.blockFile?.[0]?.path || body.url || "",
    alt: body.alt || "",
    order,
  };

  const updated = await Product.findByIdAndUpdate(
    pId,
    { $push: { productContentBlocks: newBlock } },
    { new: true }
  );

  return { success: true, message: "Thêm block thành công", product: updated };
};

//PATCH /api/product/68e74119cdda439f62c1629f/reorder-blocks
/**
 * Gửi danh sách id kèm order mới
 * {
  "blocks": [
    { "_id": "68e74119cdda439f62c162a0", "order": 1 },
    { "_id": "68e74119cdda439f62c162a5", "order": 2 }
  ]
}
 */
exports.reorderProductBlocks = async (params, body) => {
  const { pId } = params;
  const { blocks } = body; // [{_id, order}, ...]

  const product = await Product.findById(pId);
  if (!product) throw new Error("Không tìm thấy sản phẩm");

  product.productContentBlocks.forEach((b) => {
    const newOrder = blocks.find((x) => x._id === String(b._id))?.order;
    if (typeof newOrder !== "undefined") b.order = newOrder;
  });

  await product.save();

  return { success: true, message: "Cập nhật thứ tự thành công", product };
};

exports.deleteProduct = async (params) => {
  const { pId } = params;

  const product = await Product.findOne({
    _id: pId,
    isDeleted: { $ne: true },
  });
  if (!product) {
    const err = new Error("Không tìm thấy sản phẩm");
    err.status = 404;
    throw err;
  }

  const shopId = product.shopId;

  // Xóa mềm các biến thể của sản phẩm
  await ProductVariation.updateMany(
    { productId: pId, isDeleted: { $ne: true } },
    {
      $set: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    }
  );

  // Xóa mềm sản phẩm
  await Product.findByIdAndUpdate(pId, {
    $set: {
      isDeleted: true,
      deletedAt: new Date(),
    },
  });

  // Cập nhật lại thống kê shop (chỉ tính sản phẩm chưa xóa)
  await exports.recalcShopAggregates(shopId);

  return {
    success: true,
    message: "Xóa sản phẩm thành công",
  };
};

/*
 *ProductVariation
 */

// create
exports.creatProductVariation = async (body, files) => {
  if (files?.length > 0) {
    body.pvImages = files.map((file) => file.path);
  }
  //console.log("Nhan thong tin dang ky bien the", body, files);

  // tránh coi 0 là thiếu
  const requiredFields = ["productId", "pvName", "pvPrice", "pvStockQuantity"];
  const missing = requiredFields.filter(
    (f) => body[f] == null || body[f] === ""
  );
  if (missing.length) {
    const err = new Error(`Missing fields: ${missing.join(", ")}`);
    err.status = 400;
    throw err;
  }

  // kiem tra gia
  if (Number(body.pvPrice) < 0) {
    const err = new Error("Giá sản phẩm: >= 0");
    err.status = 400;
    throw err;
  }

  //Kiem tra so luong san pham
  if (
    !Number.isInteger(Number(body.pvStockQuantity)) ||
    Number(body.pvStockQuantity) < 0
  ) {
    const err = new Error("Số lượng sản phẩm trong kho: >= 0");
    err.status = 400;
    throw err;
  }

  if (!body.pvSlug && body.pvName) {
    body.pvSlug = slugify(body.pvName, { lower: true, strict: true });
  }

  const productVariation = await ProductVariation.create(body);

  // đồng bộ tổng tồn kho + giá min cho Product
  await exports.recalcProductAggregates(body.productId);

  return { success: true, message: "thành công", productVariation };
};

// Read by Id
exports.getProductVariationById = async (params) => {
  const { pvId } = params;
  const doc = await ProductVariation.findOne({
    _id: pvId,
    isDeleted: { $ne: true },
  }).populate({
    path: "productId",
    select: "productName shopId",
    populate: {
      path: "shopId",
      select: "shopName shopLogo shopOfficial",
    },
  });
  if (!doc) {
    const err = new Error("Không tìm thấy biến thể");
    err.status = 404;
    throw err;
  }
  return {
    success: true,
    message: "Lấy thông tin biến thể thành công",
    productVariation: doc,
  };
};

// LIST BY productId (không phân trang, có thể mở rộng sau)
exports.getProductVariations = async (query) => {
  const filter = { isDeleted: { $ne: true } };
  if (query.pId) {
    filter.productId = query.pId;
  }
  if (query.shopId) {
    filter.shopId = query.shopId;
  }

  const list = await ProductVariation.find(filter)
    .sort({ createdAt: -1 })
    .populate("productId");

  return {
    success: true,
    message: "Lấy biến thể thành công",
    productVariations: list,
  };
};

// UPDATE
exports.updateProductVariation = async (params, body, files) => {
  //console.log("Duoc goi cap nhat bien the", params, body, files);
  const { pvId } = params;

  if (files?.length > 0) {
    // Có file upload mới
    body.pvImages = files.map((f) => f.path);
  } else if (Object.prototype.hasOwnProperty.call(body, "pvImages")) {
    // Không có file nhưng có field pvImages
    if (typeof body.pvImages === "string" && body.pvImages.trim() === "[]") {
      // Gửi mảng rỗng → clear ảnh
      body.pvImages = [];
    }
    // Nếu không gửi gì → giữ nguyên, không làm gì
  }

  // nếu có chỉnh giá/stock thì validate tối thiểu
  if (body.pvPrice != null && Number(body.pvPrice) < 0) {
    const err = new Error("Giá sản phẩm: >= 0");
    err.status = 400;
    throw err;
  }
  if (body.pvStockQuantity != null) {
    const n = Number(body.pvStockQuantity);
    if (!Number.isInteger(n) || n < 0) {
      const err = new Error("Số lượng sản phẩm trong kho: >= 0");
      err.status = 400;
      throw err;
    }
  }

  const updated = await ProductVariation.findOneAndUpdate(
    { _id: pvId, isDeleted: { $ne: true } },
    body,
    { new: true }
  );
  if (!updated) {
    const err = new Error("Không tìm thấy biến thể");
    err.status = 404;
    throw err;
  }

  await exports.recalcProductAggregates(updated.productId);

  return {
    success: true,
    message: "Cập nhật sản phẩm thành công",
    productVariation: updated,
  };
};

// SOFT DELETE
exports.deteleProductVariation = async (params) => {
  const { pvId } = params;

  const doc = await ProductVariation.findOneAndUpdate(
    { _id: pvId, isDeleted: { $ne: true } },
    {
      $set: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    },
    { new: true }
  );

  if (!doc) {
    const err = new Error("Không tìm thấy biến thể");
    err.status = 404;
    throw err;
  }

  await exports.recalcProductAggregates(doc.productId);

  return { success: true, message: "Xóa sản phẩm thành công" };
};

const isHexColor = (s) =>
  typeof s === "string" && /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(s.trim());

/**
 * Theme
 */

exports.createTheme = async (body, files) => {
  // Ảnh: lấy file đầu tiên (nếu bạn muốn cho nhiều ảnh, đổi thành map)
  if (files?.length > 0) {
    body.themeImage = files[0].path;
  }

  // Validate bắt buộc
  const required = ["themeName", "themeImage"];
  const missing = required.filter((f) => body[f] == null || body[f] === "");
  if (missing.length) {
    const err = new Error(`Missing fields: ${missing.join(", ")}`);
    err.status = 400;
    throw err;
  }

  // Tự sinh slug
  if (!body.themeSlug && body.themeName) {
    body.themeSlug = slugify(body.themeName, { lower: true, strict: true });
  }

  // Validate màu (nếu truyền)
  if (body.themeColor && !isHexColor(body.themeColor)) {
    const err = new Error(
      "themeColor phải là mã hex hợp lệ, ví dụ: #ffffff hoặc #fff"
    );
    err.status = 400;
    throw err;
  }

  const theme = await Theme.create(body);
  return { success: true, message: "Tạo chủ đề thành công", theme };
};

exports.getThemeById = async (params, query = {}) => {
  const { themeId } = params || {};
  const { slug } = query || {};

  let doc = null;
  if (themeId) doc = await Theme.findById(themeId);
  else if (slug) doc = await Theme.findOne({ themeSlug: slug });
  else {
    const err = new Error("Thiếu themeId hoặc slug");
    err.status = 400;
    throw err;
  }

  if (!doc) {
    const err = new Error("Không tìm thấy chủ đề");
    err.status = 404;
    throw err;
  }

  return {
    success: true,
    message: "Lấy chủ đề thành công",
    theme: doc,
  };
};

exports.getThemes = async (query = {}) => {
  const { q } = query;

  const filter = {};
  if (q) {
    filter.$or = [
      { themeName: { $regex: q, $options: "i" } },
      { themeSlug: { $regex: q, $options: "i" } },
    ];
  }

  // Nếu dùng soft delete, thêm: filter.isDeleted = { $ne: true }
  const list = await Theme.find(filter).sort({ createdAt: -1 });

  return {
    success: true,
    message: "Lấy danh sách chủ đề thành công",
    themes: list,
  };
};

exports.updateTheme = async (params, body, files) => {
  const { themeId } = params;
  if (!themeId) {
    const err = new Error("Thiếu trường themeId");
    err.status = 400;
    throw err;
  }

  // Ảnh mới (nếu có)
  if (files?.length > 0) {
    body.themeImage = files[0].path;
  }

  // Tự sinh slug nếu đổi tên mà không gửi slug
  if (!body.themeSlug && body.themeName) {
    body.themeSlug = slugify(body.themeName, { lower: true, strict: true });
  }

  // Validate màu (nếu truyền)
  if (body.themeColor && !isHexColor(body.themeColor)) {
    const err = new Error(
      "themeColor phải là mã hex hợp lệ, ví dụ: #ffffff hoặc #fff"
    );
    err.status = 400;
    throw err;
  }

  try {
    const updated = await Theme.findByIdAndUpdate(themeId, body, { new: true });
    if (!updated) {
      const err = new Error("Không tìm thấy chủ đề");
      err.status = 404;
      throw err;
    }
    return {
      success: true,
      message: "Cập nhật chủ đề thành công",
      theme: updated,
    };
  } catch (err) {
    if (err?.code === 11000) {
      const dupField = Object.keys(err.keyPattern || {})[0] || "field";
      const e = new Error(`Giá trị '${dupField}' đã tồn tại`);
      e.status = 409;
      throw e;
    }
    throw err;
  }
};

exports.deleteTheme = async (params) => {
  const { themeId } = params;
  const theme = await Theme.findById(themeId);
  if (!theme) {
    const err = new Error("Không tìm thấy chủ đề");
    err.status = 404;
    throw err;
  }

  const isUsed = await ProductTheme.exists({ themeId });
  if (isUsed) {
    const err = new Error(
      "Không thể xóa vì chủ đề này đang được sử dụng trong sản phẩm"
    );
    err.status = 400;
    throw err;
  }

  await Theme.findByIdAndDelete(themeId);

  return {
    success: true,
    message: "Xóa chủ đề thành công",
  };
};

/**
 * ProductTheme
 */
exports.createProductTheme = async (body) => {
  // console.log("Duoc goi", body);
  const { productId, themeId } = body;
  if (!productId || !themeId) {
    const err = new Error("Thiếu productId hoặc themeId");
    err.status = 400;
    throw err;
  }

  const product = await Product.findById(productId);
  const theme = await Theme.findById(themeId);
  if (!product || !theme) {
    const err = new Error("Không tìm thấy sản phẩm hoặc chủ đề");
    err.status = 404;
    throw err;
  }

  const existing = await ProductTheme.findOne({ productId, themeId });
  if (existing) {
    const err = new Error("Sản phẩm đã có trong chủ đề này");
    err.status = 400;
    throw err;
  }

  const newItem = await ProductTheme.create({ productId, themeId });

  return {
    success: true,
    message: "Thêm sản phẩm vào chủ đề thành công",
    productTheme: newItem,
  };
};

exports.getProductsByTheme = async (themeId) => {
  const theme = await Theme.findById(themeId);
  if (!theme) {
    const err = new Error("Không tìm thấy chủ đề");
    err.status = 404;
    throw err;
  }

  const list = await ProductTheme.find({ themeId })
    .populate("themeId", "themeName themeImage themeDescription")
    .populate({
      path: "productId",
      select:
        "productName productSlug productThumb  productMinOriginalPrice productMinPrice productDescription productRateAvg productSoldCount productStockQuantity",
    })
    .sort({ createdAt: -1 });

  return {
    success: true,
    theme: theme.themeName,
    total: list.length,
    products: list.map((i) => i.productId),
  };
};

exports.deleteProductTheme = async (id) => {
  const deleted = await ProductTheme.findByIdAndDelete(id);
  if (!deleted) {
    const err = new Error("Không tìm thấy liên kết cần xóa");
    err.status = 404;
    throw err;
  }

  return {
    success: true,
    message: "Xóa liên kết sản phẩm - chủ đề thành công",
  };
};

exports.getAllProductThemes = async () => {
  const list = await ProductTheme.find()
    .populate("productId", "productName")
    .populate("themeId", "themeName")
    .sort({ createdAt: -1 });

  return { success: true, total: list.length, productThemes: list };
};

exports.getThemesWithProducts = async () => {
  // Lấy toàn bộ theme
  const themes = await Theme.find().sort({ createdAt: -1 });

  // Lặp từng theme và populate sản phẩm thuộc theme đó
  const results = await Promise.all(
    themes.map(async (theme) => {
      const productThemes = await ProductTheme.find({ themeId: theme._id })
        .populate({
          path: "productId",
          select:
            "productName productSlug productThumb productMinPrice productDescription productRateAvg productSoldCount productStockQuantity",
        })
        .lean();

      // lọc các sản phẩm hợp lệ
      const products = productThemes
        .map((pt) => pt.productId)
        .filter((p) => p != null);

      const total = products.length;
      return {
        themeId: theme._id,
        themeName: theme.themeName,
        themeSlug: theme.themeSlug,
        themeImage: theme.themeImage,
        themeColor: theme.themeColor,
        themeDescription: theme.themeDescription,
        total,
        products,
      };
    })
  );

  return {
    success: true,
    message: "Lấy danh sách theme và sản phẩm thành công",
    themes: results,
  };
};

// HELP — Recalc stock & min price
/**
 Khi khách mua 1 biến thể → cập nhật:
  + Biến thể: pvSoldCount +n, pvStockQuantity -n
  + Sản phẩm (Product): productSoldCount +n, productStockQuantity -n
  + Shop: shopSoldCount +
 */
/**
 * Cập nhật bán hàng hoặc hoàn trả
 * @param {String} pvId - ID biến thể
 * @param {Number} quantity - Số lượng
 * @param {'sell' | 'refund'} action - Hành động
 */
exports.updateVariationSales = async (pvId, quantity = 1, action = "sell") => {
  const qty = Math.max(1, Math.floor(quantity));
  const sign = action === "sell" ? 1 : -1; // +1 hoặc -1

  // 1. Lấy variation + productId + shopId
  const variation = await ProductVariation.findOne({
    _id: pvId,
    isDeleted: { $ne: true },
  })
    .select("productId pvStockQuantity pvSoldCount")
    .populate({
      path: "productId",
      select: "shopId",
    });

  if (!variation) {
    const err = new Error("Không tìm thấy biến thể");
    err.status = 404;
    throw err;
  }

  // 2. Kiểm tra điều kiện theo hành động
  if (action === "sell" && variation.pvStockQuantity < qty) {
    const err = new Error("Số lượng trong kho không đủ");
    err.status = 400;
    throw err;
  }

  if (action === "refund" && variation.pvSoldCount < qty) {
    const err = new Error("Số lượng hoàn trả vượt quá số đã bán");
    err.status = 400;
    throw err;
  }

  const productId = variation.productId._id;
  const shopId = variation.productId.shopId;

  // 3. Cập nhật đồng thời
  await Promise.all([
    ProductVariation.findByIdAndUpdate(pvId, {
      $inc: {
        pvSoldCount: sign * qty,
        pvStockQuantity: -sign * qty, // sell: -qty, refund: +qty
      },
    }),

    Product.findByIdAndUpdate(productId, {
      $inc: {
        productSoldCount: sign * qty,
        productStockQuantity: -sign * qty,
      },
    }),

    ShopService.incrementShopSoldCount(shopId, sign * qty),
  ]);

  return {
    success: true,
    message: action === "sell" ? "Bán hàng thành công" : "Hoàn trả thành công",
    variationId: pvId,
    quantity: qty,
    action,
  };
};
// Bán hàng
exports.sellVariation = async (pvId, quantity = 1) => {
  return exports.updateVariationSales(pvId, quantity, "sell");
};

// Hoàn trả / Hủy đơn
exports.refundVariation = async (pvId, quantity = 1) => {
  return exports.updateVariationSales(pvId, quantity, "refund");
};

//Dùng khi tạo mới, cập nhật giá và xóa biến thể
exports.recalcProductAggregates = async (productId) => {
  const pid = new Types.ObjectId(productId);
  const [agg] = await ProductVariation.aggregate([
    { $match: { productId: pid, isDeleted: { $ne: true } } },
    {
      $group: {
        _id: null,
        totalStock: { $sum: "$pvStockQuantity" },
        totalSold: { $sum: "$pvSoldCount" },
        minPrice: { $min: "$pvPrice" },
        minOriginalPrice: { $min: "$pvOriginalPrice" },
      },
    },
  ]);

  const cheapest = await ProductVariation.findOne({
    productId: pid,
    isDeleted: { $ne: true },
  })
    .sort({ pvPrice: 1, _id: 1 })
    .select("_id");

  const update = {
    productStockQuantity: agg?.totalStock ?? 0,
    productSoldCount: agg?.totalSold ?? 0,
    productMinPrice: agg?.minPrice ?? 0,
    productMinOriginalPrice: agg?.minOriginalPrice ?? 0,
    variationId: cheapest?._id ?? null,
  };

  //await exports.updateProduct(params, update);
  await Product.findByIdAndUpdate(productId, update);
};

//Dùng khi thêm sửa xóa sản phẩm:
exports.recalcShopAggregates = async (shopId) => {
  const [agg] = await Product.aggregate([
    {
      $match: {
        shopId: new Types.ObjectId(shopId),
        isDeleted: { $ne: true },
      },
    },
    {
      $group: {
        _id: null,
        shopProductCount: { $sum: 1 },
        shopRateAvg: { $avg: "$productRateAvg" },
      },
    },
  ]);

  await ShopService.updateShop(shopId, {
    shopProductCount: agg?.shopProductCount || 0,
    shopRateAvg: agg?.shopRateAvg || 0,
  });
};

exports.getProductDashboardReport = async (query = {}) => {
  const {
    shopId,
    sortKey = "sold", // mặc định sort theo số lượng bán
    sortDir = "desc",
    page = 1,
    limit = 20,
    hasSale,
  } = query;

  // ---- VALIDATE shopId (nếu có) ----
  let shopObjectId = null;
  if (shopId) {
    if (!Types.ObjectId.isValid(shopId)) {
      const err = new Error("Sai định dạng shopId");
      err.status = 400;
      throw err;
    }
    shopObjectId = new Types.ObjectId(shopId);
  }

  // ---- FILTER CƠ BẢN ----
  const filter = {
    isDeleted: { $ne: true },
  };

  // Nếu có shopId hợp lệ -> lọc theo shop
  if (shopObjectId) {
    filter.shopId = shopObjectId;
  }

  if (hasSale === "true" || hasSale === true) {
    filter.productIsOnSale = true;
  }

  // ---- SORT ----
  const mapSort = {
    createdAt: "productCreateAt",
    sold: "productSoldCount",
    stock: "productStockQuantity",
    rating: "productRateAvg",
    price: "productMinPrice",
  };
  const field = mapSort[sortKey] || "productSoldCount";
  const dir = String(sortDir).toLowerCase() === "asc" ? 1 : -1;
  const sortObj = { [field]: dir, _id: dir };

  // ---- PHÂN TRANG ----
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const skipNum = (pageNum - 1) * limitNum;

  const [result] = await Product.aggregate([
    { $match: filter },

    {
      $facet: {
        // 1) Summary cho dashboard
        summary: [
          {
            $group: {
              _id: null,
              totalProducts: { $sum: 1 },
              totalSold: { $sum: "$productSoldCount" },
              totalStock: { $sum: "$productStockQuantity" },
              onSaleCount: {
                $sum: {
                  $cond: [{ $eq: ["$productIsOnSale", true] }, 1, 0],
                },
              },
              outOfStockCount: {
                $sum: {
                  $cond: [{ $eq: ["$productStockQuantity", 0] }, 1, 0],
                },
              },
              avgRating: { $avg: "$productRateAvg" },
            },
          },
        ],

        // 2) Danh sách sản phẩm (đã sort + phân trang)
        items: [
          { $sort: sortObj },
          { $skip: skipNum },
          { $limit: limitNum },
          {
            $project: {
              productName: 1,
              productThumb: 1,
              productSoldCount: 1,
              productStockQuantity: 1,
              productIsOnSale: 1,
              productDiscountPercent: 1,
              productMinPrice: 1,
              productMinOriginalPrice: 1,
              productRateAvg: 1,
              productCreateAt: 1,
            },
          },
        ],

        // 3) Tổng số document để tính total trang
        totalDocs: [{ $count: "count" }],
      },
    },

    {
      $project: {
        summary: { $arrayElemAt: ["$summary", 0] },
        items: 1,
        totalDocs: {
          $ifNull: [{ $arrayElemAt: ["$totalDocs.count", 0] }, 0],
        },
      },
    },
  ]);

  const safeSummary = result?.summary || {
    totalProducts: 0,
    totalSold: 0,
    totalStock: 0,
    onSaleCount: 0,
    outOfStockCount: 0,
    avgRating: 0,
  };

  return {
    success: true,
    message: `Lấy báo cáo sản phẩm cho ${
      shopId ? "shop" : "hệ thống"
    } thành công`,
    data: {
      summary: safeSummary,
      items: result?.items || [],
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: result?.totalDocs || 0,
      },
    },
    filter: {
      shopId: shopId || null, // giờ có thể null nếu lấy toàn hệ thống
      sortKey,
      sortDir,
      hasSale: !!(hasSale === "true" || hasSale === true),
    },
  };
};
