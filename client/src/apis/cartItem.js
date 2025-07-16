import axios from "../axios";

/**
 * 🛒 Thêm một CartItem vào giỏ hàng.
 * Nếu sản phẩm đã tồn tại trong giỏ, sẽ tự động tăng số lượng.
 * @param {Object} data - { quantity, price, shoppingCart, productVariationId }
 */
export const apiCreateCartItem = (data) =>
  axios({
    url: "/cartitem/",
    method: "post",
    data,
  });

/**
 * 🧾 Lấy danh sách các CartItem theo giỏ hàng (shoppingCart ID).
 * Mỗi item có kèm thông tin sản phẩm (product title, thumbnail, price).
 * @param {String} shoppingCart - ID của giỏ hàng
 */
export const apiGetCartItems = (shoppingCart) =>
  axios({
    url: "/cartitem/",
    method: "get",
    params: { shoppingCart },
  });

/**
 * 📦 Lấy chi tiết một CartItem theo ID.
 * Bao gồm thông tin sản phẩm tương ứng.
 * @param {String} id - ID của CartItem
 */
export const apiGetCartItem = (id) =>
  axios({
    url: "/cartitem/" + id,
    method: "get",
  });

/**
 * 🔄 Cập nhật số lượng hoặc giá cho một CartItem cụ thể.
 * @param {String} id - ID của CartItem
 * @param {Object} data - { quantity?, price? }
 */
export const apiUpdateCartItem = (id, data) =>
  axios({
    url: "/cartitem/" + id,
    method: "put",
    data,
  });

/**
 * ❌ Xóa một CartItem khỏi giỏ hàng.
 * Sau khi xóa sẽ tự động cập nhật lại tổng giá giỏ hàng.
 * @param {String} id - ID của CartItem cần xóa
 */
export const apiDeleteCartItem = (id) =>
  axios({
    url: "/cartitem/" + id,
    method: "delete",
  });

/**
 * 🧹 Xoá toàn bộ các CartItem trong một giỏ hàng.
 * Giỏ hàng sẽ được làm trống hoàn toàn và totalPrice về 0.
 * @param {String} shoppingCart - ID của giỏ hàng cần xoá toàn bộ
 */
export const apiClearCartItems = (shoppingCart) =>
  axios({
    url: "/cartitem/clear",
    method: "get",
    params: { shoppingCart },
  });

/**
 * 🔢 Lấy tổng số lượng sản phẩm (quantity) hiện có trong giỏ hàng.
 * Dùng để hiển thị badge số lượng hoặc tính toán nhanh.
 * @param {String} shoppingCart - ID của giỏ hàng
 */
export const apiGetCartItemCount = (shoppingCart) =>
  axios({
    url: "/cartitem/count",
    method: "get",
    params: { shoppingCart },
  });
