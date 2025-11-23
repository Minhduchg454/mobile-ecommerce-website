const productService = require("./product.service");

//Category controller
exports.createCategory = async (req, res, next) => {
  try {
    const result = await productService.createCategory(req.body, req.file);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

exports.getCategory = async (req, res, next) => {
  try {
    const result = await productService.getCategory(req.query);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const result = await productService.updateCategory(
      req.params,
      req.body,
      req.file
    );
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    const { cId } = req.params;
    const result = await productService.deteleCategory(cId);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

//Brand controller
exports.createBrand = async (req, res, next) => {
  try {
    const result = await productService.createBrand(
      req.body,
      req.file,
      req.app
    );
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

exports.getBrand = async (req, res, next) => {
  try {
    const result = await productService.getBrand(req.query);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.getBrandStats = async (req, res, next) => {
  try {
    const result = await productService.getBrandStats();
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.updateBrand = async (req, res, next) => {
  try {
    const result = await productService.updateBrand(
      req.params,
      req.body,
      req.file,
      req.app
    );
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.deleteBrand = async (req, res, next) => {
  try {
    const { bId } = req.params; // brand id
    const result = await productService.deleteBrand(bId);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

//Product
exports.createProduct = async (req, res, next) => {
  try {
    const result = await productService.createProduct(req.body, req.files);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.getProductById = async (req, res, next) => {
  try {
    const params = req.params;
    const result = await productService.getProductById(params);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.getProduct = async (req, res, next) => {
  try {
    const result = await productService.getProducts(req.query);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.getShopProductsWithVariations = async (req, res, next) => {
  try {
    const result = await productService.getShopProductsWithVariations(
      req.query
    );
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const result = await productService.updateProduct(
      req.params,
      req.body,
      req.files,
      req.app
    );
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const params = req.params;
    const result = await productService.deleteProduct(params);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.getProductStats = async (req, res, next) => {
  try {
    const result = await productService.getProductStats(req.params);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.getProductDashboardReport = async (req, res, next) => {
  try {
    const result = await productService.getProductDashboardReport(req.query);
    return res.json(result);
  } catch (err) {
    next(err);
  }
};

/**
 * Block
 */

// ===== Product Content Block =====
exports.addProductBlock = async (req, res, next) => {
  try {
    const result = await productService.addProductBlock(
      req.params,
      req.body,
      req.files
    );
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.updateProductBlock = async (req, res, next) => {
  try {
    const result = await productService.updateProductBlock(
      req.params,
      req.body
    );
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.deleteProductBlock = async (req, res, next) => {
  try {
    const result = await productService.deleteProductBlock(req.params);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.reorderProductBlocks = async (req, res, next) => {
  try {
    const result = await productService.reorderProductBlocks(
      req.params,
      req.body
    );
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

/**
 * Product variation
 */

exports.createProductVariation = async (req, res, next) => {
  try {
    const result = await productService.creatProductVariation(
      req.body,
      req.files
    );
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

exports.getProductVariationById = async (req, res, next) => {
  try {
    const result = await productService.getProductVariationById(req.params);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.getProductVariations = async (req, res, next) => {
  try {
    const result = await productService.getProductVariations(req.query);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.updateProductVariation = async (req, res, next) => {
  try {
    const result = await productService.updateProductVariation(
      req.params,
      req.body,
      req.files
    );
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.deleteProductVariation = async (req, res, next) => {
  try {
    const result = await productService.deteleProductVariation(req.params);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

/**
 * Theme
 */

exports.createTheme = async (req, res, next) => {
  try {
    const result = await productService.createTheme(req.body, req.files);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

exports.getThemes = async (req, res, next) => {
  try {
    const result = await productService.getThemes(req.query);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.getThemeById = async (req, res, next) => {
  try {
    const result = await productService.getThemeById(req.params, req.query);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.updateTheme = async (req, res, next) => {
  try {
    const result = await productService.updateTheme(
      req.params,
      req.body,
      req.files
    );
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.deleteTheme = async (req, res, next) => {
  try {
    const result = await service.deleteTheme(req.params);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

/**
 * Product Theme
 */

exports.createProductTheme = async (req, res, next) => {
  try {
    const response = await productService.createProductTheme(req.body);
    res.status(201).json(response);
  } catch (err) {
    next(err);
  }
};

exports.getProductsByTheme = async (req, res, next) => {
  try {
    const { themeId } = req.params;
    const response = await productService.getProductsByTheme(themeId);
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
};

exports.getAllProductThemes = async (req, res, next) => {
  try {
    const response = await productService.getAllProductThemes();
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
};

exports.deleteProductTheme = async (req, res, next) => {
  try {
    const { id } = req.params;
    const response = await productService.deleteProductTheme(id);
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
};

exports.getThemesWithProducts = async (req, res, next) => {
  try {
    const response = await productService.getThemesWithProducts();
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
};
