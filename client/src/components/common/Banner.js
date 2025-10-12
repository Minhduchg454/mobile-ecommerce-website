import React, { memo, useState, useEffect, useRef } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { FaPause, FaPlay } from "react-icons/fa";

const banners = [
  require("../../assets/banner-iphone.webp"),
  require("../../assets/banner-apple.webp"),
  require("../../assets/banner-samsung.webp"),
  require("../../assets/banner-combo.webp"),
  require("../../assets/banner-laptop.webp"),
  require("../../assets/banner-dongho.webp"),
];

const Banner = ({ images = banners, delay = 4000 }) => {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false); // 🧠 trạng thái tạm dừng
  const intervalRef = useRef(null);

  const nextSlide = () => setIndex((prev) => (prev + 1) % images.length);
  const prevSlide = () =>
    setIndex((prev) => (prev - 1 + images.length) % images.length);

  // Hàm khởi động interval
  const startInterval = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(nextSlide, delay);
  };

  // Hàm dừng interval
  const stopInterval = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
  };

  // Khi thay đổi trạng thái "pause" thì bật/tắt interval
  useEffect(() => {
    if (!isPaused) startInterval();
    else stopInterval();

    return () => stopInterval();
  }, [isPaused, delay]);

  // Dọn dẹp khi unmount
  useEffect(() => {
    return () => stopInterval();
  }, []);

  const handleNext = () => {
    nextSlide();
    if (!isPaused) startInterval();
  };

  const handlePrev = () => {
    prevSlide();
    if (!isPaused) startInterval();
  };

  return (
    <div className="w-full">
      {/* Khối banner */}
      <div className="group relative w-full aspect-[3/1] overflow-hidden">
        {/* Slider */}
        <div
          className="flex transition-transform duration-700 ease-in-out w-full h-full "
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

        {/* Nút điều hướng trái */}
        <button
          onClick={handlePrev}
          className="h-12 w-6 absolute left-4 top-1/2 -translate-y-1/2 
               bg-white/70 hover:bg-white hover:scale-105 rounded-full shadow 
               flex items-center justify-center transition-all duration-300
               opacity-0 group-hover:opacity-100"
        >
          <FaChevronLeft className="text-gray-700 text-lg" />
        </button>

        {/* Nút điều hướng phải */}
        <button
          onClick={handleNext}
          className="h-12 w-6 absolute right-4 top-1/2 -translate-y-1/2 
               bg-white/70 hover:bg-white hover:scale-105 rounded-full shadow 
               flex items-center justify-center transition-all duration-300
               opacity-0 group-hover:opacity-100"
        >
          <FaChevronRight className="text-gray-700 text-lg" />
        </button>
      </div>

      {/* Dãy nút chỉ báo & tạm dừng nằm BÊN DƯỚI ảnh */}
      <div className="flex items-center justify-center gap-3 mt-3">
        {/* Indicator */}
        <div className="flex gap-2 rounded-xl bg-white p-1.5 md:p-2 shadow-sm">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setIndex(i);
                if (!isPaused) startInterval();
              }}
              className={`w-1.5 h-1.5 md:w-2.5 md:h-2.5 rounded-full transition-all duration-300 ${
                i === index
                  ? "bg-black scale-110"
                  : "bg-black/40 hover:bg-black/70"
              }`}
            ></button>
          ))}
        </div>

        {/* Nút dừng / phát */}
        <button
          onClick={() => setIsPaused((prev) => !prev)}
          className="p-1.5 md:p-2 rounded-full bg-white hover:bg-gray-200 transition-all duration-300 shadow-sm"
        >
          {isPaused ? (
            <FaPlay className="text-gray-700 text-[8px] md:text-[11px]" />
          ) : (
            <FaPause className="text-gray-700 text-[8px] md:text-[11px]" />
          )}
        </button>
      </div>
    </div>
  );
};

export default memo(Banner);
