import React from "react";

export default function Wishlist({ wishlist, onRemove }) {
  if (!wishlist || wishlist.length === 0)
    return <div className="text-gray-500">Chưa có sản phẩm yêu thích.</div>;
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {wishlist.map((item) => (
        <div key={item.id} className="border rounded-lg p-4 relative bg-white shadow">
          <img src={item.image} alt={item.name} className="w-full h-32 object-cover mb-2 rounded" />
          <h3 className="font-semibold text-base mb-1">{item.name}</h3>
          <p className="text-gray-500 text-sm mb-2">Giá: {item.price.toLocaleString()}₫</p>
          <button
            className="absolute top-2 right-2 text-gray-400 hover:text-red-500 font-bold"
            onClick={() => onRemove(item.id)}
            aria-label="Xóa khỏi yêu thích"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
} 