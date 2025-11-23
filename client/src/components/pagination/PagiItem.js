import React, { memo } from "react";

const PagiItem = ({ page, currentPage, onPageChange, isEllipsis = false }) => {
  // Nếu là dấu ba chấm, không làm gì cả
  if (isEllipsis) {
    return <span className="px-2 py-1 mx-1 text-gray-500">...</span>;
  }

  const handleClick = () => {
    if (typeof page === "number" && page !== currentPage) {
      onPageChange(page);
    }
  };

  const isActive = page === currentPage;

  return (
    <button
      onClick={handleClick}
      disabled={isActive}
      className={`rounded-full p-0.5 w-7 h-7 text-sm transition-colors 
            ${
              isActive
                ? "bg-[#DEDEE2] text-black font-extrabold cursor-default "
                : "bg-[#DEDEE2]/40 text-gray-400 font-light"
            }
            ${typeof page !== "number" ? "hidden" : ""}
            `}
    >
      {page}
    </button>
  );
};

export default memo(PagiItem);
