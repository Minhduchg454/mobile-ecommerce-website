import React, { useEffect, useState } from "react";
import { apiGetProducts } from "../../services/catalog.api";
import { apiRecommendations } from "../../services/recommendations.api";
import { ProductCard } from "../../components";
import { useSelector } from "react-redux";

export const RecommendMlList = () => {
  const [products, setProducts] = useState([]);
  const { current } = useSelector((state) => state.user);
  const limit = 10;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      let finalProducts = [];

      try {
        if (current?._id) {
          // 1. GỌI API GỢI Ý ML TRƯỚC
          const resMl = await apiRecommendations(current._id, limit * 2);

          if (resMl?.success && resMl?.products?.length > 0) {
            finalProducts = resMl.products;

            // 2. NẾU KHÔNG ĐỦ LIMIT → BỔ SUNG BẰNG SẢN PHẨM BÁN CHẠY
            if (finalProducts.length < limit) {
              console.log(
                `ML chỉ trả về ${finalProducts.length}, đang bổ sung...`
              );

              const need = limit - finalProducts.length;
              const mlPvIds = finalProducts
                .map((p) => p.variationId || p._id)
                .filter(Boolean);

              const resFallback = await apiGetProducts({
                sortKey: "rating",
                sortDir: "desc",
                limit: need + 10,
                viewer: "public",
              });

              if (resFallback?.success && resFallback?.products?.length > 0) {
                const fallbackProducts = resFallback.products
                  .filter((p) => !mlPvIds.includes(p.variationId || p._id))
                  .slice(0, need);

                finalProducts = [...finalProducts, ...fallbackProducts];
              }
            }
          } else {
            throw new Error("ML rỗng");
          }
        } else {
          throw new Error("Chưa đăng nhập");
        }
      } catch (error) {
        console.log("Dùng fallback hoàn toàn:", error.message);
        try {
          const res = await apiGetProducts({
            sortKey: "rating",
            sortDir: "desc",
            limit,
            viewer: "public",
          });
          if (res?.success) {
            finalProducts = res.products.slice(0, limit);
          }
        } catch (e) {
          console.error("Lỗi fallback:", e);
        }
      }

      // Đảm bảo luôn có đủ limit (nếu DB còn hàng)
      if (finalProducts.length < limit) {
        console.log(
          `Vẫn thiếu, chỉ có ${finalProducts.length}/${limit} → hiển thị tạm`
        );
      }
      setProducts(finalProducts.slice(0, limit)); // Chỉ lấy đúng limit
      setLoading(false);
    })();
  }, [current?._id]);

  if (loading) {
    return (
      <div className="first:pl-2 first:md:pl-28 flex gap-4 md:mx-4 overflow-x-auto py-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="w-[140px] md:w-[180px] h-[220px] rounded-xl bg-gray-200/70 animate-pulse flex-shrink-0"
          />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Chưa có gợi ý phù hợp cho bạn
      </div>
    );
  }

  return (
    <div className="w-full py-2 md:py-4">
      <div className="p-1 rounded-2xl rainbow-border md:mx-28 mx-2">
        <div className="rounded-2xl bg-white/60 backdrop-blur-sm p-3 md:p-6 shadow-md">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 auto-rows-fr">
            {products.map((p, index) => (
              <div key={p._id || index} className="flex justify-center">
                <ProductCard
                  totalSold={p.productSoldCount}
                  productMinOriginalPrice={p.productMinOriginalPrice}
                  productMinPrice={p.productMinPrice}
                  variationId={p.variationId || p._id}
                  rating={p.productRateAvg}
                  productName={p.productName}
                  thumb={p.productThumb}
                  slugCategory={p.categoryId?.categorySlug}
                  slug={p.productSlug}
                  shopId={p.shopId?._id}
                  shopName={p.shopId?.shopName}
                  shopSlug={p.shopId?.shopSlug}
                  shopLogo={p.shopId?.shopLogo}
                  shopOfficial={p.shopId?.shopIsOfficial}
                  productIsOnSale={p.productIsOnSale}
                  productDiscountPercent={p.productDiscountPercent}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
