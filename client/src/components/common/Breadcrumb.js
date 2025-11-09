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
  ];

  const breadcrumbs = useBreadcrumbs(routes, { disableDefaults: true });
  return (
    <div className="text-description flex items-center gap-1">
      {breadcrumbs.map(({ match, breadcrumb }, index, self) => {
        const { customerId, shopId } = match.params || {};

        const to =
          match.route?.path === "/customer/:customerId"
            ? `/customer/${customerId}/profile`
            : match.route?.path === "/seller/:shopId"
            ? `/seller/${shopId}/dashboard`
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
