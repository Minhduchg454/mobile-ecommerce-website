import { createAsyncThunk } from "@reduxjs/toolkit";
import { apiGetShops } from "../../services/shop.api";

export const fetchSellerCurrent = createAsyncThunk(
  "seller/fetchCurrent",
  async (userId, { rejectWithValue, extra }) => {
    // Thêm tham số extra
    try {
      const includeSubscription = extra?.includeSubscription ?? true;
      const response = await apiGetShops({
        userId: userId,
        includeSubscription: includeSubscription,
      });

      if (response?.success) {
        // KIỂM TRA MẢNG RỖNG:
        if (Array.isArray(response.shops) && response.shops.length > 0) {
          // Thành công và tìm thấy shop: Trả về shop đầu tiên
          return response.shops[0];
        } else {
          // Thành công nhưng MẢNG RỖNG: Trả về NULL để xóa Shop cũ khỏi Redux
          return null;
        }
      } else {
        // API thất bại (success: false): Trả về lỗi
        return rejectWithValue(response.message || "Lỗi tải dữ liệu shop");
      }
    } catch (error) {
      console.error("Lỗi lấy dữ liệu shop:", error);
      return rejectWithValue(error.message || "Lỗi không xác định");
    }
  }
);
