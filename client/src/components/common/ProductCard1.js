import React from "react";
import { formatMoney, calculateFinalPrice } from "ultils/helpers";
import path from "ultils/path";
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
    variationId: pvId, // Đảm bảo variationId được truyền vào
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
  return (
    <a
      href={productUrl}
      className="relative card-default border cursor-pointer w-[150px] h-[260px] p-2 flex flex-col justify-start items-center"
    >
      {showBadge && (
        <div className="absolute right-0 top-0 rounded-tr-2xl rounded-bl-2xl bg-red-500 text-white text-[10px] md:text-xs font-bold px-2 py-1">
          -{pct}%
        </div>
      )}
      {/* Ảnh */}
      <div className="w-full  h-[100px] flex justify-center items-center">
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
            <span className="text-[7px] px-0.5 py-0.5 rounded bg-red-500 text-white border border-purple-200">
              Mall
            </span>
          )}{" "}
          <span className="text-xs">{productName}</span>
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
          <span className="text-card-t-price text-xs  md:text-sm font-semibold">
            {finalPrice ? `${formatMoney(finalPrice)} đ` : "Liên hệ"}
          </span>
          <span className="text-gray-400 line-through text-[11px] md:text-xs">
            {formatMoney(origPrice)} đ
          </span>
        </div>

        <div className="flex justify-start gap-3 items-center text-xs w-full">
          <span className="flex items-center gap-1">
            <AiFillStar className="text-yellow-300" size={16} />
            <span>{rating ?? 0}</span>
          </span>
          <span className="">{`Đã bán ${totalSold ?? 0}`}</span>
        </div>
      </div>
    </a>
  );
};
