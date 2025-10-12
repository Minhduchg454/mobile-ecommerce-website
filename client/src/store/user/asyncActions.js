import { createAsyncThunk, current } from "@reduxjs/toolkit"; //giup tao cac hanh dong bat dong bo, thuong goi la api
import * as apis from "../../apis";
import { apiGetCurrent } from "../../services/auth.api";
import { updateCart, setCart } from "./userSlice";

export const getCurrent = createAsyncThunk(
  "user/current",
  async (_, { dispatch, getState, rejectWithValue }) => {
    try {
      const response = await apiGetCurrent();
      if (!response.success) return rejectWithValue(response);
      const user = response.user;
      //user.huuduc = "sai lam";
      return user;
    } catch (error) {
      console.error(" Lỗi trong getCurrent:", error);
      return rejectWithValue(error.response?.data || "Lỗi không xác định");
    }
  }
);

export const updateCartItem = createAsyncThunk(
  "user/updateCartItem",
  async ({ product, quantity, priceAtTime }, { dispatch, getState }) => {
    const state = getState();
    const { isLoggedIn, current } = state.user;

    // 1. Cập nhật Redux ngay lập tức để UI phản hồi nhanh
    dispatch(
      updateCart({ productVariationId: product, quantity, priceAtTime })
    );

    // 2. Nếu chưa đăng nhập thì chỉ cập nhật local
    if (!isLoggedIn) return;

    try {
      // 3. Nếu đã đăng nhập → sync với server
      const cartRes = await apis.apiGetCustomerCart(current._id);
      const shoppingCartId = cartRes?.cart?._id;

      if (!shoppingCartId) {
        console.log("Không có cardId gây lỗi");
        return;
      }

      const cartItemsRes = await apis.apiGetCartItems(shoppingCartId);
      const cartItems = cartItemsRes?.cartItems || [];

      // Tìm cartItem tương ứng trong DB
      const matched = cartItems.find(
        (item) =>
          item.productVariationId === product ||
          item.productVariationId?._id === product
      );

      if (matched?._id) {
        // Đã có trong DB → update lại
        await apis.apiUpdateCartItem(matched._id, { quantity });
      } else {
        // Chưa có trong DB → thêm mới
        await apis.apiCreateCartItem({
          productVariationId: product,
          quantity,
          price: priceAtTime,
          shoppingCart: shoppingCartId,
        });
      }
    } catch (error) {
      console.error("Không thể đồng bộ giỏ hàng với server:", error);
    }
  }
);

export const removeCartItem = createAsyncThunk(
  "user/removeCartItem",
  async (productVariationId, { dispatch, getState }) => {
    const state = getState();
    const { currentCart, isLoggedIn, current } = state.user;

    // 1. Xóa khỏi Redux (UI phản hồi tức thì)
    const filtered = currentCart.filter(
      (el) => el.productVariationId !== productVariationId
    );
    dispatch(setCart(filtered));

    // 2. Nếu chưa login thì không gọi server
    if (!isLoggedIn) return;

    try {
      // 3. Lấy đúng cartItem._id từ server
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
        await apis.apiDeleteCartItem(matchedItem._id); //
      } else {
        console.warn("Không tìm thấy cartItem cần xoá trong server.");
      }
    } catch (err) {
      console.error("❌ Không thể xóa sản phẩm khỏi giỏ hàng:", err);
    }
  }
);

export const fetchAddresses = createAsyncThunk(
  "user/fetchAddresses",
  async (_, { getState, rejectWithValue }) => {
    try {
      const userId = getState().user.current?._id;
      const res = await apis.apiGetAddressesByUser({ userId });

      if (res.success) {
        return res.data;
      } else {
        return rejectWithValue("Không thể lấy địa chỉ.");
      }
    } catch (err) {
      return rejectWithValue("Lỗi khi lấy địa chỉ.");
    }
  }
);

// thêm vào dưới các thunk khác
export const fetchWishlist = createAsyncThunk(
  "user/fetchWishlist",
  async (_, { getState, rejectWithValue }) => {
    try {
      const userId = getState().user.current?._id;
      if (!userId) return [];

      const res = await apis.apiGetWishlistByQuery({ userId });

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
      const shoppingRes = await apis.apiGetCustomerCart(userId);
      const shoppingCartId = shoppingRes.cart?._id;

      let serverCartItems = [];
      if (shoppingCartId) {
        const cartRes = await apis.apiGetCartItems(shoppingCartId);
        if (cartRes.success) serverCartItems = cartRes.cartItems;
      }

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

          if (matchedItem.quantity !== localItem.quantity) {
            await apis.apiUpdateCartItem({
              product: matchedId,
              quantity: localItem.quantity,
            });

            matchedItem.quantity = localItem.quantity;
          }
        } else {
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

      const normalized = mergedCart
        .filter((item) => item.productVariationId !== null)
        .map((item) => ({
          productVariationId:
            typeof item.productVariationId === "string"
              ? item.productVariationId
              : item.productVariationId._id,
          quantity: item.quantity,
          priceAtTime: item.price,
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
