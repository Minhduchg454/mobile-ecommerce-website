import {
  Link,
  createSearchParams,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import path from "../../ultils/path";
import { APP_INFO } from "../../ultils/contants";
import { MdOutlineShoppingCart } from "react-icons/md";
import { FaRegHeart } from "react-icons/fa";
import React, { useState, useRef, useEffect } from "react";
import { showAlert } from "store/app/appSlice";
import { nextAlertId, registerHandlers } from "store/alert/alertBus";
import defaultAvatar from "assets/avatarDefault.png";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "store/user/userSlice";
import { clearSeller } from "store/seller/sellerSlice";
import { clearChatData } from "store/chat/chatSlice";
import { persistor } from "store/redux";
import {
  AiOutlineUser,
  AiOutlineSearch,
  AiOutlineClose,
  AiOutlineShop,
} from "react-icons/ai";
import { FiLogOut, FiSettings } from "react-icons/fi";
import { HiOutlineClipboardList } from "react-icons/hi";
import {
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdOutlineNotifications,
} from "react-icons/md";
import { fetchUnreadCount } from "../../store/notification/asynsAction";
import { getSocket } from "../../ultils/socket";

export const Header1 = () => {
  const [isShowMenu, setIsShowMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const menuRef = useRef(null);
  const { currentCart } = useSelector((state) => state.user);
  const { current, isLoggedIn } = useSelector((state) => state.user);
  const { unreadCount } = useSelector((state) => state.notification);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const isAdmin = Boolean(current?.roles?.includes("admin"));
  const isLogged = Boolean(isLoggedIn);
  const countCart = currentCart?.length || 0;

  const handleLogout = () => {
    setIsShowMenu(false);
    const id = nextAlertId();
    registerHandlers(id, {
      onConfirm: () => {
        dispatch(logout());
        dispatch(clearSeller());
        dispatch(clearChatData());
        navigate(`/`);
        persistor.purge();
      },
      onCancel: () => {},
      onClose: () => {},
    });

    dispatch(
      showAlert({
        id,
        title: "Xác nhận đăng xuất",
        message: "Bạn có chắc chắn muốn đăng xuất không?",
        variant: "danger",
        showCancelButton: true,
        confirmText: "Đăng xuất",
        cancelText: "Huỷ",
      })
    );
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const dataButtons = [
    {
      label: "Yêu thích",
      icon: <FaRegHeart size="25" />,
      path: `${path.WISHLIST}`,
      isShow: isLogged && !isAdmin,
    },
    {
      label: "Giỏ hàng",
      icon: <MdOutlineShoppingCart size="27" />,
      path: `${path.CART}`,
      isShow: !isAdmin,
    },
  ];

  const userMenu = [
    {
      label: "Thông tin tài khoản",
      icon: <AiOutlineUser size="16" />,
      path: `/${path.CUSTOMER}/${current?._id}/${path.C_PROFILE}`,
      isShow: !current?.roles?.includes("admin"),
    },
    {
      label: "Đơn hàng của tôi",
      icon: <HiOutlineClipboardList size="16" />,
      path: `/${path.CUSTOMER}/${current?._id}/${path.C_ORDER}`,
      isShow: current?.roles?.includes("shop", "customer") || false,
    },
    {
      label: "Kênh quản lý hệ thống",
      icon: <FiSettings size="16" />,
      path: `/${path.ADMIN}/${current?._id}/${path.A_DASHBOARD}`,
      isShow: isAdmin,
    },
    {
      label: "Kênh bán hàng",
      icon: <AiOutlineShop size="16" />,
      path: `/${path.SELLER}/${current?._id}/${path.S_DASHBOARD}`,
      isShow: current?.roles?.includes("shop") || false,
    },
    {
      label: "Đăng xuất",
      icon: <FiLogOut size="16" />,
      onClick: handleLogout,
      isShow: true,
    },
  ];

  const mergedMenu = isMobile
    ? [...dataButtons.filter((b) => b.isShow), ...userMenu]
    : userMenu;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = () => {
    const keyword = q?.trim();
    navigate({
      pathname: `/${path.PRODUCTS}`,
      search: keyword ? createSearchParams({ s: keyword }).toString() : "",
    });
  };

  const handleClear = () => {
    setQ("");
    searchParams.delete("s");
    setSearchParams(searchParams, { replace: true });
  };

  useEffect(() => {
    if (!current?._id) return;

    const socket = getSocket();
    if (!socket) return;

    const handleUpdate = () => {
      dispatch(fetchUnreadCount());
    };

    socket.on("new_notification", handleUpdate);
    socket.on("update_unread_count", handleUpdate);

    return () => {
      socket.off("new_notification", handleUpdate);
      socket.off("update_unread_count", handleUpdate);
    };
  }, [current, dispatch]);

  useEffect(() => {
    if (current) {
      dispatch(fetchUnreadCount());
    }
  }, [current, dispatch]);

  return (
    <div className="bg-white/50 backdrop-blur-sm w-full flex justify-between items-center h-[50px] px-2 lg:px-10 ">
      {/* Logo */}
      <Link
        to={`/${path.HOME}`}
        className="ml-0 md:ml-28 px-1 md:px-3 font-bold text-xl md:text-3xl  hover:scale-105 transition-transform"
      >
        {APP_INFO.NAME}
      </Link>

      {/* Search */}
      <div
        className="relative flex px-2 py-1.5 w-full mx-2 lg:w-[600px]
             bg-input-bg/60 rounded-full
             focus-within:border-[2px] focus-within:border-input-fc
             transition-all duration-200"
      >
        <button
          type="button"
          onClick={handleSearch}
          className="flex items-center justify-center text-gray-600"
        >
          <AiOutlineSearch size={22} />
        </button>

        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="Tìm sản phẩm..."
          className="ml-3 bg-transparent w-full text-description border-none focus:outline-none"
        />

        {q && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-5 top-1/2 -translate-y-1/2 
                 flex p-0.5 border w-5 h-5 bg-black/60 shadow-md rounded-full 
                 items-center justify-center text-white"
          >
            <AiOutlineClose size={20} />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Group Button — chỉ hiện khi không phải mobile, và không phải admin */}
        {!isAdmin && !isMobile && (
          <div className="flex gap-4 border rounded-3xl py-1 px-3 bg-button-bg/60">
            {dataButtons
              .filter((btn) => btn.isShow)
              .map((btn, idx) => (
                <Link
                  key={idx}
                  to={btn.path}
                  className="relative flex items-center hover:text-button-t-hv transition"
                >
                  {btn.icon}
                  {/* Badge số lượng */}
                  {btn.path === path.CART && countCart > 0 && (
                    <span className="absolute -top-1 -right-1 border border-white bg-black text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                      {countCart > 99 ? "99+" : countCart}
                    </span>
                  )}
                </Link>
              ))}
          </div>
        )}

        {isLogged && (
          <button
            onClick={() => navigate(`${path.NOTIFICATION}`)}
            className="border rounded-3xl py-1 px-3 bg-button-bg/60"
          >
            <div className="relative">
              <MdOutlineNotifications
                size="27"
                className=" hover:text-button-t-hv transition"
              />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-black border border-white text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </div>
          </button>
        )}

        {/* Account */}
        <div className="relative flex items-center" ref={menuRef}>
          {current ? (
            <div
              className="relative cursor-pointer flex items-center gap-2"
              onClick={() => setIsShowMenu((prev) => !prev)}
            >
              <div className="w-9 aspect-square rounded-full overflow-hidden border">
                <img
                  src={current?.userAvatar || defaultAvatar}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = defaultAvatar;
                  }}
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
                <div className="absolute -right-1 -bottom-[4px] p-0.2 w-4 h-4 flex items-center justify-center border rounded-full bg-gray-200 text-gray-800 shadow-sm">
                  {isShowMenu ? (
                    <MdKeyboardArrowUp size={25} />
                  ) : (
                    <MdKeyboardArrowDown size={25} />
                  )}
                </div>
              </div>
            </div>
          ) : (
            <Link
              to={`/${path.LOGIN}`}
              className="rounded-3xl px-2 py-2 md:py-1 bg-button-bg-ac backdrop-blur-sm text-white hover:scale-105 transition-transform"
            >
              <p className="text-xs lg:text-base text-center font-normal whitespace-nowrap">
                Đăng nhập
              </p>
            </Link>
          )}

          {/* Dropdown menu */}
          {isShowMenu && (
            <div className="bg-white absolute right-0 top-full mt-2 w-[250px] border rounded-3xl shadow-lg">
              {mergedMenu
                .filter((item) => item.isShow)
                .map((item, idx) => {
                  const iconEl = item.icon
                    ? React.cloneElement(item.icon, {
                        size: 20,
                        className: "text-gray-600",
                      })
                    : null;

                  return item.onClick ? (
                    <button
                      key={idx}
                      onClick={item.onClick}
                      className="w-full flex items-center gap-2 px-4 py-2 hover:bg-menu-hover rounded-3xl text-left"
                    >
                      {iconEl}
                      {item.label}
                    </button>
                  ) : (
                    <Link
                      key={idx}
                      to={item.path}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-menu-hover rounded-3xl"
                    >
                      {iconEl}
                      {item.label}
                    </Link>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
