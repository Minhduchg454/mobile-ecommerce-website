import React, { useEffect } from "react";
import Chatbot from "chatbot/Chatbot";

import { useDispatch, useSelector } from "react-redux";
import { ToastContainer, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Modal, GlobalGlassAlert } from "components";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { RouterProvider } from "react-router-dom";
import { router } from "./app/routes";

function App() {
  const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
  const { isShowModal, modalChildren } = useSelector((state) => state.app);

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div className="font-jp bg-[#F5F5F7]">
        {isShowModal && <Modal>{modalChildren}</Modal>}
        <GlobalGlassAlert />
        <RouterProvider router={router} />
        <ToastContainer
          position="top-center"
          autoClose={2000}
          hideProgressBar={true}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          transition={Bounce}
          toastClassName={() =>
            "flex items-center justify-between backdrop-blur-lg bg-white/70 text-black rounded-xl shadow-md p-2"
          }
        />
        <Chatbot />
      </div>
    </GoogleOAuthProvider>
  );
}

export default App;
