// src/components/layout/AuthLayout.jsx
import { Outlet, Link } from "react-router-dom";
import {
  FaMobileAlt,
  FaLaptop,
  FaTabletAlt,
  FaHeadphones,
  FaTshirt,
  FaCamera,
  FaGamepad,
  FaCouch,
} from "react-icons/fa";
import { APP_INFO } from "../../ultils/contants";

export const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-tr from-[#4ADEDE] to-[#787FF6] grid lg:flex p-4 justify-around items-center relative">
      {/* Logo MOBILE: absolute để không đẩy layout, ẩn trên lg */}
      <Link
        to="/"
        className="lg:hidden absolute top-5 left-1/2 -translate-x-1/2 text-3xl font-semibold text-white z-10"
      >
        {APP_INFO.NAME}
      </Link>
      {/* LEFT: Giới thiệu sàn */}
      <div className="hidden lg:flex flex-col justify-around h-[600px] w-1/2 relative">
        {/* Nội dung */}
        <div className="flex flex-col justify-between  text-left ">
          <div>
            <h1 className="text-gray-100 text-5xl font-bold leading-tight mb-3 mx-auto">
              Sàn giao dịch điện tử <br />
              thông minh <span> {APP_INFO.NAME}</span>
            </h1>
            <div className="flex gap-8 text-white/30">
              <FaMobileAlt className="text-4xl animate-bounce-slow" />
              <FaLaptop className="text-4xl animate-float" />
              <FaTabletAlt className="text-4xl animate-float2" />
              <FaHeadphones className="text-4xl animate-bounce-slow2" />
              <FaTshirt className="text-4xl animate-float2" />
              <FaCamera className="text-4xl animate-float" />
              <FaGamepad className="text-4xl animate-float" />
              <FaCouch className="text-4xl animate-bounce-slow" />
            </div>
          </div>
        </div>
        <ul className="list-inside text-gray-200 text-lg">
          <li>Đăng bán và tìm kiếm sản phẩm nhanh chóng</li>
          <li>Tư vấn hỗ trợ tức thì qua chatbot AI</li>
          <li>Gợi ý phù hợp dựa trên hành vi người dùng</li>
          <li>Quản lý đơn hàng và khách hàng dễ dàng</li>
          <li>Khuyến mãi ngập tràn, giá bao tốt thị trường</li>
        </ul>

        <div className="text-sm text-gray-200 text-center">
          © {new Date().getFullYear()} {APP_INFO.NAME}. Bản quyền thuộc về công
          ty {APP_INFO.NAME} Inc. <br /> Đã đăng ký giấy phép kinh doanh và
          chứng nhận thương mại điện tử.
        </div>
      </div>

      {/* RIGHT: Đăng nhập/đăng ký */}
      <div className="flex items-center justify-center">
        <Outlet />
      </div>
    </div>
  );
};
