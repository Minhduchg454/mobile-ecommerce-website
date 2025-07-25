import React, { useEffect, useState, useMemo } from "react";
import {
  apiGetDashboard,
  apiGetNewUserStats,
  apiGetProducts,
  apiGetOrders,
} from "apis";
import BoxInfo from "components/chart/BoxInfo";
import CustomChart from "components/chart/CustomChart";
import { AiOutlineUserAdd } from "react-icons/ai";
import { formatMoney } from "ultils/helpers";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";
import { HiOutlineChartSquareBar } from "react-icons/hi";
import { FaBoxOpen } from "react-icons/fa";
import { HiOutlineClipboardList } from "react-icons/hi";
import { MdVerifiedUser } from "react-icons/md";
import ChartDataLabels from "chartjs-plugin-datalabels";

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

const getDefaultTimeRange = (type) => {
  const now = new Date();
  const to = now.toISOString().split("T")[0]; // yyyy-MM-dd
  let from;

  if (type === "ngày") {
    from = to;
  } else if (type === "tháng") {
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    from = firstDayOfMonth.toISOString().split("T")[0];
  } else if (type === "năm") {
    const firstDayOfYear = new Date(now.getFullYear(), 0, 1);
    from = firstDayOfYear.toISOString().split("T")[0];
  }

  return { from, to };
};

//Mac dinh bieu do tron
const defaultPieData = [
  { status: "Cancelled", sum: 10 },
  { status: "Succeed", sum: 90 },
];

//Mac dinh doanh thu
const defaultChartData = [
  { label: "2025-06-30", total: 1000000 },
  { label: "2025-07-05", total: 1500000 },
  { label: "2025-07-10", total: 1200000 },
  { label: "2025-07-15", total: 1700000 },
  { label: "2025-07-20", total: 1400000 },
  { label: "2025-07-25", total: 1600000 },
  { label: "2025-07-30", total: 2000000 },
  { label: "2025-08-05", total: 1800000 },
  { label: "2025-08-10", total: 2100000 },
  { label: "2025-08-15", total: 1950000 },
  { label: "2025-08-20", total: 1700000 },
  { label: "2025-08-25", total: 2200000 },
  { label: "2025-08-31", total: 2500000 },
];

const pieOptions = {
  plugins: {
    legend: {
      position: "bottom",
    },
    datalabels: {
      color: "#000",
      formatter: (value, context) => {
        const dataArr = context.chart.data.datasets[0].data;
        const total = dataArr.reduce((acc, val) => acc + val, 0);
        const percent = ((value / total) * 100).toFixed(1);
        const label = context.chart.data.labels[context.dataIndex];
        return `${label}: ${value} \n(${percent}%)`;
      },
      font: {
        size: 13,
        weight: "bold",
      },
    },
  },
};

const Dashboard = () => {
  const [data, setData] = useState();
  const [isMonth, setIsMonth] = useState(false);
  const [userStatsType, setUserStatsType] = useState("tháng");
  const [customTime, setCustomTime] = useState(getDefaultTimeRange("tháng"));
  const [userStats, setUserStats] = useState([]);
  const [statType, setStatType] = useState("product");
  const [statResult, setStatResult] = useState(0);
  const [productList, setProductList] = useState([]);
  const [productStatType, setProductStatType] = useState("mostSold");
  const [highlightProduct, setHighlightProduct] = useState(null);
  const [inventoryStatType, setInventoryStatType] = useState("stockValue"); // 👈 Mới thêm
  const [totalInventoryValue, setTotalInventoryValue] = useState(0);
  const [totalStockQuantity, setTotalStockQuantity] = useState(0);
  const [totalSoldQuantity, setTotalSoldQuantity] = useState(0);
  const [orders, setOrders] = useState([]);
  const [totalOrders, setTotalOrders] = useState(0);

  const { totalPaid, totalUnpaid } = useMemo(() => {
    let totalPaid = 0;
    let totalUnpaid = 0;

    orders.forEach((order) => {
      if (order.status === "Succeeded") {
        totalPaid += order.totalPrice || 0;
      } else if (order.status === "Pending") {
        totalUnpaid += order.totalPrice || 0;
      }
    });

    return { totalPaid, totalUnpaid };
  }, [orders]);

  useEffect(() => {
    const fetchProducts = async () => {
      const res = await apiGetProducts();
      if (res?.products) setProductList(res.products);
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
      const res = await apiGetOrders();
      if (res?.success) {
        setOrders(res.data);
        setTotalOrders(res.count);
      }
    };
    fetchOrders();
  }, []);

  useEffect(() => {
    if (!productList.length) return;

    let totalStockValue = 0;
    let totalSoldValue = 0;
    let totalStockQuantity = 0;
    let totalSoldQuantity = 0;

    for (const product of productList) {
      const price = product.minPrice || 0;
      const stock = product.totalStock || 0;
      const sold = product.totalSold || 0;

      totalStockValue += price * stock;
      totalSoldValue += price * sold;
      totalStockQuantity += stock;
      totalSoldQuantity += sold;
    }

    // Gán giá trị số lượng
    setTotalStockQuantity(totalStockQuantity);
    setTotalSoldQuantity(totalSoldQuantity);

    // Gán giá trị tiền
    if (inventoryStatType === "stockValue") {
      setTotalInventoryValue(totalStockValue);
    } else {
      setTotalInventoryValue(totalSoldValue);
    }
  }, [inventoryStatType, productList]);

  useEffect(() => {
    if (!productList.length) return;

    switch (statType) {
      case "brand":
        setStatResult(new Set(productList.map((p) => p.brandId?._id)).size);
        break;
      case "category":
        setStatResult(new Set(productList.map((p) => p.categoryId?._id)).size);
        break;
      case "stock":
        setStatResult(
          productList.reduce((acc, cur) => acc + (cur.totalStock || 0), 0)
        );
        break;
      case "product":
        setStatResult(productList.length);
        break;
      default:
        setStatResult(0);
    }
  }, [statType, productList]);

  useEffect(() => {
    if (!productList.length) return;

    const getStatProduct = () => {
      switch (productStatType) {
        case "mostSold":
          return [...productList].sort((a, b) => b.totalSold - a.totalSold)[0];
        case "leastSold":
          return [...productList].sort((a, b) => a.totalSold - b.totalSold)[0];
        case "bestRated":
          return [...productList]
            .filter((p) => p.totalRating > 0)
            .sort((a, b) => b.rating - a.rating)[0];
        case "worstRated":
          return [...productList]
            .filter((p) => p.totalRating > 0)
            .sort((a, b) => a.rating - b.rating)[0];
        default:
          return null;
      }
    };

    setHighlightProduct(getStatProduct());
  }, [productStatType, productList]);

  useEffect(() => {
    const fetchUserStats = async () => {
      if (!customTime.from || !customTime.to) return;
      const res = await apiGetNewUserStats({
        from: customTime.from,
        to: customTime.to,
        type: userStatsType,
      });

      if (res.success) setUserStats(res.data);
    };

    fetchUserStats();
  }, [customTime, userStatsType]);

  const fetchDataDashboard = async (params) => {
    const response = await apiGetDashboard(params);
    if (response.success) setData(response.data);
  };

  useEffect(() => {
    const type = isMonth ? "MTH" : "D";
    const params = { type };
    if (customTime.from) params.from = customTime.from;
    if (customTime.to) params.to = customTime.to;
    fetchDataDashboard(params);
  }, [isMonth, customTime]);

  const handleCustomTime = () => setCustomTime({ from: "", to: "" });

  const computedPieData = useMemo(() => {
    const cancelled = orders.filter((o) => o.status === "Cancelled").length;
    const succeed = orders.filter((o) => o.status === "Succeeded").length;

    return {
      labels: ["Đã hủy", "Thành công"],
      datasets: [
        {
          data: [cancelled, succeed],
          backgroundColor: [
            "rgba(255, 99, 132, 0.4)",
            "rgba(54, 162, 235, 0.4)",
          ],
          borderColor: ["rgba(255, 99, 132, 1)", "rgba(54, 162, 235, 1)"],
          borderWidth: 1,
        },
      ],
    };
  }, [orders]);

  return (
    <div className="w-full flex flex-col gap-4 px-4 my-3">
      {/* Thống kê tổng quan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <BoxInfo
          text={`Số thành viên mới (${userStatsType})`}
          icon={<AiOutlineUserAdd size={22} />}
          number={
            userStats?.length > 0
              ? userStats.reduce((sum, item) => sum + item.count, 0)
              : 0
          }
          className="bg-blue-500 text-white border-blue-500 rounded-xl"
          showTimeSelector={true}
          timeType={userStatsType}
          onChangeTimeType={(type) => {
            setUserStatsType(type);
            setCustomTime(getDefaultTimeRange(type));
          }}
          timeOptions={[
            { label: "Theo ngày", value: "ngày" },
            { label: "Theo tháng", value: "tháng" },
            { label: "Theo năm", value: "năm" },
            { label: "Theo quý", value: "quý" },
          ]}
          selectClassName="bg-blue-400 hover:bg-white focus:ring-2 focus:ring-blue-500"
        />

        <BoxInfo
          text="Sản phẩm bán chạy nhất"
          number={
            highlightProduct
              ? productStatType === "mostSold" ||
                productStatType === "leastSold"
                ? `${highlightProduct.productName} (${highlightProduct.totalSold} đã bán)`
                : `${highlightProduct.productName}  (${highlightProduct.rating}★)`
              : "Không có"
          }
          icon={<FaBoxOpen size={20} />}
          className="bg-purple-500 text-white border-purple-500 rounded-xl"
          showTimeSelector
          timeType={productStatType}
          onChangeTimeType={setProductStatType}
          timeOptions={[
            { label: "Bán chạy nhất", value: "mostSold" },
            { label: "Bán ít nhất", value: "leastSold" },
            { label: "Đánh giá cao nhất", value: "bestRated" },
            { label: "Đánh giá thấp nhất", value: "worstRated" },
          ]}
          selectClassName="bg-purple-400 hover:bg-white focus:ring-2 focus:ring-purple-500"
          numberClassName="text-sm leading-snug line-clamp-2"
        />

        <BoxInfo
          text={
            statType === "brand"
              ? "Tổng số thương hiệu"
              : statType === "category"
              ? "Tổng số danh mục"
              : statType === "stock"
              ? "Tổng tồn kho sản phẩm"
              : "Tổng số sản phẩm"
          }
          icon={<HiOutlineChartSquareBar size={22} />}
          number={statResult}
          className="bg-indigo-500 text-white border-indigo-500 rounded-xl"
          showTimeSelector={true}
          timeType={statType}
          onChangeTimeType={setStatType}
          timeOptions={[
            { label: "Thương hiệu", value: "brand" },
            { label: "Danh mục", value: "category" },
            { label: "Tồn kho", value: "stock" },
            { label: "Sản phẩm", value: "product" },
          ]}
          selectClassName="bg-indigo-400 hover:bg-white focus:ring-2 focus:ring-indigo-500"
        />

        <BoxInfo
          text={
            inventoryStatType === "stockValue"
              ? "Tổng giá trị hàng tồn kho"
              : "Tổng giá trị sản phẩm đã bán"
          }
          icon={<img src="/dong.svg" className="h-6 object-contain" />}
          number={
            inventoryStatType === "stockValue"
              ? `${formatMoney(
                  Math.round(totalInventoryValue)
                )} đ (${totalStockQuantity} sp)`
              : `${formatMoney(
                  Math.round(totalInventoryValue)
                )} đ (${totalSoldQuantity} sp)`
          }
          className="bg-teal-500 text-white border-teal-500 rounded-xl"
          showTimeSelector={true}
          timeType={inventoryStatType}
          onChangeTimeType={setInventoryStatType}
          timeOptions={[
            { label: "Giá trị tồn kho", value: "stockValue" },
            { label: "Giá trị đã bán", value: "soldValue" },
          ]}
          selectClassName="bg-teal-400 hover:bg-white focus:ring-2 focus:ring-teal-500"
          numberClassName="text-xl leading-snug line-clamp-2"
        />

        <BoxInfo
          text="Tổng số đơn hàng"
          icon={<HiOutlineClipboardList size={22} />}
          number={totalOrders || 0}
          className="bg-yellow-500 text-white border-yellow-500 rounded-xl"
        />

        <BoxInfo
          text="Số tiền đã được thanh toán"
          icon={<img src="/dong.svg" className="h-6 object-contain" />}
          number={formatMoney(Math.round(totalPaid))}
          className="bg-green-500 text-white border-green-500 rounded-xl"
        />
        <BoxInfo
          text="Số tiền chưa thanh toán"
          icon={<img src="/dong.svg" className="h-6 object-contain" />}
          number={formatMoney(Math.round(totalUnpaid))}
          className="bg-orange-500 text-white border-orange-500 rounded-xl"
        />

        <BoxInfo
          text="Sản phẩm còn trong bảo hành"
          icon={<MdVerifiedUser size={22} />}
          number={0}
          className="bg-amber-500 text-white border-amber-500 rounded-xl"
        />
      </div>

      {/* Thống kê biểu đồ */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-4 mt-6">
        {/* Biểu đồ doanh thu */}
        <div className="col-span-1 lg:col-span-7 bg-white rounded-xl shadow-md p-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex flex-wrap items-center gap-4 font-semibold text-lg">
                <span>
                  Thống kê doanh thu theo {isMonth ? "tháng" : "ngày"}
                </span>
                <div className="flex items-center gap-3 text-sm font-normal">
                  <label>Từ</label>
                  <input
                    type="date"
                    value={customTime.from}
                    onChange={(e) =>
                      setCustomTime((prev) => ({
                        ...prev,
                        from: e.target.value,
                      }))
                    }
                    className="border p-1 rounded-md"
                  />
                  <label>Đến</label>
                  <input
                    type="date"
                    value={customTime.to}
                    onChange={(e) =>
                      setCustomTime((prev) => ({
                        ...prev,
                        to: e.target.value,
                      }))
                    }
                    className="border p-1 rounded-md"
                  />
                  <button
                    onClick={handleCustomTime}
                    className="text-blue-500 border border-blue-500 px-2 py-1 rounded-md hover:bg-blue-50"
                  >
                    Mặc định
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className={`px-4 py-1 rounded-md border ${
                    !isMonth
                      ? "bg-main text-white font-semibold"
                      : "hover:border-main-blue"
                  }`}
                  onClick={() => setIsMonth(false)}
                >
                  Ngày
                </button>
                <button
                  className={`px-4 py-1 rounded-md border ${
                    isMonth
                      ? "bg-main text-white font-semibold"
                      : "hover:border-main-blue"
                  }`}
                  onClick={() => setIsMonth(true)}
                >
                  Tháng
                </button>
              </div>
            </div>

            <CustomChart
              customTime={customTime}
              isMonth={isMonth}
              data={(data?.chartData?.length
                ? data.chartData
                : defaultChartData
              ).map((item) => ({
                date: item.label,
                sum: item.total,
              }))}
            />
          </div>
        </div>

        {/* Biểu đồ tròn */}
        <div className="col-span-1 lg:col-span-3 bg-white rounded-xl shadow-md p-4">
          <h2 className="font-semibold mb-4">Tỉ lệ đơn hàng</h2>
          <Pie data={computedPieData} options={pieOptions} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
