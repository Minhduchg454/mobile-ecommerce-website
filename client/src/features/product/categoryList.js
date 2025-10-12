import React, { useState, useEffect } from "react";
import { apiGetProductCategories } from "../../services/catalog.api";
import { useNavigate } from "react-router-dom";
import path from "../../ultils/path";

export const CategoryList = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await apiGetProductCategories();
      if (response.success) {
        setCategories(response.categories);
      } else {
        console.log("Có lỗi xảy ra khi lấy danh mục:", response);
        setCategories([]);
      }
    } catch (err) {
      console.error("Lỗi API:", err);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="mx-2 md:mx-28">
      <div className="w-full flex flex-wrap items-center justify-center border rounded-3xl bg-white/80 backdrop-blur-sm text-center shadow-md p-2">
        {loading ? (
          // 🔹 Hiệu ứng loading (skeleton)
          Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col items-center p-2 cursor-pointer text-center"
            >
              <div className="w-[50px] h-[50px] sm:w-[80px] sm:h-[80px] md:w-[100px] md:h-[100px] rounded-xl bg-gray-200/70 animate-pulse"></div>
              <div className="h-3 w-16 sm:w-20 md:w-24 bg-gray-200/70 rounded-full mt-2 animate-pulse"></div>
            </div>
          ))
        ) : categories.length > 0 ? (
          categories.map((el) => (
            <div
              key={el._id}
              className="flex flex-col items-center p-2 cursor-pointer text-center transition transform hover:scale-105 duration-300"
              onClick={() =>
                navigate(`/${path.PRODUCTS}?category=${el.categorySlug}`)
              }
            >
              <img
                src={
                  el.categoryThumb ||
                  "https://cdn-icons-png.flaticon.com/512/3062/3062634.png"
                }
                alt={el.categoryName}
                className="w-[50px] h-[50px] sm:w-[80px] sm:h-[80px] md:w-[100px] md:h-[100px] rounded-xl object-contain transition-transform duration-300"
              />
              <span className="text-xs sm:text-sm md:text-base font-medium capitalize break-words mt-1">
                {el.categoryName}
              </span>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-sm italic py-4">
            Không có danh mục nào.
          </p>
        )}
      </div>
    </div>
  );
};
