import axios from "../axios";

// Ví dụ: /api/stats/user/new?from=2025-07-01&to=2025-07-15&type=day
export const apiGetNewUserStats = (params) =>
  axios({
    url: "/stats/user/new",
    method: "get",
    params,
  });

// Ví dụ: /api/stats/product/sold
export const apiGetTotalSoldProducts = () =>
  axios({
    url: "/stats/products/sold",
    method: "get",
  });

// Trong apis/index.js hoặc file apis/stats.js

export const apiGetRevenueStats = async () => {
  return {
    success: true,
    data: [
      { time: "2025-07-01", total: 100 },
      { time: "2025-07-02", total: 150 },
    ],
  };
};

export const apiGetOrderStats = async () => {
  return {
    success: true,
    data: {
      cancelled: 10,
      succeed: 90,
    },
  };
};
