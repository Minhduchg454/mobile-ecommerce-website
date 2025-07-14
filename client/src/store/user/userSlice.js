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
    clearMessage: (state) => {
      state.mes = "";
    },
    updateCart: (state, action) => {
      const { pid, color, quantity } = action.payload;
      const updatingCart = JSON.parse(JSON.stringify(state.currentCart));
      state.currentCart = updatingCart.map((el) => {
        if (el.color === color && el.product?._id === pid) {
          return { ...el, quantity };
        } else return el;
      });
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
      state.currentCart = userObj && userObj.cart ? userObj.cart : [];
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
export const { login, logout, clearMessage, updateCart } = userSlice.actions;
//Xuat reducer gan ao configureStore
export default userSlice.reducer;
