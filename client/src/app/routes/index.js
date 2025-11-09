import { createBrowserRouter } from "react-router-dom";
import path from "../../ultils/path";
import { useNavigate } from "react-router-dom";

// Layouts
import { AuthLayout } from "../layout/authLayout";
import { SiteLayout } from "../layout/siteLayout";
import { CustomerLayout } from "../layout/customerLayout";
import { ShopLayout } from "../layout/shopLayout";
import { AdminLayout } from "../layout/adminLayout";

//Guard
import { CustomerGuard, ShopGuard, AdminGuard } from "./guard";

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
  // Auth
  {
    element: <AuthLayout />,
    children: [
      { path: `/${path.REGISTER}`, element: <RegisterForm /> },
      { path: `/${path.LOGIN}`, element: <LoginForm /> },
    ],
  },

  // Public
  {
    element: <SiteLayout />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: `/${path.PRODUCTS}`, element: <ListProductsPage /> },
      { path: `/${path.PRODUCTS}/:pvId`, element: <DetailProductPage /> },
      { path: `/${path.SHOP}/:shopId`, element: <ShopPage /> },
      { path: `/${path.CHECKOUT}`, element: <CheckOutPage /> },
      { path: `/${path.CHECKOUT}/result`, element: <PaymentResult /> },
      { path: `/${path.CART}`, element: <CartsPage /> },
      { path: `/${path.WISHLIST}`, element: <WishListPage /> },
      { path: `/${path.REGISTER_SHOP}`, element: <RegisterShopForm /> },
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
      { path: path.C_SUCCEEDED_ORDER, element: <OrderSucceededCustomerPage /> },
      { path: `${path.C_ORDER}/:orderId`, element: <OrderDetailCustomer /> },
      { path: path.C_MANAGESELLER, element: <ManageShopPage /> },
      notFoundRoute,
    ],
  },

  // Shop
  {
    path: `/${path.SELLER}/:shopId`,
    element: <ShopGuard />,
    children: [
      { path: path.S_DASHBOARD, element: <DashBoardShopPage /> },
      { path: path.S_PROFILE, element: <InformationShopPage /> },
      { path: path.S_MANAGE_COUPONS, element: <CouponShopManagePage /> },
      { path: path.S_ADDRESS, element: <AddressShopManagePage /> },
      { path: path.S_ORDER, element: <OrdersShopManagePage /> },
      { path: `${path.S_ORDER}/:orderId`, element: <OrderDetailShop /> },
      { path: path.S_CANCEL_ORDER, element: <OrdersCancelShopManagePage /> },
      { path: path.S_MANAGE_CATEGORIES, element: <CategoryShopManagePage /> },

      {
        path: path.S_MANAGE_PRODUCTS,
        element: <ProductsShopManagePage />,
      },
      {
        path: path.S_CREATE_PRODUCT,
        element: <CreateProductsShopPage />,
      },
      notFoundRoute,
    ],
  },

  // Admin
  {
    path: `/${path.ADMIN}/:adminId`,
    element: <AdminGuard />,
    children: [
      { path: path.A_MANAGE_USERS, element: <UsersManagePage /> },
      { path: path.A_MANAGE_BLOCK_USERS, element: <UsersBlockManagePage /> },
      { path: path.A_MANAGE_COUPONS, element: <CouponManagePage /> },
      { path: path.A_MANAGE_CATEGORY, element: <CategoryManagePage /> },
      { path: path.A_MANAGE_BRANDS, element: <BrandsManagePage /> },
      { path: path.A_MANAGE_SERVICE_PLAN, element: <ServicePlansManagePage /> },
      { path: path.A_MANAGE_SHOPS, element: <ShopManagePage /> },
      { path: path.A_MANAGE_BLOCK_SHOPS, element: <ShopBlockManagePage /> },
      { path: path.A_DASHBOARD, element: <DashBoardAdminPage /> },
      notFoundRoute,
    ],
  },
]);

export default router;
