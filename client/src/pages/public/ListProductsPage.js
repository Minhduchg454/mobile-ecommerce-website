import { ProductCard1, Breadcrumb, ListPage } from "../../components";
import {
  apiGetProductCategories,
  apiGetProducts,
  apiGetShops,
  apiGetBrands,
  apiGetThemes,
} from "../../services/catalog.api";

export const ListProductsPage = () => {
  return (
    <div className="h-[calc(100vh-82px)] animate-fadeIn">
      <ListPage
        // fetchers
        fetchItems={apiGetProducts}
        fetchCategories={apiGetProductCategories}
        fetchBrands={apiGetBrands}
        fetchShops={apiGetShops}
        fetchThemes={apiGetThemes}
        // hiển thị/bật tắt các filter
        showCategory
        showBrand
        showShop
        showTheme
        showSale
        showMall
        // breadcrumb
        BreadcrumbComponent={Breadcrumb}
        // render từng item
        renderItem={(p) => (
          <ProductCard1
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
            shopId={p.shopId?._id}
            shopOfficial={p.shopId?.shopOfficial}
            productMinOriginalPrice={p.productMinOriginalPrice}
            productMinPrice={p.productMinPrice}
            productDiscountPercent={p.productDiscountPercent}
            productIsOnSale={p.productIsOnSale}
          />
        )}
        // mapping key của API (nếu khác, đổi ở đây)
        itemsKey="products"
        totalKey="total"
        pageInfoKey="pageInfo"
      />
    </div>
  );
};
