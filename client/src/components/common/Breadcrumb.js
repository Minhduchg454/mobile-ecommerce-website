import React, { memo } from "react";
import useBreadcrumbs from "use-react-router-breadcrumbs";
import { Link } from "react-router-dom";
import { IoIosArrowForward } from "react-icons/io";
import path from "ultils/path";

const Breadcrumb = ({ title, category, productName }) => {
  const routes = [
    { path: "/", breadcrumb: "Trang chủ" },
    { path: "/products", breadcrumb: "Sản phẩm" },

    { path: "/products/:pvId", breadcrumb: productName },
    { path: "/:category", breadcrumb: category },

    { path: "/:category/:pid/:title", breadcrumb: title },
    //Customer
    { path: "/customer/:customerId", breadcrumb: "Người dùng" },
    { path: "/customer/:customerId/profile", breadcrumb: "Hồ sơ" },
    { path: "/customer/:customerId/addreeses", breadcrumb: "Địa chỉ" },
    { path: "/customer/:customerId/orders", breadcrumb: "Đơn hàng" },
    //Shop
    { path: "/seller/:shopId", breadcrumb: "Cửa hàng" },
    { path: "/seller/:shopId/dashboard", breadcrumb: "Tổng quan" },
    {
      path: `//${path.SELLER}/:shopId/${path.S_BALANCE}`,
      breadcrumb: "Tài chính",
    },
    { path: "/seller/:shopId/manage-orders", breadcrumb: "Tất cả đơn hàng" },
    {
      path: `/${path.SELLER}/:shopId/${path.S_CANCEL_ORDER}`,
      breadcrumb: "Đơn hàng đã hủy",
    },
    {
      path: `/${path.SELLER}/:shopId/${path.S_MANAGE_PRODUCTS}`,
      breadcrumb: "Tất cả sản phẩm",
    },
    {
      path: `/${path.SELLER}/:shopId/${path.S_CREATE_PRODUCT}`,
      breadcrumb: "Thêm sản phẩm",
    },
    {
      path: `/${path.SELLER}/:shopId/${path.S_MANAGE_CATEGORIES}`,
      breadcrumb: "Quản lí danh mục",
    },
    {
      path: `/${path.SELLER}/:shopId/${path.S_ADDRESS}`,
      breadcrumb: "Địa chỉ lấy hàng",
    },
    {
      path: `/${path.SELLER}/:shopId/${path.S_PROFILE}`,
      breadcrumb: "Hồ sơ cửa hàng",
    },
    {
      path: `/${path.SELLER}/:shopId/${path.S_MANAGE_COUPONS}`,
      breadcrumb: "Quản lý voucher",
    },
    //admin
    { path: "/admin/:adminId", breadcrumb: "Admin" },
    {
      path: `/${path.ADMIN}/:adminId/${path.A_DASHBOARD}`,
      breadcrumb: "Tổng quan",
    },
    {
      path: `/${path.ADMIN}/:adminId/${path.A_BALANCE}`,
      breadcrumb: "Tài chính",
    },
    {
      path: `/${path.ADMIN}/:adminId/${path.A_MANAGE_USERS}`,
      breadcrumb: "Tất cả tài khoản",
    },
    {
      path: `/${path.ADMIN}/:adminId/${path.A_MANAGE_BLOCK_USERS}`,
      breadcrumb: "Tài khoản đã khóa",
    },
    {
      path: `/${path.ADMIN}/:adminId/${path.A_MANAGE_SHOPS}`,
      breadcrumb: "Tất cả shop",
    },
    {
      path: `/${path.ADMIN}/:adminId/${path.A_MANAGE_BLOCK_SHOPS}`,
      breadcrumb: "Shop đã khóa",
    },
    {
      path: `/${path.ADMIN}/:adminId/${path.A_PRODUCT_APPROVAL}`,
      breadcrumb: "Phê duyệt sản phẩm",
    },
    {
      path: `/${path.ADMIN}/:adminId/${path.A_MANAGE_COUPONS}`,
      breadcrumb: "Quản lý voucher",
    },
    {
      path: `/${path.ADMIN}/:adminId/${path.A_MANAGE_BRANDS}`,
      breadcrumb: "Quản lý thương hiệu",
    },
    {
      path: `/${path.ADMIN}/:adminId/${path.A_MANAGE_CATEGORY}`,
      breadcrumb: "Quản lý danh mục",
    },
    {
      path: `/${path.ADMIN}/:adminId/${path.A_MANAGE_SERVICE_PLAN}`,
      breadcrumb: "Quản lý gói dịch vụ",
    },
  ];

  const breadcrumbs = useBreadcrumbs(routes, { disableDefaults: true });
  return (
    <div className="text-description flex items-center gap-1">
      {breadcrumbs.map(({ match, breadcrumb }, index, self) => {
        const { customerId, shopId, adminId } = match.params || {};

        const to =
          match.route?.path === "/customer/:customerId"
            ? `/customer/${customerId}/profile`
            : match.route?.path === "/seller/:shopId"
            ? `/seller/${shopId}/dashboard`
            : // Xử lý chuyển hướng cho route gốc của Admin
            match.route?.path === "/admin/:adminId"
            ? `/${path.ADMIN}/${adminId}/${path.A_DASHBOARD}` // Chuyển hướng về Dashboard
            : match.pathname;

        return (
          <Link
            key={match.pathname}
            to={to}
            className="flex gap-1 items-center hover:text-cyan-700"
          >
            <span className="capitalize truncate max-w-[300px] inline-block align-middle">
              {breadcrumb}
            </span>
            {index !== self.length - 1 && <IoIosArrowForward />}
          </Link>
        );
      })}
    </div>
  );
};

export default memo(Breadcrumb);
