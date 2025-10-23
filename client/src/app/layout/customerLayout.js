import { Outlet, useParams, useNavigate, NavLink } from "react-router-dom";
import path from "ultils/path";
import {
  AiOutlineUser,
  AiOutlineHistory,
  AiOutlineSearch,
  AiOutlineClose,
} from "react-icons/ai";
import { MdLocationOn } from "react-icons/md";
import { useState } from "react";
import clsx from "clsx";
import { Breadcrumb } from "../../components";
import { useSelector } from "react-redux";
import defaultAvatar from "assets/avatarDefault.png";

export const CustomerLayout = () => {
  const { customerId } = useParams();
  const { current } = useSelector((state) => state.user);

  const dataButtons = [
    {
      icon: <AiOutlineUser size={20} />,
      label: "Hồ sơ",
      to: `/${path.CUSTOMER}/${customerId}/${path.C_PROFILE}`,
    },
    {
      icon: <MdLocationOn size={20} />,
      label: "Địa chỉ giao hàng",
      to: `/${path.CUSTOMER}/${customerId}/${path.C_ADDRESS}`,
    },
    {
      icon: <AiOutlineHistory size={20} />,
      label: "Đơn hàng",
      to: `/${path.CUSTOMER}/${customerId}/${path.C_ORDER}`,
    },
  ];

  const [selectedButton, setSelectedButton] = useState(dataButtons[0]);
  const navigate = useNavigate();

  return (
    <div className="h-[100vh] w-full grid grid-cols-12 bg-app-bg gap-x-4 animate-fadeIn">
      {/* SideBar */}
      <div className="hidden md:col-span-4 lg:col-span-3 m-4 glass rounded-3xl shadow-lg p-2 md:py-0 px-4 overflow-y-auto scroll-hidden  md:flex flex-col ">
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md pt-4 flex flex-col items-center justify-center">
          <div
            className="w-24 cursor-pointer aspect-square rounded-full overflow-hidden border z-10"
            onClick={() => {
              setSelectedButton(dataButtons[0]);
              navigate(`/${path.CUSTOMER}/${customerId}/${path.C_PROFILE}`);
            }}
          >
            <img
              src={current?.userAvatar || defaultAvatar}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = defaultAvatar;
              }}
              alt="avatar"
              className="w-full h-full object-cover "
            />
          </div>
          <p className="-mt-2 font-bold text-base border rounded-3xl p-2 shadow-md z-5">
            {current?.userLastName} {current?.userFirstName}
          </p>
        </div>

        <div className="w-full flex flex-col mt-4 flex-1 ">
          {dataButtons.map((b, i) => (
            <NavLink
              key={i}
              to={b.to} //Neu to trung voi duong dan hien tai that bat
              className={({ isActive }) =>
                clsx(
                  "hover:bg-sidebar-hv rounded-3xl px-3 py-1 text-left mb-2 block",
                  isActive && "text-sidebar-t-select bg-sidebar-bg-select"
                )
              }
            >
              <p className="text-sm md:text-lg inline-flex items-center gap-2">
                {b.icon}
                {b.label}
              </p>
            </NavLink>
          ))}
        </div>
        <div className="sticky bottom-0 z-10 backdrop-blur-md pb-4 md:bg-white/90 mt-auto">
          <button
            className="w-full px-3 py-1 font-bold border shadow-md rounded-3xl bg-gray-action hover:text-text-ac hover:scale-103 transition"
            onClick={() => navigate(`/`)}
          >
            Trang chủ
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="col-span-12 md:col-span-8 lg:col-span-9  ml-4 md:ml-0 mr-4 my-4  px-4 rounded-3xl overflow-y-auto scroll-hidden">
        {/* Cum chuc nang */}
        <div className="sticky top-0 z-10 mb-4 flex justify-between items-center bg-app-bg/5 backdrop-blur-sm  rounded-3xl ">
          {/* Duong dan */}
          <div className="glass shadow-md py-2 px-2 rounded-3xl border z-10 flex justify-center items-center">
            <Breadcrumb />
          </div>
          {/* Tim kiem */}
          <div className="glass border rounded-3xl relative flex px-2 py-1.5 w-full mx-2 lg:w-[400px] focus-within:border-[2px] focus-within:border-input-fc transition-all duration-200 shadow-md z-10">
            <button
              type="button"
              onClick={() => {}}
              className="flex items-center justify-center text-gray-600"
            >
              <AiOutlineSearch size={22} />
            </button>
            <input
              type="text"
              value={"Tìm sản phẩm"}
              onChange={(e) => {}}
              onKeyDown={(e) => e.key === "Enter"}
              placeholder="Tìm bất kì điều gì..."
              className="ml-3 bg-transparent w-full text-description border-none focus:outline-none"
            />

            <button
              type="button"
              onClick={{}}
              className="absolute inset-y-0 right-5 top-1/2 -translate-y-1/2 
                           flex p-0.5 border w-5 h-5 bg-black/60 shadow-md rounded-full 
                           items-center justify-center text-white"
            >
              <AiOutlineClose size={20} />
            </button>
          </div>
        </div>
        {/* Noi dung */}
        <Outlet />
      </div>
    </div>
  );
};
