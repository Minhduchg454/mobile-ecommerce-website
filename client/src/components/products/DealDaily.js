import React, { useState, useEffect, memo } from "react";
import icons from "ultils/icons";
import { apiGetProducts } from "apis/product";
import {
  renderStarFromNumber,
  formatMoney,
  secondsToHms,
} from "ultils/helpers";
import { Countdown } from "components";
import { useSelector } from "react-redux";
import withBaseComponent from "hocs/withBaseComponent";
import { getDealDaily } from "store/products/productSlice";
import { useNavigate } from "react-router-dom";

const { AiOutlineMenu } = icons;

const DealDaily = ({ dispatch }) => {
  const [hour, setHour] = useState(0);
  const [minute, setMinute] = useState(0);
  const [second, setSecond] = useState(0);
  const { dealDaily } = useSelector((s) => s.products);
  const navigate = useNavigate();

  // Gọi API và dispatch deal mới
  const fetchDealDaily = async () => {
    const response = await apiGetProducts({ sort: "-totalRating", limit: 20 });
    if (response.success && response.products?.length > 0) {
      const randomProduct =
        response.products[Math.floor(Math.random() * response.products.length)];
      dispatch(
        getDealDaily({
          data: randomProduct,
          time: Date.now() + 12 * 60 * 60 * 1000, // 12 giờ
        })
      );
    }
  };

  // Gọi 1 lần đầu nếu chưa có
  useEffect(() => {
    if (!dealDaily?.time) {
      fetchDealDaily();
    }
  }, [dealDaily?.time]);

  // Reset lại bộ đếm khi có time mới
  useEffect(() => {
    if (dealDaily?.time) {
      const deltaTime = dealDaily.time - Date.now();
      const { h, m, s } = secondsToHms(deltaTime);
      setHour(h);
      setMinute(m);
      setSecond(s);
    }
  }, [dealDaily?.time]);

  // Tạo interval đếm ngược
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
        fetchDealDaily(); // hết giờ → gọi sản phẩm mới
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [hour, minute, second, dealDaily?.time]);

  const handleRedirect = () => {
    const data = dealDaily?.data;

    console.log(
      "Kich hoat onclick0",
      data?._id,
      data?.slug,
      data?.categoryId?.slug
    );
    if (data?._id && data?.slug && data?.categoryId?.slug) {
      console.log("Kich hoat onclick1");
      navigate(`/${data.categoryId.slug}/${data._id}/${data.slug}`);
    }
  };

  return (
    <div className="card-default card border hidden lg:block w-full flex-auto">
      <div className="flex items-center justify-center p-4 w-full">
        <span className="font-semibold text-[20px] flex justify-center text-gray-700">
          ĐANG GIẢM GIÁ
        </span>
      </div>

      <div
        className="w-full flex flex-col items-center pt-8 px-4 gap-2 cursor-pointer"
        onClick={handleRedirect}
      >
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
          {renderStarFromNumber(dealDaily?.data?.rating, 20)?.map(
            (el, index) => (
              <span key={index}>{el}</span>
            )
          )}
        </span>
        <span>{`${formatMoney(dealDaily?.data?.minPrice)} VNĐ`}</span>
      </div>

      {/* <div className="flex justify-center mb-4">
        <button
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          onClick={fetchDealDaily}
        >
          ÉP ĐỔI DEAL
        </button>
      </div> */}

      <div className="px-4 mt-8">
        <div className="flex justify-center gap-2 items-center mb-4">
          <Countdown unit="Giờ" number={hour} />
          <Countdown unit="Phút" number={minute} />
          <Countdown unit="Giây" number={second} />
        </div>
      </div>
    </div>
  );
};

export default withBaseComponent(memo(DealDaily));
