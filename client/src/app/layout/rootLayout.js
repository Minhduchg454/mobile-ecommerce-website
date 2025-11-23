// src/layouts/RootLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { Modal, GlobalGlassAlert } from "../../components";
import { ChatGlobal } from "../../features/chat/chatGlobal";

export const RootLayout = () => {
  const { isShowModal, modalChildren } = useSelector((state) => state.app);

  return (
    <div className="font-jp bg-[#F5F5F7] min-h-screen relative">
      {isShowModal && <Modal>{modalChildren}</Modal>}
      <GlobalGlassAlert />
      <Outlet />
      <ChatGlobal />
    </div>
  );
};
