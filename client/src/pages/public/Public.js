import React from "react";
import { Outlet } from "react-router-dom";
import { Header, Navigation, ColorSlider } from "components";
import Footer from "components/footer/Footer";
import TopHeaders from "components/headers/TopHeader";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
const Public = () => {
  return (
    <div className="flex flex-col items-center">
      <TopHeaders />
      <Header />
      <Navigation />
      <div className="w-full flex items-center flex-col">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};

export default Public;
