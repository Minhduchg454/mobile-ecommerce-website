import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import path from "../../ultils/path";
import { MdInventory2 } from "react-icons/md";
import { AiFillStar, AiOutlineStar } from "react-icons/ai";
import { BsSuitHeart } from "react-icons/bs";
import { MdAccessTimeFilled, MdShoppingCart } from "react-icons/md";
import { FaBoxOpen } from "react-icons/fa";

export const ShopCard = (props) => {
  const {
    shopSlug,
    shopName,
    shopLogo,
    shopDescription,
    shopCreateAt,
    shopRateAvg,
    shopSoldCount,
    shopProductCount,
    shopBackground,
    shopId,
  } = props;

  const navigate = useNavigate();
  const handleNavigate = () => navigate(`/shops/${shopId}`);

  const initial = useMemo(
    () => (shopName ? shopName[0].toUpperCase() : "S"),
    [shopName]
  );

  const formattedDate = useMemo(() => {
    if (!shopCreateAt) return "";
    const date = new Date(shopCreateAt);
    return isNaN(date.getTime())
      ? ""
      : date.toLocaleDateString("vi-VN", { year: "numeric", month: "short" });
  }, [shopCreateAt]);

  return (
    <div
      onClick={handleNavigate}
      className="card-default cursor-pointer w-[250px] md:w-[300px] h-[230px] md:h-[250px] border-gray-200 hover:shadow-md transition-shadow duration-200 overflow-hidden"
      style={{
        backgroundImage: shopBackground ? `url(${shopBackground})` : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Lớp phủ mờ để dễ đọc chữ khi có hình nền */}
      <div className="w-full h-full bg-black/30 p-4 flex flex-col justify-start text-white">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          {shopLogo ? (
            <img
              src={shopLogo}
              alt={shopName}
              className="h-12 w-12 rounded-full object-cover border border-gray-300"
            />
          ) : (
            <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-semibold">
              {initial}
            </div>
          )}

          <div className="flex flex-col flex-1 min-w-0 mb-2">
            <span className="font-semibold truncate text-base">{shopName}</span>
            {formattedDate && (
              <span className="text-[11px] mt-0.5">
                Tham gia: {formattedDate}
              </span>
            )}
          </div>
        </div>

        {/* Mô tả */}
        {shopDescription && (
          <p className="text-description mt-2 line-clamp-3 break-words my-2">
            {shopDescription}
          </p>
        )}

        {/* Thống kê */}
        <div className="flex flex-col justify-center items-start text-description ">
          <span className="flex items-center gap-1 mb-0.5">
            <AiFillStar size={16} />
            <span>{shopRateAvg ?? 0} / 5</span>
          </span>

          <span className="flex items-center gap-1  mb-0.5">
            <FaBoxOpen size={16} />
            <span>Sản phẩm: {shopProductCount ?? 0}</span>
          </span>

          <span className="flex items-center gap-1  mb-0.5">
            <MdShoppingCart size={15} />
            <span>Đã bán: {shopSoldCount ?? 0}</span>
          </span>
        </div>
      </div>
    </div>
  );
};
