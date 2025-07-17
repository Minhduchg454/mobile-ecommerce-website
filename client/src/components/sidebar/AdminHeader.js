import React from "react";
import { HiOutlineMenuAlt3 } from "react-icons/hi";

const AdminHeader = ({ title = "Trang quản trị", onToggleSidebar }) => {
  return (
    <div className="fixed top-0 left-0 right-0 h-[60px] bg-white z-40 shadow-md flex items-center px-4 md:pl-[260px] justify-between">
      <button className="text-2xl md:hidden" onClick={onToggleSidebar}>
        <HiOutlineMenuAlt3 />
      </button>
      <h1 className="text-lg font-semibold">{title}</h1>
      <div />
    </div>
  );
};

export default AdminHeader;
