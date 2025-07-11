import React from "react";
import {
  Sidebar,
  Banner,
  BestSeller,
  DealDaily,
  FeatureProducts,
  CategoryList,
  FeatureInfo,
} from "../../components";
import { useSelector } from "react-redux";
import icons from "../../ultils/icons";
import withBaseComponent from "hocs/withBaseComponent";
import { createSearchParams } from "react-router-dom";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const { IoIosArrowForward } = icons;
const Home = ({ navigate }) => {
  const { newProducts } = useSelector((state) => state.products);
  const { categories } = useSelector((state) => state.app);

  return (
    <div className="w-full px-2">
      {/* 
        De co gian duoc phai dung md:w-main khong dong w-main
        + W-MAIN la no khoa chet chieu rong do, khong duoc doi du man hinh nho hay lon
        + Chỉ từ md trở lên mới fix 1100px, còn nhỏ hơn thì auto → ✅ Co giãn
      */}
      <div className="md:w-main m-auto">
        <CategoryList />
      </div>
      <div className="md:w-main m-auto flex flex-col md:flex-row mt-6 px-2 gap-4">
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
      <div className="flex flex-col my-8 md:w-main m-auto">
        <FeatureProducts
          title="ĐIỆN THOẠI ĐƯỢC ĐÁNH GIÁ CAO"
          query={{ sort: "-rating", categoryId: "6855ba0fdffd1bd4e14fb9ff" }}
        />
      </div>
      <div className="flex flex-col my-8 md:w-main m-auto">
        <FeatureProducts
          title="PHỤ KIỆN ĐIỆN THOẠI ĐƯỢC ĐÁNH GIÁ CAO"
          query={{ sort: "-rating", categoryId: "6855ba84634ab410b39b8bce" }}
        />
      </div>
      <div className="flex flex-col my-8 md:w-main m-auto overflow-x-hidden">
        <FeatureInfo />
      </div>
    </div>
  );
};

export default withBaseComponent(Home);
