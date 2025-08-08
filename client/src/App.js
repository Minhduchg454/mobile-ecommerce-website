import React, { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import Chatbot from "chatbot/Chatbot";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import {
  Login,
  Home,
  Public,
  FAQ,
  Services,
  DetailProduct1,
  Products,
  ResetPassword,
} from "pages/public";
import {
  AdminLayout,
  ManageOrder,
  ManageProducts,
  ManageUser,
  CreateProducts,
  Dashboard,
  CreateVariation,
  ManageProductCategory,
  ManageBrands,
  ManageCoupons,
} from "pages/admin";
import {
  MemberLayout,
  Personal,
  History,
  Wishlist,
  Checkout,
  PersonalAddress,
} from "pages/member";
import path from "ultils/path";
import { useDispatch, useSelector } from "react-redux";
import { ToastContainer, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Cart, Modal } from "components";
import { showCart, showWishlist } from "store/app/appSlice";
import { GoogleOAuthProvider } from "@react-oauth/google";

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
        <Routes>
          <Route path={path.PUBLIC} element={<Public />}>
            <Route index element={<Home />} />
            <Route path={path.HOME} element={<Home />} />

            <Route
              path={path.DETAIL_PRODUCT__CATEGORY__PID__TITLE}
              element={<DetailProduct1 />}
            />
            <Route path={path.FAQ} element={<FAQ />} />
            <Route path={path.OUR_SERVICES} element={<Services />} />
            <Route path={path.PRODUCTS__CATEGORY} element={<Products />} />
            <Route path={path.SEARCH_HOME} element={<Products />} />
            <Route path={path.RESET_PASSWORD} element={<ResetPassword />} />
          </Route>
          <Route path={path.ADMIN} element={<AdminLayout />}>
            <Route path={path.DASHBOARD} element={<Dashboard />} />
            <Route path={path.MANAGE_ORDER} element={<ManageOrder />} />
            <Route path={path.MANAGE_PRODUCTS} element={<ManageProducts />} />
            <Route path={path.MANAGE_USER} element={<ManageUser />} />
            <Route path={path.CREATE_PRODUCTS} element={<CreateProducts />} />

            <Route path={path.CREATE_VARIATION} element={<CreateVariation />} />
            <Route
              path={path.MANAGE_PRODUCTS_CATEGORIES}
              element={<ManageProductCategory />}
            />
            <Route path={path.MANAGE_BRANDS} element={<ManageBrands />} />
            <Route path={path.MANAGE_COUPONS} element={<ManageCoupons />} />
          </Route>
          <Route path={path.MEMBER} element={<MemberLayout />}>
            <Route path={path.PERSONAL} element={<Personal />} />
            <Route path={path.WISHLIST} element={<Wishlist />} />
            <Route path={path.HISTORY} element={<History />} />
            <Route path={path.ADDRESS} element={<PersonalAddress />} />
          </Route>
          <Route path={path.CHECKOUT} element={<Checkout />} />
          <Route path={path.LOGIN} element={<Login />} />
        </Routes>
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
