import React, { useState, useEffect, memo } from "react";
import icons from "ultils/icons";
import { apiGetProducts } from "apis/product";
import {
  renderStarFromNumber,
  formatMoney,
  secondsToHms,
} from "ultils/helpers";
import { Countdown } from "components";
import moment from "moment";
import { useSelector } from "react-redux";
import withBaseComponent from "hocs/withBaseComponent";
import { getDealDaily } from "store/products/productSlice";

const { AiOutlineMenu } = icons;

const DealDaily = ({ dispatch }) => {
  const [hour, setHour] = useState(0);
  const [minute, setMinute] = useState(0);
  const [second, setSecond] = useState(0);
  const { dealDaily } = useSelector((s) => s.products);

  // Hàm gọi API lấy sản phẩm ngẫu nhiên
  const fetchDealDaily = async () => {
    const response = await apiGetProducts({ sort: "-totalRating", limit: 20 });
    if (response.success && response.products?.length > 0) {
      const randomProduct =
        response.products[Math.floor(Math.random() * response.products.length)];

      dispatch(
        getDealDaily({
          data: randomProduct,
          time: Date.now() + 24 * 60 * 60 * 1000, // 24 giờ
        })
      );
    } else {
      console.warn("Không có sản phẩm hoặc lỗi khi gọi API");
    }
  };

  // Gọi API lần đầu nếu chưa có dữ liệu
  useEffect(() => {
    if (!dealDaily?.time) {
      fetchDealDaily();
    }
  }, []);

  // Cập nhật thời gian đếm ngược mỗi khi dealDaily thay đổi
  useEffect(() => {
    if (dealDaily?.time) {
      const deltaTime = dealDaily.time - Date.now();
      const time = secondsToHms(deltaTime);
      setHour(time.h);
      setMinute(time.m);
      setSecond(time.s);
    }
  }, [dealDaily]);

  // Đếm ngược
  useEffect(() => {
    const interval = setInterval(() => {
      if (second > 0) setSecond((prev) => prev - 1);
      else if (minute > 0) {
        setMinute((prev) => prev - 1);
        setSecond(59);
      } else if (hour > 0) {
        setHour((prev) => prev - 1);
        setMinute(59);
        setSecond(59);
      } else {
        clearInterval(interval);
        fetchDealDaily(); // hết giờ thì gọi sản phẩm mới
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [hour, minute, second]);

  return (
    <div className="border hidden lg:block w-full flex-auto">
      <div className="flex items-center justify-center p-4 w-full">
        <span className="font-semibold text-[20px] flex justify-center text-gray-700">
          ĐANG GIẢM GIÁ
        </span>
      </div>

      <div className="w-full flex flex-col items-center pt-8 px-4 gap-2">
        <img
          src={
            dealDaily?.data?.thumb ||
            "https://apollobattery.com.au/wp-content/uploads/2022/08/default-product-image.png"
          }
          alt=""
          className="w-full object-contain"
        />
        <span className="line-clamp-1 text-center">
          {dealDaily?.data?.productName}
        </span>
        <span className="flex h-4">
          {renderStarFromNumber(dealDaily?.data?.totalRatings, 20)?.map(
            (el, index) => (
              <span key={index}>{el}</span>
            )
          )}
        </span>
        <span>{`${formatMoney(dealDaily?.data?.minPrice)} VNĐ`}</span>
      </div>

      <div className="px-4 mt-8">
        <div className="flex justify-center gap-2 items-center mb-4">
          <Countdown unit={"Hours"} number={hour} />
          <Countdown unit={"Minutes"} number={minute} />
          <Countdown unit={"Seconds"} number={second} />
        </div>
        <button
          type="button"
          className="flex gap-2 items-center justify-center w-full bg-main hover:bg-gray-800 text-white font-medium py-2"
        >
          <AiOutlineMenu />
          <span>Tùy chọn</span>
        </button>
      </div>
    </div>
  );
};

export default withBaseComponent(memo(DealDaily));
