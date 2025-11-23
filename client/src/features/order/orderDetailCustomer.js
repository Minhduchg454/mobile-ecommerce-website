// src/pages/orders/OrderDetailCustomer.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiGetOrders } from "../../services/order.api";
import { apiGetPayments } from "../../services/payment.api";
import moment from "moment";
import { formatMoney } from "ultils/helpers";
import { OrderProgressTimeline, CopyText } from "../../components";
import "moment/locale/vi"; // Nếu muốn hiển thị tiếng Việt (ngày, tháng...)
import { STATUS_BADGE } from "../../ultils/contants";
import path from "ultils/path";
import { AiOutlineExclamationCircle, AiOutlineCopy } from "react-icons/ai";

export const OrderDetailCustomer = () => {
  const { orderId, customerId } = useParams();
  const navigate = useNavigate();

  const [payment, setPayment] = useState(null);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const fetchAll = async () => {
      setLoading(true);
      setError("");

      try {
        // Chạy song song 2 API
        const [orderRes, paymentRes] = await Promise.all([
          apiGetOrders({ orderId }), // BE của bạn trả { success, data: [...] }?
          apiGetPayments({ orderId }), // BE trả { success, data: [...] }?
        ]);

        if (!mounted) return;

        // Gán order (ưu tiên mảng data)
        const orderData = orderRes?.data?.[0] || orderRes?.orders?.[0] || null;
        if (!orderRes?.success || !orderData) {
          setError(orderRes?.message || "Không thể tải chi tiết đơn hàng");
        } else {
          setOrder(orderData);
        }

        // Gán payment (nếu có)
        const payData =
          paymentRes?.data?.[0] || paymentRes?.payments?.[0] || null;
        if (paymentRes?.success && payData) setPayment(payData);
      } catch (e) {
        if (mounted) setError(e?.message || "Lỗi khi tải chi tiết đơn hàng");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchAll();
    return () => {
      mounted = false;
    };
  }, [orderId]);

  if (error) {
    return (
      <div className="p-4">
        <p className="text-red-600 mb-3">{error}</p>
        <button
          className="border rounded-2xl px-3 py-1"
          onClick={() => navigate(-1)}
        >
          Quay lại
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-4 text-gray-500">Đang tải chi tiết đơn hàng...</div>
    );
  }

  if (!order) {
    return <div className="p-4 text-gray-500">Không tìm thấy đơn hàng.</div>;
  }

  const statusName = order?.orderStatusId?.orderStatusName;

  const timelineTimestamps = {
    placedAt: order?.createdAt,
    paymentConfirmedAt: order?.paymentConfirmedAt,
    handedToCarrierAt: order?.handedToCarrierAt,
    deliveredAt: order?.deliveredAt,
    completedAt: statusName === "Succeeded" ? order?.orderDeliveryDate : null,
    cancelledAt: statusName === "Cancelled" ? order?.updatedAt : null,
  };
  const badge = STATUS_BADGE[statusName] || {
    label: "Không xác định",
    bg: "bg-gray-100",
    text: "text-gray-600",
  };

  const addr = order?.addressId;
  const addressUserName = addr?.addressUserName;
  const addressNumberPhone = addr?.addressNumberPhone;
  const addressLine = addr
    ? [
        addr.addressStreet,
        addr.addressWard,
        addr.addressDistrict,
        addr.addressCity,
        addr.addressCountry,
      ]
        .filter(Boolean)
        .join(", ")
    : "";

  return (
    <div className="w-full bg-white rounded-3xl md:p-4 p-2  animate-fadeIn">
      {/* Header */}
      <div className="flex justify-end items-center gap-2 mb-1">
        <div className="flex items-center gap-1">
          <p className="text-sm md:text-base">
            Mã đơn hàng: <span className="font-mono">{order._id}</span>
          </p>
          <CopyText text={order._id} />
        </div>
        <p>|</p>
        <p
          className={`text-sm md:text-base px-2 py-0.5 rounded-3xl whitespace-nowrap ${badge.bg} ${badge.text}`}
        >
          {badge.label}
        </p>
      </div>

      {/* Tiến trình đặt hàng */}
      {statusName !== "Cancelled" ? (
        <OrderProgressTimeline
          statusName={statusName}
          timestamps={timelineTimestamps}
          className="mb-4"
        />
      ) : (
        <div className="py-4">
          <p className="text-bold text-main text-xl font-bold">
            Đã hủy đơn hàng
          </p>
          <p>
            vào{" "}
            {order?.updatedAt
              ? moment(order.updatedAt).format("HH:mm DD-MM-YYYY")
              : "Không có thời gian"}
          </p>
        </div>
      )}

      {/* Địa chỉ */}
      {addr && (
        <div className="mb-3 text-sm md:text-base border-t border-b pt-3 pb-3">
          <div className="font-bold">Địa chỉ nhận hàng</div>
          {addressUserName && <span>{addressUserName}</span>}
          {" | "}
          {addressNumberPhone && <span>{addressNumberPhone}</span>}
          {addressLine && <p>{addressLine}</p>}
        </div>
      )}

      {/* Shop */}
      {order.shopId && (
        <div className="flex items-center justify-start gap-2 mb-3">
          <div className="relative">
            <img
              src={order.shopId.shopLogo || "/no-image.png"}
              alt=""
              className="w-10 h-10 rounded-full object-cover border cursor-pointer border-gray-300"
            />
            {order.shopId.shopIsOfficial && (
              <span className="border rounded-lg line-clamp-1 absolute -bottom-2 right-1/2 translate-x-1/2 bg-red-600 text-white py-0.5 px-1 text-[8px]">
                Mall
              </span>
            )}
          </div>

          <span
            className="font-bold max-w-[240px] truncate text-sm md:text-base"
            title={order.shopId.shopName}
          >
            {order.shopId.shopName}
          </span>
        </div>
      )}

      {/* Items */}
      <div className="space-y-3">
        {(order.items || []).map((it) => {
          const pv = it.productVariation || it.pvId;
          const product = pv?.productId;
          const thumb = pv?.pvImages?.[0];
          const isOnSale = product?.productDiscountPercent > 0;
          const name = product?.productName || "Sản phẩm";
          const pvName = pv?.pvName || "Phân loại";
          const qty = it.odQuantity ?? 1;
          const unitPrice = it.odPrice ?? pv?.pvPrice ?? 0;
          const originalPrice = pv?.pvOriginalPrice ?? pv?.pvPrice;

          return (
            <div
              key={it._id}
              className="flex justify-between items-center gap-3 border rounded-2xl p-3"
            >
              <button
                onClick={() => {
                  navigate(`/${path.PRODUCTS}/${it.pvId}`);
                }}
                className="flex gap-2"
              >
                <img
                  src={thumb}
                  onError={(e) => (e.currentTarget.src = "/no-image.png")}
                  className="w-20 h-20 object-cover rounded-lg border"
                  alt=""
                />

                <div className="flex flex-col justify-center items-start flex-1">
                  <div className="font-medium">
                    {" "}
                    {isOnSale && (
                      <span className="mr-1 rounded-3xl border bg-red-500 text-white text-[8px] px-1 py-1 align-middle">
                        Sale {product?.productDiscountPercent}%
                      </span>
                    )}
                    {name}
                  </div>
                  <div className="text-xs text-gray-500">
                    Phân loại: {pvName}
                  </div>
                  <div className="text-xs text-gray-500">x{qty}</div>
                </div>
              </button>
              <div className="flex flex-col  gap-2 text-right min-w-[120px]">
                {originalPrice ? (
                  <span className="text-gray-400 line-through text-xs md:text-sm">
                    {formatMoney(originalPrice)}đ
                  </span>
                ) : null}
                <span className="text-red-500 text-xs md:text-sm">
                  {formatMoney(unitPrice)}đ
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tổng tiền */}
      <div className="mb-3 pt-2 md:pt-4 flex justify-end items-center ">
        <table className="lg:w-[400px] w-full text-sm md:text-base p-2">
          <tbody>
            <tr>
              <td className="text-left">Tổng tiền hàng:</td>
              <td className="text-right">
                {formatMoney(order.orderSubtotalPrice)}đ
              </td>
            </tr>
            <tr>
              <td className="text-left">Phí vận chuyển:</td>
              <td className="text-right">
                {formatMoney(order.orderShippingFee)}đ
              </td>
            </tr>
            {Number(order.orderShippingDiscount) > 0 && (
              <tr>
                <td className="text-left">Ưu đãi phí vận chuyển:</td>
                <td className="text-right">
                  - {formatMoney(order.orderShippingDiscount)}đ
                </td>
              </tr>
            )}
            {Number(order.orderShopDiscount) > 0 && (
              <tr>
                <td className="text-left">Tổng giảm từ voucher shop:</td>
                <td className="text-right">
                  - {formatMoney(order.orderShopDiscount)}đ
                </td>
              </tr>
            )}
            {Number(order.orderSystemDiscount) > 0 && (
              <tr>
                <td className="text-left">Tổng giảm từ voucher hệ thống:</td>
                <td className="text-right">
                  - {formatMoney(order.orderSystemDiscount)}đ
                </td>
              </tr>
            )}
            <tr>
              <td className="text-left font-semibold">Tổng thanh toán:</td>
              <td className="text-right text-main text-base md:text-lg font-bold">
                {formatMoney(order.orderTotalPrice)}đ
              </td>
            </tr>
            <tr>
              <td className="text-left">Phương thức thanh toán:</td>
              <td className="text-right">{payment?.paymentMethod || "—"}</td>
            </tr>
          </tbody>
        </table>
      </div>
      {payment?.paymentStatus === "Pending" && statusName !== "Succeeded" && (
        <div className="flex gap-2 justify-center items-center border border-yellow-400 bg-yellow-50 text-xs md:text-sm rounded-3xl px-2 py-1 ">
          <AiOutlineExclamationCircle size={16} className="text-yellow-500" />
          <p className="text-xs">
            Vui lòng thanh toán{" "}
            <span className="text-main">
              {" "}
              {formatMoney(order.orderTotalPrice)}đ
            </span>{" "}
            khi nhận hàng
          </p>
        </div>
      )}
    </div>
  );
};
