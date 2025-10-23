const Customer = require("./entities/customer.model");
const shoppingService = require("../shopping/cart.service");

exports.getCartByCustomerId = async (cId) => {
  const customer = await Customer.findById(cId).select("cartId");

  if (!customer) {
    const err = new Error("Customer không tồn tại");
    err.status = 404;
    throw err;
  }

  // Nếu đã có cartId → trả về ngay
  if (customer.cartId) {
    return {
      success: true,
      message: "Lấy cartId hiện có thành công",
      cartId: customer.cartId,
    };
  }

  // Nếu chưa có cartId → tạo mới giỏ hàng bên Shopping rồi cập nhật
  const created = await shoppingService.createCart(); // hàm này sẽ tạo nếu chưa có
  const newCartId = created?.cart?._id;

  if (!newCartId) {
    const err = new Error("Không tạo được giỏ hàng");
    err.status = 500;
    throw err;
  }

  // Cập nhật cartId cho Customer
  customer.cartId = newCartId;
  await customer.save();

  return {
    success: true,
    message: "Tạo giỏ hàng và cập nhật cartId thành công",
    cartId: newCartId,
  };
};
