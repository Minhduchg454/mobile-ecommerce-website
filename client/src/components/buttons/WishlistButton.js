import React, { memo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { showWishlist } from "store/app/appSlice";
import clsx from "clsx";
import "./WishlistButton.css";

const WishlistButton = ({ 
  className = "",
  showBadge = true,
  size = "md",
  variant = "default" // default, minimal, floating
}) => {
  const dispatch = useDispatch();
  const { current } = useSelector((state) => state.user);
  
  const wishlistCount = current?.wishlist?.length || 0;

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12"
  };

  const iconSizes = {
    sm: 16,
    md: 18,
    lg: 20
  };

  const handleClick = () => {
    dispatch(showWishlist());
  };

  if (variant === "minimal") {
    return (
      <button
        onClick={handleClick}
        className={clsx(
          "wishlist-button relative flex items-center justify-center rounded-full transition-all duration-200",
          "hover:bg-red-50 hover:scale-105 active:scale-95",
          sizeClasses[size],
          className
        )}
      >
        <FaRegHeart 
          className="text-gray-600 hover:text-red-500 transition-colors duration-200" 
          size={iconSizes[size]}
        />
                 {showBadge && wishlistCount > 0 && (
           <span className="wishlist-badge absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
             {wishlistCount > 99 ? "99+" : wishlistCount}
           </span>
         )}
      </button>
    );
  }

  if (variant === "floating") {
    return (
      <button
        onClick={handleClick}
        className={clsx(
          "wishlist-button floating fixed bottom-6 right-6 z-50 bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-full shadow-lg",
          "hover:shadow-xl hover:scale-110 active:scale-95 transition-all duration-300",
          "flex items-center justify-center",
          sizeClasses.lg,
          className
        )}
      >
        <FaHeart size={20} />
                 {showBadge && wishlistCount > 0 && (
           <span className="wishlist-badge absolute -top-2 -right-2 bg-white text-red-500 text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold border-2 border-red-500">
             {wishlistCount > 99 ? "99+" : wishlistCount}
           </span>
         )}
      </button>
    );
  }

  // Default variant
  return (
    <button
      onClick={handleClick}
      className={clsx(
        "wishlist-button relative flex items-center justify-center rounded-full transition-all duration-200",
        "bg-white border border-gray-200 hover:border-red-300 hover:bg-red-50",
        "hover:scale-105 active:scale-95 shadow-sm hover:shadow-md",
        sizeClasses[size],
        className
      )}
    >
      <FaRegHeart 
        className="text-gray-600 hover:text-red-500 transition-colors duration-200" 
        size={iconSizes[size]}
      />
             {showBadge && wishlistCount > 0 && (
         <span className="wishlist-badge absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center font-semibold px-1">
           {wishlistCount > 99 ? "99+" : wishlistCount}
         </span>
       )}
    </button>
  );
};

export default memo(WishlistButton); 