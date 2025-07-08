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
    <div className="w-full">
      <div className="flex flex-wrap gap-6 my-4">
        {categories?.map((el) => (
          <div
            key={el._id}
            className="flex flex-col items-center p-2 cursor-pointer min-h-[120px] text-center"
            onClick={() => navigate(`/${el.slug}`)}
          >
            <img
              src={
                el.thumb ||
                "https://cdn-icons-png.flaticon.com/512/3062/3062634.png"
              }
              alt="category"
              className="w-[100px] h-[80px] object-contain mb-2"
            />
            <span className="text-sm font-medium capitalize break-words">
              {el.productCategoryName}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default withBaseComponent(memo(CategoryList));
