import React, { useEffect, useState } from "react";
import { apiGetProducts } from "../../services/catalog.api";
import { ProductCard1, HorizontalScroller } from "../../components";

export const SaleHomePage = () => {
  const [products, setProducts] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiGetProducts({
          hasSale: "true",
          sortKey: "discount",
          sortDir: "desc",
          limit: 10,
        });
        if (res?.success) setProducts(res.products || []);
        else setErr(res?.message || "Không thể tải dữ liệu");
      } catch (e) {
        setErr(e?.message || "Có lỗi xảy ra");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (err) {
    return (
      <div className="py-2 text-sm text-red-600 ml-2  md:ml-28">{err}</div>
    );
  }

  return (
    <div className="w-full">
      {loading || products.length === 0 ? (
        <div className="first:pl-2 first:md:pl-28 flex gap-4 md:mx-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="w-[100px] h-[150px] rounded-xl bg-gray-200/70 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <HorizontalScroller
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
