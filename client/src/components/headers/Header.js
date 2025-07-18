import React, { useEffect, useState, memo } from "react";
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
import { InputFormSearch, ShowSwal } from "components";
import { useForm } from "react-hook-form";
import { MdOutlineShoppingCart } from "react-icons/md";
import { FaRegHeart } from "react-icons/fa";
import { IoMenuSharp } from "react-icons/io5";
import { navigation } from "ultils/contants";
import { persistor } from "store/redux";

const { AiOutlineSearch, FaUserCircle } = icons;

const HeaderFull = () => {
  const {
    register,
    formState: { errors, isDirty },
    watch,
  } = useForm();

  const q = watch("q");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { current, currentCart } = useSelector((state) => state.user);
  const [isShowOption, setIsShowOption] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const roleName = current?.roleId?.roleName?.toLowerCase();
  const countCurrentCart = currentCart.length;

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

  useEffect(() => {
    const handleClickoutOptions = (e) => {
      const profile = document.getElementById("profile");
      if (!profile?.contains(e.target)) setIsShowOption(false);
    };

    document.addEventListener("click", handleClickoutOptions);
    return () => document.removeEventListener("click", handleClickoutOptions);
  }, []);

  useEffect(() => {
    const handleEnterSearch = (e) => {
      if (e.keyCode === 13) {
        navigate({
          pathname: `/${path.PRODUCTS}`,
          search: createSearchParams({ q }).toString(),
        });
      }
    };
    if (isDirty) window.addEventListener("keyup", handleEnterSearch);
    else window.removeEventListener("keyup", handleEnterSearch);

    return () => {
      window.removeEventListener("keyup", handleEnterSearch);
    };
  }, [isDirty, q]);

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
    if (result.isConfirmed) {
      dispatch(logout());
      persistor.purge();
    }
  };

  return (
    <div className="w-full bg-header-footer shadow-lg">
      {/* ==== HEADER ==== */}
      <div className="xl:w-main w-full mx-auto mt-1 flex items-center justify-between md:h-[60px] py-[8px] px-4">
        {/* Logo + menu */}
        <div className="flex items-center gap-2">
          {/* Hamburger menu */}
          <span
            onClick={() => setShowMenu(true)}
            className="md:hidden cursor-pointer hover:text-blue-600"
          >
            <IoMenuSharp size={24} />
          </span>

          {/* Logo */}
          <Link
            to={`/${path.HOME}`}
            className="h-[60px] w-[120px] flex items-center justify-start px-2 shrink-0"
          >
            <div className="h-full w-full flex items-center justify-center">
              <img
                src={logo}
                alt="logo"
                className="h-full w-full object-contain"
              />
            </div>
          </Link>
        </div>

        {/* Search box */}
        <div className="lg:w-[700px] w-full px-1 shadow rounded-xl bg-gray-200">
          <InputFormSearch
            id="q"
            register={register}
            errors={errors}
            placeholder="Nhập tên điện thoại, máy tính, phụ kiện... cần tìm"
            wrapperStyle="flex-1 px-4"
            style="bg-gray-200 p-3 rounded-full text-sm border-none focus:outline-none"
            icon={<AiOutlineSearch size={24} />}
            iconPosition="left"
            onIconClick={handleSearch}
            onKeyUp={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>

        {/* User & icon */}
        <div className="flex h-full items-center gap-4 ml-4 relative ">
          {roleName === "customer" && (
            <div
              onClick={() => dispatch(showWishlist())}
              className="relative cursor-pointer border rounded-full p-2 bg-[#E3E5E9]"
            >
              <div className="relative group cursor-pointer">
                <FaRegHeart size={24} className="text-black" />
                <span
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2 py-1 
                            text-[10px] text-white bg-black rounded 
                            opacity-0 group-hover:opacity-100 
                            transition-all duration-300 delay-500 
                            transform translate-y-1 group-hover:translate-y-0 
                            whitespace-nowrap z-50"
                >
                  Yêu thích
                </span>
              </div>

              {current?.wishlist?.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
                  {current.wishlist.length}
                </span>
              )}
            </div>
          )}

          {roleName !== "admin" && (
            <div
              onClick={() => dispatch(showCart())}
              className="relative cursor-pointer rounded-full p-2 bg-[#E3E5E9]"
            >
              <div className="relative group cursor-pointer">
                <MdOutlineShoppingCart size={24} className="text-black" />
                <span
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2 py-1 
                            text-[10px] text-white bg-black rounded 
                            opacity-0 group-hover:opacity-100 
                            transition-all duration-300 delay-500 
                            transform translate-y-1 group-hover:translate-y-0 
                            whitespace-nowrap z-50"
                >
                  Giỏ hàng
                </span>
              </div>
              {countCurrentCart > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {countCurrentCart}
                </span>
              )}
            </div>
          )}

          {!current && (
            <Link
              className="text-sm hover:scale-105 transition-transform duration-200 transform border p-2 rounded-xl bg-white/70 shadow-sm backdrop-blur-sm hover:font-bold"
              to={`/${path.LOGIN}`}
            >
              Đăng nhập
            </Link>
          )}

          {current && (
            <div
              id="profile"
              className="relative cursor-pointer flex items-center gap-2"
              onClick={() => setIsShowOption((prev) => !prev)}
            >
              {current?.avatar ? (
                <div className="relative group cursor-pointer">
                  <div className="w-10 aspect-square rounded-full overflow-hidden border shrink-0">
                    <img
                      src={current.avatar}
                      alt="avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Tooltip tuỳ biến */}
                  <span
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2 py-1 
                            text-[10px] text-white bg-black rounded 
                            opacity-0 group-hover:opacity-100 
                            transition-all duration-300 delay-500 
                            transform translate-y-1 group-hover:translate-y-0 
                            whitespace-nowrap z-50"
                  >
                    Tài khoản
                  </span>

                  <div className="absolute -right-1 -bottom-[4px] p-1 w-5 h-5 flex items-center justify-center border border-gray-300 rounded-full bg-gray-200 text-gray-800 shadow-sm transition text-xs">
                    ▾
                  </div>
                </div>
              ) : (
                <div className="relative group cursor-pointer">
                  <div className="relative group cursor-pointer">
                    <FaUserCircle size={33} className="text-black" />
                    <span className="absolute top-full right-0 mt-1 px-2 py-1 text-[10px] text-white bg-black rounded opacity-0 group-hover:opacity-100 transition-transform duration-200 ease-in-out transform translate-x-2 group-hover:translate-x-0 whitespace-nowrap z-50">
                      Tài khoản
                    </span>
                    <div className="absolute -right-1 -bottom-[4px] p-1 w-5 h-5 flex items-center justify-center border border-gray-300 rounded-full bg-gray-200 text-gray-800 shadow-sm transition text-xs">
                      ▾
                    </div>
                  </div>
                </div>
              )}

              {isShowOption && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute top-full right-0  bg-gray-100 border rounded shadow-md z-50 min-w-[150px] py-2"
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
          )}
        </div>
      </div>

      {/* ==== NAVIGATION (chỉ hiện khi màn hình md trở lên) ==== */}
      <div className="bg-header-footer w-full h-[35px] px-2 md:pb-2 justify-center hidden md:flex">
        <div className="w-main m-auto flex justify-between items-center">
          <div className="py-2 flex-auto text-sm flex items-center justify-center">
            {navigation.map((el) => (
              <NavLink
                to={el.path}
                key={el.id}
                className={({ isActive }) =>
                  isActive
                    ? "md:pr-12 pr-6 text-xs hover:text-blue-600 text-blue-600"
                    : "md:pr-12 pr-6 text-xs hover:text-blue-300"
                }
              >
                {el.value}
              </NavLink>
            ))}
          </div>
        </div>
      </div>

      {/* ==== MENU DRAWER khi nhấn nút hamburger ==== */}
      {showMenu && (
        <div
          onClick={() => setShowMenu(false)}
          className="absolute inset-0 z-[999] bg-overlay"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-2/5 bg-white backdrop-blur-md p-3 h-full flex flex-col"
          >
            {navigation.map((el) => (
              <NavLink
                to={el.path}
                key={el.id}
                onClick={() => setShowMenu(false)}
                className={({ isActive }) =>
                  isActive
                    ? "py-3 border-b text-sm hover:text-blue-600 text-blue-600"
                    : "py-3 border-b text-sm hover:text-blue-300"
                }
              >
                {el.value}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(HeaderFull);
