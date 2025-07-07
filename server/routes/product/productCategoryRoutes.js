const router = require("express").Router();
const ctrls = require("../../controllers/product/productCategoryController");
const uploadCloud = require("../../config/cloudinary.config"); // đường dẫn đúng của bạn

router.post("/", uploadCloud.single("thumb"), ctrls.createCategory);
router.get("/", ctrls.getCategories);
router.get("/by-name", ctrls.getCategoryIdByName);
router.put("/:pcid", uploadCloud.single("thumb"), ctrls.updateCategory); // Cập nhật ảnh mới nếu có
router.delete("/:pcid", ctrls.deleteCategory);

module.exports = router;

/*,
const { verifyAccessToken, isAdmin } = require("../../middlewares/verifyToken");

router.post('/', [verifyAccessToken, isAdmin], ctrls.createCategory)
router.get('/', ctrls.getCategories)
router.put('/:pcid', [verifyAccessToken, isAdmin], ctrls.updateCategory)
router.delete('/:pcid', [verifyAccessToken, isAdmin], ctrls.deleteCategory)
*/
