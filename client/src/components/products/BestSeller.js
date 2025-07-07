import React, { useState, useEffect, memo } from "react";
import { apiGetProducts } from "apis/product";
import { CustomSlider } from "components";
import { getNewProducts } from "store/products/asynsActions";
import { useDispatch, useSelector } from "react-redux";
import clsx from "clsx";

const tabs = [
  { id: 1, name: "BÁN CHẠY NHẤT" },
  { id: 2, name: "THIẾT BỊ MỚI NHẤT" },
];

const BestSeller = () => {
  const [bestSellers, setBestSellers] = useState(null);
  const [activedTab, setActivedTab] = useState(1);
  const [products, setProducts] = useState(null);
  const dispatch = useDispatch();
  const { newProducts } = useSelector((state) => state.products);
  const { isShowModal } = useSelector((state) => state.app);

  const fetchProducts = async () => {
    const response = await apiGetProducts({ sort: "-totalSold" });
    if (response.success) {
      setBestSellers(response.products);
      setProducts(response.products);
    }
  };

  useEffect(() => {
    fetchProducts();
    dispatch(getNewProducts());
  }, []);

  useEffect(() => {
    if (activedTab === 1) setProducts(bestSellers);
    if (activedTab === 2) setProducts(newProducts);
  }, [activedTab]);
  return (
    <div className={clsx(isShowModal ? "hidden" : "")}>
      <div className="flex text-[20px] ml-[-32px]">
        {tabs.map((el) => (
          <span
            key={el.id}
            className={`font-semibold text-center md:text-start uppercase px-8 border-r cursor-pointer text-gray-400 ${
              activedTab === el.id ? "text-gray-900" : ""
            }`}
            onClick={() => setActivedTab(el.id)}
          >
            {el.name}
          </span>
        ))}
      </div>
      <div className="mt-4 hidden md:block mx-[-10px] border-t-2 border-main pt-4">
        <CustomSlider products={products} activedTab={activedTab} />
      </div>
      <div className="mt-4 md:hidden block mx-[-10px] border-t-2 border-main pt-4">
        <CustomSlider
          products={products}
          slidesToShow={1}
          activedTab={activedTab}
        />
      </div>
    </div>
  );
};

export default memo(BestSeller);
