import { ProductCard, Breadcrumb, ListPage } from "../../components";
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
        fetchItems={apiGetProducts}
        fetchCategories={apiGetProductCategories}
        fetchBrands={apiGetBrands}
        fetchShops={apiGetShops}
        fetchThemes={apiGetThemes}
        showCategory
        showBrand
        showShop
        showTheme
        showSale
        showMall
        BreadcrumbComponent={Breadcrumb}
        renderItem={(p) => (
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
            shopId={p.shopId?._id}
            shopOfficial={p.shopId?.shopIsOfficial}
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
