import React, { useState, useEffect, memo } from "react";
import { apiGetProducts } from "apis";
import { CustomSlider1, ProductCard } from "components";
import clsx from "clsx";
import { useSelector } from "react-redux";

const tabs = [
  { id: 1, name: "Bán chạy nhất", sort: "-totalSold" },
  { id: 2, name: "Thiết bị mới nhất", sort: "newest" },
];

const BestSeller = () => {
  const [products, setProducts] = useState([]);
  const [activedTab, setActivedTab] = useState(1);
  const { isShowModal } = useSelector((state) => state.app);

  const fetchProducts = async (sort) => {
    try {
      const res = await apiGetProducts({ sort, limit: 20 });

      if (!res.success) return;

      const productsData = res.products.map((p) => {
        const variations = Array.isArray(p.variations) ? p.variations : [];

        const cheapestVariation =
          variations.length > 0
            ? variations.reduce((prev, curr) =>
                curr.price < prev.price ? curr : prev
              )
            : null;

        return {
          ...p,
          pvid: cheapestVariation?._id,
          price: cheapestVariation?.price || p.minPrice,
        };
      });
      setProducts(productsData);
    } catch (error) {
      console.error("❌ Lỗi khi lấy sản phẩm:", error);
    }
  };

  useEffect(() => {
    const currentTab = tabs.find((tab) => tab.id === activedTab);
    if (currentTab) fetchProducts(currentTab.sort);
  }, [activedTab]);

  return (
    <div className={clsx(isShowModal ? "hidden" : "")}>
      <div className="flex text-[20px] ml-[-32px]">
        {tabs.map((el) => (
          <span
            key={el.id}
            className={`font-semibold text-center md:text-start px-8 border-r cursor-pointer text-gray-400 ${
              activedTab === el.id ? "text-gray-900" : ""
            }`}
            onClick={() => setActivedTab(el.id)}
          >
            {el.name}
          </span>
        ))}
      </div>

      <div className="mx-[-10px] border-t-2 border-gray-300 pt-3">
        <CustomSlider1
          items={products}
          itemWidth={250}
          renderItem={(el) => (
            <ProductCard
              pid={el._id}
              pvid={el.pvid}
              price={el.price}
              thumb={el.thumb}
              slug={el.slug}
              slugCategory={el.categoryId?.slug}
              rating={el.rating}
              productName={el.productName}
              totalSold={el.totalSold}
            />
          )}
        />
      </div>
    </div>
  );
};

export default memo(BestSeller);
