// components/FilterPanel.jsx
export function FilterPanel({
  categories = [],
  categoriesShop = [],
  brands = [],
  shops = [],
  themes = [],
  selectedCategoryIds,
  setSelectedCategoryIds,
  selectedCategoryShopIds,
  setSelectedCategoryShopIds,
  selectedBrandIds,
  setSelectedBrandIds,
  selectedShopIds,
  setSelectedShopIds,
  selectedThemeIds,
  setSelectedThemeIds,
  hasSale,
  setHasSale,
  hasMall,
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
}) {
  const toggle = (id, list, setter) => {
    setter((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const filterH1 = "text-sm md:text-base font-bold mt-2";
  const filterLi =
    "text-sm md:text-base ml-1 py-1 px-2 hover:bg-gray-action rounded-xl cursor-pointer";

  return (
    <>
      <div className="w-full font-semibold text-title sticky top-0 z-10 bg-white/90 backdrop-blur-md md:pt-4 mb-1">
        <p className="font-bold text-lg md:text-xl flex items-center gap-2">
          Bộ lọc
        </p>
        {onClose && (
          <button
            className="md:hidden absolute top-1 right-2 p-1 border rounded-full hover:bg-gray-action"
            onClick={onClose}
          >
            ✕
          </button>
        )}
      </div>

      <div className="pb-[190px]">
        {showCategoryShop && categoriesShop.length > 0 && (
          <div>
            <h1 className={filterH1}>Danh mục shop</h1>
            <ul>
              {categoriesShop.map((cs) => (
                <li
                  key={cs._id}
                  className={`${filterLi} ${
                    selectedCategoryShopIds.includes(cs._id)
                      ? "text-cyan-400"
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

        {showCategory && categories.length > 0 && (
          <div>
            <h1 className={filterH1}>Danh mục</h1>
            <ul>
              {categories.map((c) => (
                <li
                  key={c._id}
                  className={`${filterLi} ${
                    selectedCategoryIds.includes(c._id) ? "text-cyan-400" : ""
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

        {showBrand && brands.length > 0 && (
          <div>
            <h1 className={filterH1}>Thương hiệu</h1>
            <ul>
              {brands.map((b) => (
                <li
                  key={b._id}
                  className={`${filterLi} ${
                    selectedBrandIds.includes(b._id) ? "text-cyan-400" : ""
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
            <h1 className={filterH1}>Khuyến mãi, ưu đãi</h1>
            <label className={`${filterLi} ${hasSale ? "text-cyan-400" : ""}`}>
              <input
                type="checkbox"
                checked={hasSale}
                onChange={(e) => setHasSale(e.target.checked)}
                className="mr-2"
              />
              Đang sale
            </label>
          </div>
        )}

        {showMall && (
          <div>
            <h1 className={filterH1}>Loại cửa hàng</h1>
            <label className={`${filterLi} ${hasMall ? "text-cyan-400" : ""}`}>
              <input
                type="checkbox"
                checked={hasMall}
                onChange={(e) => setHasMall(e.target.checked)}
                className="mr-2"
              />
              Shop Mall
            </label>
          </div>
        )}

        {showShop && shops.length > 0 && (
          <div>
            <h1 className={filterH1}>Cửa hàng</h1>
            <ul>
              {shops.map((s) => (
                <li
                  key={s._id}
                  className={`${filterLi} ${
                    selectedShopIds.includes(s._id) ? "text-cyan-400" : ""
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
            <h1 className={filterH1}>Chủ đề</h1>
            <ul>
              {themes.map((t) => (
                <li
                  key={t._id}
                  className={`${filterLi} ${
                    selectedThemeIds.includes(t._id) ? "text-cyan-400" : ""
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

      <div className="sticky bottom-0 bg-white/80 backdrop-blur-md pb-4">
        <button
          className="w-full px-3 py-2 font-bold border shadow-md rounded-2xl bg-gray-action hover:text-cyan-700 hover:scale-103 transition"
          onClick={onClearAll}
        >
          Xóa tất cả
        </button>
      </div>
    </>
  );
}
