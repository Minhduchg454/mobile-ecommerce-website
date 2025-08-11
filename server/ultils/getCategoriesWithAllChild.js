const ProductCategory = require("../models/product/ProductCategory");
const Product = require("../models/product/Product");
const ProductVariation = require("../models/product/ProductVariation");
const Specifications = require("../models/product/Specifications");
const ValueOfSpecifications = require("../models/product/ValueOfSpecifications");

const getCategoriesWithAllChild = async () => {
  try {
    const categories = await ProductCategory.find()
      .populate({
        path: "products",
        populate: [
          {
            path: "variations",
            populate: {
              path: "valueOfSpecifications",
              populate: {
                path: "specificationTypeId",
              },
            },
          },
          {
            path: "valueOfSpecifications",
            populate: {
              path: "specificationTypeId",
            },
          },
        ],
      })
      .lean();
    // console.log("getCategoriesWithAllChild", categories);
    return categories;
  } catch (error) {
    console.error("Lỗi khi lấy categories:", error);
    return [];
  }
};

module.exports = getCategoriesWithAllChild;
