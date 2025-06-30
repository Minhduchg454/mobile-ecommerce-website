const Product = require("../models/product/ProductVariation");
const Fuse = require("fuse.js");
const he = require("he");

const searchProduct = async (query) => {
    try {
        const products = await Product.find({});

        const cleanProducts = products.map(p => ({
            ...p._doc,
            descriptionText: he.decode(
                p.description.join(" ").replace(/<[^>]+>/g, "")
            ),
        }));

        const options = {
            includeScore: true,
            threshold: 0.6,
            ignoreLocation: true,
            minMatchCharLength: 2,
            keys: [
                "title",
                "slug",
                "descriptionText",
                "brand",
                "category",
                "color",
            ],
        };

        const fuse = new Fuse(cleanProducts, options);

        const result = fuse.search(query);

        return result.map(r => ({
            title: r.item.title,
            price: r.item.price,
            color: r.item.color,
            description: r.item.descriptionText,
            score: r.score,
        }));
    } catch (err) {
        console.error("Lỗi khi tìm kiếm:", err);
        return [];
    }
};

module.exports = searchProduct;