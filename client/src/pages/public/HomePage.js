import {
  CategoryList,
  BannerHomePage,
  ThemeList,
  PolicyList,
  TopSoldProducts,
  ShopList,
  RecommendMlList,
  SaleHomePage,
} from "../../features/";

export const HomePage = () => {
  const card = "mb-5 md:mb-11 animate-fadeIn ";
  const title = "font-bold text-base md:text-xl ml-2 md:ml-28 my-3 ";

  return (
    <div className="w-full ">
      <div className="animate-fadeIn ">
        <BannerHomePage />
      </div>
      <div className={`${card}`}>
        <p className={`${title}`}>Khám phá danh mục nổi bật</p>
        <CategoryList />
      </div>
      <div className={`${card}`}>
        <p className={`${title}`}>Ưu đãi & Giảm giá hot</p>
        <SaleHomePage />
      </div>
      <div className={`${card}`}>
        <p className={`${title}`}>Gợi ý hôm nay</p>
        <RecommendMlList />
      </div>
      <div className={`${card}`}>
        <p className={`${title}`}>Xu hướng nổi bật</p>
        <ThemeList />
      </div>
      <div className={`${card}`}>
        <p className={`${title}`}>Được mua nhiều nhất</p>
        <TopSoldProducts />
      </div>
      <div className={`${card}`}>
        <p className={`${title}`}> Shop được yêu thích</p>
        <ShopList />
      </div>
      <div className={`${card}`}>
        <p className={`${title}`}>Cam kết từ sàn</p>
        <PolicyList />
      </div>
    </div>
  );
};
