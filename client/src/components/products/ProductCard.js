import withBaseComponent from "hocs/withBaseComponent";
import React, { memo } from "react";
import { renderStarFromNumber, formatMoney } from "ultils/helpers";
import path from "ultils/path";

const ProductCard = ({
  minPrice,
  totalRating,
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
          `/${category?.productCategoryName.ptoLowerCase()}/${pid}/${productName}`
        )
      }
      className="col-span-1 cursor-pointer"
    >
      <div className="flex w-full border min-h-[150px]">
        <img
          src={thumb}
          alt="products"
          className="w-[120px] object-contain p-4"
        />
        <div className="flex flex-col mt-[15px] items-start gap-1 w-full text-xs">
          <span className="line-clamp-1 capitalize text-sm">
            {productName?.toLowerCase()}
          </span>
          <span className="flex h-4">
            {renderStarFromNumber(totalRating, 14)?.map((el, index) => (
              <span key={index}>{el}</span>
            ))}
          </span>
          <span>{`${formatMoney(minPrice)} VNĐ`}</span>
        </div>
      </div>
    </div>
  );
};

export default withBaseComponent(memo(ProductCard));
