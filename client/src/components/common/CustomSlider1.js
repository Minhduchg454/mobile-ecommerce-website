import React, { memo, useRef } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const CustomSlider1 = ({ items, renderItem, itemWidth = 250 }) => {
  const containerRef = useRef(null);

  const handleWheel = (e) => {
    if (containerRef.current && Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      e.preventDefault();
      containerRef.current.scrollLeft += e.deltaY * 0.6; // mượt hơn
    }
  };

  const scroll = (direction) => {
    const amount = itemWidth + 16; // tính cả gap
    containerRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative">
      {/* Nút trái */}
      <button
        onClick={() => scroll("left")}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white bg-opacity-70 hover:bg-opacity-100 rounded-full shadow flex items-center justify-center"
      >
        <FaChevronLeft className="text-gray-700 text-lg" />
      </button>

      {/* Nút phải */}
      <button
        onClick={() => scroll("right")}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white bg-opacity-70 hover:bg-opacity-100 rounded-full shadow flex items-center justify-center"
      >
        <FaChevronRight className="text-gray-700 text-lg" />
      </button>

      {/* Slider */}
      <div
        ref={containerRef}
        onWheel={handleWheel}
        className="flex gap-2 overflow-x-auto scroll-smooth py-2 hide-scrollbar"
        style={{
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {items?.map((item, index) => (
          <div
            key={index}
            className="flex-shrink-0"
            style={{
              width: `${itemWidth}px`,
              scrollSnapAlign: "start",
            }}
          >
            {renderItem(item)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default memo(CustomSlider1);
