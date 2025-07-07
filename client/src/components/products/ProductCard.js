import withBaseComponent from "hocs/withBaseComponent";
import React, { memo } from "react";
import { renderStarFromNumber, formatMoney } from "ultils/helpers";
import path from "ultils/path";

const ProductCard = ({
  totalSold,
  minPrice,
  rating,
  productName,
  thumb,
  pid,
  navigate,
  category,
}) => {
  return (
    <div
      onClick={(e) =>
        navigate(
          `/${category?.productCategoryName.toLowerCase()}/${pid}/${productName}`
        )
      }
      className="card-default  cursor-pointer max-w-[320px]"
    >
      <div className="flex w-full border rounded-md shadow-sm overflow-hidden">
        <img
          src={thumb}
          alt="products"
          className="w-[120px] h-[200px] object-contain p-2"
        />
        <div className="flex flex-col justify-center gap-2 p-2 text-xs w-full">
          <span className="line-clamp-2 capitalize text-sm font-medium">
            {productName?.toLowerCase()}
          </span>
          <span className="flex h-4 items-center gap-1 text-yellow-500">
            {renderStarFromNumber(rating, 14)?.map((el, index) => (
              <span key={index}>{el}</span>
            ))}
            <span className="text-gray-500 ml-2">{`Đã bán ${totalSold}`}</span>
          </span>
          <span className="text-main font-semibold">
            {`${formatMoney(minPrice)} VNĐ`}
          </span>
        </div>
      </div>
    </div>
  );
};

export default withBaseComponent(memo(ProductCard));
