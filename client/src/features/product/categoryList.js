import React, { useState, useEffect } from "react";
import { apiGetProductCategories } from "../../services/catalog.api";
import { useNavigate } from "react-router-dom";
import { HorizontalScroller } from "../../components";
import path from "../../ultils/path";

export const CategoryList = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await apiGetProductCategories();
        setCategories(res?.success ? res.categories : []);
      } catch (e) {
        console.error(e);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="w-full">
      {loading || categories.length === 0 ? (
        <div className="first:pl-2 first:md:pl-28 flex gap-4 md:mx-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="w-[100px] h-[150px] rounded-xl bg-gray-200/70 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <HorizontalScroller
          items={categories}
          keyExtractor={(c) => c._id}
          renderItem={(c) => (
            <button
              type="button"
              key={c._id}
              className={`flex flex-col items-center p-2 cursor-pointer text-center transition-transform duration-300 hover:scale-105 `}
              onClick={() =>
                navigate(`/${path.PRODUCTS}?category=${c.categorySlug}`)
              }
            >
              <img
                src={
                  c.categoryThumb ||
                  "https://cdn-icons-png.flaticon.com/512/3062/3062634.png"
                }
                alt={c.categoryName}
                className="w-[70px] h-[70px] lg:w-[90px] lg:h-[90px] rounded-xl object-contain"
              />
              <span className="text-xs md:text-sm lg:text-base font-medium capitalize break-words mt-1 line-clamp-2">
                {c.categoryName}
              </span>
            </button>
          )}
        />
      )}
    </div>
  );
};
