import React, { memo, useEffect, useRef, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const ReusableBanner = ({
  images = [],
  aspectRatio = "3/1",
  className = "",
  delay = 5000, // 👉 thêm delay với giá trị mặc định
}) => {
  const [index, setIndex] = useState(0);
  const intervalRef = useRef(null);

  const nextSlide = () => {
    setIndex((prev) => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    setIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const resetInterval = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(nextSlide, delay);
  };

  useEffect(() => {
    intervalRef.current = setInterval(nextSlide, delay);
    return () => clearInterval(intervalRef.current);
  }, [delay]);

  const handleNext = () => {
    nextSlide();
    resetInterval();
  };

  const handlePrev = () => {
    prevSlide();
    resetInterval();
  };

  if (!images.length) return null;

  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-gray-100 aspect-[${aspectRatio}] ${className}`}
    >
      <div
        className="flex transition-transform duration-700 ease-in-out w-full h-full"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {images.map((img, i) => (
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
        className="w-10 h-10 absolute left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-70 hover:bg-opacity-100 rounded-full shadow flex items-center justify-center"
      >
        <FaChevronLeft className="text-gray-700 text-lg" />
      </button>

      <button
        onClick={handleNext}
        className="w-10 h-10 absolute right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-70 hover:bg-opacity-100 rounded-full shadow flex items-center justify-center"
      >
        <FaChevronRight className="text-gray-700 text-lg" />
      </button>
    </div>
  );
};

export default memo(ReusableBanner);
