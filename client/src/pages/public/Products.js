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
  ProductCard,
  ReusableBanner,
} from "../../components";
import {
  apiGetProducts,
  apiGetCategoryIdByName,
  apiGetAllProductCategories,
  apiGetBrands,
  apiGetVariationsByProductId,
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
  const [productsWithVariants, setProductsWithVariants] = useState([]);
  const [activeClick, setActiveClick] = useState(null);
  const [params, setSearchParams] = useSearchParams();
  const [sort, setSort] = useState("");
  const { category } = useParams();

  const [categoryName, setCategoryName] = useState("");
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  const banner1 = [
    require("assets/banner-iphone.webp"),
    require("assets/banner-apple.webp"),
  ];

  const banner2 = [
    require("assets/banner-samsung.webp"),
    require("assets/banner-combo.webp"),
  ];

  useEffect(() => {
    const fetchData = async () => {
      const [res1, res2] = await Promise.all([
        apiGetAllProductCategories(),
        apiGetBrands(),
      ]);

      if (res1.success) {
        setCategories(res1.prodCategories);
        const matchedCategory = res1.prodCategories.find(
          (item) => item.slug === category
        );
        if (matchedCategory) {
          setCategoryName(matchedCategory.productCategoryName);
        }
      }
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
    if (response.success) {
      setProducts(response);

      // 🔁 Bổ sung gọi biến thể cho từng sản phẩm
      const enrichedProducts = await Promise.all(
        response.products.map(async (product) => {
          try {
            const variationRes = await apiGetVariationsByProductId(product._id);
            const firstVariant = variationRes.success
              ? variationRes.variations?.[0]
              : null;

            return {
              ...product,
              pvid: firstVariant?._id,
              price: firstVariant?.price || 0,
              thumb: firstVariant?.images?.[0] || product.thumb,
              totalSold: firstVariant?.sold || 0,
            };
          } catch {
            return product;
          }
        })
      );
      setProductsWithVariants(enrichedProducts);
    }
  };

  useEffect(() => {
    const queries = Object.fromEntries([...params.entries()]);
    const queryObject = { ...queries };

    if (queries.from || queries.to) {
      if (queries.from) queryObject["minPrice.gte"] = queries.from;
      if (queries.to) queryObject["minPrice.lte"] = queries.to;
      delete queryObject.from;
      delete queryObject.to;
    }

    fetchProductsByCategory(queryObject);
    window.scrollTo(0, 0);
  }, [params.toString()]);

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
      const currentParams = Object.fromEntries([...params.entries()]);
      navigate({
        pathname: `/${category}`,
        search: createSearchParams({ ...currentParams, sort }).toString(),
      });
    }
  }, [sort]);

  return (
    <div className="w-full">
      <div className="md:w-main m-auto h-[81px] flex justify-start items-center p-2 !bg-white">
        <div className="lg:w-main w-screen px-4 lg:px-0">
          <Breadcrumb category={category} />
          <h3 className="font-semibold uppercase">{categoryName}</h3>
        </div>
      </div>
      <div className="md:w-main p-2  m-auto grid grid-cols-1 md:grid-cols-2 gap-4">
        <ReusableBanner images={banner1} aspectRatio="3/1" />
        <ReusableBanner images={banner2} aspectRatio="3/1" />
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
      <div className="md:w-main m-auto my-4 gap-4 flex flex-wrap">
        {productsWithVariants?.map((el) => (
          <div className="mr-6" key={el._id}>
            <ProductCard
              pid={el._id}
              pvid={el.pvid}
              price={el.price}
              thumb={el.thumb}
              slug={el.slug}
              slugCategory={el.categoryId?.slug}
              productName={el.productName}
              rating={el.rating}
              totalSold={el.totalSold}
            />
          </div>
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
