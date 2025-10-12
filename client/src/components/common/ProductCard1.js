import React, { useState, useEffect } from "react";
import withBaseComponent from "hocs/withBaseComponent";
import { renderStarFromNumber, formatMoney } from "ultils/helpers";
import { toast } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import {
  BsFillCartPlusFill,
  BsFillSuitHeartFill,
  BsSuitHeart,
} from "react-icons/bs";
import Swal from "sweetalert2";
import path from "ultils/path";
import { useNavigate } from "react-router-dom";
import { updateCartItem, fetchWishlist } from "store/user/asyncActions";
import useRole from "hooks/useRole";
import { apiCreateWishlist, apiDeleteWishlistByCondition } from "../../apis";
import clsx from "clsx";
import { AiFillStar } from "react-icons/ai";
import { ShopChip } from "../../components";

export const ProductCard1 = (props) => {
  const {
    productMinOriginalPrice,
    productMinPrice,
    productDiscountPercent,
    productIsOnSale,
    slugCategory,
    slug,
    variationId: pvId,
    shopSlug,
    shopId,
    shopName,
    shopLogo,
    shopOfficial,
    thumb,
    productName,
    rating,
    totalSold,
  } = props;

  const navigate = useNavigate();
  const handleNavigate = () => {
    navigate(`/${path.PRODUCTS}/${pvId}`);
  };

  // --- TÍNH GIÁ THEO QUY TẮC MỚI ---
  const orig = Number(productMinOriginalPrice) || 0;
  const pctRaw = Number(productDiscountPercent) || 0;
  const pct = Math.max(0, Math.min(99, Math.round(pctRaw))); // clamp 0–99

  // Nếu là sale của sàn: tính lại giá từ (orig, pct). Ngược lại: dùng giá đã có.
  const isOnSale = productIsOnSale === true;
  const saleByPlatform =
    isOnSale && orig > 0 && pct > 0 ? Math.round(orig * (1 - pct / 100)) : null;

  const finalPrice = isOnSale
    ? saleByPlatform ?? orig
    : Number(productMinPrice) || orig || 0;

  const showBadge = isOnSale && pct > 0; // chỉ badge khi sale sàn
  const showStriked = orig > finalPrice && orig > 0;

  return (
    <div
      onClick={handleNavigate}
      className="relative card-default cursor-pointer w-[180px] h-[270px] md:w-[220px] md:h-[310px] p-2 flex flex-col justify-start items-center"
    >
      {showBadge && (
        <div className="absolute right-0 top-0 rounded-tr-2xl rounded-bl-2xl bg-red-500 text-white text-[10px] md:text-xs font-bold px-2 py-1">
          -{pct}%
        </div>
      )}
      {/* Ảnh */}
      <div className="w-full h-[120px] md:h-[150px] flex justify-center items-center">
        <img
          src={
            thumb ||
            "https://apollobattery.com.au/wp-content/uploads/2022/08/default-product-image.png"
          }
          alt={productName}
          className="w-auto h-full object-contain"
        />
      </div>

      {/* Tên sản phẩm */}
      <div className="flex flex-col justify-start items-start text-xs w-full mt-1">
        <span className="line-clamp-2 font-medium text-start capitalize break-words min-h-[3.2em] leading-[1.5em]">
          {shopOfficial && (
            <span className="text-[10px] px-0.5 py-0.5 rounded bg-red-500 text-white border border-purple-200">
              Mall
            </span>
          )}{" "}
          <span className="text-xs md:text-sm">
            {productName?.toLowerCase()}
          </span>
        </span>
      </div>

      {/* Shop chip */}
      {shopSlug && (
        <div className="w-full py-1">
          <ShopChip
            shopSlug={shopSlug}
            shopName={shopName}
            shopLogo={shopLogo}
            shopId={shopId}
          />
        </div>
      )}

      {/* Giá & đánh giá */}
      <div className="w-full">
        <div className="flex flex-col items-baseline min-h-[2.4em] leading-[1.2em]">
          <span className="text-card-t-price text-sm md:text-base font-semibold">
            {finalPrice ? `${formatMoney(finalPrice)} đ` : "Liên hệ"}
          </span>
          {showStriked && (
            <span className="text-gray-400 line-through text-[11px] md:text-xs">
              {formatMoney(orig)} đ
            </span>
          )}
        </div>

        <div className="flex justify-start gap-3 items-center text-description w-full">
          <span className="flex items-center gap-1">
            <AiFillStar className="text-yellow-300" size={16} />
            <span>{rating ?? 0}</span>
          </span>
          <span className="">{`Đã bán ${totalSold ?? 0}`}</span>
        </div>
      </div>
    </div>
  );
};
