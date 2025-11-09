import { createAsyncThunk } from "@reduxjs/toolkit";
import { apiGetShops } from "../../services/shop.api";

export const fetchSellerCurrent = createAsyncThunk(
  "seller/fetchCurrent",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await apiGetShops({ userId });

      if (response?.success && Array.isArray(response.shops)) {
        return response.shops[0] || null;
      } else {
        return rejectWithValue("Không tìm thấy shop cho user này");
      }
    } catch (error) {
      console.error("Lỗi lấy dữ liệu shop:", error);
      return rejectWithValue(error.message || "Lỗi không xác định");
    }
  }
);
