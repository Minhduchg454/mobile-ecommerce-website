// src/pages/orders/OrderDetailCustomer.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiGetOrders } from "../../services/order.api";
import { apiGetPayments } from "../../services/payment.api";
import moment from "moment";
import { formatMoney } from "ultils/helpers";

import "moment/locale/vi"; // Nếu muốn hiển thị tiếng Việt (ngày, tháng...)
import {} from "react-icons/ai";
import { MdOutlineLocationOn } from "react-icons/md";
import { HiOutlineClipboardList } from "react-icons/hi";
import { FiHash, FiBox, FiClock } from "react-icons/fi";
import { STATUS_BADGE } from "../../ultils/contants";
import { CopyText } from "../../components";

const InfoRow = ({ icon: Icon, label, children }) => (
  <div className="grid grid-cols-[24px_1fr] items-start gap-2 mb-1 text-sm md:text-base">
    <div className="flex justify-center pt-[2px]">
      <Icon size={20} className="text-gray-600" />
    </div>
    <div>
      <span className="font-semibold">{label}</span>
      {children && <div className="mt-0.5">{children}</div>}
    </div>
  </div>
);

export const OrderDetailShop = () => {
  const { orderId, shopId } = useParams(); // customerId nếu cần dùng để xác thực
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
  const badge = STATUS_BADGE[statusName] || {
    label: "Không xác định",
    bg: "bg-gray-100",
    text: "text-gray-600",
  };

  console.log("Thông tin nhận được", order);

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
      <div className="flex justify-between items-center mb-4 border-b pb-3">
        <button
          className="text-sm border rounded-2xl px-3 py-1 whitespace-nowrap"
          onClick={() => navigate(-1)}
        >
          Quay lại
        </button>
        <div className="text-xs md:text-sm">
          Cập nhật gần nhất:{" "}
          {moment(order?.updatedAt).format("DD/MM/YYYY HH:mm")}
        </div>
      </div>

      {/* Trạng thái đơn hàng */}
      <InfoRow icon={HiOutlineClipboardList} label="Trạng thái đơn hàng:">
        <p>{badge.label}</p>
      </InfoRow>

      {/* Mã đơn hàng */}
      <InfoRow icon={FiHash} label="Mã đơn hàng:">
        <p className="flex justify-start items-center gap-1">
          {order._id} <CopyText text={order._id} />
        </p>
      </InfoRow>

      {/* Thời gian */}
      <InfoRow icon={FiClock} label="Thời gian:">
        <p>
          Ngày đặt hàng: {moment(order?.orderDate).format("DD/MM/YYYY HH:mm")}
        </p>
        {order?.orderDeliveryDate && (
          <p>
            Ngày nhận hàng:{" "}
            {moment(order?.orderDeliveryDate).format("DD/MM/YYYY HH:mm")}
          </p>
        )}
      </InfoRow>

      {/* Địa chỉ */}
      <InfoRow icon={MdOutlineLocationOn} label="Địa chỉ giao hàng:">
        <div>
          {addressUserName && <span>{addressUserName}</span>}
          {" | "}
          {addressNumberPhone && <span>{addressNumberPhone}</span>}
          {addressLine && <p>{addressLine}</p>}
        </div>
      </InfoRow>

      <div className="mb-3 text-sm md:text-base ">
        <div className="grid grid-cols-[24px_1fr] items-center gap-2 mb-2">
          <FiBox size={20} className="text-gray-600 justify-self-center" />
          <span className="font-bold">Danh sách sản phẩm:</span>
        </div>

        {/* Items */}
        <div className="space-y-3 mt-2">
          {(order.items || []).map((it) => {
            const pv = it.productVariation || it.pvId;
            const product = pv?.productId;
            const thumb = pv?.pvImages?.[0];
            const name = product?.productName || "Sản phẩm";
            const pvName = pv?.pvName || "Phân loại";
            const qty = it.odQuantity ?? 1;
            const unitPrice = it.odPrice ?? pv?.pvPrice ?? 0;
            const originalPrice = pv?.pvOriginalPrice ?? pv?.pvPrice;

            return (
              <div
                key={it._id}
                className="flex items-center gap-3 border rounded-2xl p-3"
              >
                <img
                  src={thumb}
                  onError={(e) => (e.currentTarget.src = "/no-image.png")}
                  className="w-20 h-20 object-cover rounded-lg border"
                  alt=""
                />
                <div className="flex-1">
                  <div className="font-medium">{name}</div>
                  <div className="text-xs text-gray-500">
                    Phân loại: {pvName}
                  </div>
                  <div className="text-xs text-gray-500">x{qty}</div>
                </div>
                <div className="flex flex-col md:flex-row gap-2 text-right min-w-[120px]">
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
    </div>
  );
};
