import React, { memo } from "react";
import { FaHeart, FaShoppingCart, FaEye, FaTrash } from "react-icons/fa";
import { formatMoney } from "ultils/helpers";
import { HeartIcon } from "components";
import clsx from "clsx";
import "../buttons/WishlistButton.css";

const WishlistItem = ({
  product,
  onRemove,
  onAddToCart,
  onViewDetail,
  className = "",
}) => {
  const handleRemove = (e) => {
    e.stopPropagation();
    onRemove?.(product._id);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    onAddToCart?.(product._id);
  };

  const handleViewDetail = (e) => {
    e.stopPropagation();
    onViewDetail?.(product._id);
  };

  return (
    <div
      className={clsx(
        "wishlist-item bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden group",
        className
      )}
    >
      {/* Product Image */}
      <div className="relative">
        <img
          src={
            product.thumb ||
            "https://apollobattery.com.au/wp-content/uploads/2022/08/default-product-image.png"
          }
          alt={product.productName}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Wishlist Icon */}
        <div className="absolute top-2 right-2">
          <HeartIcon
            isWished={true}
            size="sm"
            showAnimation={false}
            className="bg-white/80 backdrop-blur-sm"
          />
        </div>

        {/* Remove Button */}
        <button
          onClick={handleRemove}
          className="absolute top-2 left-2 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-red-100 transition-colors duration-200 group/remove"
        >
          <FaTrash 
            size={12} 
            className="text-gray-600 group-hover/remove:text-red-500 transition-colors duration-200" 
          />
        </button>

        {/* Product Name Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
          <h3 className="text-white font-semibold text-sm line-clamp-2">
            {product.productName}
          </h3>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Price and Rating */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-lg font-bold text-red-600">
            {product.price ? `${formatMoney(product.price)} VNĐ` : "Liên hệ"}
          </span>
          <div className="flex items-center gap-1 text-yellow-500">
            <span className="text-sm">★</span>
            <span className="text-sm text-gray-600">{product.rating || 0}</span>
          </div>
        </div>

        {/* Additional Info */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
          <span>Đã bán: {product.totalSold || 0}</span>
          <span>Danh mục: {product.categoryId?.productCategoryName || 'N/A'}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button 
            onClick={handleAddToCart}
            className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-2 text-sm font-medium"
          >
            <FaShoppingCart size={14} />
            Thêm giỏ hàng
          </button>
          <button 
            onClick={handleViewDetail}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center gap-2"
          >
            <FaEye size={14} />
            <span className="text-sm">Chi tiết</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default memo(WishlistItem); 