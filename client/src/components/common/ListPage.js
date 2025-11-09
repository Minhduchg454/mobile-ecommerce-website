import { useEffect, useRef, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { RiVipCrown2Line } from "react-icons/ri";
import { CloseButton } from "../../components";
import {
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdClose,
  MdFilterList,
  MdCategory,
  MdStorefront,
  MdLocalOffer,
  MdColorLens,
} from "react-icons/md";
import noData from "../../assets/data-No.png";

const FilterPanel = ({
  categories = [],
  categoriesShop = [],
  brands = [],
  shops = [],
  themes = [],
  selectedCategoryIds = [],
  setSelectedCategoryIds,
  selectedCategoryShopIds = [],
  setSelectedCategoryShopIds,
  selectedBrandIds = [],
  setSelectedBrandIds,
  selectedShopIds = [],
  setSelectedShopIds,
  selectedThemeIds = [],
  setSelectedThemeIds,
  hasSale = false,
  setHasSale,
  hasMall = false,
  setHasMall,
  onClearAll,
  onClose,
  showCategory = true,
  showCategoryShop = false,
  showBrand = true,
  showShop = true,
  showTheme = true,
  showMall = true,
  showSale = true,
}) => {
  const filterLi =
    "text-sm md:text-base ml-1 py-1 px-2 hover:bg-sidebar-hv rounded-xl cursor-pointer";
  const H1 = ({ icon: Icon, children }) => (
    <h1 className="text-sm md:text-base font-bold mt-2 flex items-center gap-2">
      <Icon className="text-gray-700" size={18} />
      {children}
    </h1>
  );

  const toggle = (id, list, setter) => {
    setter((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="relative  bg-white rounded-3xl flex flex-col h-full md:py-0 px-4 overflow-y-auto scroll-hidden">
      <div className="sticky  top-0 z-10  text-title  rounded-tr-xl  rounded-tl-xl bg-white/60 backdrop-blur-sm pt-2 md:pt-4">
        <p className="font-bold text-lg md:text-xl">Bộ lọc</p>
        <CloseButton
          onClick={onClose}
          className="absolute top-2 right-0 block md:hidden"
        />
      </div>

      <div className="flex flex-col mt-2 flex-1">
        {showCategory && categories.length > 0 && (
          <div>
            <H1 icon={MdCategory}>Danh mục</H1>
            <ul>
              {categories.map((c) => (
                <li
                  key={c._id || c.categorySlug}
                  className={`${filterLi} ${
                    selectedCategoryIds.includes(c._id)
                      ? "text-sidebar-t-select"
                      : ""
                  }`}
                  onClick={() =>
                    toggle(c._id, selectedCategoryIds, setSelectedCategoryIds)
                  }
                >
                  {c.categoryName}
                </li>
              ))}
            </ul>
          </div>
        )}

        {showCategoryShop && categoriesShop.length > 0 && (
          <div>
            <H1 icon={MdCategory}>Danh mục cửa hàng</H1>
            <ul>
              {categoriesShop.map((cs) => (
                <li
                  key={cs._id || cs.categorySlug}
                  className={`${filterLi} ${
                    selectedCategoryShopIds.includes(cs._id)
                      ? "text-sidebar-t-select"
                      : ""
                  }`}
                  onClick={() =>
                    toggle(
                      cs._id,
                      selectedCategoryShopIds,
                      setSelectedCategoryShopIds
                    )
                  }
                >
                  {cs.csName}
                </li>
              ))}
            </ul>
          </div>
        )}

        {showBrand && brands.length > 0 && (
          <div>
            <H1
              icon={() => (
                <div
                  className="inline-flex items-center justify-center w-6 h-4 text-[5px] font-bold 
      rounded border border-black text-gray-700 bg-white p-0.5"
                >
                  BRAND
                </div>
              )}
            >
              Thương hiệu
            </H1>
            <ul>
              {brands.map((b) => (
                <li
                  key={b._id || b.brandSlug}
                  className={`${filterLi} ${
                    selectedBrandIds.includes(b._id)
                      ? "text-sidebar-t-select"
                      : ""
                  }`}
                  onClick={() =>
                    toggle(b._id, selectedBrandIds, setSelectedBrandIds)
                  }
                >
                  {b.brandName}
                </li>
              ))}
            </ul>
          </div>
        )}

        {showSale && (
          <div>
            <H1 icon={MdLocalOffer}>Khuyến mãi, ưu đãi</H1>
            <label
              className={`${filterLi} ${
                hasSale ? "text-sidebar-t-select " : ""
              }`}
            >
              <input
                type="checkbox"
                className="mr-2"
                checked={hasSale}
                onChange={(e) => setHasSale(e.target.checked)}
              />
              Đang sale
            </label>
          </div>
        )}

        {showMall && (
          <div>
            <H1 icon={RiVipCrown2Line}>Loại cửa hàng</H1>
            <label
              className={`${filterLi} ${
                hasMall ? "text-sidebar-t-select" : ""
              }`}
            >
              <input
                type="checkbox"
                className="mr-2"
                checked={hasMall}
                onChange={(e) => setHasMall(e.target.checked)}
              />
              Shop mall
            </label>
          </div>
        )}

        {showShop && shops.length > 0 && (
          <div>
            <H1 icon={MdStorefront}>Cửa hàng</H1>
            <ul>
              {shops.map((s) => (
                <li
                  key={s._id || s.shopSlug}
                  className={`${filterLi} ${
                    selectedShopIds.includes(s._id)
                      ? "text-sidebar-t-select"
                      : ""
                  }`}
                  onClick={() =>
                    toggle(s._id, selectedShopIds, setSelectedShopIds)
                  }
                >
                  {s.shopName}
                </li>
              ))}
            </ul>
          </div>
        )}

        {showTheme && themes.length > 0 && (
          <div>
            <H1 icon={MdColorLens}>Chủ đề</H1>
            <ul>
              {themes.map((t) => (
                <li
                  key={t._id || t.themeSlug}
                  className={`${filterLi} ${
                    selectedThemeIds.includes(t._id)
                      ? "text-sidebar-t-select"
                      : ""
                  }`}
                  onClick={() =>
                    toggle(t._id, selectedThemeIds, setSelectedThemeIds)
                  }
                >
                  {t.themeName}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="sticky bottom-0 z-10 rounded-br-sm  rounded-bl-sm pb-4 bg-white/90 ">
        <button
          className="w-full px-3 py-1 font-bold border shadow-md rounded-3xl bg-gray-action hover:text-text-ac hover:scale-103 transition"
          onClick={onClearAll}
        >
          Xóa tất cả
        </button>
      </div>
    </div>
  );
};

const parseList = (v) =>
  v
    ? v
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean)
    : [];
const parseBool = (v) => v === "true" || v === "1";
const parseSort = (v, fallback = "createdAt:desc") =>
  v && v.includes(":") ? v : fallback;

/**
 * ListPage
 */

export const ListPage = ({
  fetchItems,
  fetchCategories,
  fetchCategoriesShop,
  fetchBrands,
  fetchShops,
  fetchThemes,
  sortOptions = [
    { label: "Mới nhất", value: "createdAt:desc" },
    { label: "Cũ nhất", value: "createdAt:asc" },
    { label: "Bán chạy nhất", value: "sold:desc" },
    { label: "Giá từ cao đến thấp", value: "price:desc" },
    { label: "Giá từ thấp đến cao", value: "price:asc" },
    { label: "Được yêu thích nhất", value: "rating:desc" },
  ],
  shopId,
  renderItem,
  showCategory = true,
  showCategoryShop = false,
  showBrand = true,
  showShop = true,
  showTheme = true,
  showMall = true,
  showSale = true,
  BreadcrumbComponent,
  itemsKey = "products",
  totalKey = "total",
  pageInfoKey = "pageInfo",
}) => {
  const [sort, setSort] = useState(sortOptions[0]);
  const [isShowSort, setIsShowSort] = useState(false);
  const [totalResult, setTotalResult] = useState(0);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const [categories, setCategories] = useState([]);
  const [categoriesShop, setCategoriesShop] = useState([]);
  const [brands, setBrands] = useState([]);
  const [shops, setShops] = useState([]);
  const [themes, setThemes] = useState([]);

  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
  const [selectedCategoryShopIds, setSelectedCategoryShopIds] = useState([]);
  const [selectedBrandIds, setSelectedBrandIds] = useState([]);
  const [selectedShopIds, setSelectedShopIds] = useState([]);
  const [selectedThemeIds, setSelectedThemeIds] = useState([]);
  const [hasSale, setHasSale] = useState(false);
  const [hasMall, setHasMall] = useState(false);

  const [items, setItems] = useState([]);
  const [pageInfo, setPageInfo] = useState({
    hasMore: false,
    nextCursor: null,
  });
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [err, setErr] = useState("");

  const menuRef = useRef(null);
  const btnRef = useRef(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const s = (searchParams.get("s") || "").trim();

  useEffect(() => {
    (async () => {
      try {
        const promises = [];
        if (showCategory && fetchCategories)
          promises.push(fetchCategories({ sort: "oldest" }));
        if (showCategoryShop && fetchCategoriesShop) {
          promises.push(fetchCategoriesShop({ shopId }));
        }
        if (showBrand && fetchBrands) promises.push(fetchBrands());
        if (showShop && fetchShops) promises.push(fetchShops());
        if (showTheme && fetchThemes) promises.push(fetchThemes());

        const results = await Promise.all(promises);
        let index = 0;
        if (showCategory && fetchCategories) {
          if (results[index]?.success)
            setCategories(results[index].categories || []);
          index++;
        }
        if (showCategoryShop && fetchCategoriesShop) {
          if (results[index]?.success)
            setCategoriesShop(results[index].categoryShops || []);
          index++;
        }
        if (showBrand && fetchBrands) {
          if (results[index]?.success) setBrands(results[index].brands || []);
          index++;
        }
        if (showShop && fetchShops) {
          if (results[index]?.success) setShops(results[index].shops || []);
          index++;
        }
        if (showTheme && fetchThemes) {
          if (results[index]?.success) setThemes(results[index].themes || []);
        }
      } catch (err) {
        console.error("Lỗi load filter:", err);
      } finally {
        setDataLoaded(true);
      }
    })();
  }, [
    fetchCategories,
    fetchCategoriesShop,
    fetchBrands,
    fetchShops,
    fetchThemes,
    showCategory,
    showCategoryShop,
    showBrand,
    showShop,
    showTheme,
  ]);

  useEffect(() => {
    if (!dataLoaded || hydrated) return;

    const catSlugs = parseList(searchParams.get("category"));
    const catShopSlugs = parseList(searchParams.get("categoryShop"));
    const brandSlugs = parseList(searchParams.get("brand"));
    const shopSlugs = parseList(searchParams.get("shop"));
    const themeSlugs = parseList(searchParams.get("theme"));
    const sortFromUrl = parseSort(searchParams.get("sort"));
    const found = sortOptions.find((o) => o.value === sortFromUrl);

    if (found) setSort(found);

    if (showCategory && categories.length)
      setSelectedCategoryIds(
        categories
          .filter((c) => catSlugs.includes(c.categorySlug))
          .map((c) => c._id)
      );
    if (showCategoryShop && categoriesShop.length)
      setSelectedCategoryShopIds(
        categoriesShop
          .filter((cs) => catShopSlugs.includes(cs.csSlug))
          .map((cs) => cs._id)
      );
    if (showBrand && brands.length)
      setSelectedBrandIds(
        brands.filter((b) => brandSlugs.includes(b.brandSlug)).map((b) => b._id)
      );
    if (showShop && shops.length)
      setSelectedShopIds(
        shops.filter((s) => shopSlugs.includes(s.shopSlug)).map((s) => s._id)
      );
    if (showTheme && themes.length)
      setSelectedThemeIds(
        themes.filter((t) => themeSlugs.includes(t.themeSlug)).map((t) => t._id)
      );

    setHasSale(parseBool(searchParams.get("hasSale")));
    setHasMall(parseBool(searchParams.get("hasMall")));
    setHydrated(true);
  }, [
    dataLoaded,
    searchParams,
    categories,
    categoriesShop,
    brands,
    shops,
    themes,
    showCategory,
    showCategoryShop,
    showBrand,
    showShop,
    showTheme,
  ]);

  useEffect(() => {
    if (!hydrated) return;

    const params = {};
    if (sort?.value) params.sort = sort.value;

    if (showCategory && selectedCategoryIds.length)
      params.category = categories
        .filter((c) => selectedCategoryIds.includes(c._id))
        .map((c) => c.categorySlug)
        .join(",");
    if (showCategoryShop && selectedCategoryShopIds.length)
      params.categoryShop = categoriesShop
        .filter((cs) => selectedCategoryShopIds.includes(cs._id))
        .map((cs) => cs.csSlug)
        .join(",");
    if (showBrand && selectedBrandIds.length)
      params.brand = brands
        .filter((b) => selectedBrandIds.includes(b._id))
        .map((b) => b.brandSlug)
        .join(",");
    if (showShop && selectedShopIds.length)
      params.shop = shops
        .filter((s) => selectedShopIds.includes(s._id))
        .map((s) => s.shopSlug)
        .join(",");
    if (showTheme && selectedThemeIds.length)
      params.theme = themes
        .filter((t) => selectedThemeIds.includes(t._id))
        .map((t) => t.themeSlug)
        .join(",");

    if (hasSale && showSale) params.hasSale = "true";
    if (hasMall && showMall) params.hasMall = "true";
    if (s) params.s = s;

    setSearchParams(params, { replace: true });
  }, [
    hydrated,
    sort,
    selectedCategoryIds,
    selectedCategoryShopIds,
    selectedBrandIds,
    selectedShopIds,
    selectedThemeIds,
    hasSale,
    hasMall,
    categories,
    categoriesShop,
    brands,
    shops,
    themes,
    s,
    showCategory,
    showCategoryShop,
    showBrand,
    showShop,
    showTheme,
    showSale,
    showMall,
  ]);

  useEffect(() => {
    if (isFilterOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => (document.body.style.overflow = "");
  }, [isFilterOpen]);

  useEffect(() => {
    if (!isShowSort) return;
    const onClick = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        btnRef.current &&
        !btnRef.current.contains(e.target)
      ) {
        setIsShowSort(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [isShowSort]);

  const queryBase = useMemo(() => {
    const [sortKeyRaw, sortDirRaw] = String(sort.value).split(":");
    const q = {
      sortKey: sortKeyRaw || "createdAt",
      sortDir: sortDirRaw || "desc",
      limit: 8,
    };

    if (showSale && hasSale) q.hasSale = true;
    if (showMall && hasMall) q.hasMall = true;
    if (showCategory && selectedCategoryIds.length)
      q.categoryId = selectedCategoryIds;
    if (showCategoryShop && selectedCategoryShopIds.length)
      q.categoryShopId = selectedCategoryShopIds;
    if (showBrand && selectedBrandIds.length) q.brandId = selectedBrandIds;
    if (shopId) {
      q.shopId = shopId;
    } else if (showShop && selectedShopIds.length) q.shopId = selectedShopIds;
    if (showTheme && selectedThemeIds.length) q.themeId = selectedThemeIds;
    if (s) q.s = s;
    q.viewer = "public";

    return q;
  }, [
    sort,
    hasSale,
    hasMall,
    selectedCategoryIds,
    selectedCategoryShopIds,
    selectedBrandIds,
    selectedShopIds,
    selectedThemeIds,
    s,
    showCategory,
    showCategoryShop,
    showBrand,
    showShop,
    showTheme,
    showSale,
    showMall,
  ]);

  const fetchFirstPage = async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await fetchItems(queryBase);

      if (res?.success) {
        setItems(res[itemsKey] || []);
        setPageInfo(res[pageInfoKey] || { hasMore: false, nextCursor: null });
        setTotalResult(res[totalKey] || 0);
      } else {
        setErr(res?.message || "Không thể tải dữ liệu");
        setItems([]);
        setPageInfo({ hasMore: false, nextCursor: null });
      }
    } catch (e) {
      setErr(e?.message || "Có lỗi xảy ra");
      setItems([]);
      setPageInfo({ hasMore: false, nextCursor: null });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFirstPage();
  }, [queryBase]);

  const loadMore = async () => {
    if (!pageInfo?.hasMore || loadingMore) return;
    setLoadingMore(true);
    setErr("");
    try {
      const res = await fetchItems({
        ...queryBase,
        after: pageInfo.nextCursor,
      });
      if (res?.success) {
        const newItems = (res[itemsKey] || []).filter(
          (newItem) => !items.some((existing) => existing._id === newItem._id)
        );
        setItems((prev) => [...prev, ...newItems]);
        setPageInfo(res[pageInfoKey] || { hasMore: false, nextCursor: null });
        setTotalResult((prev) => prev + (res[totalKey] || 0));
      }
    } catch (e) {
      setErr(e?.message || "Có lỗi xảy ra");
    } finally {
      setLoadingMore(false);
    }
  };

  console.log("Danh sach san pham", items);

  const clearAllFilter = () => {
    setSelectedCategoryIds([]);
    setSelectedCategoryShopIds([]);
    setSelectedBrandIds([]);
    setSelectedShopIds([]);
    setSelectedThemeIds([]);
    setHasSale(false);
    setHasMall(false);
    setSearchParams("");
    setSort(sortOptions[0]);
  };

  return (
    <div className="h-full m-2 md:m-4 grid grid-cols-12 gap-4">
      <div className="relative h-full hidden md:block md:col-span-4 lg:col-span-3   overflow-y-auto scroll-hidden">
        <FilterPanel
          categories={categories}
          categoriesShop={categoriesShop}
          brands={brands}
          shops={shops}
          themes={themes}
          selectedCategoryIds={selectedCategoryIds}
          setSelectedCategoryIds={setSelectedCategoryIds}
          selectedCategoryShopIds={selectedCategoryShopIds}
          setSelectedCategoryShopIds={setSelectedCategoryShopIds}
          selectedBrandIds={selectedBrandIds}
          setSelectedBrandIds={setSelectedBrandIds}
          selectedShopIds={selectedShopIds}
          setSelectedShopIds={setSelectedShopIds}
          selectedThemeIds={selectedThemeIds}
          setSelectedThemeIds={setSelectedThemeIds}
          hasSale={hasSale}
          setHasSale={setHasSale}
          hasMall={hasMall}
          setHasMall={setHasMall}
          onClearAll={clearAllFilter}
          showCategory={showCategory}
          showCategoryShop={showCategoryShop}
          showBrand={showBrand}
          showShop={showShop}
          showTheme={showTheme}
          showMall={showMall}
          showSale={showSale}
        />
      </div>

      {/* Bên phải kết quả */}
      <div
        className="col-span-12 md:col-span-8 lg:col-span-9 min-h-0 h-full overflow-y-auto scroll-hidden"
        style={{ scrollbarGutter: "stable" }}
      >
        <div className="sticky top-0 z-10 mb-4 flex justify-between items-center bg-white/10 backdrop-blur-sm">
          <div className="flex justify-start items-center gap-2 md:gap-3">
            <button
              className="md:hidden inline-flex items-center gap-1 md:px-2 py-1 rounded-2xl border shadow glass"
              onClick={() => setIsFilterOpen(true)}
              aria-label="Mở bộ lọc"
            >
              <MdFilterList size={18} className="text-gray-700" />
            </button>
            {BreadcrumbComponent && (
              <div className="md:px-2 py-1 px-1 rounded-3xl glass shadow-md border">
                <BreadcrumbComponent />
              </div>
            )}
            <div className="py-1 text-description">Kết quả: {totalResult}</div>
          </div>

          <div className="relative">
            <button
              ref={btnRef}
              type="button"
              onClick={() => setIsShowSort((v) => !v)}
              className="glass shadow-md md:px-2 py-1 px-1 border rounded-2xl text-description flex items-center gap-1"
              aria-haspopup="listbox"
              aria-expanded={isShowSort}
            >
              Sắp xếp: <span className="font-bold">{sort.label}</span>
              {isShowSort ? (
                <MdKeyboardArrowUp size={18} className="ml-1" />
              ) : (
                <MdKeyboardArrowDown size={18} className="ml-1" />
              )}
            </button>

            {isShowSort && (
              <div
                ref={menuRef}
                role="listbox"
                className="absolute right-0 mt-2 w-52 bg-white/90 backdrop-blur-md border rounded-xl shadow-lg p-1 z-20"
              >
                {sortOptions.map((opt) => (
                  <button
                    key={opt.value}
                    role="option"
                    aria-selected={opt.value === sort.value}
                    onClick={() => {
                      setSort(opt);
                      setIsShowSort(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-gray-action ${
                      opt.value === sort.value ? "bg-white/20 font-bold" : ""
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="px-2 md:px-4">
          {loading && <div className="p-4">Đang tải dữ liệu…</div>}
          {err && !loading && (
            <div className="p-4 text-red-600 text-sm">{err}</div>
          )}
          {!loading && !err && (
            <>
              <div className="flex flex-wrap justify-start items-start gap-3 md:gap-5 px-2 md:px-6 animate-fadeIn">
                {items.length > 0 ? (
                  items.map((item) => renderItem(item))
                ) : (
                  <div className="w-full flex flex-col items-center justify-center p-6 h-[500px] bg-white rounded-3xl">
                    <img
                      src={noData}
                      alt="No Data"
                      className="w-32 h-32 mb-4 opacity-50"
                    />
                    <p className="text-black">Không có sản phẩm nào</p>
                  </div>
                )}
              </div>
              <div className="flex justify-center py-4">
                {pageInfo?.hasMore ? (
                  <button
                    disabled={loadingMore}
                    onClick={() => {
                      if (!loadingMore && pageInfo?.hasMore) loadMore();
                    }}
                    className="px-4 py-2 rounded-xl border shadow-md glass hover:text-cyan-700 hover:scale-103 disabled:opacity-60"
                  >
                    {loadingMore ? "Đang tải..." : "Xem thêm"}
                  </button>
                ) : (
                  <div className="text-sm text-gray-500"></div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {isFilterOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0"
            onClick={() => setIsFilterOpen(false)}
          />
          <div
            className={`absolute left-2.5 top-3 w-[85%] max-w-[330px] h-[calc(100vh-82px)] transform transition-transform duration-300  ${
              isFilterOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div className="h-full overflow-y-auto scroll-hidden ">
              <FilterPanel
                onClose={() => setIsFilterOpen(false)}
                categories={categories}
                categoriesShop={categoriesShop}
                brands={brands}
                shops={shops}
                themes={themes}
                selectedCategoryIds={selectedCategoryIds}
                setSelectedCategoryIds={setSelectedCategoryIds}
                selectedCategoryShopIds={selectedCategoryShopIds}
                setSelectedCategoryShopIds={setSelectedCategoryShopIds}
                selectedBrandIds={selectedBrandIds}
                setSelectedBrandIds={setSelectedBrandIds}
                selectedShopIds={selectedShopIds}
                setSelectedShopIds={setSelectedShopIds}
                selectedThemeIds={selectedThemeIds}
                setSelectedThemeIds={setSelectedThemeIds}
                hasSale={hasSale}
                setHasSale={setHasSale}
                hasMall={hasMall}
                setHasMall={setHasMall}
                onClearAll={clearAllFilter}
                showCategory={showCategory}
                showCategoryShop={showCategoryShop}
                showBrand={showBrand}
                showShop={showShop}
                showTheme={showTheme}
                showMall={showMall}
                showSale={showSale}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
