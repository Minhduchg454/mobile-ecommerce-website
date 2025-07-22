import React, { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";
import Swal from "sweetalert2";
import { useSelector } from "react-redux";
import { apiGetUserOrders, apiCancelOrder } from "apis/product";

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { current } = useSelector((state) => state.user);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await apiGetUserOrders();
      console.log(res.orders);
      setOrders(res.orders || []);
      console.log(res.data?.orders);
      // tuỳ backend trả về gì
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    const result = await Swal.fire({
      title: "Xác nhận hủy đơn hàng?",
      text: "Sau khi hủy, đơn hàng sẽ không thể phục hồi.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Hủy đơn",
      cancelButtonText: "Đóng",
    });

    if (result.isConfirmed) {
      try {
        await apiCancelOrder(orderId);
        Swal.fire("Đã hủy!", "Đơn hàng đã được hủy.", "success");
        fetchOrders();
      } catch (error) {
        Swal.fire("Lỗi!", "Không thể hủy đơn hàng.", "error");
        console.error(error);
      }
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="p-4 w-full max-w-4xl mx-auto">
      <h1 className="text-xl font-semibold mb-6 text-center">
        Lịch sử đơn hàng
      </h1>

      {loading ? (
        <p>Đang tải đơn hàng...</p>
      ) : orders.length === 0 ? (
        <p>Bạn chưa có đơn hàng nào.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="border rounded p-4 shadow bg-white">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <p>
                    <strong>Mã đơn:</strong> {order._id}
                  </p>
                  <p>
                    <strong>Ngày đặt:</strong>{" "}
                    {moment(order.createdAt).format("DD/MM/YYYY HH:mm")}
                  </p>
                  <p>
                    <strong>Trạng thái:</strong> {order.status}
                  </p>
                  <p>
                    <strong>Tổng tiền:</strong>{" "}
                    {order.totalPrice?.toLocaleString()}₫
                  </p>

                  <div className="mt-2 space-y-2">
                    {order.items?.map((item) => (
                      <div
                        key={item._id}
                        className="flex items-center gap-3 border-t pt-2"
                      >
                        <img
                          src={
                            item.productVariationId?.images?.[0] ||
                            "/fallback.jpg"
                          }
                          alt="thumb"
                          className="w-14 h-14 object-cover rounded border"
                        />
                        <div>
                          <p className="font-medium">
                            {item.productVariationId?.productVariationName}
                          </p>
                          <p className="text-sm text-gray-600">
                            Số lượng: {item.quantity} – Giá:{" "}
                            {item.price.toLocaleString()}₫
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {["Pending", "Processing"].includes(order.status) && (
                  <button
                    onClick={() => handleCancelOrder(order._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    Hủy đơn
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
