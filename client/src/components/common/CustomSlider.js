import React, { memo } from "react";
import Slider from "react-slick";
import { ProductCard } from "components";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

// Nút điều hướng trước
const CustomPrevArrow = ({ onClick }) => (
  <button
    onClick={onClick}
    className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white bg-opacity-70 hover:bg-opacity-100 rounded-full shadow flex items-center justify-center"
  >
    <FaChevronLeft className="text-gray-700 text-lg" />
  </button>
);

// Nút điều hướng sau
const CustomNextArrow = ({ onClick }) => (
  <button
    onClick={onClick}
    className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white bg-opacity-70 hover:bg-opacity-100 rounded-full shadow flex items-center justify-center"
  >
    <FaChevronRight className="text-gray-700 text-lg" />
  </button>
);

// Slider sản phẩm
const CustomSlider = ({ products, activedTab, normal, slidesToShow = 3 }) => {
  const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow,
    slidesToScroll: 1,
    nextArrow: <CustomNextArrow />,
    prevArrow: <CustomPrevArrow />,
  };

  // console.log("CustomSIldedanh sach san pham", products);

  return (
    <>
      {products && (
        <div className="relative mr-[10px]">
          {" "}
          {/* Quan trọng để chứa nút điều hướng */}
          <Slider className="custom-slider" {...settings}>
            {products.map((el) => (
              <div key={el._id} className="px-2 py-2">
                <ProductCard
                  pid={el._id}
                  image={el.thumb}
                  slugCategory={el.categoryId?.slug}
                  {...el}
                />
              </div>
            ))}
          </Slider>
        </div>
      )}
    </>
  );
};

export default memo(CustomSlider);
