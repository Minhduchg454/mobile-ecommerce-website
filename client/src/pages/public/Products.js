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
import {
  apiGetProducts,
  apiGetCategoryIdByName,
  apiGetAllProductCategories,
  apiGetBrands,
} from "../../apis";
import Masonry from "react-masonry-css";
import { sorts } from "../../ultils/contants";
import SelectableList from "../../components/search/SelectableList";

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
  const [params, setSearchParams] = useSearchParams(); //Lay cac truy van tu url /iphone?from=1000&to=5000&sort=-price
  const [sort, setSort] = useState("");
  const { category } = useParams();

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedBrandId, setSelectedBrandId] = useState("");

  //Truy xuat danh muc tat ca danh muc
  useEffect(() => {
    const fetchData = async () => {
      const [res1, res2] = await Promise.all([
        apiGetAllProductCategories(),
        apiGetBrands(),
      ]);

      if (res1.success) setCategories(res1.prodCategories);
      if (res2.success) setBrands(res2.brands);
      console.log(res2.brands);
    };

    fetchData();
  }, []);

  const fetchProductsByCategory = async (queries) => {
    if (category && category !== "products" && !queries.categoryId) {
      try {
        const response = await apiGetCategoryIdByName(category);
        if (response.success) {
          const categoryId = response.categoryId;
          queries.categoryId = categoryId;
        }
      } catch (err) {
        console.error("Lỗi khi lấy categoryId từ tên:", err);
      }
    }

    const response = await apiGetProducts(queries);
    if (response.success) setProducts(response);
  };

  //Goi API moi khi params thay doi
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
  }, [params.toString()]);

  //Bat tat, bo loc, gia mau
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

  //Khi sort thay doi => cap nhat lai url => params doi => goi API lai
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
        <div className="w-4/5 flex-auto flex flex-wrap gap-4">
          {/* Lọc theo giá */}
          <div className="flex flex-col gap-2">
            <span className="font-semibold text-sm">Lọc</span>
            <SearchItem
              name="Giá"
              activeClick={activeClick}
              changeActiveFitler={changeActiveFitler}
              type="input"
            />
          </div>

          {/* Danh mục */}
          <SelectableList
            title="Danh mục"
            items={categories}
            selectedId={params.get("categoryId") || ""}
            onSelect={(id) => {
              setSelectedCategoryId(id);
              setSearchParams((prevParams) => {
                const current = Object.fromEntries([...prevParams.entries()]);
                return createSearchParams({
                  ...current,
                  categoryId: id,
                });
              });
            }}
          />
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
        <Pagination totalCount={products?.total || 0} />
      </div>
      <div className="w-full h-[100px]"></div>
    </div>
  );
};

export default Products;
