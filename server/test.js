const mongoose = require("mongoose");
const Product = require("./models/product");
const Fuse = require('fuse.js');
const he = require('he');

mongoose.connect("mongodb://localhost:27017/cuahangdientu", {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log("Kết nối MongoDB thành công"))
    .catch(err => console.error("Lỗi kết nối MongoDB:", err));

async function searchProduct() {
    try {
        const products = await Product.find({});
        const cleanProducts = products.map(p => ({
            ...p._doc,
            descriptionText: he.decode(p.description.join(' ').replace(/<[^>]+>/g, ''))
        }));

        const options = {
            includeScore: true,
            threshold: 0.6,
            ignoreLocation: true,
            minMatchCharLength: 2,
            keys: [
                'title',
                'slug',
                'descriptionText',
                'brand',
                'category',
                'color'
            ]
        };

        const fuse = new Fuse(cleanProducts, options);

        const result = fuse.search("Tốc độ CPU 3.39 Ghz");

        result.forEach(r => {
            console.log(`Tiêu đề: ${r.item.title}`);
            console.log(`Điểm phù hợp: ${r.score.toFixed(2)}`);
            console.log(`Giá: ${r.item.price}`);
            console.log(`Màu: ${r.item.color}`);
            console.log(`Miêu tả: ${r.item.descriptionText}`)
            console.log('---');
        });
    } catch (err) {
        console.error("Lỗi khi tìm kiếm:", err);
    }
}

mongoose.connection.once('open', () => {
    searchProduct();
});
