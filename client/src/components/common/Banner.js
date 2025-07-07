import React, { memo, useState, useEffect, useRef } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const banners = [
  require("../../assets/banner-iphone.webp"),
  require("../../assets/banner-apple.webp"),
  require("../../assets/banner-samsung.webp"),
  require("../../assets/banner-combo.webp"),
];

const Banner = () => {
  const [index, setIndex] = useState(0);
  const intervalRef = useRef(null);

  const nextSlide = () => {
    setIndex((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const resetInterval = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(nextSlide, 5000);
  };

  useEffect(() => {
    intervalRef.current = setInterval(nextSlide, 5000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const handleNext = () => {
    nextSlide();
    resetInterval();
  };

  const handlePrev = () => {
    prevSlide();
    resetInterval();
  };

  return (
    <div className="w-full aspect-[3/1] bg-gray-100 relative overflow-hidden rounded-xl">
      {/* Slide container */}
      <div
        className="flex transition-transform duration-700 ease-in-out w-full h-full"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {banners.map((img, i) => (
          <img
            key={i}
            src={img}
            alt={`banner-${i}`}
            className="w-full h-full object-cover flex-shrink-0"
          />
        ))}
      </div>

      {/* Nút điều hướng */}
      <button
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-70 hover:bg-opacity-100 p-2 rounded-full shadow"
      >
        <FaChevronLeft />
      </button>

      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-70 hover:bg-opacity-100 p-2 rounded-full shadow"
      >
        <FaChevronRight />
      </button>
    </div>
  );
};

export default memo(Banner);
