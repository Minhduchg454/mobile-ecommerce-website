const WishList = require("../../models/user/WishList");

// Tạo mới wish list item
exports.createWishList = async (req, res) => {
  try {
    const { userId, productVariationId } = req.body;
    if (!userId || !productVariationId) {
      return res.status(400).json({
        success: false,
        mes: "Missing userId or productVariationId",
      });
    }

    // Kiểm tra đã tồn tại chưa
    const existed = await WishList.findOne({ userId, productVariationId });
    if (existed) {
      return res
        .status(400)
        .json({ success: false, mes: "Item already exists in wishlist" });
    }

    const wishItem = await WishList.create({ userId, productVariationId });
    res.json({ success: true, wishItem });
  } catch (err) {
    res.status(500).json({ success: false, mes: err.message });
  }
};

// Lấy toàn bộ wishlist
exports.getWishList = async (req, res) => {
  try {
    const wishList = await WishList.find()
      .populate("productVariationId")
      .populate({
        path: "userId",
        populate: {
          path: "_id", // chính là User
          model: "User",
          select: "avatar firstName lastName",
        },
      });
    res.json({ success: true, wishList });
  } catch (err) {
    res.status(500).json({ success: false, mes: err.message });
  }
};

// Lấy wishlist theo điều kiện tùy ý (?userId=...&productVariationId=...)
exports.getWishListByQuery = async (req, res) => {
  try {
    const filters = { ...req.query };

    const wishList = await WishList.find(filters)
      .populate("productVariationId")
      .populate({
        path: "userId",
        populate: {
          path: "_id", // chính là User
          model: "User",
          select: "avatar firstName lastName",
        },
      });

    res.json({ success: true, wishList });
  } catch (err) {
    res.status(500).json({ success: false, mes: err.message });
  }
};

// Cập nhật wishlist item (nếu cần đổi productVariationId)
exports.updateWishList = async (req, res) => {
  try {
    const { id } = req.params;
    const { productVariationId } = req.body;

    const updated = await WishList.findByIdAndUpdate(
      id,
      { productVariationId },
      { new: true }
    );
    res.json({ success: !!updated, wishItem: updated || "Update failed" });
  } catch (err) {
    res.status(500).json({ success: false, mes: err.message });
  }
};

// Xóa wishlist item theo id
exports.deleteWishList = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await WishList.findByIdAndDelete(id);
    res.json({
      success: !!deleted,
      mes: deleted ? "Deleted successfully" : "Delete failed",
    });
  } catch (err) {
    res.status(500).json({ success: false, mes: err.message });
  }
};

//Xoa wishList theo userId vaf productVaritationId
exports.deleteWishListByCondition = async (req, res) => {
  try {
    const { userId, productVariationId } = req.query;

    if (!userId || !productVariationId) {
      return res.status(400).json({
        success: false,
        mes: "Missing userId or productVariationId",
      });
    }

    const deleted = await WishList.findOneAndDelete({
      userId,
      productVariationId,
    });

    res.json({
      success: !!deleted,
      mes: deleted ? "Deleted from wishlist" : "Item not found in wishlist",
    });
  } catch (err) {
    res.status(500).json({ success: false, mes: err.message });
  }
};
