const router = require("express").Router();
const userController = require("./user.controller");
const uploadCloud = require("../../config/cloudinary.config");
const { verifyAccessToken } = require("../../middlewares/verifyToken");

/**
 * User
 */
router.get("/current", verifyAccessToken, userController.getCurrent);
router.put(
  "/profile/:uId",
  uploadCloud.single("userAvatar"),
  userController.updateUser
);
router.get("/profiles", userController.getUsers);
router.delete("/profiles/:uId", userController.deleteUser);

/**
 * Address
 */

router.post("/addresses", userController.createAddress);
router.get("/addresses", userController.getAddresses);
router.put("/addresses/:addressId", userController.updateAddress);
router.delete("/addresses/:addressId", userController.deleteAddress);

/**
 * Bank
 */

router.post(
  "/banks",
  uploadCloud.single("bankLogo"),
  userController.createBank
);
router.get("/banks", userController.getBank);
router.put(
  "/banks/:bId",
  uploadCloud.single("bankLogo"),
  userController.updateBank
);
router.delete("banks/:bId", userController.deleteBank);

module.exports = router;

/**
 * PaymenAccount
 */
router.post("/payment-accounts", userController.createPaymentAccount);
router.get("/payment-accounts", userController.getPaymentAccounts);
router.put("/payment-accounts/:aId", userController.updatePaymentAccount);
router.delete("/payment-accounts/:aId", userController.deletePaymentAccount);

/**
 * Balance
 */
router.get("/balances", userController.getCurrentUserBalanceByFor);
router.put("/balances/:userId", userController.updateBalance);

/**
 * Transaction
 */

router.get("/transactions", userController.getTransactions);
router.get("/transactions/:tId", userController.getTransactionDetail);
