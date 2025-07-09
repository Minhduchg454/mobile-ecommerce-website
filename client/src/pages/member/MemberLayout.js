import React, { useState, useRef } from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { MemberSidebar, AdminHeader } from "components";
import path from "ultils/path";

const getPageTitle = (pathname) => {
  if (pathname.includes("personal")) return "THÔNG TIN CÁ NHÂN";
  if (pathname.includes("my-cart")) return "GIỎ HÀNG";
  if (pathname.includes("buy-history")) return "LỊCH SỬ MUA HÀNG";
  if (pathname.includes("my-order")) return "ĐƠN HÀNG";
  if (pathname.includes("wishlist")) return "DANH SÁCH SẢN PHẨM YÊU THÍCH";
  return "THÀNH VIÊN";
};

const MemberLayout = () => {
  const { isLoggedIn, current } = useSelector((state) => state.user);
  const location = useLocation();
  const [showSidebar, setShowSidebar] = useState(false);
  const contentRef = useRef();
  const title = getPageTitle(location.pathname);

  if (!isLoggedIn || !current)
    return <Navigate to={`/${path.LOGIN}`} replace={true} />;

  return (
    <div className="w-screen h-screen overflow-hidden bg-gray-100 text-gray-900 relative">
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-screen z-50 bg-white w-[250px] shadow-md
        transition-transform duration-300
        ${showSidebar ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0`}
      >
        <MemberSidebar />
      </div>

      {/* Header */}
      <div className="fixed top-0 left-0 md:left-[250px] right-0 h-[60px] z-40 bg-white shadow-md">
        <AdminHeader
          title={title}
          onToggleSidebar={() => setShowSidebar(!showSidebar)}
        />
      </div>

      {/* Overlay */}
      {showSidebar && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-30 md:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Main content */}
      <div
        ref={contentRef}
        className="pt-[60px] md:pl-[250px] h-full overflow-y-auto"
      >
        <div className="p-4">
          <Outlet context={{ contentRef }} />
        </div>
      </div>
    </div>
  );
};

export default MemberLayout;
