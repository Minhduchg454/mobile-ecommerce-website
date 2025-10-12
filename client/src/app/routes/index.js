import { createBrowserRouter } from "react-router-dom";
import path from "../../ultils/path";

// Layouts
import { AuthLayout } from "../layout/authLayout";
import { SiteLayout } from "../layout/siteLayout";
import { CustomerLayout } from "../layout/customerLayout";

// Pages
import {
  HomePage,
  ListProductsPage,
  DetailProductPage,
  ShopPage,
  InformationUserPage,
  UserAddress,
  CustomerOrders,
} from "../../pages";
import { LoginForm } from "../../features/auth/loginForm";
import { RegisterForm } from "../../features/auth/registerForm";

export const router = createBrowserRouter([
  // Public
  {
    element: <SiteLayout />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/products", element: <ListProductsPage /> },
      { path: "/products/:pvId", element: <DetailProductPage /> },
      { path: "/shops/:shopId", element: <ShopPage /> },
    ],
  },

  // Auth
  {
    element: <AuthLayout />,
    children: [
      { path: `/${path.REGISTER}`, element: <RegisterForm /> },
      { path: `/${path.LOGIN}`, element: <LoginForm /> },
    ],
  },

  // Customer (cha–con)
  {
    path: `/${path.CUSTOMER}/:customerId`,
    element: <CustomerLayout />,
    children: [
      { path: path.C_PROFILE, element: <InformationUserPage /> },
      { path: path.C_ADDRESS, element: <UserAddress /> },
      { path: path.C_ORDER, element: <CustomerOrders /> },
    ],
  },
]);

export default router;
