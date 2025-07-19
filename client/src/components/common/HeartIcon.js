import React, { memo } from "react";
import { BsFillSuitHeartFill, BsSuitHeart } from "react-icons/bs";
import clsx from "clsx";

const HeartIcon = ({ 
  isWished = false, 
  size = 16, 
  className = "",
  onClick,
  disabled = false 
}) => {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={clsx(
        "flex items-center justify-center transition-all duration-200 rounded-md",
        disabled
          ? "cursor-not-allowed opacity-50"
          : "cursor-pointer",
        isWished
          ? "bg-red-500 text-white hover:bg-red-600"
          : "border border-red-500 text-red-500 hover:bg-red-50",
        className
      )}
    >
      {isWished ? (
        <BsFillSuitHeartFill size={size} />
      ) : (
        <BsSuitHeart size={size} />
      )}
    </button>
  );
};

export default memo(HeartIcon); 