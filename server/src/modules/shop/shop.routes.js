const uploadCloud = require("../../config/cloudinary.config");
const router = require("express").Router();
const controller = require("./shop.controller");

//Shop

// Nếu có middleware auth/role thì thêm ở đây:
// const { verifyAccessToken, isAdminOrOwner } = require("../../middlewares/auth");
router.post(
  "/profile",
  /* verifyAccessToken, */ uploadCloud.fields([
    { name: "shopLogo", maxCount: 1 },
    { name: "shopBackground", maxCount: 1 },
    { name: "shopBanner", maxCount: 10 }, // nhiều ảnh
  ]),
  controller.createShop
);
router.get("/profiles", controller.getShops);
router.get("/profiles/dash-board", controller.getShopDashboardStats);
router.get(
  "/profile/:userId",
  /* verifyAccessToken, */ controller.getShopByUser
);

router.put(
  "/profile/:userId",
  /* verifyAccessToken, */ uploadCloud.fields([
    { name: "shopLogo", maxCount: 1 },
    { name: "shopBackground", maxCount: 1 },
    { name: "shopBanner", maxCount: 10 }, // nhiều ảnh
  ]),
  controller.updateShop
);
router.delete(
  "/profile/:userId",
  /* verifyAccessToken, */ controller.deleteShop
);

//ServicePlan
router.post("/service-plans", controller.createServicePlan);
router.get("/service-plans", controller.getServicePlans);
router.put("/service-plans/:sId", controller.updateServicePlan);
router.delete("/service-plans/:sId", controller.deleteServicePlan);

//ShopSubscrible
router.post("/subscribles", controller.createSubscription);
router.get("/subscribles/:shopId", controller.getSubscriptionsByShop);
router.put("/subscribles/cancel/:subId", controller.cancelSubscription); //dung patch do chi cap nhat mot phan tai nguyen

//Category-Shop
router.post(
  "/category-shop",
  uploadCloud.single("thumb"),
  controller.createCategoryShop
);
router.get("/category-shop", controller.getCategoryShops);
router.put(
  "/category-shop/:csId",
  uploadCloud.single("csThumb"),
  controller.updateCategoryShop
);
router.delete("/category-shop/:csId", controller.deleteCategoryShop);

module.exports = router;
