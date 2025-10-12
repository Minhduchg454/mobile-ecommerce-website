import { ShopCard, Breadcrumb, ListPage, ProductCard1 } from "../../components";
import { apiGetProducts } from "../../services/catalog.api";
import { apiGetShopCategories } from "../../services/shop.api";

export const ShopCategoryList = ({ shopId }) => {
  return (
    <ListPage
      fetchItems={apiGetProducts}
      fetchCategoriesShop={apiGetShopCategories}
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
      shopId={shopId}
      BreadcrumbComponent={Breadcrumb}
      showCategory={false}
      showCategoryShop={true}
      showBrand={false}
      showShop={false}
      showTheme={false}
      showMall={false}
      showSale={false}
      itemsKey="products"
      totalKey="total"
      pageInfoKey="pageInfo"
    />
  );
};
