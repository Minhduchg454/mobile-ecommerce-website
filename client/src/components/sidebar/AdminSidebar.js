import React from "react";
import { SidebarLayout } from "../../components";
import logo from "assets/logo-removebg-preview-Photoroom.png";
import { adminSidebar } from "ultils/contants";

const AdminSidebar = () => {
  return (
    <SidebarLayout
      logo={logo}
      title="QUẢN LÝ CỬA HÀNG"
      sidebarItems={adminSidebar}
      showBackHome={true}
    />
  );
};

export default AdminSidebar;
