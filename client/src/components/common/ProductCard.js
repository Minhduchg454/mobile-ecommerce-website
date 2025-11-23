import React from "react";
import { formatMoney, calculateFinalPrice } from "ultils/helpers";
import path from "ultils/path";
import { AiFillStar } from "react-icons/ai";
import { ShopChip } from "../../components";
import { useNavigate } from "react-router-dom";

export const ProductCard = (props) => {
  const navigate = useNavigate();
  const {
    productMinOriginalPrice,
    productMinPrice,
    productDiscountPercent,
    productIsOnSale,
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
    className,
    imageHeight,
  } = props;

  const productUrl = `/${path.PRODUCTS}/${pvId}`;

  const origPrice = Number(productMinOriginalPrice) || 0;
  const pctRaw = Number(productDiscountPercent) || 0;
  const pct = Math.max(0, Math.min(99, Math.round(pctRaw)));
  const isOnSale = productIsOnSale === true;
  const finalPrice = calculateFinalPrice(
    productMinPrice,
    productDiscountPercent
  );
  const showBadge = isOnSale && pct > 0;

  const handleCardClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(productUrl);
  };

  // 1. Kích thước Card: Nếu có prop 'className' truyền vào thì dùng, ko thì dùng mặc định
  const cardDimensions =
    className || "w-[180px] h-[270px] md:w-[220px] md:h-[310px]";

  // 2. Kích thước Ảnh: Tương tự
  const imgDimensions = imageHeight || "h-[120px] md:h-[150px]";

  return (
    <div
      onClick={handleCardClick}
      className={`relative card-default cursor-pointer p-2 flex flex-col justify-start items-center border ${cardDimensions}`}
    >
      {showBadge && (
        <div className="absolute right-0 top-0 rounded-tr-2xl rounded-bl-2xl bg-red-500 text-white text-[10px] md:text-xs font-bold px-2 py-1">
          -{pct}%
        </div>
      )}

      {/* Áp dụng imgDimensions vào đây */}
      <div
        className={`w-full flex justify-center items-center ${imgDimensions}`}
      >
        <img
          src={
            thumb ||
            "https://apollobattery.com.au/wp-content/uploads/2022/08/default-product-image.png"
          }
          alt={productName}
          className="w-auto h-full object-contain"
        />
      </div>

      <div className="flex flex-col justify-start items-start text-xs w-full mt-1">
        <span className="line-clamp-2 font-medium text-start capitalize break-words min-h-[3.2em] leading-[1.5em]">
          {shopOfficial && (
            <span className="text-[10px] px-0.5 py-0.5 rounded bg-red-500 text-white border border-purple-200">
              Mall
            </span>
          )}{" "}
          <span className="text-xs md:text-sm">{productName}</span>
        </span>
      </div>

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

      <div className="w-full">
        <div className="flex flex-col items-baseline min-h-[2.4em] leading-[1.2em]">
          <span className="text-card-t-price text-sm md:text-base font-semibold">
            {finalPrice ? `${formatMoney(finalPrice)} đ` : "Liên hệ"}
          </span>

          <span className="text-gray-400 line-through text-[11px] md:text-xs">
            {formatMoney(origPrice)} đ
          </span>
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
