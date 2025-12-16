import { createAsyncThunk } from "@reduxjs/toolkit";
import { apiGetShops } from "../../services/shop.api";
import { apiGetAddresses } from "../../services/user.api";

export const fetchSellerCurrent = createAsyncThunk(
  "seller/fetchCurrent",
  async (userId, { rejectWithValue, extra }) => {
    try {
      const includeSubscription = extra?.includeSubscription ?? true;
      const response = await apiGetShops({
        userId: userId,
        includeSubscription: includeSubscription,
      });

      const resAddress = await apiGetAddresses({
        userId,
        sort: "default_first",
        addressFor: "shop",
      });
      if (response?.success) {
        if (Array.isArray(response.shops) && response.shops.length > 0) {
          const shopData = response.shops[0];
          let addressData = null;
          if (
            resAddress?.success &&
            Array.isArray(resAddress.addresses) &&
            resAddress.addresses.length > 0
          ) {
            addressData = resAddress.addresses[0];
          }
          return {
            ...shopData,
            address: addressData,
          };
        } else {
          return null;
        }
      } else {
        return rejectWithValue(response.message || "Lỗi tải dữ liệu shop");
      }
    } catch (error) {
      console.error("Lỗi lấy dữ liệu shop:", error);
      return rejectWithValue(error.message || "Lỗi không xác định");
    }
  }
);
