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
import { sorts, priceRanges } from "../../ultils/contants";
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
    const queries = Object.fromEntries([...params.entries()]);

    // Clone để không thay đổi trực tiếp object từ URL
    const queryObject = { ...queries };

    // Tạo lại cấu trúc minPrice.gte và minPrice.lte đúng chuẩn cho backend
    if (queries.from || queries.to) {
      if (queries.from) {
        queryObject["minPrice.gte"] = queries.from;
      }
      if (queries.to) {
        queryObject["minPrice.lte"] = queries.to;
      }
      delete queryObject.from;
      delete queryObject.to;
    }

    fetchProductsByCategory(queryObject);
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
      const currentParams = Object.fromEntries([...params.entries()]);
      navigate({
        pathname: `/${category}`,
        search: createSearchParams({ ...currentParams, sort }).toString(),
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
          <SelectableList
            title={"Giá"}
            items={priceRanges}
            selectedId={
              params.get("minPrice.gte") && params.get("minPrice.lte")
                ? `${params.get("minPrice.gte")}-${params.get("minPrice.lte")}`
                : ""
            }
            onSelect={(value) => {
              setSearchParams((prevParams) => {
                const current = Object.fromEntries([...prevParams.entries()]);

                // Xóa các giá trị cũ
                delete current["minPrice.gte"];
                delete current["minPrice.lte"];
                delete current.from;
                delete current.to;

                if (value) {
                  const [from, to] = value.split("-");
                  return createSearchParams({
                    ...current,
                    "minPrice.gte": from,
                    "minPrice.lte": to,
                  });
                } else {
                  return createSearchParams(current);
                }
              });
            }}
            labelField="text"
            valueField="value"
          />

          {/* Danh mục */}
          <SelectableList
            title={"danh mục"}
            items={categories}
            selectedId={params.get("categoryId") || ""}
            onSelect={(id) => {
              setSearchParams((prevParams) => {
                const current = Object.fromEntries([...prevParams.entries()]);
                return createSearchParams({ ...current, categoryId: id });
              });
            }}
          />

          {/* Thuong hieu */}
          <SelectableList
            title={"thương hiệu"}
            items={brands}
            selectedId={params.get("brandId") || ""}
            onSelect={(id) => {
              setSearchParams((prevParams) => {
                const current = Object.fromEntries([...prevParams.entries()]);
                return createSearchParams({ ...current, brandId: id });
              });
            }}
            labelField="brandName"
            valueField="_id"
          />
        </div>
        <div className="w-1/5 flex flex-col gap-3">
          <SelectableList
            title={"sắp xếp"}
            items={sorts}
            selectedId={sort}
            onSelect={(value) => setSort(value)}
            labelField="text"
            valueField="value"
          />
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
