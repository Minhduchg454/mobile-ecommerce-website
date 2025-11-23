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

exports.getCustomerDetail = async (cId) => {
  // cId ở đây chính là _id của Customer,
  // trong schema Customer của bạn _id = ref User (bạn set thủ công)
  // => Customer.findById(cId) là đúng.

  const customer = await Customer.findById(cId)
    .populate({
      path: "_id", // _id trong Customer -> ref "User"
      model: "User",
      select:
        "userFirstName userLastName userEmail userMobile userAvatar userGender", // tùy bạn
    })
    .populate({
      path: "cartId", // cartId trong Customer -> ref "ShoppingCart"
      model: "ShoppingCart",
      // select: "items totalPrice", // bạn có thể giới hạn field nếu muốn
    })
    .lean();

  if (!customer) {
    // không tìm thấy customer
    return {
      success: false,
      message: "Customer không tồn tại",
      data: null,
    };
  }

  // Trả ra dữ liệu đã populate
  return {
    success: true,
    message: "Lấy thông tin customer thành công",
    data: {
      user: customer._id, // sau populate _id không còn là ObjectId nữa mà là object User
      cart: customer.cartId, // sau populate cartId không còn là ObjectId nữa mà là object ShoppingCart
    },
  };
};
