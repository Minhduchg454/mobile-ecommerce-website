import React, { useEffect } from "react";
import Chatbot from "chatbot/Chatbot";
import { Wishlist } from "pages/member";
import { useDispatch, useSelector } from "react-redux";
import { ToastContainer, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Cart, Modal, GlobalGlassAlert } from "components";
import { showCart, showWishlist } from "store/app/appSlice";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { RouterProvider } from "react-router-dom";
import { router } from "./app/routes";

function App() {
  const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
  const dispatch = useDispatch();
  const { isShowModal, modalChildren, isShowCart, isShowWishlist } =
    useSelector((state) => state.app);

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div className="font-jp bg-[#F5F5F7]">
        {isShowWishlist && (
          <div
            onClick={() => dispatch(showWishlist())}
            className="fixed inset-0 z-50 backdrop-blur-md bg-black/30 flex justify-end shadow-md"
          >
            <Wishlist />
          </div>
        )}
        {isShowCart && (
          <div
            onClick={() => dispatch(showCart())}
            className="fixed inset-0 z-50 backdrop-blur-md bg-black/30 flex justify-end shadow-md"
          >
            <Cart />
          </div>
        )}
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
