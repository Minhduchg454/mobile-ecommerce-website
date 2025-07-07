const ProductCategory = require("../models/product/ProductCategory")
const Product = require("../models/product/Product")
const ProductVariation = require("../models/product/ProductVariation")

const getCategoriesWithAllChild = async () => {
    try {
        const categories = await ProductCategory.find()
            .populate({
                path: 'products',
                populate: {
                    path: 'variations'
                }
            })
            .lean();
        console.log("hi")
        return categories;
    } catch (error) {
        return error;
    }
};
module.exports = getCategoriesWithAllChild;