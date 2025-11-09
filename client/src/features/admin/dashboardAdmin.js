import {
  apiGetOrderCountsByStatus,
  apiGetOrderDashboardStats,
} from "../../services/order.api";
import {
  apiGetProductStats,
  apiGetProductDashboardReport,
} from "../../services/catalog.api";
import { apigetShopDashboardStats } from "../../services/shop.api";
import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import path from "ultils/path";
import { formatMoney } from "../../ultils/helpers";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
  LabelList,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const BAR_COLORS = [
  "#DC2626",
  "#EA580C",
  "#EAB308",
  "#16A34A",
  "#0D9488",
  "#2563EB",
  "#7C3AED",
  "#C026D3",
  "#DB2777",
  "#6B7280",
];

const SHOP_STATUS_LABELS = {
  pending: "Đang chờ duyệt",
  approved: "Đã được duyệt",
  blocked: "Đã bị khóa",
};

const SHOP_STATUS_COLORS = ["#3B82F6", "#22C55E", "#EF4444"]; // pending / approved / blocked
const SHOP_OFFICIAL_COLORS = ["#F97316", "#9CA3AF"]; // mall / thường

export const DashBoardAdmin = () => {
  const navigate = useNavigate();
  const { adminId: adminIdParams } = useParams();
  const { current } = useSelector((s) => s.user);
  const adminId = adminIdParams || current._id;

  const [countsByStatus, setCountsByStatus] = useState({});
  const [productsStats, setProductsStats] = useState({});
  const [dashboardStats, setDashboardStats] = useState(null);
  const [productReport, setProductReport] = useState(null);
  const [shopDashboard, setShopDashboard] = useState(null);
  const [dateFilter, setDateFilter] = useState({
    from: "",
    to: "",
  });

  const getTodayISO = () => new Date().toISOString().slice(0, 10);

  // Khi mount lần đầu → set mặc định 30 ngày gần nhất cho phần đơn hàng
  useEffect(() => {
    const today = new Date();
    const to = today.toISOString().slice(0, 10);

    const lastMonth = new Date();
    lastMonth.setDate(today.getDate() - 30);
    const from = lastMonth.toISOString().slice(0, 10);

    setDateFilter({ from, to });
  }, []);

  //--------FetchApi ĐƠN HÀNG + THỐNG KÊ SẢN PHẨM CƠ BẢN-----------
  const fetchCountsByStatus = async () => {
    try {
      const [resOrderStatus, resProductStats] = await Promise.all([
        apiGetOrderCountsByStatus(),
        apiGetProductStats(),
      ]);

      if (resOrderStatus?.success) {
        setCountsByStatus(resOrderStatus.counts || {});
        console.log("Đếm trạng thái đơn hàng:", resOrderStatus);
      }

      if (resProductStats?.success) {
        setProductsStats(resProductStats.stats || {});
        console.log(
          "Thống kê sản phẩm:",
          resProductStats.stats,
          resProductStats.scope
        );
      }
    } catch (err) {
      console.error("Lỗi khi gọi API:", err);
    }
  };

  const fetchDashBoardStats = async (filter) => {
    try {
      const res = await apiGetOrderDashboardStats({
        from: filter?.from,
        to: filter?.to,
      });

      if (res?.success) {
        setDashboardStats(res.data || null); // { summary, byStatus, daily }
        console.log("Thống kê dashboard:", res);
      }
    } catch (err) {
      console.error("Lỗi khi gọi API dashboard:", err);
    }
  };

  const fetchProductDashboard = async () => {
    try {
      const params = {
        sortKey: "sold",
        sortDir: "desc",
        limit: 10,
      };

      const res = await apiGetProductDashboardReport(params);

      if (res?.success) {
        setProductReport(res.data?.data || res.data || null);
        console.log("Báo cáo sản phẩm:", res);
      }
    } catch (err) {
      console.error("Lỗi khi gọi API báo cáo sản phẩm:", err);
    }
  };

  const fetchShopDashboard = async () => {
    try {
      const res = await apigetShopDashboardStats({ limit: 10 });
      if (res?.success) {
        setShopDashboard(res.data?.data || res.data || null);
        console.log("Báo cáo shop:", res);
      }
    } catch (err) {
      console.error("Lỗi khi gọi API báo cáo shop:", err);
    }
  };

  useEffect(() => {
    if (!dateFilter.from || !dateFilter.to) return;

    fetchCountsByStatus();
    fetchDashBoardStats(dateFilter);
  }, [dateFilter.from, dateFilter.to]);

  useEffect(() => {
    fetchProductDashboard();
    fetchShopDashboard();
  }, []);

  const shopSummary = shopDashboard?.summary || null;

  // Dùng useMemo cho gọn
  const countRemindData = useMemo(
    () => [
      {
        label: "Shop chờ phê duyệt",
        count: shopSummary?.pendingCount ?? 0,
        to: `/${path.ADMIN}/${adminId}/${path.A_MANAGE_SHOPS}?status=pending`,
      },
      {
        label: "Sản phẩm chờ phê duyệt",
        count: countsByStatus.Confirmed ?? 0,
        to: ``,
      },
      {
        label: "Yêu cầu mới",
        count: productsStats?.outOfStock ?? 0,
        to: ``,
      },
      {
        label: "Sản phẩm bị tạm khóa",
        count: 0,
        to: ``,
      },
    ],
    [countsByStatus, productsStats]
  );

  const titleCls = "px-3 md:px-4 font-bold mb-1";
  const card = "bg-white rounded-3xl p-2 md:p-4 border";

  const handleSetToday = () => {
    const today = getTodayISO();
    setDateFilter({ from: today, to: today });
  };

  // Lấy số đơn theo trạng thái từ dashboardStats.byStatus
  const getStatusCount = (statusName) => {
    if (!dashboardStats?.byStatus) {
      return { count: 0, revenue: 0 };
    }
    const item = dashboardStats.byStatus.find((s) => s._id === statusName);
    return {
      count: item?.count ?? 0,
      revenue: item?.revenue ?? 0,
    };
  };

  // Data biểu đồ doanh thu theo ngày
  const revenueChartData = useMemo(() => {
    if (!dashboardStats?.daily) return [];
    return dashboardStats.daily.map((d) => ({
      date: d._id,
      totalRevenue: d.totalRevenue || 0,
      totalOrders: d.totalOrders || 0,
    }));
  }, [dashboardStats]);

  // Data biểu đồ cột top sản phẩm bán chạy (all-time)
  const topProductChartData = useMemo(() => {
    if (!productReport) return [];
    const items = productReport.items || productReport.products || [];
    return items.map((p) => ({
      name: p.productName,
      sold: p.productSoldCount || 0,
    }));
  }, [productReport]);

  // Data biểu đồ tròn: Sản phẩm đang khuyến mãi / không khuyến mãi
  const productSalePieData = useMemo(() => {
    if (!productReport?.summary) return [];

    const summary = productReport.summary;
    const totalProducts = summary.totalProducts ?? 0;
    const onSale = summary.onSaleCount ?? 0;
    const nonSale = Math.max(totalProducts - onSale, 0);

    return [
      {
        name: "Đang khuyến mãi",
        value: onSale,
      },
      {
        name: "Không khuyến mãi",
        value: nonSale,
      },
    ];
  }, [productReport]);

  // Data biểu đồ tròn: Cơ cấu tồn kho (còn hàng / hết hàng)
  const productInventoryPieData = useMemo(() => {
    if (!productsStats) return [];
    return [
      {
        name: "Còn hàng",
        value: productsStats.inStock ?? 0,
      },
      {
        name: "Hết hàng",
        value: productsStats.outOfStock ?? 0,
      },
    ];
  }, [productsStats]);

  const PIE_SALE_COLORS = ["#3b82f6", "#9ca3af"]; // xanh: đang sale, xám: không sale
  const PIE_COLORS = ["#22c55e", "#ef4444"]; // xanh: còn hàng, đỏ: hết hàng

  const topShopChartData = useMemo(() => {
    if (!shopDashboard?.topSold) return [];
    return shopDashboard.topSold.map((s) => ({
      name: s.shopName,
      sold: s.shopSoldCount || 0,
    }));
  }, [shopDashboard]);

  const shopStatusPieData = useMemo(() => {
    if (!shopDashboard?.byStatus) return [];
    return shopDashboard.byStatus.map((s, index) => ({
      name: SHOP_STATUS_LABELS[s._id] || s._id || "Khác",
      value: s.count || 0,
      color: SHOP_STATUS_COLORS[index % SHOP_STATUS_COLORS.length],
    }));
  }, [shopDashboard]);

  const shopOfficialPieData = useMemo(() => {
    if (!shopDashboard?.byOfficial) return [];
    return shopDashboard.byOfficial.map((s, index) => ({
      name: s._id ? "Shop Mall" : "Shop thường",
      value: s.count || 0,
      color: SHOP_OFFICIAL_COLORS[index % SHOP_OFFICIAL_COLORS.length],
    }));
  }, [shopDashboard]);

  return (
    <div>
      {/* VIỆC CẦN LÀM */}
      <div className="mb-3 md:mb-8">
        <h1 className={titleCls}>Danh sách việc cần làm</h1>
        <div
          className={`${card} grid grid-cols-2  md:grid-cols-4 gap-2 items-stretch`}
        >
          {countRemindData.map((it, idx) => (
            <button
              key={idx}
              onClick={() => navigate(it.to)}
              className="hover:bg-gray-100 border rounded-xl p-2 flex flex-col justify-center items-center text-center h-full"
            >
              <p className="text-button-bg-ac font-semibold text-lg">
                {it.count}
              </p>
              <p className="text-xs md:text-base">{it.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* PHÂN TÍCH BÁN HÀNG */}
      <div className="mb-3 md:mb-8">
        <h1 className={titleCls}>Phân tích bán hàng</h1>
        <div className={`${card} space-y-3 md:mb-4 mb-2`}>
          <div className="flex md:items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs md:text-sm">
              <span className="font-medium">Thời gian:</span>
              <input
                type="date"
                value={dateFilter.from}
                onChange={(e) =>
                  setDateFilter((prev) => ({
                    ...prev,
                    from: e.target.value,
                  }))
                }
                className="border rounded-lg px-2 py-1 text-xs md:text-sm"
              />
              <span className="mx-1">-</span>
              <input
                type="date"
                value={dateFilter.to}
                onChange={(e) =>
                  setDateFilter((prev) => ({
                    ...prev,
                    to: e.target.value,
                  }))
                }
                className="border rounded-lg px-2 py-1 text-xs md:text-sm"
              />
            </div>

            <button
              type="button"
              onClick={handleSetToday}
              className="self-start md:self-auto text-xs md:text-sm px-2 py-1 rounded-lg border hover:bg-gray-100"
            >
              Hôm nay
            </button>
          </div>
        </div>

        {/* HIỂN THỊ SỐ LIỆU TỔNG QUAN + BIỂU ĐỒ */}
        <div>
          {dashboardStats ? (
            <>
              {/* Thống kê số liệu */}
              <div
                className={`${card} grid grid-cols-2 md:grid-cols-4 gap-2 text-xs md:text-sm md:mb-4 mb-2`}
              >
                <div className="p-2 rounded-xl border">
                  <p className="font-semibold">Tổng doanh thu</p>
                  <p>{formatMoney(getStatusCount("Succeeded").revenue)}đ</p>
                </div>

                <div className="p-2 rounded-xl border">
                  <p className="font-semibold">Tổng đơn</p>
                  <p>{dashboardStats.summary?.totalOrders ?? 0}</p>
                </div>

                <div className="p-2 rounded-xl border">
                  <p className="font-semibold">Đơn hoàn thành</p>
                  <p>{getStatusCount("Succeeded").count}</p>
                </div>

                <div className="p-2 rounded-xl border">
                  <p className="font-semibold">Đơn hủy</p>
                  <p>{getStatusCount("Cancelled").count}</p>
                </div>
              </div>

              {/* Biểu đồ doanh thu theo ngày */}
              {revenueChartData.length > 0 ? (
                <div className={`${card} p-2 md:p-4`}>
                  <div className="w-full h-64 p-1 flex justify-center items-center flex-col">
                    <ResponsiveContainer width="90%" height="90%">
                      <LineChart
                        data={revenueChartData}
                        margin={{ top: 10, right: 20, bottom: 0, left: 10 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 10, fill: "#555" }}
                          tickMargin={4}
                        />
                        <YAxis
                          tick={{ fontSize: 10, fill: "#555" }}
                          tickFormatter={(value) => formatMoney(value)}
                        />
                        <Tooltip
                          contentStyle={{ fontSize: 10 }}
                          formatter={(value) => [
                            formatMoney(value),
                            "Doanh thu",
                          ]}
                          labelFormatter={(label) => `Ngày: ${label}`}
                        />
                        <Line
                          type="monotone"
                          dataKey="totalRevenue"
                          stroke="#4F46E5"
                          strokeWidth={2}
                          dot={{ r: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>

                    <p className="text-center font-light text-xs md:text-sm">
                      Biểu đồ doanh thu
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-gray-500">
                  Không có dữ liệu doanh thu trong khoảng thời gian này.
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-500">
              Chưa có dữ liệu trong khoảng thời gian này.
            </p>
          )}
        </div>
      </div>

      {/* PHÂN TÍCH SẢN PHẨM (ALL-TIME) */}
      <div className="mb-3 md:mb-8">
        <h1 className={titleCls}>Phân tích sản phẩm</h1>
        <div className={`${card} space-y-3`}>
          {topProductChartData.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {/* Biểu đồ cột: Top 10 sản phẩm bán chạy */}
              <div className="w-full h-72 flex flex-col items-center">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topProductChartData}
                    margin={{ top: 10, right: 20, left: 10, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      interval={0}
                      height={40}
                      textAnchor="middle"
                      tick={({ x, y, payload }) => {
                        const text = payload?.value || "";
                        const maxLength = 25;
                        const displayText =
                          text.length > maxLength
                            ? text.slice(0, maxLength) + "…"
                            : text;

                        return (
                          <text
                            x={x}
                            y={y + 10}
                            textAnchor="middle"
                            fill="#555"
                            fontSize={9}
                            transform={`rotate(-5, ${x}, ${y})`}
                          >
                            {displayText}
                          </text>
                        );
                      }}
                    />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{ fontSize: 10 }}
                      formatter={(value) => [value, "Số lượng bán"]}
                    />
                    <Bar dataKey="sold">
                      {topProductChartData.map((entry, index) => (
                        <Cell
                          key={`cell-bar-${index}`}
                          fill={BAR_COLORS[index % BAR_COLORS.length]}
                        />
                      ))}

                      <LabelList
                        dataKey="sold"
                        position="insideMiddle"
                        content={(props) => {
                          const { x, y, width, height, value } = props;
                          return (
                            <text
                              x={x + width / 2}
                              y={y + height / 2}
                              textAnchor="middle"
                              fill="#fff"
                              fontSize={10}
                              dy={4}
                            >
                              {`${value} sp`}
                            </text>
                          );
                        }}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-center font-light text-xs md:text-sm mt-1">
                  Top 10 sản phẩm bán chạy nhất hệ thống
                </p>
              </div>

              {/* Hàng biểu đồ tròn */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Cơ cấu tồn kho */}
                <div className="w-full h-72 flex flex-col items-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={productInventoryPieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        labelLine={false}
                        label={({
                          cx,
                          cy,
                          midAngle,
                          innerRadius,
                          outerRadius,
                          value,
                        }) => {
                          const RADIAN = Math.PI / 180;
                          const radius =
                            innerRadius + (outerRadius - innerRadius) * 0.5;
                          const x = cx + radius * Math.cos(-midAngle * RADIAN);
                          const y = cy + radius * Math.sin(-midAngle * RADIAN);

                          return (
                            <text
                              x={x}
                              y={y}
                              fill="white"
                              textAnchor="middle"
                              dominantBaseline="central"
                              fontSize={12}
                            >
                              {`${value} sp`}
                            </text>
                          );
                        }}
                      >
                        {productInventoryPieData.map((entry, index) => (
                          <Cell
                            key={`cell-inventory-${index}`}
                            fill={PIE_COLORS[index % PIE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ fontSize: 10 }}
                        formatter={(value, name) => [`${value} sp`, name]}
                      />
                      <Legend
                        verticalAlign="bottom"
                        height={24}
                        wrapperStyle={{ fontSize: 10 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>

                  <p className="text-center font-light text-xs md:text-sm mt-1">
                    Cơ cấu tồn kho sản phẩm
                  </p>
                </div>

                {/* Sản phẩm khuyến mãi / không khuyến mãi */}
                {productSalePieData.length > 0 && (
                  <div className="w-full h-72 flex flex-col items-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={productSalePieData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          labelLine={false}
                          label={({
                            cx,
                            cy,
                            midAngle,
                            innerRadius,
                            outerRadius,
                            value,
                          }) => {
                            const RADIAN = Math.PI / 180;
                            const radius =
                              innerRadius + (outerRadius - innerRadius) * 0.5;
                            const x =
                              cx + radius * Math.cos(-midAngle * RADIAN);
                            const y =
                              cy + radius * Math.sin(-midAngle * RADIAN);

                            return (
                              <text
                                x={x}
                                y={y}
                                fill="white"
                                textAnchor="middle"
                                dominantBaseline="central"
                                fontSize={12}
                              >
                                {`${value} sp`}
                              </text>
                            );
                          }}
                        >
                          {productSalePieData.map((entry, index) => (
                            <Cell
                              key={`cell-sale-${index}`}
                              fill={
                                PIE_SALE_COLORS[index % PIE_SALE_COLORS.length]
                              }
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ fontSize: 10 }}
                          formatter={(value, name) => [`${value} sp`, name]}
                        />
                        <Legend
                          verticalAlign="bottom"
                          height={24}
                          wrapperStyle={{ fontSize: 10 }}
                        />
                      </PieChart>
                    </ResponsiveContainer>

                    <p className="text-center font-light text-xs md:text-sm mt-1">
                      Phân bố sản phẩm khuyến mãi
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-500">
              Chưa có dữ liệu sản phẩm để hiển thị.
            </p>
          )}
        </div>
      </div>

      {/* PHÂN TÍCH CỬA HÀNG (ALL SHOPS) */}
      <div className="">
        <h1 className={titleCls}>Phân tích cửa hàng</h1>
        <div className={` space-y-3`}>
          {shopDashboard ? (
            <>
              {/* Summary shop */}
              <div
                className={`${card} grid grid-cols-2 md:grid-cols-4 gap-2 text-xs md:text-sm`}
              >
                <div className="p-2 rounded-xl border">
                  <p className="font-semibold">Tổng số shop</p>
                  <p>{shopSummary?.totalShops ?? 0}</p>
                </div>

                <div className="p-2 rounded-xl border">
                  <p className="font-semibold">Shop chờ duyệt</p>
                  <p>{shopSummary?.pendingCount ?? 0}</p>
                </div>

                <div className="p-2 rounded-xl border">
                  <p className="font-semibold">Shop đã duyệt</p>
                  <p>{shopSummary?.approvedCount ?? 0}</p>
                </div>

                <div className="p-2 rounded-xl border">
                  <p className="font-semibold">Shop bị khóa</p>
                  <p>{shopSummary?.blockedCount ?? 0}</p>
                </div>
              </div>

              {/* Charts shop */}
              <div className={`${card} mt-2 space-y-4`}>
                {/* Biểu đồ cột: Top shop bán chạy */}
                {topShopChartData.length > 0 && (
                  <div className="w-full h-72 flex flex-col items-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={topShopChartData}
                        margin={{
                          top: 10,
                          right: 20,
                          left: 10,
                          bottom: 0,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="name"
                          interval={0}
                          height={40}
                          textAnchor="middle"
                          tick={({ x, y, payload }) => {
                            const text = payload?.value || "";
                            const maxLength = 20;
                            const displayText =
                              text.length > maxLength
                                ? text.slice(0, maxLength) + "…"
                                : text;

                            return (
                              <text
                                x={x}
                                y={y + 10}
                                textAnchor="middle"
                                fill="#555"
                                fontSize={9}
                                transform={`rotate(-5, ${x}, ${y})`}
                              >
                                {displayText}
                              </text>
                            );
                          }}
                        />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip
                          contentStyle={{ fontSize: 10 }}
                          formatter={(value) => [value, "Lượt bán"]}
                        />
                        <Bar dataKey="sold">
                          {topShopChartData.map((entry, index) => (
                            <Cell
                              key={`cell-shop-bar-${index}`}
                              fill={BAR_COLORS[index % BAR_COLORS.length]}
                            />
                          ))}
                          <LabelList
                            dataKey="sold"
                            position="insideMiddle"
                            content={({ x, y, width, height, value }) => (
                              <text
                                x={x + width / 2}
                                y={y + height / 2}
                                textAnchor="middle"
                                fill="#fff"
                                fontSize={10}
                                dy={4}
                              >
                                {value}
                              </text>
                            )}
                          />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                    <p className="text-center font-light text-xs md:text-sm mt-1">
                      Top 10 shop bán chạy nhất hệ thống
                    </p>
                  </div>
                )}

                {/* Hai biểu đồ tròn phía dưới */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Pie: trạng thái shop */}
                  <div className="w-full h-72 flex flex-col items-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={shopStatusPieData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          labelLine={false}
                          label={({
                            cx,
                            cy,
                            midAngle,
                            innerRadius,
                            outerRadius,
                            value,
                          }) => {
                            const RADIAN = Math.PI / 180;
                            const radius =
                              innerRadius + (outerRadius - innerRadius) * 0.5;
                            const x =
                              cx + radius * Math.cos(-midAngle * RADIAN);
                            const y =
                              cy + radius * Math.sin(-midAngle * RADIAN);
                            return (
                              <text
                                x={x}
                                y={y}
                                fill="#fff"
                                textAnchor="middle"
                                dominantBaseline="central"
                                fontSize={10}
                              >
                                {value}
                              </text>
                            );
                          }}
                        >
                          {shopStatusPieData.map((entry, index) => (
                            <Cell
                              key={`cell-shop-status-${index}`}
                              fill={entry.color}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ fontSize: 10 }}
                          formatter={(value, name) => [value, name]}
                        />
                        <Legend
                          verticalAlign="bottom"
                          height={24}
                          wrapperStyle={{ fontSize: 10 }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <p className="text-center font-light text-xs md:text-sm mt-1">
                      Cơ cấu trạng thái shop
                    </p>
                  </div>

                  {/* Pie: Mall / thường */}
                  <div className="w-full h-72 flex flex-col items-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={shopOfficialPieData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          labelLine={false}
                          label={({
                            cx,
                            cy,
                            midAngle,
                            innerRadius,
                            outerRadius,
                            value,
                          }) => {
                            const RADIAN = Math.PI / 180;
                            const radius =
                              innerRadius + (outerRadius - innerRadius) * 0.5;
                            const x =
                              cx + radius * Math.cos(-midAngle * RADIAN);
                            const y =
                              cy + radius * Math.sin(-midAngle * RADIAN);
                            return (
                              <text
                                x={x}
                                y={y}
                                fill="#fff"
                                textAnchor="middle"
                                dominantBaseline="central"
                                fontSize={10}
                              >
                                {value}
                              </text>
                            );
                          }}
                        >
                          {shopOfficialPieData.map((entry, index) => (
                            <Cell
                              key={`cell-shop-official-${index}`}
                              fill={entry.color}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ fontSize: 10 }}
                          formatter={(value, name) => [value, name]}
                        />
                        <Legend
                          verticalAlign="bottom"
                          height={24}
                          wrapperStyle={{ fontSize: 10 }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <p className="text-center font-light text-xs md:text-sm mt-1">
                      Cơ cấu loại shop (Mall / thường)
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <p className="text-xs text-gray-500">
              Chưa có dữ liệu cửa hàng để hiển thị.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
