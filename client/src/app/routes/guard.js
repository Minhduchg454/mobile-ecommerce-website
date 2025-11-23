// src/routes/guards.jsx
import React from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation, useParams } from "react-router-dom";
import path from "ultils/path";

import { CustomerLayout } from "../layout/customerLayout";
import { ShopLayout } from "../layout/shopLayout";
import { AdminLayout } from "../layout/adminLayout";
import { AuthLayout } from "../layout/authLayout";

const isTrue = (v) => v === true || v === "true";

// ===== Guard chung kiểm tra đăng nhập =====
const useAuth = () => {
  const { isLoggedIn, current } = useSelector((s) => s.user);
  const authed = isTrue(isLoggedIn) && current;
  return { authed, current };
};

// ========== PUBLIC GUARD ==========
export const AuthGuard = () => {
  const { authed, current } = useAuth();
  const location = useLocation();
  if (authed) {
    return <Navigate to={`/`} state={{ from: location }} replace />;
  }
  return <AuthLayout />;
};

// ========== CUSTOMER GUARD ==========
export const CustomerGuard = () => {
  const location = useLocation();
  const { customerId } = useParams();
  const { authed, current } = useAuth();

  // Chưa đăng nhập -> đá về login
  if (!authed) {
    return <Navigate to={`/`} state={{ from: location }} replace />;
  }

  if (current?.roles?.includes("admin")) {
    return <Navigate to="/" replace />;
  }
  if (!current?._id || current._id !== customerId) {
    return <Navigate to="/" replace />;
  }

  return <CustomerLayout />;
};

// ========== SHOP GUARD ==========
export const ShopGuard = () => {
  const location = useLocation();
  const { shopId } = useParams();
  const { authed, current } = useAuth();
  const isShop = current?.roles?.includes("shop");

  // Chưa login -> login
  if (!authed) {
    return (
      <Navigate to={`/${path.LOGIN}`} state={{ from: location }} replace />
    );
  }
  //Kiểm tra tra shop
  if (!isShop) {
    return <Navigate to={`/${path.HOME}`} replace />;
  }

  //Đúng vai trò
  if (!current?._id || current._id !== shopId) {
    return <Navigate to="/" replace />;
  }

  return <ShopLayout />;
};

// ========== ADMIN GUARD ==========
export const AdminGuard = () => {
  const location = useLocation();
  const { adminId } = useParams();
  const { authed, current } = useAuth();

  //Chưa login
  if (!authed) {
    return (
      <Navigate to={`/${path.LOGIN}`} state={{ from: location }} replace />
    );
  }

  //Đúng vai trò
  const isAdmin = current?.roles?.includes("admin");
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Đảm bảo adminId trên URL chính là mình
  if (!current?._id || current._id !== adminId) {
    return <Navigate to="/" replace />;
  }

  return <AdminLayout />;
};
