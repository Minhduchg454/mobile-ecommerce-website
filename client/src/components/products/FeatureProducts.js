import React, { useState, useEffect, memo } from "react";
import { ProductCard } from "components";
import { apiGetProducts, apiGetVariationsByProductId } from "apis";

const FeatureProducts = ({ title = "SẢN PHẨM", query = {} }) => {
  const [productsWithVariants, setProductsWithVariants] = useState([]);

  const fetchProducts = async () => {
    try {
      const response = await apiGetProducts({
        limit: 4,
        ...query,
      });

      if (response.success && response.products.length > 0) {
        const enrichedProducts = await Promise.all(
          response.products.map(async (product) => {
            const variationRes = await apiGetVariationsByProductId(product._id);
            const firstVariant = variationRes.success
              ? variationRes.variations?.[0]
              : null;

            return {
              pid: product._id,
              pvid: firstVariant?._id,
              price: firstVariant?.price || 0,
              thumb: firstVariant?.images?.[0] || product.thumb,
              slug: product.slug,
              slugCategory: product.categoryId?.slug,
              rating: product.rating,
              productName: product.productName,
              totalSold: firstVariant?.sold || 0,
            };
          })
        );

        setProductsWithVariants(enrichedProducts);
      }
    } catch (err) {
      console.error("❌ Lỗi lấy sản phẩm và biến thể:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [JSON.stringify(query)]);

  return (
    <div className="w-full">
      <h3 className="text-[20px] font-semibold py-[15px]">{title}</h3>
      <div className="flex justify-start gap-4 flex-wrap">
        {productsWithVariants.map((el) => (
          <ProductCard key={el.pvid || el.pid} {...el} />
        ))}
      </div>
    </div>
  );
};

export default memo(FeatureProducts);
