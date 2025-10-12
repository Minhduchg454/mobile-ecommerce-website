import React, { useEffect, useState } from "react";
import { apiGetProducts } from "../../services/catalog.api";
import { ProductCard1, HorizontalScroller } from "../../components";

export const RecommentList = ({ brandId, excludeProductId }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await apiGetProducts({
          brandId,
          limit: 10,
          excludeIds: excludeProductId,
        });
        if (res.success) {
          setProducts(res.products || []);
        } else {
          setProducts([]);
        }
      } catch (e) {
        console.log("Lỗi khi tải sản phẩm gợi ý", e);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [brandId, excludeProductId]);

  return (
    <div className="w-full">
      {loading ? (
        <div className="flex gap-2 mx-2 md:mx-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="w-[250px] h-[350px] rounded-xl bg-gray-200/70 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <HorizontalScroller
          isLeft={false}
          items={products}
          keyExtractor={(p) => p._id}
          renderItem={(p) => (
            <ProductCard1
              totalSold={p.productSoldCount}
              productMinOriginalPrice={p.productMinOriginalPrice}
              productMinPrice={p.productMinPrice}
              variationId={p.variationId}
              rating={p.productRateAvg}
              productName={p.productName}
              thumb={p.productThumb}
              slugCategory={p.categoryId?.categorySlug}
              slug={p.productSlug}
              shopId={p.shopId?._id}
              shopName={p.shopId?.shopName}
              shopSlug={p.shopId?.shopSlug}
              shopLogo={p.shopId?.shopLogo}
              shopOfficial={p.shopId?.shopOfficial}
              productIsOnSale={p.productIsOnSale}
              productDiscountPercent={p.productDiscountPercent}
            />
          )}
        />
      )}
    </div>
  );
};
