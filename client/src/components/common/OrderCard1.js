import React from "react";
import { useNavigate } from "react-router-dom"; // 1. Import hook
import { formatMoney } from "ultils/helpers";
import {
  AiOutlineShop,
  AiOutlineClockCircle,
  AiOutlineCheckCircle,
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
  const navigate = useNavigate(); // 2. Khởi tạo hook navigate

  if (!order || !currentUser) return null;

  const status = order.orderStatusId?.orderStatusName || "Pending";
  const statusInfo = statusConfig[status] || statusConfig.Pending;
  const totalItems =
    order.items?.reduce((sum, item) => sum + item.odQuantity, 0) || 0;
  const roles = currentUser.roles || [];
  const userId = currentUser._id;

  return (
    <div className="bg-white rounded-3xl shadow-lg border border-gray-200 overflow-hidden max-w-2xl ">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 flex items-center justify-between gap-1 border-b">
        <div className="flex items-center gap-3">
          <div>
            <p className="font-semibold text-gray-800 text-sm md:text-base">
              {order.shopId?.shopName || "Cửa hàng"}
            </p>
            <p
              className="text-xs text-gray-600 cursor-pointer"
              title={order._id} // Di chuột vào sẽ hiện full ID
            >
              #{order._id?.slice(0, 10)}...
            </p>
          </div>
        </div>
        <div
          className={`flex items-center gap-2 font-semibold ${statusInfo.color}`}
        >
          {statusInfo.icon}
          <span className="text-xs md:text-sm">{statusInfo.text}</span>
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
              {/* Giữ nguyên fix object-contain/cover ở đây nếu bạn đã sửa trước đó */}
              <div className="w-20 h-20 rounded-lg overflow-hidden border bg-gray-50 flex items-center justify-center shrink-0">
                <img
                  src={thumb || "/placeholder.png"}
                  alt={product.productName}
                  onError={(e) => (e.currentTarget.src = "/no-image.png")}
                  className="w-full h-full object-contain"
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

      {/* [CẬP NHẬT] NÚT HÀNH ĐỘNG DÙNG NAVIGATE */}
      <div className="px-4 py-3 bg-white border-t flex items-center justify-end gap-3 flex-wrap">
        {/* Nút cho Khách hàng */}
        {roles.includes("customer") && (
          <button
            type="button"
            onClick={() =>
              navigate(
                `/${path.CUSTOMER}/${userId}/${path.C_ORDER}/${order._id}`
              )
            }
            className="inline-flex items-center px-3 py-1 bg-white text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition shadow-sm text-sm"
          >
            Xem đơn hàng
          </button>
        )}

        {/* Nút cho Chủ shop */}
        {roles.includes("shop") && (
          <button
            type="button"
            onClick={() =>
              navigate(`/${path.SELLER}/${userId}/${path.S_ORDER}/${order._id}`)
            }
            className="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition shadow-sm text-sm"
          >
            Quản lý đơn
          </button>
        )}

        {/* Nút cho Admin */}
        {roles.includes("admin") && (
          <button
            type="button"
            onClick={() => navigate(`/admin/orders/${order._id}`)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition shadow-sm text-sm"
          >
            <AiOutlineCheckCircle />
            Xem (Admin)
          </button>
        )}
      </div>
    </div>
  );
};
