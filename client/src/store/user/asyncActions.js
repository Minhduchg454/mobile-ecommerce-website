import { createAsyncThunk } from "@reduxjs/toolkit"; //giup tao cac hanh dong bat dong bo, thuong goi la api
import * as apis from "../../apis";
import { updateCart, setCart } from "./userSlice";

export const getCurrent = createAsyncThunk(
  "user/current",
  async (_, { dispatch, getState, rejectWithValue }) => {
    // 1. Backup localCart ngay lúc vừa gọi login
    const localCartBackup = getState().user.currentCart;
    console.log("Back up thanh cong", localCartBackup);

    // 2. Gọi API lấy user
    const response = await apis.apiGetCurrent();
    if (!response.success) return rejectWithValue(response);
    const user = response.user;

    // 3. Lấy giỏ hàng từ server theo userId
    const shoppingRes = await apis.apiGetCustomerCart(user._id);
    const shoppingCartId = shoppingRes.cart?._id;

    let serverCartItems = [];
    if (shoppingCartId) {
      const cartRes = await apis.apiGetCartItems(shoppingCartId);
      if (cartRes.success) serverCartItems = cartRes.cartItems;
    }
    console.log("Giỏ hàng server", serverCartItems);

    // 4. Merge: giữ sản phẩm cũ, thêm mới và cập nhật nếu khác số lượng
    const mergedCart = [...serverCartItems];

    for (const localItem of localCartBackup) {
      const matchedItem = serverCartItems.find(
        (item) =>
          item.productVariationId === localItem.productVariationId ||
          item.productVariationId?._id === localItem.productVariationId
      );

      if (matchedItem) {
        const matchedId =
          typeof matchedItem.productVariationId === "string"
            ? matchedItem.productVariationId
            : matchedItem.productVariationId._id;

        // ✅ Nếu khác số lượng → cập nhật lại server
        if (matchedItem.quantity !== localItem.quantity) {
          await apis.apiUpdateCartItem({
            product: matchedId,
            quantity: localItem.quantity,
          });

          // ✅ Cập nhật lại vào mergedCart để hiển thị đúng
          matchedItem.quantity = localItem.quantity;
        }
      } else {
        // ✅ Nếu chưa có → thêm mới
        const res = await apis.apiCreateCartItem({
          productVariationId: localItem.productVariationId,
          quantity: localItem.quantity,
          price: localItem.priceAtTime,
          shoppingCart: shoppingCartId,
        });

        if (res.success) {
          mergedCart.push(res.cartItem);
        }
      }
    }

    // 5. Normalize và set lại Redux
    const normalized = mergedCart.map((item) => ({
      productVariationId:
        typeof item.productVariationId === "string"
          ? item.productVariationId
          : item.productVariationId._id,
      quantity: item.quantity,
      priceAtTime: item.price,
    }));

    dispatch(setCart(normalized));
    return user;
  }
);

export const updateCartItem = createAsyncThunk(
  "user/updateCartItem",
  async ({ product, quantity, priceAtTime }, { dispatch, getState }) => {
    const state = getState();
    const { isLoggedIn, currentCart, current } = state.user;

    // ✅ 1. Cập nhật Redux ngay lập tức để UI phản hồi nhanh
    dispatch(
      updateCart({ productVariationId: product, quantity, priceAtTime })
    );

    // ✅ 2. Nếu chưa đăng nhập thì chỉ cập nhật local
    if (!isLoggedIn) return;

    try {
      // ✅ 3. Nếu đã đăng nhập → sync với server
      const cartRes = await apis.apiGetCustomerCart(current._id);
      const shoppingCartId = cartRes?.cart?._id;

      if (!shoppingCartId) return;

      const cartItemsRes = await apis.apiGetCartItems(shoppingCartId);
      const cartItems = cartItemsRes?.cartItems || [];

      // ✅ Tìm cartItem tương ứng trong DB
      const matched = cartItems.find(
        (item) =>
          item.productVariationId === product ||
          item.productVariationId?._id === product
      );

      if (matched?._id) {
        // ✅ Đã có trong DB → update lại
        await apis.apiUpdateCartItem(matched._id, { quantity });
      } else {
        // ✅ Chưa có trong DB → thêm mới
        await apis.apiCreateCartItem({
          productVariationId: product,
          quantity,
          price: priceAtTime,
          shoppingCart: shoppingCartId,
        });
      }
    } catch (error) {
      console.error("❌ Không thể đồng bộ giỏ hàng với server:", error);
    }
  }
);

export const removeCartItem = createAsyncThunk(
  "user/removeCartItem",
  async (productVariationId, { dispatch, getState }) => {
    const state = getState();
    const { currentCart, isLoggedIn, current } = state.user;

    // ✅ 1. Xóa khỏi Redux (UI phản hồi tức thì)
    const filtered = currentCart.filter(
      (el) => el.productVariationId !== productVariationId
    );
    dispatch(setCart(filtered));

    // ✅ 2. Nếu chưa login thì không gọi server
    if (!isLoggedIn) return;

    try {
      // ✅ 3. Lấy đúng cartItem._id từ server
      const cartRes = await apis.apiGetCustomerCart(current._id);
      const shoppingCartId = cartRes?.cart?._id;
      if (!shoppingCartId) return;

      const cartItemsRes = await apis.apiGetCartItems(shoppingCartId);
      const cartItems = cartItemsRes?.cartItems || [];

      const matchedItem = cartItems.find(
        (item) =>
          item.productVariationId === productVariationId ||
          item.productVariationId?._id === productVariationId
      );

      if (matchedItem?._id) {
        await apis.apiDeleteCartItem(matchedItem._id); // ✅ Xóa đúng CartItem._id
      } else {
        console.warn("Không tìm thấy cartItem cần xoá trong server.");
      }
    } catch (err) {
      console.error("❌ Không thể xóa sản phẩm khỏi giỏ hàng:", err);
    }
  }
);

/*
1. Tên action: 'user/current'
	•	Đây là tên action type sẽ được tạo:
	•	user/current/pending
	•	user/current/fulfilled
	•	user/current/rejecte
*/
