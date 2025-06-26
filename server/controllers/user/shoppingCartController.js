const ShoppingCart = require('../../models/user/ShoppingCart');
const asyncHandler = require('express-async-handler');

// Tạo mới giỏ hàng
exports.createCart = asyncHandler(async (req, res) => {
    // Lấy dữ liệu từ body
    const { totalPrice } = req.body;
    // Tạo mới shopping cart
    const cart = await ShoppingCart.create({ totalPrice });
    return res.status(201).json({ success: true, cart });
});

// Lấy thông tin giỏ hàng theo id
exports.getCart = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const cart = await ShoppingCart.findById(id);
    if (!cart) return res.status(404).json({ success: false, mes: 'Cart not found' });
    return res.json({ success: true, cart });
});

// Cập nhật giỏ hàng
exports.updateCart = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updated = await ShoppingCart.findByIdAndUpdate(id, req.body, { new: true });
    return res.json({ success: !!updated, cart: updated || 'Update failed' });
});

// Xóa giỏ hàng
exports.deleteCart = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const deleted = await ShoppingCart.findByIdAndDelete(id);
    return res.json({ success: !!deleted, mes: deleted ? 'Cart deleted' : 'Delete failed' });
}); 