import React, { Fragment, memo, useEffect, useState } from "react";
import logo from "assets/logo-removebg-preview-Photoroom.png";
import icons from "ultils/icons";
import { Link } from "react-router-dom";
import path from "ultils/path";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "store/user/userSlice";
import withBaseComponent from "hocs/withBaseComponent";
import { showCart, showWishlist } from "store/app/appSlice";
import {
  ConfirmLogoutModa,
  InputFormSearch,
  ConfirmModal,
} from "../../components";
import { useForm } from "react-hook-form";
import { NavLink, createSearchParams, useNavigate } from "react-router-dom";
import { MdOutlineShoppingCart } from "react-icons/md";
import { FaRegHeart } from "react-icons/fa"; // 👈 outline

const { AiOutlineSearch, BsHandbagFill, FaUserCircle } = icons;

const Header = () => {
  const {
    register,
    formState: { errors, isDirty },
    watch,
  } = useForm();
  const dispatch = useDispatch();
  const { current } = useSelector((state) => state.user);
  // Log giá trị current để debug đăng nhập

  const [isShowOption, setIsShowOption] = useState(false);
  const [isConfirmingLogout, setIsConfirmingLogout] = useState(false);
  useEffect(() => {
    const handleClickoutOptions = (e) => {
      const profile = document.getElementById("profile");
      if (!profile?.contains(e.target)) setIsShowOption(false);
    };

    document.addEventListener("click", handleClickoutOptions);

    return () => {
      document.removeEventListener("click", handleClickoutOptions);
    };
  }, []);

  const q = watch("q");
  const navigate = useNavigate();

  const handleSearch = () => {
    const currentQuery = q?.trim();

    if (!currentQuery) {
      navigate({
        pathname: `/${path.SEARCH_HOME}`,
      });
    } else {
      navigate({
        pathname: `/${path.SEARCH_HOME}`,
        search: createSearchParams({ q: currentQuery }).toString(),
      });
    }
  };

  // Xử lý nhấn Enter
  useEffect(() => {
    const handleEnter = (e) => {
      if (
        e.key === "Enter" &&
        document.activeElement?.id === "q" // chỉ khi đang focus vào input có id là "q"
      ) {
        handleSearch();
      }
    };

    window.addEventListener("keyup", handleEnter);
    return () => {
      window.removeEventListener("keyup", handleEnter);
    };
  }, [q]);

  return (
    <div className="w-full bg-header-footer">
      <div className="md:w-main w-full mx-auto flex items-center justify-between md:h-[60px] py-[8px] px-4">
        <Link
          to={`/${path.HOME}`}
          className="h-16 flex items-center justify-center px-2"
        >
          <img src={logo} alt="logo" className="h-full w-auto object-contain" />
        </Link>

        <div className="w-full md:w-[600px] px-1 shadow rounded-xl bg-gray-200">
          <InputFormSearch
            id="q"
            register={register}
            errors={errors}
            placeholder="Tìm kiếm sản phẩm..."
            wrapperStyle="flex-1 px-4"
            style="bg-gray-200 p-3 rounded-full text-sm border-none focus:outline-none"
            icon={<AiOutlineSearch size={18} />}
            iconPosition="left"
            onIconClick={handleSearch}
            onKeyUp={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
          />
        </div>

        <div className="flex h-full text-[16px] py-3">
          {current && (
            // Nếu current tồn tại, coi như đã đăng nhập

            <div className="flex items-center gap-4 px-4 relative">
              {/*Danh sách sản phẩm yêu thich*/}
              <div
                onClick={() => dispatch(showWishlist())}
                className="relative cursor-pointer"
              >
                <FaRegHeart size={24} className="text-pink-500" />
                {current?.wishlist?.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
                    {current?.wishlist?.length}
                  </span>
                )}
              </div>
              {/* Giỏ hàng */}
              <div
                onClick={() => dispatch(showCart())}
                className="relative cursor-pointer"
              >
                <MdOutlineShoppingCart size={24} className="text-blue-500" />
                {current?.cart?.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
                    {current?.cart?.length}
                  </span>
                )}
              </div>

              {/* Avatar và menu */}
              <div
                id="profile"
                className="relative cursor-pointer flex items-center gap-2"
                onClick={() => setIsShowOption((prev) => !prev)}
              >
                {current?.avatar ? (
                  <img
                    src={current.avatar}
                    alt="avatar"
                    className="w-10 h-10 object-cover rounded-full border"
                  />
                ) : (
                  <FaUserCircle size={28} className="text-blue-600 w-10 h-10" />
                )}
                {/* ✅ Tên người dùng */}
                <span className="hidden md:inline-block ml-2 text-lg font-medium text-black">
                  {current.firstName}
                </span>

                {/* Menu tùy chọn */}
                {isShowOption && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute top-full right-0 md:left-0 bg-gray-100 border rounded shadow-md z-50 min-w-[150px] py-2"
                  >
                    <Link
                      className="block p-2 hover:bg-sky-100"
                      to={`/${path.MEMBER}/${path.PERSONAL}`}
                    >
                      Thông tin cá nhân
                    </Link>
                    {+current.role === 1945 && (
                      <Link
                        className="block p-2 hover:bg-sky-100"
                        to={`/${path.ADMIN}/${path.DASHBOARD}`}
                      >
                        Quản lý cửa hàng
                      </Link>
                    )}
                    <span
                      onClick={() => setIsConfirmingLogout(true)}
                      className="block p-2 hover:bg-sky-100 cursor-pointer"
                    >
                      Đăng xuất
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        {isConfirmingLogout && (
          <ConfirmModal
            title="Xác nhận đăng xuất"
            message="Bạn có chắc muốn đăng xuất không?"
            confirmText="Đăng xuất"
            cancelText="Hủy"
            onCancel={() => setIsConfirmingLogout(false)}
            onConfirm={() => {
              dispatch(logout());
              setIsConfirmingLogout(false);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Header;
