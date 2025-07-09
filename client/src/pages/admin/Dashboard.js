import React, { useEffect, useState } from "react";
import { apiGetDashboard } from "apis";
import BoxInfo from "components/chart/BoxInfo";
import CustomChart from "components/chart/CustomChart";
import { AiOutlineUserAdd } from "react-icons/ai";
import { formatMoney } from "ultils/helpers";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {
  const [data, setData] = useState();
  const [isMonth, setIsMonth] = useState(false);
  const [customTime, setCustomTime] = useState({ from: "", to: "" });

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

  const pieData = {
    labels: ["Tổng đơn đã hủy", "Tổng đơn thành công"],
    datasets: [
      {
        label: "Tổng đơn",
        data: [
          data?.pieData?.find((el) => el.status === "Cancelled")?.sum || 0,
          data?.pieData?.find((el) => el.status === "Succeed")?.sum || 0,
        ],
        backgroundColor: ["rgba(255, 99, 132, 0.4)", "rgba(54, 162, 235, 0.4)"],
        borderColor: ["rgba(255, 99, 132, 1)", "rgba(54, 162, 235, 1)"],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="w-full flex flex-col gap-4 bg-gray-50 px-4 pb-6">
      {/* Thống kê tổng quan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <BoxInfo
          text="Số thành viên mới"
          icon={<AiOutlineUserAdd size={22} />}
          number={data?.users[0]?.count}
          className="bg-blue-500 text-white border-blue-500 rounded-xl"
        />
        <BoxInfo
          text="Số tiền đã được thanh toán"
          icon={<img src="/dong.svg" className="h-6 object-contain" />}
          number={
            data?.totalSuccess?.length > 0
              ? formatMoney(Math.round(data?.totalSuccess[0]?.count * 23500))
              : 0
          }
          className="bg-green-500 text-white border-green-500 rounded-xl"
        />
        <BoxInfo
          text="Số tiền chưa thanh toán"
          icon={<img src="/dong.svg" className="h-6 object-contain" />}
          number={
            data?.totalFailed?.length > 0
              ? formatMoney(Math.round(data?.totalFailed[0]?.count * 23500))
              : 0
          }
          className="bg-orange-500 text-white border-orange-500 rounded-xl"
        />
        <BoxInfo
          text="Số sản phẩm đã bán"
          number={
            data?.soldQuantities?.length > 0
              ? data?.soldQuantities[0]?.count
              : 0
          }
          className="bg-yellow-500 text-white border-yellow-500 rounded-xl"
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

            {data?.chartData && (
              <CustomChart
                customTime={customTime}
                isMonth={isMonth}
                data={data?.chartData}
              />
            )}
          </div>
        </div>

        {/* Biểu đồ tròn */}
        <div className="col-span-1 lg:col-span-3 bg-white rounded-xl shadow-md p-4">
          <h2 className="font-semibold mb-4">Tỉ lệ đơn hàng</h2>
          <Pie data={pieData} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
