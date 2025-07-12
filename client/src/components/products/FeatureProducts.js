import React, { useState, useEffect, memo } from "react";
import { ProductCard } from "components";
import { apiGetProductVariations } from "apis";

const FeatureProducts = ({
  title = "SẢN PHẨM",
  sort = "",
  query = {},
  categorySlug = "", // ✅ Dùng slug truyền vào
  limit = 4,
}) => {
  const [products, setProducts] = useState([]);

  const fetchProducts = async () => {
    try {
      let finalQuery = { ...query };

      if ("q" in finalQuery) {
        delete finalQuery.q;
      }

      const res = await apiGetProductVariations({
        limit: 50,
        ...finalQuery,
        sort,
      });

      if (res.success) {
        let variations = res.variations.filter((v) => v.productId);

        // ✅ Lọc theo categorySlug nếu có
        if (categorySlug) {
          variations = variations.filter(
            (v) => v.productId?.categoryId?.slug === categorySlug
          );
        }

        // ✅ Giữ lại 1 biến thể duy nhất cho mỗi productId
        const uniqueMap = new Map();
        for (let v of variations) {
          const pid = v.productId._id;
          if (!uniqueMap.has(pid)) {
            uniqueMap.set(pid, v);
          }
        }

        setProducts([...uniqueMap.values()].slice(0, limit));
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
      <div className="flex justify-start gap-4 flex-wrap py-2">
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
