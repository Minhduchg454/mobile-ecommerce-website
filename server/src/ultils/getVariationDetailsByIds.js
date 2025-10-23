const ProductVariation = require("../models/product/ProductVariation");
const Specifications = require("../models/product/Specifications"); // không được bỏ
const ValueOfSpecifications = require("../models/product/ValueOfSpecifications");
const Product = require("../models/product/Product");
const ProductCategory = require("../models/product/ProductCategory");

const getVariationDetailsByIds = async (variationIds) => {
  try {
    const variations = await ProductVariation.find({
      _id: { $in: variationIds },
    })
      .populate({
        path: "valueOfSpecifications",
        populate: {
          path: "specificationTypeId", // tên loại thông số
        },
      })
      .populate({
        path: "productId",
        populate: [
          {
            path: "valueOfSpecifications",
            populate: {
              path: "specificationTypeId",
            },
          },
          {
            path: "categoryId", // danh mục
          },
        ],
      })
      .lean();
    //console.log(getVariationDetailsByIds, variations);
    return variations;
  } catch (error) {
    console.error("Lỗi khi lấy thông tin variations:", error);
    return [];
  }
};

module.exports = getVariationDetailsByIds;
