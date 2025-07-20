import React, { useEffect, useState } from "react";
import {
  useParams,
  useSearchParams,
  createSearchParams,
} from "react-router-dom";
import {
  Breadcrumb,
  ProductCard,
  ReusableBanner,
  Pagination,
  SelectableList,
} from "../../components";
import {
  apiGetProductVariations,
  apiGetAllProductCategories,
  apiGetBrands,
} from "../../apis";
import { sorts, priceRanges } from "../../ultils/contants";

const Products = () => {
  const [params, setSearchParams] = useSearchParams();
  const { category } = useParams(); // slug danh mục từ URL
  const [categoryId, setCategoryId] = useState(null);
  const [categoryName, setCategoryName] = useState("");
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [products, setProducts] = useState([]);

  const banner1 = [
    require("assets/banner-iphone.webp"),
    require("assets/banner-apple.webp"),
  ];
  const banner2 = [
    require("assets/banner-samsung.webp"),
    require("assets/banner-combo.webp"),
    require("assets/banner-laptop.webp"),
    require("assets/banner-dongho.webp"),
  ];

  // Lấy danh sách danh mục và brand
  useEffect(() => {
    const fetchInitial = async () => {
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
          setCategoryId(matchedCategory._id);
          setCategoryName(matchedCategory.productCategoryName);
        } else {
          setCategoryId(null); // không có danh mục thì lấy toàn bộ
          setCategoryName("Tất cả sản phẩm");
        }
      }

      if (res2.success) {
        setBrands(res2.brands);
      }
    };

    fetchInitial();
  }, [category]);

  const fetchProducts = async () => {
    const queries = Object.fromEntries([...params.entries()]);
    const queryObject = { ...queries };

    if (categoryId) {
      queryObject.categoryId = categoryId;
    }

    // Chuyển đổi từ `from/to` thành price[gte]/price[lte]
    if (queryObject.from) {
      queryObject["price[gte]"] = queryObject.from;
      delete queryObject.from;
    }
    if (queryObject.to) {
      queryObject["price[lte]"] = queryObject.to;
      delete queryObject.to;
    }

    if (queries.q) {
      queryObject.q = queries.q;
    }

    // Xóa các trường rỗng hoặc không hợp lệ
    Object.keys(queryObject).forEach((key) => {
      if (
        !queryObject[key] ||
        queryObject[key] === "undefined" ||
        queryObject[key] === "null"
      ) {
        delete queryObject[key];
      }
    });

    const res = await apiGetProductVariations(queryObject);

    if (res.success) {
      const filtered = res.variations.filter((item) => item.productId);

      const uniqueProductsMap = new Map();
      for (let item of filtered) {
        const pid = item.productId._id;
        if (!uniqueProductsMap.has(pid)) {
          uniqueProductsMap.set(pid, item);
        }
      }

      setProducts([...uniqueProductsMap.values()]);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchProducts();
      window.scrollTo(0, 0);
    }, 300);

    return () => clearTimeout(timeout);
  }, [params, categoryId]);

  useEffect(() => {
    const q = params.get("q");
    if (q === "") {
      const current = Object.fromEntries([...params.entries()]);
      delete current.q;
      setSearchParams(createSearchParams(current));
    }
  }, [params]);

  return (
    <div className="w-full p-4">
      {/* Header */}
      <div className="xl:w-main m-auto h-[81px] flex justify-start items-center !bg-[#F5F5F7]">
        <div className="xl:w-main w-screen px-4 lg:px-0">
          <Breadcrumb category={categoryName} />
          <h3 className="font-semibold uppercase">{categoryName}</h3>
        </div>
      </div>

      {/* Banner */}
      <div className="xl:w-main m-auto grid grid-cols-1 xl:grid-cols-2 gap-4">
        <ReusableBanner images={banner1} aspectRatio="3/1" delay={2500} />
        <ReusableBanner images={banner2} aspectRatio="3/1" delay={4000} />
      </div>

      {/* Bộ lọc */}
      <div className="xl:w-main p-4 xl:mx-2border flex flex-col xl:flex-row gap-4 xl:justify-between mt-4 rounded-xl bg-white  m-auto ">
        <div className="w-4/5 flex-auto flex flex-wrap gap-4">
          {/* Lọc giá */}
          <SelectableList
            title="Giá"
            items={priceRanges}
            selectedId={
              params.get("from") && params.get("to")
                ? `${params.get("from")}-${params.get("to")}`
                : ""
            }
            onSelect={(value) => {
              setSearchParams((prevParams) => {
                const current = Object.fromEntries([...prevParams.entries()]);
                delete current.from;
                delete current.to;

                if (value) {
                  const [from, to] = value.split("-");
                  return createSearchParams({
                    ...current,
                    from,
                    to,
                  });
                } else {
                  return createSearchParams(current);
                }
              });
            }}
            labelField="text"
            valueField="value"
          />

          {/* Lọc danh mục */}
          <SelectableList
            title="Danh mục"
            items={categories}
            selectedId={params.get("categoryId") || ""}
            onSelect={(id) => {
              setSearchParams((prevParams) => {
                const current = Object.fromEntries([...prevParams.entries()]);
                return createSearchParams({ ...current, categoryId: id });
              });
            }}
          />

          {/* Lọc brand */}
          <SelectableList
            title="Thương hiệu"
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

        {/* Sắp xếp */}
        <SelectableList
          title="Sắp xếp"
          items={sorts}
          selectedId={params.get("sort") || ""}
          onSelect={(value) => {
            setSearchParams((prevParams) => {
              const current = Object.fromEntries([...prevParams.entries()]);
              if (!value) delete current.sort;
              else current.sort = value;
              return createSearchParams(current);
            });
          }}
          labelField="text"
          valueField="value"
        />
      </div>

      {/* Danh sách sản phẩm */}
      <div className="md:w-main m-auto my-4 gap-4 flex flex-wrap">
        {products.map((el) => (
          <div className="mr-6" key={el._id}>
            <ProductCard
              pid={el.productId._id}
              pvid={el._id}
              price={el.price}
              thumb={el.productId.thumb || el.images?.[0]}
              slug={el.productId.slug}
              slugCategory={el.productId.categoryId?.slug}
              productName={el.productId.productName}
              rating={el.productId.rating || 0}
              totalSold={el.productId.totalSold || 0}
            />
          </div>
        ))}
      </div>

      {/* Phân trang */}
      <div className="w-main m-auto my-4 flex justify-end">
        <Pagination totalCount={products?.length || 0} />
      </div>

      <div className="w-full h-[100px]" />
    </div>
  );
};

export default Products;
