// components/ProductExplorer.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ProductCard } from "./ProductCard";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";

export function ProductExplorer({
  // dữ liệu đầu vào/tuỳ biến
  title = "Sản phẩm",
  initialFilters = {}, // { shopId, brandId, categoryId, themeId, hasSale, hasMall, s, sortKey, sortDir }
  fetchProducts, // (query) => Promise<{success, products, total, pageInfo}>
  FilterPanel, // optional: component bộ lọc tuỳ biến (render prop)
  renderHeaderExtra, // optional: phần UI thêm bên phải thanh công cụ
  pageSize = 12,
}) {
  const [filters, setFilters] = useState({
    sortKey: "createdAt",
    sortDir: "desc",
    ...initialFilters,
  });

  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [pageInfo, setPageInfo] = useState({
    hasMore: false,
    nextCursor: null,
  });
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isShowSort, setIsShowSort] = useState(false);

  const sortOptions = [
    { label: "Mới nhất", value: { sortKey: "createdAt", sortDir: "desc" } },
    { label: "Cũ nhất", value: { sortKey: "createdAt", sortDir: "asc" } },
    { label: "Bán chạy nhất", value: { sortKey: "sold", sortDir: "desc" } },
    { label: "Giá cao → thấp", value: { sortKey: "price", sortDir: "desc" } },
    { label: "Giá thấp → cao", value: { sortKey: "price", sortDir: "asc" } },
    { label: "Yêu thích nhất", value: { sortKey: "rating", sortDir: "desc" } },
  ];

  const activeSort = useMemo(() => {
    const found = sortOptions.find(
      (o) =>
        o.value.sortKey === filters.sortKey &&
        o.value.sortDir === filters.sortDir
    );
    return found || sortOptions[0];
  }, [filters]);

  const baseQuery = useMemo(
    () => ({ ...filters, limit: pageSize }),
    [filters, pageSize]
  );

  async function loadFirstPage() {
    setLoading(true);
    const res = await fetchProducts(baseQuery);
    if (res?.success) {
      setProducts(res.products || []);
      setTotal(res.total || 0);
      setPageInfo(res.pageInfo || { hasMore: false, nextCursor: null });
    } else {
      setProducts([]);
      setTotal(0);
      setPageInfo({ hasMore: false, nextCursor: null });
    }
    setLoading(false);
  }

  async function loadMore() {
    if (!pageInfo?.hasMore || loadingMore) return;
    setLoadingMore(true);
    const res = await fetchProducts({
      ...baseQuery,
      after: pageInfo.nextCursor,
    });
    if (res?.success) {
      const dedup = (res.products || []).filter(
        (p) => !products.some((e) => e._id === p._id)
      );
      setProducts((prev) => [...prev, ...dedup]);
      setTotal(res.total ?? total);
      setPageInfo(res.pageInfo || { hasMore: false, nextCursor: null });
    }
    setLoadingMore(false);
  }

  useEffect(() => {
    loadFirstPage();
  }, [baseQuery]);

  return (
    <div className="h-[calc(100vh-82px)] m-2 md:m-4 grid grid-cols-12 gap-4">
      {/* Panel trái: truyền component tuỳ biến hoặc ẩn nếu không cần */}
      <div className="relative min-h-0 h-full hidden md:block md:col-span-3 lg:col-span-2 px-4 rounded-2xl shadow-md overflow-y-auto glass">
        {FilterPanel && (
          <FilterPanel
            filters={filters}
            setFilters={setFilters}
            clearAll={() =>
              setFilters({ sortKey: "createdAt", sortDir: "desc" })
            }
          />
        )}
      </div>

      {/* Kết quả bên phải */}
      <div className="col-span-12 md:col-span-9 lg:col-span-10 min-h-0 h-full overflow-y-auto">
        {/* Thanh công cụ */}
        <div className="sticky top-0 z-10 mb-4 flex justify-between items-center bg-white/10 backdrop-blur-sm">
          <div className="font-bold text-base md:text-lg">{title}</div>

          <div className="flex items-center gap-2">
            {renderHeaderExtra?.({ filters, setFilters })}
            <div className="relative">
              <button
                onClick={() => setIsShowSort((v) => !v)}
                className="glass shadow-md md:px-2 py-1 px-1 border rounded-2xl text-description flex items-center gap-1"
              >
                Sắp xếp: <span className="font-bold">{activeSort.label}</span>
                {isShowSort ? (
                  <MdKeyboardArrowUp size={18} />
                ) : (
                  <MdKeyboardArrowDown size={18} />
                )}
              </button>
              {isShowSort && (
                <div className="absolute right-0 mt-2 w-52 bg-white/90 border rounded-xl shadow-lg p-1 z-20">
                  {sortOptions.map((opt) => (
                    <button
                      key={`${opt.value.sortKey}:${opt.value.sortDir}`}
                      onClick={() => {
                        setFilters((f) => ({ ...f, ...opt.value }));
                        setIsShowSort(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-gray-action ${
                        opt.value.sortKey === filters.sortKey &&
                        opt.value.sortDir === filters.sortDir
                          ? "bg-white/20 font-bold"
                          : ""
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* List */}
        <div className="px-2 md:px-4">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[220px] bg-gray-200/70 rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-3 md:gap-5 px-2 md:px-6">
                {products.map((p) => (
                  <ProductCard
                    key={p._id}
                    productName={p.productName}
                    thumb={p.productThumb}
                    slugCategory={p.categoryId?.categorySlug}
                    slug={p.productSlug}
                    variationId={p.variationId}
                    rating={p.productRateAvg}
                    totalSold={p.productSoldCount}
                    shopSlug={p.shopId?.shopSlug}
                    shopName={p.shopId?.shopName}
                    shopLogo={p.shopId?.shopLogo}
                    shopOfficial={p.shopId?.shopOfficial}
                    productMinOriginalPrice={p.productMinOriginalPrice}
                    productMinPrice={p.productMinPrice}
                    productDiscountPercent={p.productDiscountPercent}
                    productIsOnSale={p.productIsOnSale}
                  />
                ))}
              </div>

              <div className="flex justify-center py-4">
                {pageInfo?.hasMore ? (
                  <button
                    disabled={loadingMore}
                    onClick={loadMore}
                    className="px-4 py-2 rounded-xl border shadow-md glass hover:text-cyan-700 disabled:opacity-60"
                  >
                    {loadingMore ? "Đang tải..." : "Xem thêm"}
                  </button>
                ) : (
                  <div className="text-sm text-gray-500">Đã hết sản phẩm</div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
