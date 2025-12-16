// /src/services/search.service.js
const Product = require("../../product/entities/product.model");
const ProductVariation = require("../../product/entities/productVariation.model");
const Category = require("../../product/entities/category.model");
const Brand = require("../../product/entities/brand.model");
const Shop = require("../../shop/entitties/shop.model");
const Fuse = require("fuse.js");
const he = require("he");
const { Types } = require("mongoose");

let fuseIndex = null;
let allCategoryNames = [];

// HÀM LOẠI BỎ DẤU TIẾNG VIỆT
function removeVietnameseSigns(str) {
  if (!str) return "";
  str = str.toString();
  const map = {
    à: "a",
    á: "a",
    ạ: "a",
    ả: "a",
    ã: "a",
    â: "a",
    ầ: "a",
    ấ: "a",
    ậ: "a",
    ẩ: "a",
    ẫ: "a",
    ă: "a",
    ằ: "a",
    ắ: "a",
    ặ: "a",
    ẳ: "a",
    ẵ: "a",
    è: "e",
    é: "e",
    ẹ: "e",
    ẻ: "e",
    ẽ: "e",
    ê: "e",
    ề: "e",
    ế: "e",
    ệ: "e",
    ể: "e",
    ễ: "e",
    ì: "i",
    í: "i",
    ị: "i",
    ỉ: "i",
    ĩ: "i",
    ò: "o",
    ó: "o",
    ọ: "o",
    ỏ: "o",
    õ: "o",
    ô: "o",
    ồ: "o",
    ố: "o",
    ộ: "o",
    ổ: "o",
    ỗ: "o",
    ơ: "o",
    ờ: "o",
    ớ: "o",
    ợ: "o",
    ở: "o",
    ỡ: "o",
    ù: "u",
    ú: "u",
    ụ: "u",
    ủ: "u",
    ũ: "u",
    ư: "u",
    ừ: "u",
    ứ: "u",
    ự: "u",
    ử: "u",
    ữ: "u",
    ỳ: "y",
    ý: "y",
    ỵ: "y",
    ỷ: "y",
    ỹ: "y",
    đ: "d",
    À: "A",
    Á: "A",
    Ạ: "A",
    Ả: "A",
    Ã: "A",
    Â: "A",
    Ầ: "A",
    Ấ: "A",
    Ậ: "A",
    Ẩ: "A",
    Ẫ: "A",
    Ă: "A",
    Ằ: "A",
    Ắ: "A",
    Ặ: "A",
    Ẳ: "A",
    Ẵ: "A",
    È: "E",
    É: "E",
    Ẹ: "E",
    Ẻ: "E",
    Ẽ: "E",
    Ê: "E",
    Ề: "E",
    Ế: "E",
    Ệ: "E",
    Ể: "E",
    Ễ: "E",
    Ì: "I",
    Í: "I",
    Ị: "I",
    Ỉ: "I",
    Ĩ: "I",
    Ò: "O",
    Ó: "O",
    Ọ: "O",
    Ỏ: "O",
    Õ: "O",
    Ô: "O",
    Ồ: "O",
    Ố: "O",
    Ộ: "O",
    Ổ: "O",
    Ỗ: "O",
    Ơ: "O",
    Ờ: "O",
    Ớ: "O",
    Ợ: "O",
    Ở: "O",
    Ỡ: "O",
    Ù: "U",
    Ú: "U",
    Ụ: "U",
    Ủ: "U",
    Ũ: "U",
    Ư: "U",
    Ừ: "U",
    Ứ: "U",
    Ự: "U",
    Ử: "U",
    Ữ: "U",
    Ỳ: "Y",
    Ý: "Y",
    Ỵ: "Y",
    Ỷ: "Y",
    Ỹ: "Y",
    Đ: "D",
  };
  return str.replace(
    /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ]/g,
    (match) => map[match] || match
  );
}
exports.removeVietnameseSigns = removeVietnameseSigns;

// 1. CẤU HÌNH FUSE TỐI ƯU
const fuseOptions = {
  includeScore: true,
  // 0.0 là phải khớp hoàn toàn, 1.0 là khớp cái gì cũng được.
  // Giảm từ 0.5 xuống 0.3 để loại bỏ các kết quả "rác" như tên Shop trùng ký tự.
  threshold: 0.3,
  distance: 100,
  minMatchCharLength: 2, // Tăng lên 2 để bỏ qua các từ quá ngắn
  shouldSort: true,
  ignoreLocation: true,
  keys: [
    // Tăng trọng số cho Tên sản phẩm để nó là ưu tiên số 1
    { name: "productName", weight: 6.0 },
    { name: "productNameNoSign", weight: 5.0 },
    { name: "categoryName", weight: 1.0 },
    { name: "brandName", weight: 1.5 },
    { name: "variationName", weight: 0.5 },
    { name: "shopName", weight: 0.1 },
    { name: "descriptionText", weight: 0.1 },
  ],
};

// 2. XÂY DỰNG INDEX
async function buildIndexData() {
  console.log("[Search Service] Bắt đầu xây dựng chỉ mục...");
  const [products, variations, categories, brands, shops] = await Promise.all([
    Product.find({
      isDeleted: { $ne: true },
      productStatus: "approved",
      variationId: { $ne: null },
    })
      .select(
        "productName productSlug productDescription productThumb categoryId brandId shopId " +
          "productIsOnSale productDiscountPercent productRateAvg productSoldCount"
      )
      .lean(),
    ProductVariation.find({ isDeleted: { $ne: true } })
      .select(
        "productId pvName pvPrice pvOriginalPrice pvImages pvStockQuantity"
      )
      .lean(),
    Category.find({ isDeleted: { $ne: true } })
      .select("categoryName")
      .lean(),
    Brand.find({ isDeleted: { $ne: true } })
      .select("brandName")
      .lean(),
    Shop.find({ isDeleted: { $ne: true }, shopStatus: "approved" })
      .select("shopName shopSlug shopLogo shopIsOfficial")
      .lean(),
  ]);

  allCategoryNames = categories.map((c) =>
    removeVietnameseSigns(c.categoryName.toLowerCase())
  );

  const variationMap = new Map();
  for (const v of variations) {
    const pId = v.productId.toString();
    if (!variationMap.has(pId)) variationMap.set(pId, []);
    variationMap.get(pId).push(v);
  }

  const categoryMap = new Map(
    categories.map((c) => [c._id.toString(), c.categoryName])
  );
  const brandMap = new Map(brands.map((b) => [b._id.toString(), b.brandName]));
  const shopMap = new Map(shops.map((s) => [s._id.toString(), s]));

  const allProductVariations = [];

  for (const product of products) {
    const pIdString = product._id.toString();
    const shopIdString = product.shopId?.toString();
    const shopData = shopMap.get(shopIdString);
    if (!shopData) continue;

    const productVariations = variationMap.get(pIdString) || [];
    const categoryName = categoryMap.get(product.categoryId?.toString()) || "";
    const brandName = brandMap.get(product.brandId?.toString()) || "";
    const productNameNoSign = removeVietnameseSigns(
      product.productName
    ).toLowerCase();

    for (const variation of productVariations) {
      const indexObject = {
        productId: pIdString,
        variationId: variation._id.toString(),
        productName: product.productName,
        productNameNoSign,
        slug: product.productSlug,
        thumb: (variation.pvImages || [])[0] || product.productThumb,
        productMinPrice: variation.pvPrice || 0,
        productMinOriginalPrice: variation.pvOriginalPrice || 0,
        productIsOnSale: product.productIsOnSale || false,
        productDiscountPercent: product.productDiscountPercent || 0,
        shopId: shopIdString,
        shopName: shopData.shopName,
        shopSlug: shopData.shopSlug,
        shopLogo: shopData.shopLogo,
        shopOfficial: shopData.shopIsOfficial || false,
        rating: product.productRateAvg || 0,
        totalSold: product.productSoldCount || 0,
        variationName: variation.pvName || "",
        categoryName,
        brandName,
        descriptionText: he.decode(
          (product.productDescription || "").replace(/<[^>]+>/g, "")
        ),
      };
      allProductVariations.push(indexObject);
    }
  }
  console.log(
    `[Search Service] Xây dựng xong: ${allProductVariations.length} biến thể.`
  );
  //console.log("Danh sach san pham", allProductVariations);
  return { data: allProductVariations };
}

// 3. KHỞI TẠO
exports.initializeSearch = async () => {
  try {
    const { data } = await buildIndexData();
    fuseIndex = new Fuse(data, fuseOptions);
    console.log("[Search Service] Chỉ mục Fuse đã sẵn sàng.");
  } catch (error) {
    console.error("[Search Service] Lỗi khi xây dựng chỉ mục:", error);
  }
};

exports.getAllCategoryNames = () => allCategoryNames;
exports.getFuseIndex = () => fuseIndex;

// 4. HÀM SEARCH (ĐÃ SỬA HOÀN CHỈNH)
//Query → Fuse.js (tính điểm) → Sắp xếp → Lọc giá → De-duplicate → Trả về limit
/**
  Điểm càng thấp → càng phù hợp (0.0 = khớp hoàn hảo, 1.0 = không khớp).
  Fuse dùng Levenshtein distance + partial match + trọng số (weight).
  threshold: 0.5 → chỉ giữ kết quả tốt hơn 50%.
 */
exports.search = (query, options = {}) => {
  const { limit = 5, minPrice, maxPrice, category } = options;

  if (!fuseIndex) {
    console.warn("[Search Service] Chỉ mục chưa sẵn sàng.");
    return [];
  }

  const normalizedQuery = query?.trim().toLowerCase() || "";
  const queryNoSign = removeVietnameseSigns(normalizedQuery);
  const normalizedCategory = category?.trim().toLowerCase() || "";
  const categoryNoSign = removeVietnameseSigns(normalizedCategory);

  console.log("Từ khóa tìm kiếm:", queryNoSign, "| Danh mục:", categoryNoSign);

  let fuseResults = [];

  // === CASE 1: Có query → Tìm rộng bằng Fuse ===
  if (normalizedQuery) {
    fuseResults = fuseIndex.search(queryNoSign);

    // === ƯU TIÊN KHỚP TRONG variationName ===
    const colorKeywords = [
      "cam",
      "đỏ",
      "xanh",
      "đen",
      "trắng",
      "vàng",
      "tím",
      "hồng",
      "xám",
      "bạc",
    ];
    const hasColorKeyword = colorKeywords.some((k) => queryNoSign.includes(k));

    if (hasColorKeyword) {
      fuseResults = fuseResults.map((r) => {
        const varMatch = r.item.variationName
          .toLowerCase()
          .includes(normalizedQuery.split(" ").pop());
        if (varMatch) {
          r.score = Math.min(r.score, 0.000001);
        }
        return r;
      });
    }

    // === LỚP 1: ƯU TIÊN DANH MỤC ===
    const isCategoryKeyword = allCategoryNames.includes(queryNoSign);
    if (isCategoryKeyword) {
      fuseResults = fuseResults.map((r) => {
        const catNoSign = removeVietnameseSigns(
          r.item.categoryName.toLowerCase()
        );
        if (catNoSign === queryNoSign) {
          r.score = Math.min(r.score, 0.00001);
        }
        return r;
      });
    }

    // === LỚP 2: LỌC CHẶT DANH MỤC ===
    if (isCategoryKeyword) {
      fuseResults = fuseResults.filter((r) => {
        const catNoSign = removeVietnameseSigns(
          r.item.categoryName.toLowerCase()
        );
        return catNoSign === queryNoSign;
      });
    }
  }

  // === CASE 2: Chỉ có danh mục (từ bộ lọc) ===
  else if (normalizedCategory) {
    const allDocs = fuseIndex.getIndex().docs;
    fuseResults = allDocs
      .map((item, idx) => {
        const cat = item.categoryName.toLowerCase();
        const catNoSign = removeVietnameseSigns(cat);
        const matched =
          cat.includes(normalizedCategory) ||
          catNoSign.includes(categoryNoSign);
        return matched ? { item, score: 0, refIndex: idx } : null;
      })
      .filter(Boolean);
  }

  // === CASE 3: Không có gì → Top bán chạy ===
  else {
    const allDocs = fuseIndex.getIndex().docs;
    fuseResults = allDocs
      .map((item, idx) => ({ item, score: 0, refIndex: idx }))
      .sort(
        (a, b) =>
          b.item.totalSold - a.item.totalSold || b.item.rating - a.item.rating
      );
  }

  // === SẮP XẾP: score → totalSold → rating ===
  const sortedResults = fuseResults.sort((a, b) => {
    if (a.score !== b.score) return a.score - b.score;
    if (b.item.totalSold !== a.item.totalSold)
      return b.item.totalSold - a.item.totalSold;
    return b.item.rating - a.item.rating;
  });

  if (options.productIsOnSale === true) {
    sortedResults.sort((a, b) => {
      if (a.item.productIsOnSale && b.item.productIsOnSale) {
        return (
          b.item.productDiscountPercent - a.item.productDiscountPercent ||
          a.score - b.score
        );
      }
      return (
        b.item.productIsOnSale - a.item.productIsOnSale || a.score - b.score
      );
    });
  }

  let filtered = sortedResults;
  if (minPrice != null || maxPrice != null) {
    filtered = sortedResults.filter((r) => {
      const p = r.item.productMinPrice;
      return (!minPrice || p >= minPrice) && (!maxPrice || p <= maxPrice);
    });
  }
  if (options.productIsOnSale === true) {
    filtered = filtered.filter((r) => {
      return (
        r.item.productIsOnSale === true &&
        r.item.productDiscountPercent > 0 &&
        r.item.productMinPrice < r.item.productMinOriginalPrice
      );
    });
  }

  // === DE-DUPLICATE + LIMIT ===
  const seen = new Set();
  const final = [];
  for (const { item } of filtered) {
    if (!seen.has(item.productId)) {
      seen.add(item.productId);
      final.push({
        productId: item.productId,
        variationId: item.variationId,
        productName: item.productName,
        variationName: item.variationName,
        slug: item.slug,
        thumb: item.thumb,
        productMinPrice: item.productMinPrice,
        productMinOriginalPrice: item.productMinOriginalPrice,
        productDiscountPercent: item.productDiscountPercent,
        productIsOnSale: item.productIsOnSale,
        rating: item.rating,
        totalSold: item.totalSold,
        shopName: item.shopName,
        shopSlug: item.shopSlug,
        shopLogo: item.shopLogo,
        isOfficial: item.shopOfficial,
        category: item.categoryName,
        brand: item.brandName,
      });
      if (final.length >= limit) break;
    }
  }

  return final;
};
