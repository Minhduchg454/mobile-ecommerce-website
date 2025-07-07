import React, { useState, useEffect, memo } from "react";
import { apiGetAllProductCategories } from "apis";
import withBaseComponent from "hocs/withBaseComponent";
import { IoIosArrowForward } from "react-icons/io";

const CategoryList = ({ navigate }) => {
  const [categories, setCategories] = useState(null);

  const fetchCategories = async () => {
    const response = await apiGetAllProductCategories();
    if (response.success) setCategories(response.prodCategories);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="w-full bg-white">
      {/* Container cha giúp giới hạn chiều rộng và căn giữa */}
      <div className="max-w-screen-xl mx-auto px-4">
        <h3 className="text-xl font-semibold mb-4">Danh mục sản phẩm</h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories?.map((el) => (
            <div
              key={el._id}
              className="flex flex-col items-center p-3 cursor-pointer min-h-[120px] text-center"
              onClick={() => navigate(`/${el.slug}`)}
            >
              <img
                src={
                  el.thumb ||
                  "https://cdn-icons-png.flaticon.com/512/3062/3062634.png"
                }
                alt="category"
                className="w-[60px] h-[60px] object-contain mb-2"
              />
              <span className="text-sm font-medium capitalize break-words">
                {el.productCategoryName}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default withBaseComponent(memo(CategoryList));
