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
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 my-4">
        {categories?.map((el) => (
          <div
            key={el._id}
            className="card-default flex items-center gap-3 border p-3 cursor-pointer min-h-[80px]"
            onClick={() => navigate(`/${el.slug}`)}
          >
            <img
              src={
                el.thumb ||
                "https://cdn-icons-png.flaticon.com/512/3062/3062634.png"
              }
              alt="category"
              className="w-[50px] h-[50px] object-contain"
            />
            <span className="text-sm font-medium capitalize">
              {el.productCategoryName}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default withBaseComponent(memo(CategoryList));
