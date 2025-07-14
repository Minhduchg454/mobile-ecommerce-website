import React, { useEffect, useState } from "react";
import payment from "assets/payment.svg";
import { useSelector } from "react-redux";
import { formatMoney } from "ultils/helpers";
import { Congrat, Paypal, SelectableList } from "components";
import withBaseComponent from "hocs/withBaseComponent";
import { getCurrent } from "store/user/asyncActions";
import Swal from "sweetalert2";
import { apiCreateOrder } from "apis";
import logo from "assets/logo-removebg-preview-Photoroom.png";
import { Link } from "react-router-dom";
import path from "ultils/path";
import { MdLocationOn } from "react-icons/md";
import { FaMoneyCheckAlt } from "react-icons/fa";

const Checkout = ({ dispatch, navigate }) => {
  const { currentCart, current } = useSelector((state) => state.user);
  const [isSuccess, setIsSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("OFFLINE");

  const paymentMethods = [
    { _id: "OFFLINE", productCategoryName: "Thanh toán khi nhận hàng" },
    { _id: "ONLINE", productCategoryName: "Thanh toán Paypal" },
  ];

  useEffect(() => {
    if (isSuccess) dispatch(getCurrent());
  }, [isSuccess]);

  const totalVND = Math.round(
    currentCart?.reduce((sum, el) => +el?.price * el.quantity + sum, 0)
  );
  const totalUSD = Math.round(totalVND / 23500);

  const handleSaveOrder = async () => {
    const payload = {
      products: currentCart,
      total: totalUSD,
      address: current?.address,
    };
    const response = await apiCreateOrder({ ...payload, status: "Pending" });
    if (response.success) {
      setIsSuccess(true);
      setTimeout(() => {
        Swal.fire("Congrat!", "Order was created.", "success").then(() => {
          navigate("/");
        });
      }, 1500);
    }
  };

  const handleConfirmPayment = () => {
    if (!paymentMethod) {
      Swal.fire("Lỗi", "Vui lòng chọn phương thức thanh toán!", "warning");
      return;
    }

    if (paymentMethod === "OFFLINE") {
      Swal.fire({
        icon: "info",
        title: "Xác nhận thanh toán",
        text: `Cảm ơn quý khách đã mua hàng, cần thanh toán ${formatMoney(
          totalVND
        )} VNĐ khi nhận hàng.`,
        showConfirmButton: true,
        confirmButtonText: "Xác nhận",
        showCancelButton: true,
        cancelButtonText: "Hủy",
      }).then((result) => {
        if (result.isConfirmed) handleSaveOrder();
      });
    }

    // Nếu là ONLINE thì không gọi handleSaveOrder ở đây, xử lý trong Paypal
  };

  return (
    <div className="w-full h-full max-h-screen overflow-y-auto flex flex-col gap-6">
      {isSuccess && <Congrat />}
      {/* Tiêu đề */}
      <div className="border-b-2 shadow-lg">
        <div className="lg:w-main w-full m-auto flex items-center justify-start">
          <Link
            to={`/${path.HOME}`}
            className="h-16 flex items-center justify-start px-2"
          >
            <div className="w-auto h-[60px] flex items-center justify-center">
              <img
                src={logo}
                alt="logo"
                className="h-full w-auto object-contain"
              />
            </div>
          </Link>
          <span className="mx-2">|</span>
          <h2 className="text-2xl font-bold text-center text-[#00AFFF]">
            Thanh toán đơn hàng
          </h2>
        </div>
      </div>

      <div className="lg:w-main w-full m-auto flex flex-col gap-3 p-2">
        {/* Địa chỉ giao hàng */}
        <div className="flex flex-col border rounded-xl p-4 gap-2 shadow-sm">
          <div className="flex items-center gap-2 text-lg font-bold text-main">
            <MdLocationOn className="text-red-500 text-2xl" />
            <span>Địa chỉ nhận hàng:</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="font-bold">
              <p>
                {current?.lastName} {current?.firstName}
              </p>
              <p>{`Sđt: ${current?.mobile}`}</p>
            </div>
            <div className="text-md">{current?.address}</div>
          </div>
        </div>

        {/*Danh sách sản phẩm*/}
        <div className="overflow-x-auton border rounded-xl p-4 shadow-sm">
          <table className="min-w-full table-auto">
            <thead className="border-b-2">
              <tr className="text-center">
                <th className="p-2 text-left">Sản phẩm</th>
                <th className="p-2">Đơn giá</th>
                <th className="p-2">Số lượng</th>
                <th className="p-2 text-right">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {currentCart?.map((el) => (
                <tr key={el._id} className="border-t">
                  <td className="p-2">{el.title}</td>
                  <td className="text-center">{el.quantity}</td>
                  <td className="text-center">{el.price}</td>
                  <td className="text-right">{formatMoney(el.price)} VND</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Thông tin thanh toán*/}
        <div className="flex flex-col border rounded-xl p-4 gap-4 bg-[#FFFEFB] shadow-sm">
          <div className="flex flex-row gap-2 justify-between items-center">
            <div className="flex flex-col gap-2">
              <label className="font-medium flex items-center gap-2 text-lg">
                <FaMoneyCheckAlt className="text-blue-600 text-2xl" />
                Phương thức thanh toán:
              </label>
              <div className="flex gap-4 flex-wrap">
                {paymentMethods.map((method) => (
                  <button
                    key={method._id}
                    onClick={() => setPaymentMethod(method._id)}
                    className={`border rounded-md px-4 py-2 min-w-[200px] text-center
                    ${
                      paymentMethod === method._id
                        ? "border-red-500 text-red-600 font-bold"
                        : "border-gray-300 text-gray-700"
                    }`}
                  >
                    {method.productCategoryName}
                  </button>
                ))}
              </div>

              {/* Hiển thị nội dung mô tả tùy theo phương thức */}
              {paymentMethod === "OFFLINE" && (
                <div className="mt-2 text-gray-600 text-sm pt-2">
                  Thanh toán khi nhận hàng. Phí thu hộ: 0 VNĐ. Ưu đãi về phí vận
                  chuyển (nếu có) áp dụng cả với phí thu hộ.
                </div>
              )}
              {paymentMethod === "ONLINE" && (
                <div className="mt-2 text-gray-600 text-sm pt-2">
                  Thanh toán qua Paypal. Đảm bảo an toàn và nhanh chóng.
                </div>
              )}
            </div>
          </div>

          {/* Nếu là Paypal thì hiển thị nút Paypal */}
          {paymentMethod === "ONLINE" && (
            <div className="w-full mt-4">
              <Paypal
                payload={{
                  products: currentCart,
                  total: totalUSD,
                  address: current?.address,
                }}
                setIsSuccess={setIsSuccess}
                amount={totalUSD}
              />
            </div>
          )}
          <div className="flex justify-end items-center border-t-2 py-2">
            <div className="flex items-center gap-4">
              <span className="font-medium">Tổng thanh toán:</span>
              <span className="font-bold text-main text-lg">
                {formatMoney(totalVND)} VND
              </span>
            </div>
          </div>

          {/* Luôn hiển thị nút xác nhận */}
          <div className="flex justify-between items-center border-t-2 py-2 ">
            <p>
              Nếu đồng ý thanh toán, bạn chấp nhận các{" "}
              <span className="text-[#00AFFF]">điều khoản Shop</span>{" "}
            </p>
            <button
              onClick={handleConfirmPayment}
              className="w-fit mt-4 px-6 py-2 bg-main text-white rounded-md hover:bg-blue-700"
            >
              Xác nhận thanh toán
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withBaseComponent(Checkout);
