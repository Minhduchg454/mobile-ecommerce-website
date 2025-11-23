import {
  Outlet,
  useParams,
  useNavigate,
  NavLink,
  useLocation,
} from "react-router-dom";
import path from "ultils/path";
import { AiOutlineSearch, AiOutlineClose } from "react-icons/ai";
import React, { useState, useRef, useEffect } from "react";
import clsx from "clsx";
import { Breadcrumb, CloseButton } from "../../components";
import { useSelector } from "react-redux";
import defaultAvatar from "assets/avatarDefault.png";
import { CiBadgeDollar } from "react-icons/ci";
import { FiBox } from "react-icons/fi";
import {
  MdOutlineCategory,
  MdOutlineMenu,
  MdOutlineDashboard,
  MdOutlineAccountBalanceWallet,
} from "react-icons/md";
import {
  HiOutlineUserCircle,
  HiOutlineBuildingStorefront,
} from "react-icons/hi2";
import { FiChevronRight, FiChevronDown } from "react-icons/fi";
import { PiTicket } from "react-icons/pi";
import { APP_INFO } from "../../ultils/contants";
import logoGoCart from "../../assets/logoGoCart.png";

const Sidebar = ({
  to,
  dataButtons,
  openMenus,
  setOpenMenus,
  isSlideBarOpen,
  setIsSlideBarOpen,
  navigate,
  image,
  name,
}) => {
  const SidebarContent = () => (
    <div className="relative flex flex-col h-full md:py-0 px-4 overflow-y-auto scroll-hidden">
      {/* --- Header: Avatar & Tên cửa hàng (sticky giữ nguyên) --- */}
      <div className="sticky top-0 z-10 bg-white/60 rounded-tr-xl  rounded-tl-xl backdrop-blur-sm pt-4 flex flex-col items-center justify-center">
        <div
          className="w-24 cursor-pointer aspect-square rounded-full overflow-hidden border border-black z-10"
          onClick={() => navigate(to)}
        >
          <img
            src={image}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = defaultAvatar;
            }}
            alt="avatar"
            className="w-full h-full object-cover"
          />
        </div>
        <p className="-mt-2 font-bold text-base border rounded-3xl p-2 shadow-md z-5">
          {name}
        </p>
      </div>

      <div className="w-full h-full flex flex-col mt-4 flex-1">
        {dataButtons.map((btn, i) => {
          const hasChildren = Array.isArray(btn.children);
          if (!hasChildren)
            return (
              <NavLink
                key={i}
                to={btn.to}
                onClick={() => setIsSlideBarOpen(false)}
                className={({ isActive }) =>
                  clsx(
                    "cursor-pointer hover:bg-sidebar-hv rounded-3xl px-3 py-1 grid items-center transition-colors duration-150 my-0.5",
                    "grid-cols-[24px_1fr_24px]",
                    isActive && "bg-sidebar-bg-select text-sidebar-t-select"
                  )
                }
              >
                <div className="flex items-center text-base lg:text-lg whitespace-nowrap text-left">
                  {btn.icon}
                </div>
                <div className="pl-2 text-base lg:text-lg whitespace-nowrap text-left">
                  {btn.label}
                </div>
                <div className="flex items-center justify-end text-gray-500"></div>
              </NavLink>
            );

          // --- Có children (submenu giữ nguyên grid + spacing) ---
          return (
            <div key={i}>
              <div
                onClick={() =>
                  setOpenMenus((prev) =>
                    prev.includes(i)
                      ? prev.filter((idx) => idx !== i)
                      : [...prev, i]
                  )
                }
                className={clsx(
                  "cursor-pointer hover:bg-sidebar-hv rounded-3xl px-3 py-1 grid items-center transition-colors duration-150 my-0.5",
                  "grid-cols-[24px_1fr_24px]"
                )}
              >
                <div className="text-base lg:text-lg whitespace-nowrap text-left">
                  {btn.icon}
                </div>
                <div className="pl-2 text-base lg:text-lg whitespace-nowrap text-left">
                  {btn.label}
                </div>
                <div className="flex items-center justify-end text-gray-500">
                  {openMenus.includes(i) ? (
                    <FiChevronDown size={18} />
                  ) : (
                    <FiChevronRight size={18} />
                  )}
                </div>
              </div>

              {openMenus.includes(i) && (
                <div className="mt-1">
                  {btn.children.map((child, j) => (
                    <NavLink
                      key={j}
                      to={child.to}
                      onClick={() => setIsSlideBarOpen(false)}
                      className={({ isActive }) =>
                        clsx(
                          "rounded-3xl py-1 px-3 grid items-center transition-all duration-200",
                          "grid-cols-[24px_1fr_24px]",
                          "hover:bg-sidebar-hv mb-1",
                          isActive &&
                            "text-sidebar-t-select bg-sidebar-bg-select"
                        )
                      }
                    >
                      <div className="text-base lg:text-lg whitespace-nowrap text-left"></div>
                      <div className="pl-2 text-base lg:text-lg whitespace-nowrap text-left">
                        {child.label}
                      </div>
                      <div className="text-base md:text-lg justify-end text-gray-500"></div>
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* --- Footer: sticky bottom giữ nguyên --- */}
      <div className="sticky bottom-0 z-10 backdrop-blur-sm pb-4 md:bg-white/60  mt-auto rounded-br-xl  rounded-bl-xl">
        <button
          className="w-full px-2 py-1 font-bold border shadow-md rounded-3xl bg-gray-action hover:text-text-ac hover:scale-103 transition"
          onClick={() => navigate(`/`)}
        >
          Trang chủ
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* --- Sidebar Desktop (y nguyên class gốc) --- */}
      <div className="h-[calc(100vh-32px)] hidden md:col-span-4 lg:col-span-3 m-4 rounded-3xl shadow-lg md:flex flex-col  bg-white">
        {SidebarContent()}
      </div>

      {/* --- Sidebar Mobile (overlay dạng fixed) --- */}
      {isSlideBarOpen && (
        <>
          <div
            className="fixed inset-0 bg-white/10 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsSlideBarOpen(false)}
          />
          <div
            className={clsx(
              "absolute top-4 left-2.5 z-50 h-[calc(100vh-32px)] w-[70%] max-w-[280px] shadow-3xl rounded-3xl transition-transform duration-300 md:hidden bg-white border ",
              isSlideBarOpen ? "translate-x-0" : "-translate-x-full"
            )}
          >
            <CloseButton
              onClick={() => setIsSlideBarOpen(false)}
              className="absolute top-2 right-2 z-50"
            />
            {SidebarContent()}
          </div>
        </>
      )}
    </>
  );
};

export const AdminLayout = () => {
  const { adminId } = useParams();
  const { current } = useSelector((state) => state.user);
  const [searchTerm, setSearchTerm] = useState("");
  const image = logoGoCart;
  const name = `Quản lý hệ thống ${APP_INFO.NAME}`;
  const [openMenus, setOpenMenus] = useState([]);
  const [isSlideBarOpen, setIsSlideBarOpen] = useState(false);
  const [isShowSearchBox, setIsShowSearchBox] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const searchInputRef = useRef(null);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(location.search);
    if (searchTerm.trim()) params.set("s", searchTerm.trim());
    else params.delete("s");
    navigate(`${location.pathname}?${params.toString()}`);
  };

  useEffect(() => {
    if (isShowSearchBox) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isShowSearchBox]);

  const dataButtons = [
    {
      icon: <MdOutlineDashboard size={20} />,
      label: "Tổng quan",
      to: `/${path.ADMIN}/${adminId}/${path.A_DASHBOARD}`,
    },
    {
      icon: <MdOutlineAccountBalanceWallet size={20} />,
      label: "Tài chính",
      to: `/${path.ADMIN}/${adminId}/${path.A_BALANCE}`,
    },
    {
      icon: <HiOutlineUserCircle size={20} />,
      label: "Quản lý tài khoản",
      children: [
        {
          label: "Tất cả tài khoản",
          to: `/${path.ADMIN}/${adminId}/${path.A_MANAGE_USERS}`,
        },
        {
          label: "Tài khoản đã khóa",
          to: `/${path.ADMIN}/${adminId}/${path.A_MANAGE_BLOCK_USERS}`,
        },
      ],
    },
    {
      icon: <HiOutlineBuildingStorefront size={22} />,
      label: "Quản lý shop",
      children: [
        {
          label: "Tất cả shop",
          to: `/${path.ADMIN}/${adminId}/${path.A_MANAGE_SHOPS}`,
        },
        {
          label: "Shop đã khóa",
          to: `/${path.ADMIN}/${adminId}/${path.A_MANAGE_BLOCK_SHOPS}`,
        },
      ],
    },
    {
      icon: <FiBox size={20} />,
      label: "Phê duyệt sản phẩm",
      to: `/${path.ADMIN}/${adminId}/${path.A_PRODUCT_APPROVAL}`,
    },
    {
      icon: <PiTicket size={20} />,
      label: "Quản lý voucher",
      to: `/${path.ADMIN}/${adminId}/${path.A_MANAGE_COUPONS}`,
    },
    {
      icon: (
        <div
          className="inline-flex items-center justify-center w-5 h-4 text-[5px] font-bold 
      rounded border border-black text-gray-700 bg-white p-0.5"
        >
          BRAND
        </div>
      ),
      label: "Quản lý thương hiệu",
      to: `/${path.ADMIN}/${adminId}/${path.A_MANAGE_BRANDS}`,
    },

    {
      icon: <MdOutlineCategory size={20} />,
      label: "Quản lý danh mục",
      to: `/${path.ADMIN}/${adminId}/${path.A_MANAGE_CATEGORY}`,
    },
    {
      icon: <CiBadgeDollar size={22} />,
      label: "Quản lý gói dịch vụ",
      to: `/${path.ADMIN}/${adminId}/${path.A_MANAGE_SERVICE_PLAN}`,
    },
  ];

  return (
    <div className="h-[100vh] w-full grid grid-cols-12 bg-app-bg gap-x-4 animate-fadeIn">
      <Sidebar
        image={image}
        name={name}
        dataButtons={dataButtons}
        openMenus={openMenus}
        setOpenMenus={setOpenMenus}
        isSlideBarOpen={isSlideBarOpen}
        setIsSlideBarOpen={setIsSlideBarOpen}
        navigate={navigate}
        to={`/${path.ADMIN}/${adminId}/${path.A_DASHBOARD}`}
      />

      {/* --- Nội dung bên phải (giữ nguyên sticky header + grid layout) --- */}
      <div className="col-span-12 md:col-span-8 lg:col-span-9 ml-4 md:ml-0 mr-4 my-4 px-4 rounded-3xl overflow-y-auto scroll-hidden">
        {/* Thanh chức năng trên cùng */}
        <div className="sticky top-0 z-10 mb-4 flex justify-between items-center bg-app-bg/5 backdrop-blur-sm gap-2 rounded-3xl">
          <div className="flex gap-2">
            <button
              className="md:hidden inline-flex items-center gap-1 p-2 rounded-2xl border shadow glass"
              onClick={() => setIsSlideBarOpen(true)}
              aria-label="Mở bảng điều khiển"
            >
              <MdOutlineMenu size={18} className="text-gray-700" />
            </button>
            <div className="glass shadow-md py-2 px-2 rounded-3xl border z-10 flex justify-center items-center">
              <Breadcrumb />
            </div>
          </div>

          <button
            className={`${
              isShowSearchBox ? "hidden" : "inline-flex"
            } items-center gap-1 p-2  rounded-full border shadow glass`}
            onClick={() => setIsShowSearchBox((prev) => !prev)}
            aria-label="Mở thanh tìm kiếm"
          >
            <AiOutlineSearch size={22} />
          </button>

          {/* Thanh tìm kiếm giữ nguyên vị trí và border */}
          {isShowSearchBox && (
            <div className="glass border rounded-3xl relative flex px-2 py-1.5 w-full lg:w-[400px] focus-within:border-[2px] focus-within:border-input-fc transition-all duration-200 shadow-md z-10">
              <form
                onSubmit={handleSearchSubmit}
                className="flex items-center w-full"
              >
                <AiOutlineSearch size={22} />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm theo sản phẩm, danh mục, mã đơn hàng, ..."
                  className="ml-3 bg-transparent w-full text-description border-none focus:outline-none"
                />
              </form>
              <button
                type="button"
                className="absolute inset-y-0 right-5 top-1/2 -translate-y-1/2 
                           flex p-0.5 border w-5 h-5 bg-black/60 shadow-md rounded-full 
                           items-center justify-center text-white"
                onClick={() => {
                  setSearchTerm("");
                  const params = new URLSearchParams(location.search);
                  params.delete("s");
                  navigate(`${location.pathname}?${params.toString()}`, {
                    replace: true,
                  });
                  setIsShowSearchBox(false);
                }}
              >
                <AiOutlineClose size={20} />
              </button>
            </div>
          )}
        </div>

        <Outlet />
      </div>
    </div>
  );
};
