const brandRoutes = require("./branchRoutes");
const productCategoryRoutes = require("./productCategoryRoutes");
const productRoutes = require("./productRoutes");
const couponRoutes = require("./couponRoutes");
const couponProductVariationRoutes = require("./couponProductVariationRoutes");
const specificProductRoutes = require("./specificProRoutes");
const proVarianRoutes = require("./proVarianRoutes");
const warrantyCardRoutes = require("./warrantyCardControllerRoutes");
const specificationRoutes = require("./specificationsRoutes");
const valueOfSpecificationsRoutes = require("./valueOfSpecificationsRoutes");

// Hàm khởi tạo các route liên quan đến sản phẩm
function initProductRoutes(app) {
  app.use("/api/brands", brandRoutes);
  app.use("/api/productCategories", productCategoryRoutes);
  app.use("/api/products", productRoutes);
  app.use("/api/coupons", couponRoutes);
  app.use("/api/couponProductVariations", couponProductVariationRoutes);
  app.use("/api/productVariations", proVarianRoutes);
  app.use("/api/specificProducts", specificProductRoutes);
  app.use("/api/warrantyCards", warrantyCardRoutes);
  app.use("/api/specifications", specificationRoutes);
  app.use("/api/valueOfSpecifications", valueOfSpecificationsRoutes);
}

module.exports = initProductRoutes;

/*
    1.Tao thuong hieu:
    Post : http://localhost:5000/api/brands
    {
    "brandName": "Samsung"
    }
     id: 6855b34620fcb06c67f0a1a6

    2.Tao danh muc: 
    Post: http://localhost:5000/api/productCategories
    {
        "productCategoryName": "Điện Thoại"
    }
     => id: 6855ba0fdffd1bd4e14fb9ff

    3.Tao product
    Post: http://localhost:5000/api/products
    Su dung form-data
    {
        "productName": "Samsung Galaxy S25 Ultra",
        "description": "Smartphone cao cấp với camera siêu nét và hiệu năng vượt trội.",
        "brandId": "<Dung Id của brandId>",
        "categoryId": "<Dung Id của CategoryId>"
        "Thumb": <Duong dan file>
    }

    => id thu duoc: 6861fc4dfc0366a5baf06725

    4.Tao bien theo theo productId
    Post: http://localhost:5000/api/productVariations/
    Su dung form data
    productVariationName: Samsung Galaxy S25 Ultra Black 16/256
    price: 25000000
    stockQuantity: 10
    images: them anh
    productId: 6861fc4dfc0366a5baf06725

    




    

    


*/
