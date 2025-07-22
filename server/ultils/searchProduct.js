const getCategoriesWithAllChild = require("./getCategoriesWithAllChild");
const Fuse = require("fuse.js");
const he = require("he");

const searchProduct = async (query) => {
  try {
    const categories = await getCategoriesWithAllChild();
    const allProductVariations = [];

    for (const category of categories) {
      const products = category.products || [];

      for (const product of products) {
        const variations = Array.isArray(product.variations)
          ? product.variations
          : [];

        for (const variation of variations) {
          const specifications = (variation.valueOfSpecifications || []).map(
            (v) => {
              return {
                type: v.specificationTypeId?.typeSpecifications || "Không rõ",
                value: v.value,
              };
            }
          );

          allProductVariations.push({
            // ...variation,
            varationId: variation._id,
            variationName: variation.productVariationName,
            link: `${category.slug}/${
              product.slug
            }/?code=${variation._id?.toString()}`,
            variationId: variation._id?.toString() || null,
            title: `${product.productName} - ${variation.color || ""} ${
              variation.storage || ""
            }`.trim(),
            productName: product.productName,
            slug: product.slug,
            brand: product.brandId,
            categoryName: category.productCategoryName,
            descriptionText: he.decode(
              typeof product.description === "string"
                ? product.description.replace(/<[^>]+>/g, "")
                : ""
            ),
            price: variation.price,
            image: Array.isArray(variation.images) ? variation.images[0] : null,
            specifications,
          });
        }
      }
    }

    // console.log(allProductVariations[0])

    const options = {
      includeScore: true,
      threshold: 0.5,
      ignoreLocation: true,
      minMatchCharLength: 2,
      keys: [
        "title",
        "slug",
        "descriptionText",
        "brand",
        "categoryName",
        "color",
        "storage",
        "specifications.type", // ✅ tìm theo loại thông số
        "specifications.value", // ✅ tìm theo giá trị thông số
      ],
    };
    const fuse = new Fuse(allProductVariations, options);
    const results = fuse.search(query).slice(0, 6);
    console.log("origin search results: ", results);

    return results.map((result) => {
      const item = result.item;
      console.log("🔍 item._id typeof:", typeof item._id, item._id);

      return {
        id: item.varationId ? item.varationId.toString() : null,
        link: item.link,
        name: `${item.productName} - ${item.variationName}`,
        price: `${item.price.toLocaleString("vi-VN")}₫`,
        category: item.categoryName,
        description: item.descriptionText,
        image: item.image || null,
        specifications: (item.specifications || []).map((spec) => ({
          name: spec.type,
          value: spec.value,
        })),
      };
    });
  } catch (err) {
    console.error("❌ Lỗi khi tìm kiếm:", err);
    return [];
  }
};

module.exports = searchProduct;
