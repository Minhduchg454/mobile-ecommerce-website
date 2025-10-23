import React, { useEffect, useState } from "react";
import { apiGetProducts } from "../../services/catalog.api";
import { ProductCard1, HorizontalScroller } from "../../components";

export const RecommendMlList = () => {
  const [products, setProducts] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiGetProducts({
          sortKey: "createdAt",
          sortDir: "desc",
          limit: 10,
        });
        if (res?.success) setProducts(res.products || []);
        else setErr(res?.message || "Không thể tải chủ đề");
      } catch (e) {
        setErr(e?.message || "Có lỗi xảy ra");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="w-full py-2 md:py-4">
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
        <div className="p-1 rounded-2xl rainbow-border md:mx-28 mx-2">
          <div className="rounded-2xl bg-white/60 backdrop-blur-sm p-3 md:p-6 shadow-md flex flex-wrap justify-start items-center gap-5 md:gap-6">
            {products.map((p, _id) => (
              <div key={_id}>
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
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
