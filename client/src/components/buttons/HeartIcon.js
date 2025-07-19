import React, { memo, useState } from "react";
import { BsFillSuitHeartFill, BsSuitHeart } from "react-icons/bs";
import { FaHeart } from "react-icons/fa";
import clsx from "clsx";
import "./WishlistButton.css";

const HeartIcon = ({
  isWished = false,
  onClick,
  disabled = false,
  size = "md",
  showAnimation = true,
  className = "",
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = (e) => {
    e.stopPropagation();
    if (disabled) return;

    if (showAnimation && !isWished) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 600);
    }

    onClick?.(e);
  };

  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8", 
    lg: "w-10 h-10",
    xl: "w-12 h-12"
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={clsx(
        "relative flex items-center justify-center rounded-full transition-all duration-300 ease-in-out group",
        "hover:scale-110 active:scale-95",
        disabled && "cursor-not-allowed opacity-50",
        !disabled && "hover:shadow-lg",
        sizeClasses[size],
        className
      )}
    >
      {/* Background glow effect */}
      {isWished && (
        <div className="absolute inset-0 bg-red-500/20 rounded-full animate-pulse" />
      )}

      {/* Heart icon */}
      <div className="relative z-10">
        {isWished ? (
                <FaHeart 
        className={clsx(
          "heart-icon wished text-red-500 transition-all duration-300",
          isAnimating && "animate-bounce scale-125"
        )}
        size={size === "sm" ? 16 : size === "md" ? 20 : size === "lg" ? 24 : 28}
      />
        ) : (
                <BsSuitHeart 
        className={clsx(
          "heart-icon text-gray-400 group-hover:text-pink-400 transition-all duration-300",
          isAnimating && "animate-pulse"
        )}
        size={size === "sm" ? 16 : size === "md" ? 20 : size === "lg" ? 24 : 28}
      />
        )}
      </div>

      {/* Ripple effect on click */}
      {isAnimating && (
        <div className="absolute inset-0 rounded-full bg-red-500/30 animate-ping" />
      )}

      {/* Tooltip */}
      <div className={clsx(
        "absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20",
        "after:content-[''] after:absolute after:top-full after:left-1/2 after:transform after:-translate-x-1/2 after:border-4 after:border-transparent after:border-t-gray-800"
      )}>
        {isWished ? "Bỏ khỏi yêu thích" : "Thêm vào yêu thích"}
      </div>
    </button>
  );
};

export default memo(HeartIcon); 