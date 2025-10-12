import React, { useEffect, useState } from "react";
import { apiGetShops } from "../../services/catalog.api";
import { HorizontalScroller, ShopCard } from "../../components";

export const ShopList = () => {
  const [shops, setShops] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        // nếu backend hỗ trợ sort theo bán nhiều nhất
        const res = await apiGetShops({
          sort: "-shopProductCount",
          limit: 10,
        });
        if (res?.success) setShops(res.shops || []);
        else setErr(res?.message || "Không thể tải dữ liệu");
      } catch (e) {
        setErr(e?.message || "Có lỗi xảy ra");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex gap-2 mx-2 md:mx-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="w-[260px] md:w-[300px] h-[250px] rounded-xl bg-gray-200/70 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (err) {
    return (
      <div className="py-2 text-sm text-red-600 ml-2  md:ml-28">{err}</div>
    );
  }

  return (
    <div className="w-full">
      <HorizontalScroller
        items={shops}
        keyExtractor={(s) => s._id}
        // edgePadding cho đẹp; card đầu sát mép có thể dùng first:ml-* trong ShopCard wrapper nếu muốn
        contentClassName="pb-2"
        renderItem={(s) => (
          <ShopCard
            shopSlug={s.shopSlug}
            shopName={s.shopName}
            shopLogo={s.shopLogo}
            shopDescription={s.shopDescription}
            shopCreateAt={s.shopCreateAt || s.createdAt}
            shopColor={s.shopColor}
            shopRateAvg={s.shopRateAvg}
            shopSoldCount={s.shopSoldCount}
            shopProductCount={s.shopProductCount}
            shopBackground={s.shopBackground}
            shopId={s._id}
          />
        )}
      />
    </div>
  );
};
