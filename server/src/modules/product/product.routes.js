const router = require("express").Router();
const productController = require("./product.controller");
const uploadCloud = require("../../config/cloudinary.config");

//Category
router.put(
  "/category/:cid",
  uploadCloud.single("categoryThumb"),
  productController.updateCategory
);
router.post(
  "/category",
  uploadCloud.single("categoryThumb"),
  productController.createCategory
);
router.get("/category", productController.getCategory);
router.delete("/category/:cid", productController.deleteCategory);

//Brand
router.post(
  "/brand",
  uploadCloud.single("brandLogo"),
  productController.createBrand
);
router.get("/brands", productController.getBrand);
router.put(
  "/brand/:bid",
  uploadCloud.single("brandLogo"),
  productController.updateBrand
);
router.delete("/brand/:bid", productController.deleteBrand);

//Product
router.get("/products", productController.getProduct);
router.get("/product/:pId", productController.getProductById);
router.post(
  "/product",
  uploadCloud.fields([
    { name: "productThumb", maxCount: 1 },
    { name: "blockFiles", maxCount: 20 },
  ]),
  productController.createProduct
);
router.put(
  "/product/:pId",
  uploadCloud.fields([
    { name: "productThumb", maxCount: 1 },
    { name: "blockFiles", maxCount: 20 },
  ]),
  productController.updateProduct
);
router.delete("/product/:pId", productController.deleteProduct);

/**
 * Block
 */
// Product Block CRUD
router.post(
  "/product/:pId/block",
  uploadCloud.fields([{ name: "blockFile", maxCount: 1 }]),
  productController.addProductBlock
);
router.patch(
  "/product/:pId/block/:blockId",
  productController.updateProductBlock
);
router.delete(
  "/product/:pId/block/:blockId",
  productController.deleteProductBlock
);
router.patch(
  "/product/:pId/reorder-blocks",
  productController.reorderProductBlocks
);

/**
 * Product variation
 */
router.post(
  "/product-variation",
  uploadCloud.array("pvImages", 10),
  productController.createProductVariation
);
router.get(
  "/product-variation/:pvId",
  productController.getProductVariationById
);
router.get("/product-variations", productController.getProductVariations);
router.put(
  "/product-variation/:pvId",
  uploadCloud.array("pvImages", 10),
  productController.updateProductVariation
);
router.delete(
  "/product-variation/:pvId",
  productController.deleteProductVariation
);

/**
 * Theme
 */

router.post(
  "/theme",
  uploadCloud.array("themeImage", 10),
  productController.createTheme
);
router.get("/themes", productController.getThemes);
router.get("/theme/:themeId", productController.getThemeById);
router.put(
  "/theme/:themeId",
  uploadCloud.array("themeImage", 10),
  productController.updateTheme
);
router.delete("/theme/:themeId", productController.deleteTheme);

/**
 * ProductTheme
 */
router.post("/product-theme", productController.createProductTheme);
router.get("/product-theme", productController.getAllProductThemes);
router.get("/product-theme/:themeId", productController.getProductsByTheme);
router.delete("product-theme/:id", productController.deleteProductTheme);
router.get("/theme-with-product", productController.getThemesWithProducts);

module.exports = router;
