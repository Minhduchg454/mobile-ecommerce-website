import React from "react";
import { formatMoney } from "ultils/helpers";
import { MdLocationOn } from "react-icons/md";
import { FaMoneyCheckAlt } from "react-icons/fa";
import clsx from "clsx";

const OrderSummary = ({ order }) => {
  const {
    customerId,
    shippingAddress,
    paymentMethod,
    totalPrice,
    status,
    orderDetails,
  } = order;

  return (
    <div className="flex flex-col gap-4 ">
      <h2 className="text-xl font-bold ">Thông tin đơn hàng</h2>

      {/* Người nhận + địa chỉ */}
      <div className=" bg-white border shadow-sm p-2 pb-2 rounded-xl">
        <div className="flex items-center gap-2 text-base font-bold">
          <MdLocationOn className="text-red-500" />
          <span>Địa chỉ nhận hàng:</span>
        </div>
        <p>
          Người nhận: {`${customerId._id.lastName} ${customerId._id.firstName}`}
        </p>
        <p>SĐT: {customerId._id.mobile}</p>
        <p>Địa chỉ nhận hàng: {shippingAddress}</p>
      </div>

      {/* Danh sách sản phẩm */}
      <div className=" bg-white border shadow-sm p-2 pb-2 rounded-xl">
        <table className="min-w-full table-auto ">
          <thead>
            <tr className="border-b text-left">
              <th className="p-2">Sản phẩm</th>
              <th className="p-2">Phân loại</th>
              <th className="p-2 text-center">SL</th>
              <th className="p-2 text-right">Giá</th>
              <th className="p-2 text-right">Tổng</th>
            </tr>
          </thead>
          <tbody>
            {orderDetails.map((item) => {
              const { productVariationId: pv, quantity, price } = item;
              return (
                <tr key={pv._id} className="border-t">
                  <td className="p-2 flex items-center gap-2">
                    <img
                      src={pv.images?.[0] || "/fallback.jpg"}
                      alt="thumb"
                      className="w-12 h-12 object-cover border rounded"
                    />
                    <div>{pv.productVariationName}</div>
                  </td>
                  <td className="p-2">{pv.productVariationName}</td>
                  <td className="p-2 text-center">{quantity}</td>
                  <td className="p-2 text-right">{formatMoney(price)} VND</td>
                  <td className="p-2 text-right">
                    {formatMoney(price * quantity)} VND
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Tổng thanh toán */}
      <div className="flex justify-end border-t pt-4">
        <table className="text-right text-md w-1/2">
          <tbody>
            <tr>
              <td className="text-left font-medium">Tổng tiền:</td>
              <td className="font-bold text-main text-lg">
                {formatMoney(totalPrice)} VND
              </td>
            </tr>
            <tr>
              <td className="text-left">Phương thức thanh toán:</td>
              <td className="capitalize">{paymentMethod.toLowerCase()}</td>
            </tr>
            <tr>
              <td className="text-left">Trạng thái:</td>
              <td>
                <span
                  className={clsx(
                    "px-2 py-1 rounded-md text-base font-medium inline-block w-fit",
                    status === "Pending" && "bg-yellow-100 text-yellow-800",
                    status === "Succeeded" && "bg-green-100 text-green-800",
                    status === "Cancelled" && "bg-red-100 text-red-800"
                  )}
                >
                  {status}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderSummary;
