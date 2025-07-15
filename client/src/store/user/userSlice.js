import { createSlice } from "@reduxjs/toolkit"; //Tao mot slice, phan state rieng biet: trang thai (state), ham cap nhat state (reducers), tu dong dong sinh cac action: creators
import * as actions from "./asyncActions";

export const userSlice = createSlice({
  name: "user",
  initialState: {
    isLoggedIn: false, //Kiem tra dang nhap chua
    current: null, // chua thong tin nguoi dung hien tai
    token: null,
    isLoading: false,
    mes: "",
    currentCart: [],
  },
  reducers: {
    //ham cap nhat ca state noi bo
    login: (state, action) => {
      state.isLoggedIn = action.payload.isLoggedIn;
      state.token = action.payload.token;
      state.current = action.payload.userData; // Lưu luôn userData vào current
    },
    logout: (state, action) => {
      state.isLoggedIn = false;
      state.current = null;
      state.token = null;
      state.isLoading = false;
      state.mes = "";
    },
    setCart: (state, action) => {
      try {
        // Nếu dữ liệu truyền vào là chuỗi → parse lại
        const cartData =
          typeof action.payload === "string"
            ? JSON.parse(action.payload)
            : action.payload;

        state.currentCart = Array.isArray(cartData) ? cartData : [];
      } catch (error) {
        console.error("Lỗi khi parse currentCart:", error);
        state.currentCart = [];
      }
    },
    clearMessage: (state) => {
      state.mes = "";
    },
    updateCart: (state, action) => {
      const { productVariationId, quantity, priceAtTime } = action.payload;

      // Copy để xử lý
      const updatedCart = [...state.currentCart];
      const index = updatedCart.findIndex(
        (item) => item.productVariationId === productVariationId
      );

      if (index !== -1) {
        // Nếu đã có → cập nhật số lượng
        updatedCart[index].quantity = quantity;
      } else {
        // Nếu chưa có → thêm mới
        updatedCart.push({
          productVariationId,
          quantity,
          priceAtTime, // lưu giá tại thời điểm thêm
        });
      }

      // Cập nhật lại giỏ hàng
      state.currentCart = updatedCart;
    },
  },
  //Dung de xu ly asyncThunk
  extraReducers: (builder) => {
    //Khi getCurrent dang chay, bat loading
    builder.addCase(actions.getCurrent.pending, (state) => {
      state.isLoading = true;
    });
    //Khi thanh cong => lay du lieu nguoi dung luu vao
    builder.addCase(actions.getCurrent.fulfilled, (state, action) => {
      state.isLoading = false;
      // Lấy user từ action.payload.user nếu có, fallback về action.payload nếu không
      const userObj =
        action.payload && action.payload.user
          ? action.payload.user
          : action.payload;
      const statusName = userObj?.statusUserId?.statusUserName?.toLowerCase();
      if (statusName === "blocked") {
        state.current = null;
        state.isLoggedIn = false;
        state.token = null;
        state.mes =
          "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.";
        return; // Dừng xử lý tiếp
      }
      state.current = userObj;
      state.isLoggedIn = true;
      console.log("Current card", state.currentCart);

      // state.currentCart = userObj && userObj.cart ? userObj.cart : [];
    });
    //Neu trang thai that bai thi xoa token
    builder.addCase(actions.getCurrent.rejected, (state, action) => {
      state.isLoading = false;
      state.current = null;
      state.isLoggedIn = false;
      state.token = null;
      state.mes = "Phiên đăng nhập hết hạn, vui lòng đăng nhập lại!";
    });
  },
});
//Xuat cac actions de goi trong coponent
export const { login, logout, clearMessage, updateCart, setCart } =
  userSlice.actions;
//Xuat reducer gan ao configureStore
export default userSlice.reducer;
