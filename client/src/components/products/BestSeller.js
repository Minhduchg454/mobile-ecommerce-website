import React, { useState, useEffect, memo } from "react";
import { apiGetProductVariations, apiGetProducts } from "apis";
import { CustomSlider1, ProductCard } from "components";
import clsx from "clsx";
import { useSelector } from "react-redux";

const tabs = [
  { id: 1, name: "Bán chạy nhất" },
  { id: 2, name: "Thiết bị mới nhất" },
];

const BestSeller = () => {
  const [bestSellers, setBestSellers] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [activedTab, setActivedTab] = useState(1);
  const { isShowModal } = useSelector((state) => state.app);

  const fetchProductByVariations = async () => {
    try {
      // Gọi song song 2 API
      const [resVariations, resProducts] = await Promise.all([
        apiGetProductVariations(),
        apiGetProducts(),
      ]);

      if (!resVariations.success || !resProducts.success) return;

      const variations = resVariations.variations.filter(
        (v) => v.productId && v.productId._id
      );

      // Tạo map sản phẩm đầy đủ (để lấy slug & category slug)
      const allProductsMap = new Map(
        resProducts.products.map((p) => [p._id, p])
      );

      // Gom các biến thể theo productId
      const productMap = new Map();
      variations.forEach((v) => {
        const pid = v.productId._id;
        if (!productMap.has(pid)) {
          productMap.set(pid, {
            product: v.productId,
            variations: [],
          });
        }
        productMap.get(pid).variations.push(v);
      });

      // Trong phần bestSellersList
      const bestSellersList = Array.from(productMap.values())
        .map(({ product, variations }) => {
          const latest = variations.reduce((a, b) =>
            new Date(a.updatedAt) > new Date(b.updatedAt) ? a : b
          );

          const fullProduct = allProductsMap.get(product._id);
          return {
            ...product,
            pvid: latest._id,
            price: latest.price,
            slug: fullProduct?.slug,
            categorySlug: fullProduct?.categoryId?.slug,
            thumb: fullProduct?.thumb,
            rating: fullProduct?.rating,
            totalSold: fullProduct?.totalSold,
          };
        })
        .sort((a, b) => b.totalSold - a.totalSold);

      // Mới nhất
      const newestList = variations
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .filter(
          (v, i, arr) =>
            arr.findIndex((el) => el.productId._id === v.productId._id) === i
        )
        .map((v) => {
          const fullProduct = allProductsMap.get(v.productId._id);
          return {
            ...v.productId,
            pvid: v._id,
            price: v.price,
            slug: fullProduct?.slug,
            categorySlug: fullProduct?.categoryId?.slug,
            thumb: fullProduct?.thumb,
            rating: fullProduct?.rating,
            totalSold: fullProduct?.totalSold,
          };
        });

      setBestSellers(bestSellersList);
      setNewProducts(newestList);
      setProducts(bestSellersList); // Tab mặc định
    } catch (error) {
      console.error("❌ Lỗi khi xử lý biến thể:", error);
    }
  };

  useEffect(() => {
    fetchProductByVariations();
  }, []);

  useEffect(() => {
    if (activedTab === 1) setProducts(bestSellers);
    else if (activedTab === 2) setProducts(newProducts);
  }, [activedTab, bestSellers, newProducts]);

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
              slugCategory={el.categorySlug}
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
