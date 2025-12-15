import { createSlice } from "@reduxjs/toolkit";
import { fetchSellerCurrent } from "./asynsActions";

export const sellerSlice = createSlice({
  name: "seller",
  initialState: {
    current: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearSeller: (state) => {
      state.current = null;
      state.error = null;
    },
    setSeller(state, action) {
      console.log("Set seller:", action.payload);
      state.current = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSellerCurrent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSellerCurrent.fulfilled, (state, action) => {
        //console.log("Fetched seller current:", action.payload);
        state.loading = false;
        state.current = action.payload;
      })
      .addCase(fetchSellerCurrent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Không thể tải dữ liệu shop";
        state.current = null;
      });
  },
});

export const { clearSeller, setSeller } = sellerSlice.actions;
export default sellerSlice.reducer;
