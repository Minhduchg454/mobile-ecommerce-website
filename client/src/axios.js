import axios from "axios";
import { store } from "./store/redux";

// Tạo instance Axios với URL gốc
const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URI,
});

// Hàm lấy accessToken từ localStorage hoặc Redux store
const getAccessToken = () => {
  try {
    let localStorageData = window.localStorage.getItem("persist:shop/user");
    if (localStorageData) {
      const parsedData = JSON.parse(localStorageData);
      let token = parsedData?.token;

      // Trường hợp token bị bọc trong dấu nháy kép
      if (
        typeof token === "string" &&
        token.startsWith('"') &&
        token.endsWith('"')
      ) {
        token = JSON.parse(token);
      }

      if (typeof token === "string" && token.length > 10) {
        return token;
      }
    }
  } catch (error) {
    console.warn("[AXIOS DEBUG] Lỗi parse localStorage:", error.message);
  }

  // Lấy từ Redux store nếu localStorage không có hoặc lỗi
  const reduxToken = store.getState()?.user?.token;
  if (typeof reduxToken === "string" && reduxToken.length > 10) {
    return reduxToken;
  }

  return null;
};

// Interceptor cho request: gắn Authorization header nếu có token
instance.interceptors.request.use(
  (config) => {
    const token = getAccessToken();

    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor cho response: chỉ trả về phần dữ liệu cần thiết
instance.interceptors.response.use(
  (response) => (response.data ? response.data : response),
  (error) =>
    error.response
      ? error.response.data
      : { success: false, mes: "Unknown error" }
);

export default instance;
