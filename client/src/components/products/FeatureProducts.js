import React, { useState, useEffect, memo } from "react";
import { ProductCard } from "components";
import { apiGetAllProductCategories, apiGetProductVariations } from "apis";

const FeatureProducts = ({
  title = "SẢN PHẨM",
  sort = "",
  query = {},
  categorySlug = "",
  limit = 4,
}) => {
  const [products, setProducts] = useState([]);

  const fetchProducts = async () => {
    try {
      let finalQuery = { ...query };

      // Nếu có categorySlug thì tìm categoryId tương ứng
      if (categorySlug) {
        const catRes = await apiGetAllProductCategories();
        if (catRes.success) {
          const matched = catRes.prodCategories.find(
            (cat) => cat.slug === categorySlug
          );
          if (matched) {
            finalQuery.categoryId = matched._id;
          } else {
            // Nếu không tìm thấy slug, vẫn lấy tất cả
            console.warn("Không tìm thấy category với slug:", categorySlug);
          }
        }
      }
      if ("q" in finalQuery) {
        delete finalQuery.q;
      }

      console.log("Nhan gia tri dau vao cua feater", finalQuery, sort);
      const res = await apiGetProductVariations({
        limit: 50,
        ...finalQuery,
        sort,
      });

      if (res.success) {
        const filtered = res.variations.filter((item) => item.productId);

        // Lấy duy nhất 1 biến thể cho mỗi productId
        const uniqueProductsMap = new Map();
        for (let item of filtered) {
          const pid = item.productId._id;
          if (!uniqueProductsMap.has(pid)) {
            uniqueProductsMap.set(pid, item);
          }
        }

        const productList = [...uniqueProductsMap.values()];
        setProducts(productList.slice(0, limit));
      }
    } catch (error) {
      console.error("Lỗi khi fetch sản phẩm nổi bật:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [JSON.stringify(query), sort, categorySlug]);

  return (
    <div className="w-full">
      <h3 className="text-[20px] font-semibold py-[15px]">{title}</h3>
      <div className="flex justify-start gap-4 flex-wrap">
        {products.map((el) => (
          <ProductCard
            key={el._id}
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
        ))}
      </div>
    </div>
  );
};

export default memo(FeatureProducts);
