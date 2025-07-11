// ColorSlider.js
import React from "react";
import Slider from "react-slick";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const colors = [
  "#FF6B6B",
  "#6BCB77",
  "#4D96FF",
  "#FFD93D",
  "#FF6F91",
  "#6A4C93",
  "#20C997",
  "#FF9F1C",
  "#1982C4",
  "#8D99AE",
];

// Nút điều hướng trái
const CustomPrevArrow = ({ onClick }) => (
  <button
    onClick={onClick}
    className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white bg-opacity-70 hover:bg-opacity-100 rounded-full shadow flex items-center justify-center"
  >
    <FaChevronLeft className="text-gray-700 text-base" />
  </button>
);

// Nút điều hướng phải
const CustomNextArrow = ({ onClick }) => (
  <button
    onClick={onClick}
    className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white bg-opacity-70 hover:bg-opacity-100 rounded-full shadow flex items-center justify-center"
  >
    <FaChevronRight className="text-gray-700 text-base" />
  </button>
);

const ColorSlider = () => {
  const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    swipe: true,
    swipeToSlide: true,
    touchMove: true,
    nextArrow: <CustomNextArrow />,
    prevArrow: <CustomPrevArrow />,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-10 relative">
      <Slider {...settings}>
        {colors.map((color, idx) => (
          <div key={idx} className="px-2">
            <div
              className="w-full h-40 rounded-lg shadow-md"
              style={{ backgroundColor: color }}
            />
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default ColorSlider;
