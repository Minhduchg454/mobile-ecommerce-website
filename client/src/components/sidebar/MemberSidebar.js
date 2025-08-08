import React, { useState } from "react";
import { SidebarLayout } from "components";
import avatarDefault from "assets/avatarDefault.png";
import { memberSidebar } from "ultils/contants";
import { useSelector } from "react-redux";

const MemberSidebar = () => {
  const { current } = useSelector((state) => state.user);
  const avatar = current?.avatar || avatarDefault;
  const userName = current
    ? `${current.lastName} ${current.firstName}`
    : "TRANG THÀNH VIÊN";

  return (
    <SidebarLayout
      logo={avatar}
      title={userName}
      sidebarItems={memberSidebar}
      showBackHome={true}
      isAvatar={true}
    />
  );
};

export default MemberSidebar;
