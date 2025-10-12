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
/**
 Backend sử dụng MongoDB, nhưng module ObjectId (thường từ mongodb hoặc mongoose) không được import trong file product.service.js. Điều này khiến việc parse after cursor thất bại, và backend không thể tạo điều kiện $or để lọc các bản ghi tiếp theo.
 */

/*
 *Category service
 */
exports.createCategory = async (body, file) => {
  const { categoryName } = body;
  if (!categoryName || !file) {
    const err = new Error("Thiếu tên danh mục hoặc hình ảnh đại diện");
    err.status = 400;
    throw err;
  }

  const slug = slugify(categoryName, { lower: true });

  const category = await Category.create({
    categoryName,
    categorySlug: slug,
    categoryThumb: file.path,
  });
  return {
    success: true,
    message: "Tạo danh mục thành công",
    category,
  };
};

exports.getCategory = async (sort) => {
  let sortOption = {};
  if (sort === "oldest") {
    sortOption.createdAt = 1; // cũ nhất trước
  } else if (sort === "newest") {
    sortOption.createdAt = -1; // mới nhất trước
  }
  const categories = await Category.find().sort(sortOption);
  return {
    success: true,
    message: "Lấy danh sách danh mục thành công",
    categories,
  };
};

exports.updateCategory = async (cid, categoryName, file) => {
  let dataUpdate = {};
  if (categoryName) {
    dataUpdate.categoryName = categoryName;
    dataUpdate.categorySlug = slugify(categoryName, { lower: true });
  }
  if (file) dataUpdate.categoryThumb = file.path;

  const updatedCategory = await Category.findByIdAndUpdate(cid, dataUpdate, {
    new: true,
  });

  return {
    success: true,
    message: "Cập nhật thành công",
    updatedCategory,
  };
};

exports.deteleCategory = async (cid) => {
  const isUsed = await Product.findOne({ categoryId: cid });

  if (isUsed) {
    const err = new Error(
      "Không thể xoá danh mục vì đang được sử dụng bởi sản phẩm."
    );
    err.status = 400;
    throw err;
  }

  const deleted = await Category.findByIdAndDelete(cid);
  return {
    success: true,
    message: "Xóa danh mục thành công",
  };
};

/*
 *Brand service
 */

exports.createBrand = async (body, file) => {
  const { brandName } = body;
  if (!brandName || !file) {
    const err = new Error("Thiếu tên thương hiệu hoặc hình ảnh đại diện");
    err.status = 400;
    throw err;
  }

  const slug = slugify(brandName, { lower: true });

  const brand = await Brand.create({
    brandName,
    brandSlug: slug,
    brandLogo: file.path,
  });
  return {
    success: true,
    message: "Tạo thương hiệu thành công",
    brand,
  };
};

exports.getBrand = async (sort) => {
  const sortOption = !sort
    ? {}
    : sort === "oldest"
    ? { createdAt: 1 }
    : { createdAt: -1 };
  const brands = await Brand.find().sort(sortOption);

  return {
    success: true,
    message: "Lấy danh sách thương hiệu thành công",
    brands,
  };
};

exports.updateBrand = async (bid, brandName, file) => {
  const dataUpdate = {};
  if (brandName) {
    dataUpdate.brandName = brandName;
    dataUpdate.brandSlug = slugify(brandName, { lower: true });
  }
  if (file) dataUpdate.brandLogo = file.path;

  const updatedBrand = await Brand.findByIdAndUpdate(bid, dataUpdate, {
    new: true,
  });

  return {
    success: true,
    message: "Cập nhật thương hiệu thành công",
    brand: updatedBrand,
  };
};

exports.deleteBrand = async (bid) => {
  const isUsed = await Product.findOne({ brandId: bid });
  if (isUsed) {
    const err = new Error(
      "Không thể xoá thương hiệu vì đang được sử dụng bởi sản phẩm."
    );
    err.status = 400;
    throw err;
  }

  await Brand.findByIdAndDelete(bid);

  return {
    success: true,
    message: "Xoá thương hiệu thành công",
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
        order: Number.isFinite(b.order) ? Number(b.order) : idx, // 👈 dùng order client, fallback idx
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

  const product = await Product.findById(pId)
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
    sortKey = "createdAt", // 'createdAt' | 'sold' | 'rating' | 'discount' | 'price'
    sortDir = "desc", // 'desc' | 'asc'
    hasSale, // true => chỉ lấy sản phẩm đang sale
    hasMall,
    after, // base64 của { id, field }
    excludeIds,
  } = query;
  //console.log("Nhan dieu kien loc product", query);

  const filter = {};
  const eIds = toList(query.excludeIds);
  if (eIds.length) {
    filter._id = { ...(filter._id || {}), $nin: eIds };
  }

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

  //Lọc theo themeId
  const tIds = toList(themeId);
  if (tIds.length) {
    // Lấy danh sách productId có trong bảng trung gian
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
      };
    }

    // lọc product theo danh sách productId
    filter._id = { $in: productIds };
  }

  // --- Lọc theo Mall (shopOfficial = true) ---
  if (hasMall === "true" || hasMall === true) {
    // Gọi đúng service
    const mallResult = await ShopService.getShops({ isMall: true, limit: 500 });
    const mallShops = mallResult.shops || [];

    const mallShopIds = mallShops.map((s) => s._id);

    if (filter.shopId) {
      // Nếu người dùng đang lọc theo shopId, chỉ giữ lại những shop trùng với mall
      const allowed = filter.shopId.$in.filter((id) =>
        mallShopIds.some((mid) => String(mid) === String(id))
      );
      filter.shopId = { $in: allowed };
    } else {
      filter.shopId = { $in: mallShopIds };
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

  // Luôn thêm _id làm tie-breaker để ổn định
  const sortObj = { [field]: dir, _id: dir };

  // --- Cursor filter (keyset pagination) ---
  if (after) {
    try {
      const { id, field: fvRaw } = b64.decode(after);
      const afterId = new ObjectId(id); // Đảm bảo ObjectId đã được định nghĩa

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
      // Bỏ qua cursor nếu lỗi, nhưng ghi log để debug
    }
  }

  // --- Truy vấn ---
  const items = await Product.find(filter)
    .populate("brandId", "brandName brandSlug")
    .populate("categoryId", "categoryName categorySlug")
    .populate("shopId", "shopName shopSlug shopLogo shopOfficial")
    .sort(sortObj)
    .limit(limitNum + 1) // lấy dư 1 để biết còn không
    .lean();

  // --- Cắt dư & tính nextCursor từ item cuối cùng sau khi cắt ---
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

  // console.log("Filter:", filter);
  // console.log("Sort:", sortObj);
  // console.log("Limit:", limitNum);

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

  const product = await Product.findById(pId);
  if (!product) {
    const err = new Error("Không tìm thấy sản phẩm");
    err.status = 404;
    throw err;
  }

  // 1) Thumbnail (nếu có file mới)
  if (files?.productThumb?.[0]?.path) {
    body.productThumb = files.productThumb[0].path; // Cloudinary URL
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
  const updatedProduct = await Product.findByIdAndUpdate(pId, body, {
    new: true,
  });

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

  const product = await Product.findById(pId);
  if (!product) {
    const err = new Error("Không tìm thấy sản phẩm");
    err.status = 404;
    throw err;
  }

  const shopId = product.shopId;

  //Xoa bien the san pham
  await ProductVariation.deleteMany({ productId: pId });

  //Xoa san pham
  await Product.findByIdAndDelete(pId);

  //Cap nhat lai thong ke
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
  const { pId } = query;

  const filter = { isDeleted: { $ne: true } };
  if (pId) {
    filter.productId = pId;
  }

  const list = await ProductVariation.find(filter).sort({ createdAt: -1 });

  return {
    success: true,
    message: "Lấy biến thể thành công",
    productVariations: list,
  };
};

// UPDATE
exports.updateProductVariation = async (params, body, files) => {
  // console.log("Duoc goi cap nhat bien the", params);
  const { pvId } = params;

  if (files?.length > 0) {
    body.pvImages = files.map((file) => file.path);
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

  const updated = await ProductVariation.findByIdAndUpdate(pvId, body, {
    new: true,
  });
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
  const doc = await ProductVariation.findByIdAndUpdate(
    pvId,
    { isDeleted: true },
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
exports.recalcProductAggregates = async (productId) => {
  const pid = new Types.ObjectId(productId);

  // console.log("Cap nhat qua day, pid", pid);
  const [agg] = await ProductVariation.aggregate([
    { $match: { productId: pid } },
    {
      $facet: {
        // 1) Tổng tồn
        stock: [
          { $group: { _id: null, totalStock: { $sum: "$pvStockQuantity" } } },
        ],
        // 2) Biến thể rẻ nhất
        cheapest: [
          { $sort: { pvPrice: 1, _id: 1 } },
          { $limit: 1 },
          { $project: { _id: 1, pvPrice: 1, pvOriginalPrice: 1 } },
        ],
      },
    },
  ]);

  const totalStock = agg?.stock?.[0]?.totalStock ?? 0;
  const cheapest = agg?.cheapest?.[0];

  const update = {
    productStockQuantity: totalStock,
    productMinPrice: cheapest?.pvPrice ?? 0,
    productMinOriginalPrice: cheapest?.pvOriginalPrice ?? 0,
    variationId: cheapest?._id ?? null, // phục vụ truy vấn sau này
  };

  const params = { pId: productId };
  await exports.updateProduct(params, update);
  // hoặc: await Product.findByIdAndUpdate(productId, update);
};

exports.recalcShopAggregates = async (shopId) => {
  const [agg] = await Product.aggregate([
    {
      $match: { shopId: new Types.ObjectId(shopId) },
    },
    {
      $group: {
        _id: null,
        shopProductCount: { $sum: 1 }, // đếm sản phẩm
        shopRateAvg: { $avg: "$productRateAvg" }, // trung bình đánh giá
      },
    },
  ]);

  const update = {
    shopProductCount: agg?.shopProductCount || 0,
    shopRateAvg: agg?.shopRateAvg || 0,
  };

  await ShopService.updateShop(shopId, update);
};
