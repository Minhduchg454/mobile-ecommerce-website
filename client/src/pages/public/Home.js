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

const { IoIosArrowForward } = icons;
const Home = ({ navigate }) => {
  const { newProducts } = useSelector((state) => state.products);
  const { categories } = useSelector((state) => state.app);

  return (
    <div className="w-full px-4">
      <div className="my-8 w-main m-auto ">
        <CategoryList />
      </div>
      <div className="md:w-main m-auto flex flex-col md:flex-row mt-6 py-2">
        <div className="flex flex-col gap-5 md:w-[25%] flex-auto border-none">
          <DealDaily />
        </div>
        <div className="flex flex-col gap-5 md:pl-5 md:w-[75%] flex-auto border-none">
          <Banner />
          <BestSeller />
        </div>
      </div>
      <div className="flex flex-col my-8 w-main m-auto">
        <FeatureProducts
          title="ĐIỆN THOẠI ĐƯỢC ĐÁNH GIÁ CAO"
          query={{ sort: "-rating", categoryId: "6855ba0fdffd1bd4e14fb9ff" }}
        />
      </div>
      <div className="flex flex-col my-8 w-main m-auto">
        <FeatureProducts
          title="PHỤ KIỆN ĐIỆN THOẠI ĐƯỢC ĐÁNH GIÁ CAO"
          query={{ sort: "-rating", categoryId: "6855ba84634ab410b39b8bce" }}
        />
      </div>
      <div className="flex flex-col flex-wrap my-8 w-main m-auto">
        <FeatureInfo />
      </div>
    </div>
  );
};

export default withBaseComponent(Home);
