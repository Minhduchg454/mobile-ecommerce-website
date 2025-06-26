const CartItem = require('../../models/user/CartItem');
const asyncHandler = require('express-async-handler');

// Tạo mới CartItem
exports.createCartItem = asyncHandler(async (req, res) => {
    // Lấy dữ liệu từ body
    const { quantity, price, shoppingCart, productVariationId } = req.body;
    if (!quantity || !price || !shoppingCart || !productVariationId) {
        return res.status(400).json({ success: false, mes: 'Missing required fields' });
    }
    // Tạo mới cart item
    const cartItem = await CartItem.create({ quantity, price, shoppingCart, productVariationId });
    return res.status(201).json({ success: true, cartItem });
});

// Lấy danh sách CartItem theo shoppingCart
exports.getCartItems = asyncHandler(async (req, res) => {
    const { shoppingCart } = req.query;
    if (!shoppingCart) return res.status(400).json({ success: false, mes: 'Missing shoppingCart' });
    const cartItems = await CartItem.find({ shoppingCart });
    return res.json({ success: true, cartItems });
});

// Cập nhật CartItem
exports.updateCartItem = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updated = await CartItem.findByIdAndUpdate(id, req.body, { new: true });
    return res.json({ success: !!updated, cartItem: updated || 'Update failed' });
});

// Xóa CartItem
exports.deleteCartItem = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const deleted = await CartItem.findByIdAndDelete(id);
    return res.json({ success: !!deleted, mes: deleted ? 'CartItem deleted' : 'Delete failed' });
}); 