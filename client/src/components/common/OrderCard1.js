import React from "react";
import { formatMoney } from "ultils/helpers";
import {
  AiOutlineShop,
  AiOutlineClockCircle,
  AiOutlineCheckCircle,
  AiOutlineEye,
} from "react-icons/ai";
import { MdLocalShipping } from "react-icons/md";
import path from "ultils/path";

const statusConfig = {
  Pending: {
    text: "Chờ xác nhận",
    color: "text-orange-600",
    icon: <AiOutlineClockCircle />,
  },
  Confirmed: {
    text: "Đã xác nhận",
    color: "text-blue-600",
    icon: <AiOutlineCheckCircle />,
  },
  Shipping: {
    text: "Đang giao hàng",
    color: "text-purple-600",
    icon: <MdLocalShipping />,
  },
  Delivered: {
    text: "Đã giao",
    color: "text-green-600",
    icon: <AiOutlineCheckCircle />,
  },
  Succeeded: {
    text: "Hoàn thành",
    color: "text-green-700",
    icon: <AiOutlineCheckCircle />,
  },
  Cancelled: {
    text: "Đã hủy",
    color: "text-red-600",
    icon: <AiOutlineClockCircle />,
  },
};

export const OrderCard1 = ({ order, currentUser }) => {
  if (!order || !currentUser) return null;

  const status = order.orderStatusId?.orderStatusName || "Pending";
  const statusInfo = statusConfig[status] || statusConfig.Pending;
  const totalItems =
    order.items?.reduce((sum, item) => sum + item.odQuantity, 0) || 0;
  const roles = currentUser.roles || [];
  const userId = currentUser._id;

  // --- ĐÃ XÓA KHỐI LOGIC CHỌN 1 LINK DUY NHẤT ---

  return (
    <div className="bg-white rounded-3xl shadow-lg border border-gray-200 overflow-hidden max-w-2xl ">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 flex items-center justify-between border-b">
        <div className="flex items-center gap-3">
          <div>
            <p className="font-semibold text-gray-800">
              {order.shopId?.shopName || "Cửa hàng"}
            </p>
            <p className="text-xs text-gray-600">#{order._id}</p>
          </div>
        </div>
        <div
          className={`flex items-center gap-2 font-semibold ${statusInfo.color}`}
        >
          {statusInfo.icon}
          <span>{statusInfo.text}</span>
        </div>
      </div>

      {/* Sản phẩm */}
      <div className="p-4 space-y-3">
        {order.items?.slice(0, 3).map((item, i) => {
          const product = item.productVariation?.productId || {};
          const pv = item.productVariation || {};
          const thumb = pv.pvImages?.[0];

          return (
            <div key={i} className="flex gap-4 pb-3 border-b last:border-0">
              <div className="w-20 h-20 rounded-lg overflow-hidden border bg-gray-50">
                <img
                  src={thumb || "/placeholder.png"}
                  alt={product.productName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-800 line-clamp-2 text-sm">
                  {product.productName}
                </h4>
                {pv.pvName && (
                  <p className="text-xs text-gray-500">
                    Phân loại: {pv.pvName}
                  </p>
                )}
                <div className="flex justify-between mt-1">
                  <span className="text-sm font-semibold text-red-600">
                    {formatMoney(item.odPrice)} đ
                  </span>
                  <span className="text-xs text-gray-500">
                    x{item.odQuantity}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        {order.items?.length > 3 && (
          <p className="text-center text-sm text-gray-500">
            + {order.items.length - 3} sản phẩm khác
          </p>
        )}
      </div>

      {/* Tổng tiền */}
      <div className="bg-gray-50 px-4 py-4 border-t flex justify-between items-center">
        <span className="text-gray-600 text-sm">
          Tổng ({totalItems} sản phẩm)
        </span>
        <span className="text-base font-bold text-red-600">
          {formatMoney(order.orderTotalPrice)} đ
        </span>
      </div>

      {/* [CẬP NHẬT] NÚT HÀNH ĐỘNG THEO VAI TRÒ */}
      <div className="px-4 py-3 bg-white border-t flex items-center justify-end gap-3 flex-wrap">
        {/* Nút cho Khách hàng */}
        {roles.includes("customer") && (
          <a
            href={`/${path.CUSTOMER}/${userId}/${path.C_ORDER}/${order._id}`}
            className="inline-flex items-center px-3 py-1 bg-white text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition shadow-sm text-sm"
          >
            Xem đơn hàng
          </a>
        )}

        {/* Nút cho Chủ shop */}
        {roles.includes("shop") && (
          <a
            href={`/${path.SELLER}/${userId}/${path.S_ORDER}/${order._id}`}
            className="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition shadow-sm text-sm"
          >
            Quản lý đơn
          </a>
        )}

        {/* Nút cho Admin */}
        {roles.includes("admin") && (
          <a
            href={`/admin/orders/${order._id}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition shadow-sm text-sm"
          >
            <AiOutlineCheckCircle />
            Xem (Admin)
          </a>
        )}
      </div>
    </div>
  );
};
