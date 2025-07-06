const router = require("express").Router();
const ctrls = require("../../controllers/product/productCategoryController");

router.post("/", ctrls.createCategory);
router.get("/", ctrls.getCategories);
router.get("/by-name", ctrls.getCategoryIdByName);
router.put("/:pcid", ctrls.updateCategory);
router.delete("/:pcid", ctrls.deleteCategory);

module.exports = router;

/*,
const { verifyAccessToken, isAdmin } = require("../../middlewares/verifyToken");

router.post('/', [verifyAccessToken, isAdmin], ctrls.createCategory)
router.get('/', ctrls.getCategories)
router.put('/:pcid', [verifyAccessToken, isAdmin], ctrls.updateCategory)
router.delete('/:pcid', [verifyAccessToken, isAdmin], ctrls.deleteCategory)
*/
