import React, { useEffect, useState } from "react";
import logo from "assets/logo-removebg-preview-Photoroom.png";
import icons from "ultils/icons";
import {
  Link,
  NavLink,
  createSearchParams,
  useNavigate,
} from "react-router-dom";
import path from "ultils/path";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "store/user/userSlice";
import { showCart, showWishlist } from "store/app/appSlice";
import { InputFormSearch, ShowSwal } from "../../components";
import { useForm } from "react-hook-form";
import { MdOutlineShoppingCart } from "react-icons/md";
import { FaRegHeart } from "react-icons/fa";

const { AiOutlineSearch, FaUserCircle } = icons;

const Header = () => {
  const {
    register,
    formState: { errors },
    watch,
  } = useForm();

  const dispatch = useDispatch();
  const { current } = useSelector((state) => state.user);
  const [isShowOption, setIsShowOption] = useState(false);
  const q = watch("q");
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickoutOptions = (e) => {
      const profile = document.getElementById("profile");
      if (!profile?.contains(e.target)) setIsShowOption(false);
    };

    document.addEventListener("click", handleClickoutOptions);
    return () => document.removeEventListener("click", handleClickoutOptions);
  }, []);

  const handleSearch = () => {
    const currentQuery = q?.trim();
    navigate({
      pathname: `/${path.SEARCH_HOME}`,
      search: currentQuery
        ? createSearchParams({ q: currentQuery }).toString()
        : "",
    });
  };

  useEffect(() => {
    const handleEnter = (e) => {
      if (e.key === "Enter" && document.activeElement?.id === "q") {
        handleSearch();
      }
    };
    window.addEventListener("keyup", handleEnter);
    return () => window.removeEventListener("keyup", handleEnter);
  }, [q]);

  const handleLogout = async () => {
    const result = await ShowSwal({
      title: "Xác nhận đăng xuất",
      text: "Bạn có chắc muốn đăng xuất không?",
      icon: "warning",
      confirmText: "Đăng xuất",
      cancelText: "Hủy",
      showCancelButton: true,
      variant: "danger",
    });
    if (result.isConfirmed) dispatch(logout());
  };

  return (
    <div className="w-full bg-header-footer">
      <div className="xl:w-main w-full mx-auto flex items-center justify-between md:h-[60px] py-[8px] px-4">
        <Link
          to={`/${path.HOME}`}
          className="h-16 flex items-center justify-start px-2"
        >
          <div className="w-auto h-[60px] flex items-center justify-center">
            <img
              src={logo}
              alt="logo"
              className="h-full w-auto object-contain"
            />
          </div>
        </Link>

        <div className="lg:w-[700px] w-full px-1 shadow rounded-xl bg-gray-200">
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
            onKeyUp={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>

        {current && (
          <div className="flex h-full items-center gap-4 px-4 relative">
            <div
              onClick={() => dispatch(showWishlist())}
              className="relative cursor-pointer"
            >
              <FaRegHeart size={24} className="text-pink-500" />
              {current?.wishlist?.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
                  {current.wishlist.length}
                </span>
              )}
            </div>

            <div
              onClick={() => dispatch(showCart())}
              className="relative cursor-pointer"
            >
              <MdOutlineShoppingCart size={24} className="text-blue-500" />
              {current?.cart?.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
                  {current.cart.length}
                </span>
              )}
            </div>

            <div
              id="profile"
              className="relative cursor-pointer flex items-center gap-2"
              onClick={() => setIsShowOption((prev) => !prev)}
            >
              {current?.avatar ? (
                <div className="w-10 aspect-square rounded-full overflow-hidden border shrink-0">
                  <img
                    src={current.avatar}
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <FaUserCircle size={28} className="text-blue-600 w-10 h-10" />
              )}
              <span className="hidden lg:inline-block ml-2 text-lg font-medium text-black">
                {current.firstName}
              </span>

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
                    onClick={handleLogout}
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
    </div>
  );
};

export default Header;
