import React from "react";
import {
  Banner,
  BestSeller,
  DealDaily,
  FeatureProducts,
  CategoryList,
  FeatureInfo,
} from "../../components";
import withBaseComponent from "hocs/withBaseComponent";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const Home = ({ navigate }) => {
  return (
    <div className="w-full px-2">
      {/* 
        De co gian duoc phai dung md:w-main khong dong w-main
        + W-MAIN la no khoa chet chieu rong do, khong duoc doi du man hinh nho hay lon
        + Chỉ từ md trở lên mới fix 1100px, còn nhỏ hơn thì auto → ✅ Co giãn
      */}
      <div className="xl:w-main m-auto">
        <CategoryList />
      </div>
      <div className="xl:w-main m-auto flex flex-col md:flex-row mt-6 px-2 gap-4">
        <div className="flex flex-col gap-5 md:w-[25%] flex-auto border-none ">
          <DealDaily />
        </div>
        <div className="flex flex-col gap-5 md:pl-5 md:w-[75%] flex-auto border-none h-full">
          <div className="flex-1">
            <Banner />
          </div>
          <div className="flex-1">
            <BestSeller />
          </div>
        </div>
      </div>
      <div className="flex flex-col my-8 xl:w-main w-full m-auto overflow-x-hidden">
        <FeatureProducts
          title="Top 5 điện thoại bán chạy nhất"
          sort="-totalSold"
          categorySlug="dien-thoai"
          limit={5}
        />
      </div>
      <div className="flex flex-col my-8 xl:w-main w-full m-auto overflow-x-hidden">
        <FeatureProducts
          title="Top 5 máy tính bán chạy nhất"
          sort="-totalSold"
          categorySlug="laptop"
          limit={5}
        />
      </div>
      <div className="flex flex-col my-8 xl:w-main m-auto w-fullm-auto overflow-x-hidden">
        <FeatureProducts
          title="Những phụ kiện mới nhất"
          sort="newest"
          categorySlug="phu-kien-dien-thoai"
          limit={5}
        />
      </div>

      <div className="flex flex-col my-8 xl:w-main w-full m-auto overflow-x-hidden">
        <FeatureInfo />
      </div>
    </div>
  );
};

export default withBaseComponent(Home);
