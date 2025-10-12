// src/components/cards/PolicyCard.jsx
import React from "react";

export const PolicyCard = ({ color, icon, title, description }) => {
  // icon responsive: nhỏ hơn trên màn hình nhỏ
  const iconSize = window.innerWidth < 768 ? 40 : 60; // md breakpoint

  return (
    <div className="card-default w-[150px] h-[200px] md:w-[250px] md:h-[200px] flex flex-col justify-center items-center select-none p-2">
      {/* Icon */}
      <div
        className="w-[70px] h-[70px] md:w-[120px] md:h-[120px] flex items-center justify-center rounded-full text-6xl transition-all duration-300"
        style={{ color }}
      >
        {React.isValidElement(icon)
          ? React.cloneElement(icon, { size: iconSize, color })
          : icon}
      </div>

      {/* Title */}
      <p className="text-title font-semibold text-center mt-1">{title}</p>

      {/* Description */}
      <p className="text-description text-gray-600 text-center px-2 break-words whitespace-normal">
        {description}
      </p>
    </div>
  );
};

export default PolicyCard;
