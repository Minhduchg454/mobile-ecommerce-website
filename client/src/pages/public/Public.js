import React from "react";
import { Outlet } from "react-router-dom";
import { Header } from "components";
import Footer from "components/footer/Footer";
import TopHeaders from "components/headers/TopHeader";
const Public = () => {
  return (
    <div className="flex flex-col items-center">
      <TopHeaders />
      <Header />
      <div className="w-full flex items-center flex-col bg-[#F5F5F7]">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};

export default Public;
