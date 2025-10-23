import { createSlice } from "@reduxjs/toolkit";
import * as actions from "./asyncActions";

export const appSlice = createSlice({
  name: "app",
  initialState: {
    categories: null,
    isLoading: false,
    isShowModal: false,
    modalChildren: null,
    isShowCart: false,
    isShowWishlist: false,
    isShowAlert: false,
    alertData: null,
  },
  reducers: {
    showModal: (state, action) => {
      state.isShowModal = action.payload.isShowModal;
      state.modalChildren = action.payload.modalChildren;
    },
    showCart: (state) => {
      state.isShowCart = state.isShowCart === false ? true : false;
    },
    showWishlist: (state) => {
      state.isShowWishlist = !state.isShowWishlist;
    },
    showAlert: (state, action) => {
      if (!action.payload) {
        state.isShowAlert = false;
        state.alertData = null;
      } else {
        state.isShowAlert = true;
        state.alertData = action.payload;
      }
    },
  },
});
export const { showModal, showCart, showWishlist, showAlert } =
  appSlice.actions;

export default appSlice.reducer;
