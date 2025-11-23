import { createAsyncThunk } from "@reduxjs/toolkit"; //giup tao cac hanh dong bat dong bo, thuong goi la api

import { apiGetCustomerCart } from "../../services/customer.api";
import {
  apiCreateCartItem,
  apiDeleteCartItem,
  apiUpdateCartItem,
  apiGetCartItems,
  apiGetWishlistByQuery,
} from "../../services/shopping.api";
import { apiGetCurrent } from "../../services/auth.api";
import { updateCart, setCart } from "./userSlice";

export const getCurrent = createAsyncThunk(
  "user/current",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiGetCurrent();
      if (!response.success) return rejectWithValue(response);
      const user = response.user;
      return user;
    } catch (error) {
      console.error(" Lỗi trong getCurrent:", error);
      return rejectWithValue(error.response?.data || "Lỗi không xác định");
    }
  }
);

export const updateCartItem = createAsyncThunk(
  "user/updateCartItem",
  async (
    { pvId, cartItemQuantity, priceAtTime, add, maxItemQuantity = false },
    { dispatch, getState }
  ) => {
    const state = getState();
    const { isLoggedIn, current } = state.user || state;
    // 0) Chuẩn hoá id
    const key = String(pvId);

    // 1) Tính số lượng cuối cùng cho Redux (optimistic)
    const currentLocal = (getState().user.currentCart || []).find(
      (it) => String(it.pvId) === key
    );
    const localQty = Number(currentLocal?.cartItemQuantity || 0);

    const inc = Number(cartItemQuantity) || 0;

    // Nếu từ ProductDetail -> cộng dồn, nếu từ Cart -> ghi đè
    let finalQtyLocal = add ? Math.max(0, localQty + inc) : Math.max(0, inc);
    if (finalQtyLocal > maxItemQuantity) finalQtyLocal = maxItemQuantity;

    // 2) Cập nhật Redux ngay với finalQtyLocal (đồng bộ với UI)
    dispatch(
      updateCart({ pvId: key, cartItemQuantity: finalQtyLocal, priceAtTime })
    );

    // 3) Nếu chưa đăng nhập thì dừng tại đây (local only)
    if (!isLoggedIn) return;

    try {
      // 4) Lấy cartId từ server
      const cartRes = await apiGetCustomerCart(current._id);
      const cartId = cartRes?.cartId || cartRes?.cart?._id;
      if (!cartId) {
        console.warn("Không lấy được cartId");
        return;
      }

      // 5) Lấy danh sách cart items hiện có trên server
      const cartItemsRes = await apiGetCartItems(cartId);

      const cartItems = cartItemsRes?.cartItems || [];

      // 6) Tìm item tương ứng trên server (chuẩn hoá id khi so sánh)
      const matched = cartItems.find(
        (it) => String(it?.pvId?._id || it?.pvId) === key
      );

      if (matched?._id) {
        // Đã có trong DB:
        const currentQtyServer = Number(matched.cartItemQuantity || 0);
        let finalQtyServer = add
          ? Math.max(0, currentQtyServer + inc) // cộng dồn
          : Math.max(0, inc); // ghi đè
        if (finalQtyServer > maxItemQuantity) finalQtyServer = maxItemQuantity;

        await apiUpdateCartItem(matched._id, {
          cartItemQuantity: finalQtyServer,
        });

        // Optional: đảm bảo Redux = Server (nếu sợ race-condition)
        if (finalQtyLocal !== finalQtyServer) {
          dispatch(
            updateCart({
              pvId: key,
              cartItemQuantity: finalQtyServer,
              priceAtTime,
            })
          );
        }
      } else {
        const createQty = Math.max(0, inc);

        // Nếu createQty = 0 thì không tạo
        if (createQty > 0) {
          await apiCreateCartItem({
            pvId: key,
            cartItemQuantity: createQty,
            cartItemPrice: priceAtTime,
            cartId,
          });
        } else {
          // Nếu user set về 0 ở Cart nhưng server chưa có -> không cần gọi create
        }
      }
    } catch (error) {
      console.error("Không thể đồng bộ giỏ hàng với server:", error);
    }
  }
);

export const removeCartItem = createAsyncThunk(
  "user/removeCartItem",
  async (pvId, { dispatch, getState }) => {
    const state = getState();
    const { currentCart, isLoggedIn, current } = state.user;

    // 1. Xóa khỏi Redux (UI phản hồi tức thì)
    const filtered = currentCart.filter((el) => el.pvId !== pvId);
    dispatch(setCart(filtered));

    // 2. Nếu chưa login thì không gọi server
    if (!isLoggedIn) return;

    try {
      // 3. Lấy đúng cartItem._id từ server
      const cartRes = await apiGetCustomerCart(current._id);
      const shoppingCartId = cartRes?.cartId;
      if (!shoppingCartId) return;

      const cartItemsRes = await apiGetCartItems(shoppingCartId);
      const cartItems = cartItemsRes?.cartItems || [];

      const matchedItem = cartItems.find(
        (item) => item.pvId === pvId || item.pvId?._id === pvId
      );

      if (matchedItem?._id) {
        await apiDeleteCartItem(matchedItem._id);
      } else {
        console.warn("Không tìm thấy cartItem cần xoá trong server.");
      }
    } catch (err) {
      console.error("❌ Không thể xóa sản phẩm khỏi giỏ hàng:", err);
    }
  }
);

// thêm vào dưới các thunk khác
export const fetchWishlist = createAsyncThunk(
  "user/fetchWishlist",
  async (_, { getState, rejectWithValue }) => {
    try {
      const customerId = getState().user.current?._id;
      if (!customerId) return [];

      const res = await apiGetWishlistByQuery({ customerId });

      if (res.success) {
        return res.wishList;
      } else {
        return rejectWithValue("Không thể lấy danh sách yêu thích.");
      }
    } catch (err) {
      return rejectWithValue("Lỗi khi gọi API wishlist.");
    }
  }
);

export const syncCartFromServer = createAsyncThunk(
  "user/syncCartFromServer",
  async (userId, { getState, dispatch, rejectWithValue }) => {
    try {
      const localCartBackup = getState().user.currentCart;
      const shoppingRes = await apiGetCustomerCart(userId);
      const cartId = shoppingRes.cartId;

      let serverCartItems = [];
      if (cartId) {
        const cartRes = await apiGetCartItems(cartId);
        if (cartRes.success) serverCartItems = cartRes.cartItems;
      }

      const mergedCart = [...serverCartItems];

      for (const localItem of localCartBackup) {
        const matchedItem = serverCartItems.find(
          (item) => item.pvId?._id === localItem.pvId
        );

        if (matchedItem) {
          const matchedId =
            typeof matchedItem.pvId === "string"
              ? matchedItem.pvId
              : matchedItem.pvId._id;

          if (matchedItem.cartItemQuantity !== localItem.cartItemQuantity) {
            await apiUpdateCartItem({
              id: matchedId,
              cartItemQuantity: localItem.cartItemQuantity,
            });
            matchedItem.cartItemQuantity = localItem.cartItemQuantity;
          }
        } else {
          const res = await apiCreateCartItem({
            pvId: localItem.pvId,
            cartItemQuantity: localItem.cartItemQuantity,
            cartItemPrice: localItem.priceAtTime,
            cartId,
          });

          if (res.success) {
            mergedCart.push(res.cartItem);
          }
        }
      }

      const normalized = mergedCart
        .filter((item) => item.pvId !== null)
        .map((item) => ({
          pvId: typeof item.pvId === "string" ? item.pvId : item.pvId._id,
          cartItemQuantity: item.cartItemQuantity,
          priceAtTime: item.cartItemPrice,
        }));

      dispatch(setCart(normalized));
    } catch (error) {
      console.error("Lỗi khi sync giỏ hàng:", error);
      return rejectWithValue("Lỗi khi đồng bộ giỏ hàng");
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
