import React, { useState, useEffect, memo } from "react";
import {
  apiGetProducts,
  apiGetVariationsByProductId,
  apiUpdateProductVariation,
} from "apis";
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
  const { current } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [discountPercent, setDiscountPercent] = useState(5);
  const [dealTime, setDealTime] = useState(12);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshed, setRefreshed] = useState(false);

  const restoreOriginalPrice = async (product) => {
    if (product?.variantId && product?.originalPrice) {
      try {
        await apiUpdateProductVariation(product.variantId, {
          price: product.originalPrice,
        });
        //console.log("Đã khôi phục giá gốc cho biến thể");
      } catch (err) {
        console.error("Lỗi khôi phục giá gốc:", err);
      }
    }
  };

  const fetchDealDaily = async () => {
    setIsRefreshing(true);
    setRefreshed(false);
    try {
      const response = await apiGetProducts({
        sort: "-totalRating",
        limit: 20,
      });
      if (response.success && response.products?.length > 0) {
        const shuffled = response.products.sort(() => 0.5 - Math.random());
        const product1 = shuffled[0];

        const variantRes = await apiGetVariationsByProductId(product1._id);
        if (variantRes.success && variantRes.variations.length > 0) {
          const lowest = variantRes.variations.reduce((a, b) =>
            a.price < b.price ? a : b
          );
          const originalPrice = lowest.price;
          const minPrice = lowest.price;
          const variantId = lowest._id;

          const newProduct = {
            ...product1,
            discountPercent,
            minPrice,
            variantId,
            originalPrice,
          };

          await apiUpdateProductVariation(variantId, {
            price: newProduct.minPrice * (1 - discountPercent / 100),
          });

          const isDifferent =
            !dealDaily?.data?.product1 ||
            dealDaily.data.product1._id !== product1._id ||
            dealDaily.data.product1.variantId !== variantId;

          dispatch(
            getDealDaily({
              data: { product1: newProduct },
              time: Date.now() + dealTime * 60 * 60 * 1000,
            })
          );

          if (isDifferent) {
            setRefreshed(true);
            setTimeout(() => setRefreshed(false), 2000);
          }
        }
      }
    } catch (error) {
      console.error("❌ Lỗi khi fetch Deal Daily:", error);
    } finally {
      setIsRefreshing(false);
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
        restoreOriginalPrice(dealDaily?.data?.product1);
        fetchDealDaily();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [hour, minute, second, dealDaily?.time]);

  const handleRedirect = (product) => {
    if (product?.slug && product?.categoryId?.slug && product?.variantId) {
      navigate(
        `/${product.categoryId.slug}/${product.slug}?code=${product.variantId}`
      );
    }
  };

  const handleManualRefresh = async () => {
    await restoreOriginalPrice(dealDaily?.data?.product1);
    await fetchDealDaily();
  };

  const product1 = dealDaily?.data?.product1;

  const renderProduct = (product) => {
    const discount = product?.discountPercent || 0;
    const price = product?.minPrice || 0;
    const discountedPrice = price * (1 - discount / 100);

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
          {(renderStarFromNumber(product.rating, 20) || []).map((el, i) => (
            <span key={i}>{el}</span>
          ))}
          <span className="text-gray-500 ml-2">
            {"Đã bán " + (product.totalSold || 0)}
          </span>
        </span>

        <span className="text-red-600 font-semibold text-[16px]">
          {formatMoney(discountedPrice)} VNĐ
        </span>

        {discount > 0 && (
          <div className="flex items-center gap-2">
            <span className="line-through text-xs text-gray-500">
              {formatMoney(price)} VNĐ
            </span>
            <span className="text-xs bg-red-500 text-white px-1 rounded">
              -{discount}%
            </span>
          </div>
        )}

        {typeof product?.description === "string" && (
          <div
            className="text-sm text-center text-gray-500 my-3"
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
          SALE RỰC RỠ <p>GIÁ GIẢM BẤT NGỜ</p>
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

      {current?.roleId?.roleName === "admin" && (
        <>
          <div className="flex flex-col md:flex-row gap-4 items-center justify-center mt-4">
            <div className="flex flex-col items-start">
              <label className="text-sm text-gray-700 mb-1">
                Tỉ lệ giảm (%)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={discountPercent}
                onChange={(e) => setDiscountPercent(+e.target.value)}
                className="border px-2 py-1 rounded text-sm w-[100px]"
              />
            </div>

            <div className="flex flex-col items-start">
              <label className="text-sm text-gray-700 mb-1">
                Thời gian chạy (giờ)
              </label>
              <input
                type="number"
                min={1}
                max={48}
                value={dealTime}
                onChange={(e) => setDealTime(+e.target.value)}
                className="border px-2 py-1 rounded text-sm w-[100px]"
              />
            </div>
          </div>

          <div className="flex justify-center mt-4">
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className={`text-white px-4 py-2 rounded text-sm transition-colors duration-300 mb-2
                ${
                  refreshed
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-red-500 hover:bg-red-600"
                }
                ${isRefreshing ? "opacity-70 cursor-not-allowed" : ""}`}
            >
              {isRefreshing
                ? "Đang làm mới..."
                : refreshed
                ? "Đã cập nhật!"
                : "Làm mới Deal"}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default withBaseComponent(memo(DealDaily));
