// components/ShopChip.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import path from "../../ultils/path";

export function ShopChip({ shopSlug, shopName, shopLogo, onClick, shopId }) {
  const navigate = useNavigate();

  const initial = (shopName || "S")[0]?.toUpperCase();

  return (
    <div className="w-full">
      <button
        type="button"
        className="inline-flex items-center gap-2 w-full rounded-full border border-gray-200 bg-white px-2 py-0.5
      "
        title={shopName}
      >
        {/* Avatar */}
        {shopLogo ? (
          <img
            src={shopLogo}
            alt={shopName}
            className="h-5 w-5 border rounded-full object-cover"
          />
        ) : (
          <div className="h-5 w-5 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-semibold">
            {initial}
          </div>
        )}

        {/* Tên + badge */}
        <span className="flex items-center gap-1 min-w-0">
          <span className="truncate text-xs font-medium text-gray-800">
            {shopName}
          </span>
        </span>
      </button>
    </div>
  );
}
