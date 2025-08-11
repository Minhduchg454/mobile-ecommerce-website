const getVariationsByIds = require("../ultils/getVariationDetailsByIds"); // đổi tên cho phù hợp nếu bạn rename
const he = require("he");

const searchProductByIds = async (variationIds) => {
  try {
    const variations = await getVariationsByIds(variationIds);

    const allProductVariations = variations.map((variation) => {
      const product = variation.productId;
      const category = product?.categoryId;

      const specifications = (variation.valueOfSpecifications || []).map(
        (v) => ({
          type: v.specificationTypeId?.typeSpecifications || "Không rõ",
          value: v.value,
          unitOfMeasure: v.specificationTypeId?.unitOfMeasure,
        })
      );

      const secondSpecifications = (product?.valueOfSpecifications || []).map(
        (v) => ({
          type: v.specificationTypeId?.typeSpecifications || "Không rõ",
          value: v.value,
          unitOfMeasure: v.specificationTypeId?.unitOfMeasure,
        })
      );

      return {
        varationId: variation._id,
        variationName: variation.productVariationName,
        link: `${category?.slug || "unknown"}/${
          product?.slug || "unknown"
        }/?code=${variation._id?.toString()}`,
        variationId: variation._id?.toString() || null,
        title: `${product?.productName || ""} - ${variation.color || ""} ${
          variation.storage || ""
        }`.trim(),
        productName: product?.productName || "",
        slug: product?.slug || "",
        brand: product?.brandId || null,
        categoryName: category?.productCategoryName || "",
        descriptionText: he.decode(
          typeof product?.description === "string"
            ? product.description.replace(/<[^>]+>/g, "")
            : ""
        ),
        price: variation.price,
        image: Array.isArray(variation.images) ? variation.images[0] : null,
        specifications,
        secondSpecifications,
        stockQuantity: variation.stockQuantity,
        rating: variation.rating,
        totalRating: variation.totalRating,
      };
    });

    // Gom specs không trùng lặp
    return allProductVariations.map((item) => {
      const mergedSpecifications = [
        ...(item.specifications || []),
        ...(item.secondSpecifications || []),
      ].reduce((acc, spec) => {
        acc.set(spec.type, {
          name: spec.type,
          value: spec.value,
          unitOfMeasure: spec.unitOfMeasure,
        });
        return acc;
      }, new Map());

      const uniqueSpecifications = Array.from(mergedSpecifications.values());

      return {
        id: item.varationId ? item.varationId.toString() : null,
        link: process.env.CLIENT_URL + "/" + item.link,
        name: `${item.productName} - ${item.variationName}`,
        price: `${item.price.toLocaleString("vi-VN")}₫`,
        category: item.categoryName,
        description: item.descriptionText,
        image: item.image || null,
        specifications: uniqueSpecifications,
        stockQuantity: item.stockQuantity,
        rating: item.rating,
        totalRating: item.totalRating,
      };
    });
  } catch (err) {
    console.error("Lỗi khi tìm kiếm:", err);
    return [];
  }
};

module.exports = searchProductByIds;
