import { createBrowserRouter } from "react-router-dom";
import path from "../../ultils/path";

// Layouts

import { SiteLayout } from "../layout/siteLayout";
import { RootLayout } from "../layout/rootLayout";

//Guard
import { CustomerGuard, ShopGuard, AdminGuard, AuthGuard } from "./guard";

// Pages
import {
  HomePage,
  ListProductsPage,
  DetailProductPage,
  ShopPage,
  InformationUserPage,
  UserAddress,
  CustomerOrdersPage,
  OrderSucceededCustomerPage,
  CheckOutPage,
  WishListPage,
  CartsPage,
  PaymentResult,
  ManageShopPage,
  InformationShopPage,
  CategoryShopManagePage,
  ProductsShopManagePage,
  CreateProductsShopPage,
  OrdersShopManagePage,
  OrdersCancelShopManagePage,
  DashBoardShopPage,
  AddressShopManagePage,
  CouponShopManagePage,
  UsersBlockManagePage,
  UsersManagePage,
  NotFoundPage,
  CouponManagePage,
  CategoryManagePage,
  BrandsManagePage,
  ServicePlansManagePage,
  ShopManagePage,
  ShopBlockManagePage,
  DashBoardAdminPage,
  RegisterShopResultPage,
  RegisterServicePlanPage,
  ProductApprovalPage,
  NotificationPage,
  AdminBalancePage,
  CustomerBalancePage,
  ShopBalancePage,
  ChatPage,
} from "../../pages";

import {
  LoginForm,
  RegisterForm,
  OrderDetailCustomer,
  OrderDetailShop,
  RegisterShopForm,
} from "../../features/";
const notFoundRoute = { path: "*", element: <NotFoundPage /> };

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />, // <--- BỌC TẤT CẢ VÀO ĐÂY
    errorElement: <NotFoundPage />, // Xử lý lỗi chung nếu muốn
    children: [
      // --- Bê nguyên toàn bộ mảng route cũ của bạn vào trong children này ---

      // Auth
      {
        element: <AuthGuard />,
        children: [
          { path: `/${path.REGISTER}`, element: <RegisterForm /> },
          { path: `/${path.LOGIN}`, element: <LoginForm /> },
        ],
      },

      // Public
      {
        element: <SiteLayout />,
        children: [
          { index: true, element: <HomePage /> }, // Lưu ý: path="/" đổi thành index: true
          { path: `/${path.PRODUCTS}`, element: <ListProductsPage /> },
          { path: `/${path.SHOP}/:shopId`, element: <ShopPage /> },
          { path: `/${path.PRODUCTS}/:pvId`, element: <DetailProductPage /> },
          { path: `/${path.CHECKOUT}`, element: <CheckOutPage /> },
          { path: `/${path.CHECKOUT}/result`, element: <PaymentResult /> },
          { path: `/${path.CART}`, element: <CartsPage /> },
          { path: `/${path.WISHLIST}`, element: <WishListPage /> },
          { path: `/${path.NOTIFICATION}`, element: <NotificationPage /> },
          { path: `/${path.CHAT}`, element: <ChatPage /> },
          { path: `/${path.REGISTER_SHOP}`, element: <RegisterShopForm /> },
          {
            path: `/${path.REGISTER_SHOP}/result`,
            element: <RegisterShopResultPage />,
          },
          {
            path: `/${path.REGISTER_SERVICE_PLAN}/result`,
            element: <RegisterServicePlanPage />,
          },
          notFoundRoute,
        ],
      },

      // Customer
      {
        path: `/${path.CUSTOMER}/:customerId`,
        element: <CustomerGuard />,
        children: [
          { path: path.C_PROFILE, element: <InformationUserPage /> },
          { path: path.C_ADDRESS, element: <UserAddress /> },
          { path: path.C_ORDER, element: <CustomerOrdersPage /> },
          {
            path: path.C_SUCCEEDED_ORDER,
            element: <OrderSucceededCustomerPage />,
          },
          {
            path: `${path.C_ORDER}/:orderId`,
            element: <OrderDetailCustomer />,
          },
          { path: path.C_MANAGESELLER, element: <ManageShopPage /> },
          { path: path.C_BALANCE, element: <CustomerBalancePage /> },
          notFoundRoute,
        ],
      },

      // Shop
      {
        path: `/${path.SELLER}/:shopId`,
        element: <ShopGuard />,
        children: [
          // ... giữ nguyên các route shop ...
          { path: path.S_DASHBOARD, element: <DashBoardShopPage /> },
          { path: path.S_PROFILE, element: <InformationShopPage /> },
          { path: path.S_MANAGE_COUPONS, element: <CouponShopManagePage /> },
          { path: path.S_ADDRESS, element: <AddressShopManagePage /> },
          { path: path.S_ORDER, element: <OrdersShopManagePage /> },
          { path: `${path.S_ORDER}/:orderId`, element: <OrderDetailShop /> },
          {
            path: path.S_CANCEL_ORDER,
            element: <OrdersCancelShopManagePage />,
          },
          {
            path: path.S_MANAGE_CATEGORIES,
            element: <CategoryShopManagePage />,
          },
          { path: path.S_BALANCE, element: <ShopBalancePage /> },
          { path: path.S_MANAGE_PRODUCTS, element: <ProductsShopManagePage /> },
          { path: path.S_CREATE_PRODUCT, element: <CreateProductsShopPage /> },
          notFoundRoute,
        ],
      },

      // Admin
      {
        path: `/${path.ADMIN}/:adminId`,
        element: <AdminGuard />,
        children: [
          // ... giữ nguyên các route admin ...
          { path: path.A_MANAGE_USERS, element: <UsersManagePage /> },
          {
            path: path.A_MANAGE_BLOCK_USERS,
            element: <UsersBlockManagePage />,
          },
          { path: path.A_MANAGE_COUPONS, element: <CouponManagePage /> },
          { path: path.A_MANAGE_CATEGORY, element: <CategoryManagePage /> },
          { path: path.A_MANAGE_BRANDS, element: <BrandsManagePage /> },
          {
            path: path.A_MANAGE_SERVICE_PLAN,
            element: <ServicePlansManagePage />,
          },
          { path: path.A_MANAGE_SHOPS, element: <ShopManagePage /> },
          { path: path.A_MANAGE_BLOCK_SHOPS, element: <ShopBlockManagePage /> },
          { path: path.A_DASHBOARD, element: <DashBoardAdminPage /> },
          { path: path.A_PRODUCT_APPROVAL, element: <ProductApprovalPage /> },
          { path: path.A_BALANCE, element: <AdminBalancePage /> },
          notFoundRoute,
        ],
      },
    ],
  },
]);

export default router;
