import React, { useState, useEffect, memo } from "react";
import { apiGetProducts } from "apis/product";
import DOMPurify from "dompurify";
import {
  renderStarFromNumber,
  formatMoney,
  secondsToHms,
} from "ultils/helpers";
import { useSelector } from "react-redux";
import withBaseComponent from "hocs/withBaseComponent";
import { getDealDaily } from "store/products/productSlice";
import { useNavigate } from "react-router-dom";

const DealDaily = ({ dispatch }) => {
  const [hour, setHour] = useState(0);
  const [minute, setMinute] = useState(0);
  const [second, setSecond] = useState(0);
  const { dealDaily } = useSelector((s) => s.products);
  const navigate = useNavigate();

  const fetchDealDaily = async () => {
    const response = await apiGetProducts({ sort: "-totalRating", limit: 20 });
    if (response.success && response.products?.length > 0) {
      const shuffled = response.products.sort(() => 0.5 - Math.random());
      const product1 = shuffled[0];

      dispatch(
        getDealDaily({
          data: {
            product1: { ...product1, discountPercent: 20 },
          },
          time: Date.now() + 12 * 60 * 60 * 1000, // 12 giờ
        })
      );
    }
  };

  useEffect(() => {
    if (!dealDaily?.time) fetchDealDaily();
  }, [dealDaily?.time]);

  useEffect(() => {
    if (dealDaily?.time) {
      const deltaTime = dealDaily.time - Date.now();
      const { h, m, s } = secondsToHms(deltaTime);
      setHour(h);
      setMinute(m);
      setSecond(s);
    }
  }, [dealDaily?.time]);

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
        fetchDealDaily();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [hour, minute, second, dealDaily?.time]);

  const handleRedirect = (product) => {
    if (product?._id && product?.slug && product?.categoryId?.slug) {
      navigate(`/${product.categoryId.slug}/${product._id}/${product.slug}`);
    }
  };

  const product1 = dealDaily?.data?.product1;

  const renderProduct = (product) => {
    const discountPercent = product?.discountPercent || 0;
    const discountedPrice = product?.minPrice
      ? product.minPrice * (1 - discountPercent / 100)
      : 0;

    return (
      <div
        className="w-full flex flex-col items-center pt-8 px-4 gap-2 cursor-pointer"
        onClick={() => handleRedirect(product)}
      >
        <img
          src={
            product.thumb ||
            "https://apollobattery.com.au/wp-content/uploads/2022/08/default-product-image.png"
          }
          alt=""
          className="w-[250px] h-[274px] object-contain"
        />
        <span className="line-clamp-1 text-center">{product.productName}</span>
        <span className="flex h-4 items-center gap-1">
          {renderStarFromNumber(product.rating, 20)?.map((el, i) => (
            <span key={i}>{el}</span>
          ))}
          <span className="text-gray-500 ml-2">
            {"Đã bán " + product.totalSold}
          </span>
        </span>

        <span className="text-red-600 font-semibold text-[16px]">
          {formatMoney(discountedPrice)} VNĐ
        </span>

        {discountPercent > 0 && (
          <div className="flex items-center gap-2">
            <span className="line-through text-xs text-gray-500">
              {formatMoney(product.minPrice)} VNĐ
            </span>
            <span className="text-xs bg-red-500 text-white px-1 rounded">
              -{discountPercent}%
            </span>
          </div>
        )}

        {typeof product?.description === "string" && (
          <div
            className="text-sm text-center text-gray-500 my-3 pl-0"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(product.description),
            }}
          ></div>
        )}
      </div>
    );
  };

  return (
    <div className="card-default card border lg:block w-full flex-auto">
      <div className="flex flex-col items-center justify-center p-4 w-full">
        <span className="font-semibold text-[20px] text-gray-700 text-center">
          SALE RỰC RỠ - GIÁ GIẢM BẤT NGỜ
        </span>
      </div>

      <div className="flex flex-col items-center bg-orange-100 px-4 py-2 rounded-md">
        <span className="text-orange-600 font-semibold uppercase mb-2 text-sm">
          KẾT THÚC SAU
        </span>
        <div className="flex gap-2">
          {[
            { value: hour, label: "Giờ" },
            { value: minute, label: "Phút" },
            { value: second, label: "Giây" },
          ].map((time, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="bg-orange-500 text-white px-3 py-2 rounded-md text-lg font-bold">
                {time.value.toString().padStart(2, "0")}
              </div>
              <span className="text-xs text-orange-700 mt-1">{time.label}</span>
            </div>
          ))}
        </div>
      </div>

      {product1 && renderProduct(product1)}

      {/* Bat khi can */}
      {/* {product1 && (
        <div className="flex justify-center mt-4">
          <button
            onClick={fetchDealDaily}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm"
          >
            🔄 Làm mới Deal
          </button>
        </div>
      )} */}
    </div>
  );
};

export default withBaseComponent(memo(DealDaily));
