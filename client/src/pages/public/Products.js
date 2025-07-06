import React, { useEffect, useState, useCallback } from "react";
import {
  useParams,
  useSearchParams,
  createSearchParams,
  useNavigate,
} from "react-router-dom";
import {
  Breadcrumb,
  Product,
  SearchItem,
  InputSelect,
  Pagination,
} from "../../components";
import { apiGetProducts, apiGetCategoryIdByName } from "../../apis";
import Masonry from "react-masonry-css";
import { sorts } from "../../ultils/contants";

const breakpointColumnsObj = {
  default: 4,
  1100: 3,
  700: 2,
  500: 1,
};

const Products = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState(null);
  const [activeClick, setActiveClick] = useState(null);
  const [params] = useSearchParams();
  const [sort, setSort] = useState("");
  const { category } = useParams();

  const fetchProductsByCategory = async (queries) => {
    if (category && category !== "products") {
      try {
        const response = await apiGetCategoryIdByName(category);
        if (response.success) {
          const categoryId = response.categoryId;
          console.log(categoryId);
          queries.categoryId = categoryId;
        } else {
          queries.categoryId = null; // fallback nếu không có
        }
      } catch (err) {
        console.error("❌ Lỗi khi lấy categoryId từ tên:", err);
      }
    }

    const response = await apiGetProducts(queries);
    if (response.success) setProducts(response);
  };

  useEffect(() => {
    const queries = Object.fromEntries([...params]);
    let priceQuery = {};
    if (queries.to && queries.from) {
      priceQuery = {
        $and: [
          { price: { gte: queries.from } },
          { price: { lte: queries.to } },
        ],
      };
      delete queries.price;
    } else {
      if (queries.from) queries.price = { gte: queries.from };
      if (queries.to) queries.price = { lte: queries.to };
    }

    delete queries.to;
    delete queries.from;
    const q = { ...priceQuery, ...queries };
    fetchProductsByCategory(q);
    window.scrollTo(0, 0);
  }, [params]);
  const changeActiveFitler = useCallback(
    (name) => {
      if (activeClick === name) setActiveClick(null);
      else setActiveClick(name);
    },
    [activeClick]
  );
  const changeValue = useCallback(
    (value) => {
      setSort(value);
    },
    [sort]
  );

  useEffect(() => {
    if (sort) {
      navigate({
        pathname: `/${category}`,
        search: createSearchParams({ sort }).toString(),
      });
    }
  }, [sort]);
  return (
    <div className="w-full">
      <div className="h-[81px] flex justify-center items-center bg-gray-100">
        <div className="lg:w-main w-screen px-4 lg:px-0">
          <h3 className="font-semibold uppercase">{category}</h3>
          <Breadcrumb category={category} />
        </div>
      </div>
      <div className="lg:w-main border p-4 flex lg:pr-4 pr-8 flex-col md:flex-row gap-4 md:justify-between mt-8 m-auto">
        <div className="w-4/5 flex-auto flex flex-col gap-3">
          <span className="font-semibold text-sm">Lọc</span>
          <div className="flex items-center gap-4">
            <SearchItem
              name="Giá"
              activeClick={activeClick}
              changeActiveFitler={changeActiveFitler}
              type="input"
            />
            <SearchItem
              name="Màu"
              activeClick={activeClick}
              changeActiveFitler={changeActiveFitler}
            />
          </div>
        </div>
        <div className="w-1/5 flex flex-col gap-3">
          <span className="font-semibold text-sm">Sắp xếp</span>
          <div className="w-full">
            <InputSelect
              changeValue={changeValue}
              value={sort}
              options={sorts}
            />
          </div>
        </div>
      </div>
      <div className="mt-8 w-main m-auto grid lg:grid-cols-4 md:grid-cols-3 grid-cols-1 gap-4">
        {products?.products?.map((el) => (
          <Product key={el._id} pid={el._id} productData={el} normal={true} />
        ))}
      </div>
      <div className="w-main m-auto my-4 flex justify-end">
        <Pagination totalCount={products?.counts} />
      </div>
      <div className="w-full h-[100px]"></div>
    </div>
  );
};

export default Products;
