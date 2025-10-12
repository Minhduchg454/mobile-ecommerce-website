import React, { memo } from "react";
import useBreadcrumbs from "use-react-router-breadcrumbs";
import { Link } from "react-router-dom";
import { IoIosArrowForward } from "react-icons/io";

const Breadcrumb = ({ title, category, categoryShop, productName }) => {
  const routes = [
    { path: "/", breadcrumb: "Trang chủ" },
    { path: "/products", breadcrumb: "Sản phẩm" },

    { path: "/customer/:customerId", breadcrumb: "Người dùng" },
    { path: "/customer/:customerId/profile", breadcrumb: "Hồ sơ" },
    { path: "/customer/:customerId/addreeses", breadcrumb: "Địa chỉ" },
    { path: "/customer/:customerId/orders", breadcrumb: "Đơn hàng" },
    { path: "/products/:pvId", breadcrumb: productName },
    { path: "/:category", breadcrumb: category },

    { path: "/:category/:pid/:title", breadcrumb: title },
  ];

  const breadcrumbs = useBreadcrumbs(routes, { disableDefaults: true });
  return (
    <div className="text-description flex items-center gap-1">
      {breadcrumbs.map(({ match, breadcrumb }, index, self) => {
        const { customerId } = match.params || {};

        // Nếu crumb là "Người dùng" → trỏ tới /customer/:id/profile
        const to =
          match.route?.path === "/customer/:customerId"
            ? `/customer/${customerId}/profile`
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
