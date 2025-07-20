import React, { useState, useRef } from "react"; // Thêm useRef
import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { AdminSidebar, AdminHeader } from "components";
import path from "ultils/path";

const getPageTitle = (pathname) => {
  if (pathname.includes("dashboard")) return "THỐNG KÊ";
  if (pathname.includes("manage-user")) return "QUẢN LÝ TÀI KHOẢN";
  if (pathname.includes("manage-products-categories"))
    return "QUẢN LÝ DANH MỤC";
  if (pathname.includes("manage-products")) return "QUẢN LÝ KHO HÀNG";
  if (pathname.includes("create-products")) return "THÊM SẢN PHẨM";
  if (pathname.includes("manage-order")) return "QUẢN LÝ ĐƠN HÀNG";
  if (pathname.includes("create-blog")) return "THÊM TIN TỨC";
  if (pathname.includes("manage-blogs")) return "QUẢN LÝ KHO TIN TỨC";
  if (pathname.includes("manage-brands")) return "QUẢN LÝ THƯƠNG HIỆU";
  return "QUẢN TRỊ";
};

const AdminLayout = () => {
  const { isLoggedIn, current } = useSelector((state) => state.user);
  const [showSidebar, setShowSidebar] = useState(false);
  const location = useLocation();
  const title = getPageTitle(location.pathname);

  const contentRef = useRef(); // ✅ Tạo ref cho vùng nội dung cuộn

  if (!isLoggedIn || !current || +current.role !== 1945)
    return <Navigate to={`/${path.LOGIN}`} replace />;

  return (
    <div className="w-screen h-screen overflow-hidden bg-gray-100 text-gray-900 relative">
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-screen z-50 bg-white w-[250px] shadow-md
        transition-transform duration-300
        ${showSidebar ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0`}
      >
        <AdminSidebar />
      </div>

      {/* Header */}
      <div
        className={`fixed top-0 left-0 md:left-[250px] right-0 h-[60px] z-40 bg-white`}
      >
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
        ref={contentRef} // ✅ Gán ref ở đây
        className="pt-[60px] md:pl-[250px] h-full overflow-y-auto"
      >
        <div className="p-4">
          {/* ✅ Truyền context xuống cho useOutletContext() dùng */}
          <Outlet context={{ contentRef }} />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
