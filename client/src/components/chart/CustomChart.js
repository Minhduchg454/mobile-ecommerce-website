import React, { memo, useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  getDaysInMonth,
  getDaysInRange,
  getMonthInYear,
  getMonthsInRange,
} from "ultils/helpers";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Chart as ChartJS } from "chart.js";
ChartJS.register(ChartDataLabels);

// Hàm định dạng ngắn gọn
const formatMoneyShort = (value) => {
  if (value >= 1_000_000_000) return (value / 1_000_000_000).toFixed(1) + " tỷ";
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(1) + " triệu";
  if (value >= 1_000) return (value / 1_000).toFixed(1) + " nghìn";
  return value;
};

const CustomChart = ({ data, isMonth, customTime }) => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const number = isMonth
      ? getMonthsInRange(customTime?.from, customTime?.to)
      : getDaysInRange(customTime?.from, customTime?.to);
    const rawData = isMonth
      ? getMonthInYear(customTime?.to, number)
      : getDaysInMonth(customTime?.to, number);

    const editedData = rawData.map((el) => {
      return {
        sum: data?.some((i) => i.date === el)
          ? data.find((i) => i.date === el)?.sum
          : 0,
        date: el,
      };
    });

    setChartData(editedData);
  }, [data, isMonth, customTime]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    pointRadius: 3,
    pointHoverRadius: 5,
    tension: 0.3,
    scales: {
      y: {
        ticks: {
          callback: function (value) {
            return formatMoneyShort(value);
          },
          font: { size: 12 },
        },
        grid: {
          color: "rgba(0,0,0,0.05)",
          drawTicks: false,
        },
        beginAtZero: true,
      },
      x: {
        ticks: {
          color: "black",
          maxRotation: 45,
          minRotation: 30,
          autoSkip: true,
          maxTicksLimit: 12,
        },
        grid: { color: "transparent" },
      },
    },
    plugins: {
      legend: false,
      tooltip: {
        callbacks: {
          label: function (context) {
            return "Doanh thu: " + formatMoneyShort(context.raw);
          },
        },
      },
      datalabels: {
        color: "#333",
        anchor: "end",
        align: "top",
        offset: 1,
        font: {
          size: 12,
          weight: "bold",
        },
        formatter: (value) => formatMoneyShort(value),
      },
    },
  };

  const chartRenderData = {
    labels: chartData.map((el) => el.date),
    datasets: [
      {
        data: chartData.map((el) => Math.round(+el.sum)),
        borderColor: "#e35050",
        backgroundColor: "#e35050",
        borderWidth: 2,
        pointBackgroundColor: "#fff",
        pointBorderColor: "#e35050",
        pointHoverBorderWidth: 4,
        fill: false,
      },
    ],
  };

  return (
    <div className="py-4 my-2 w-full h-full">
      {chartData?.length ? (
        <Line options={options} data={chartRenderData} />
      ) : (
        <span>Không có dữ liệu.</span>
      )}
    </div>
  );
};

export default memo(CustomChart);
