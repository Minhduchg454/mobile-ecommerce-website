import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import { MdLocationOn } from "react-icons/md";
import { FaMoneyCheckAlt } from "react-icons/fa";

import { formatMoney } from "ultils/helpers";
import { apiCreateOrder, apiGetProductVariation } from "apis";
import withBaseComponent from "hocs/withBaseComponent";
import { getCurrent } from "store/user/asyncActions";
import { Congrat, Paypal } from "components";
import path from "ultils/path";
import logo from "assets/logo-removebg-preview-Photoroom.png";

const Checkout = ({ dispatch, navigate }) => {
  const { state } = useLocation();
  const selectedItems = state?.selectedItems || [];
  const { current } = useSelector((state) => state.user);

  const [variationData, setVariationData] = useState({});
  const [isSuccess, setIsSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("OFFLINE");
  const [loading, setLoading] = useState(true);

  const paymentMethods = [
    { _id: "OFFLINE", productCategoryName: "Thanh toán khi nhận hàng" },
    { _id: "ONLINE", productCategoryName: "Thanh toán Paypal" },
  ];

  useEffect(() => {
    const fetchVariations = async () => {
      const data = {};
      await Promise.all(
        selectedItems.map(async (item) => {
          const res = await apiGetProductVariation(item.productVariationId);
          if (res.success) {
            data[item.productVariationId] = res.variation;
          }
        })
      );
      setVariationData(data);
      setLoading(false);
    };

    if (selectedItems.length > 0) fetchVariations();
  }, [selectedItems]);

  useEffect(() => {
    if (isSuccess) dispatch(getCurrent());
  }, [isSuccess]);

  // Giá mới theo CSDL
  const totalVND = selectedItems.reduce((sum, el) => {
    const variation = variationData[el.productVariationId];
    return sum + (variation?.price || 0) * el.quantity;
  }, 0);
  const totalUSD = Math.round(totalVND / 23500);

  // Tổng giá lúc thêm vào giỏ hàng
  const totalOldVND = selectedItems.reduce(
    (sum, el) => sum + el.priceAtTime * el.quantity,
    0
  );

  const handleSaveOrder = async () => {
    const payload = {
      products: selectedItems.map((el) => ({
        productVariationId: el.productVariationId,
        quantity: el.quantity,
        price: variationData[el.productVariationId]?.price || 0,
      })),
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
  };

  return (
    <div className="w-full h-full max-h-screen overflow-y-auto flex flex-col gap-6">
      {isSuccess && <Congrat />}

      <div className="border-b-2 shadow-lg">
        <div className="lg:w-main w-full m-auto flex items-center justify-start">
          <Link to={`/${path.HOME}`} className="h-16 px-2">
            <img
              src={logo}
              alt="logo"
              className="h-full w-auto object-contain"
            />
          </Link>
          <span className="mx-2">|</span>
          <h2 className="text-2xl font-bold text-[#00AFFF]">
            Thanh toán đơn hàng
          </h2>
        </div>
      </div>

      <div className="lg:w-main w-full m-auto flex flex-col gap-3 p-2">
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

        <div className="border rounded-xl p-4 shadow-sm">
          {loading ? (
            <div className="text-center italic text-gray-400">
              Đang tải sản phẩm...
            </div>
          ) : (
            <table className="min-w-full table-auto">
              <thead className="border-b-2">
                <tr className="text-center">
                  <th className="p-2 text-left">Sản phẩm</th>
                  <th className="p-2">Số lượng</th>
                  <th className="p-2">Đơn giá mới</th>
                  <th className="p-2">Giá cũ</th>
                  <th className="p-2 text-right">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {selectedItems.map((el) => {
                  const variation = variationData[el.productVariationId];
                  const product = variation?.productId;
                  const productName = product?.productName;
                  const brand = product?.brandId;
                  const currentPrice = variation?.price || 0;
                  return (
                    <tr key={el.productVariationId} className="border-t">
                      <td className="p-2 text-left flex items-center gap-2">
                        <img
                          src={
                            variation?.images?.[0] ||
                            product?.thumb ||
                            "/fallback.jpg"
                          }
                          alt="thumb"
                          className="w-12 h-12 object-cover border rounded"
                        />
                        <div>
                          <p className="font-medium text-main">
                            {`${productName} - `}
                            {variation?.productVariationName || "Đang tải..."}
                          </p>
                          <p className="text-sm text-gray-500 italic">
                            ID: {el.productVariationId}
                          </p>
                        </div>
                      </td>
                      <td className="text-center">{el.quantity}</td>
                      <td className="text-center">
                        {formatMoney(currentPrice)} VND
                      </td>
                      <td className="text-center text-gray-400 line-through">
                        {formatMoney(el.priceAtTime)} VND
                      </td>
                      <td className="text-right">
                        {formatMoney(currentPrice * el.quantity)} VND
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="flex flex-col border rounded-xl p-4 gap-4 bg-[#FFFEFB] shadow-sm">
          {totalVND !== totalOldVND && (
            <div className="text-red-500 text-sm font-medium">
              ⚠️ Có chênh lệch giá so với lúc thêm vào giỏ hàng:
              <span className="ml-2 font-bold">
                {formatMoney(totalVND - totalOldVND)} VND
              </span>
            </div>
          )}

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

            {paymentMethod === "OFFLINE" && (
              <p className="text-gray-600 text-sm pt-2">
                Thanh toán khi nhận hàng. Phí thu hộ: 0 VNĐ.
              </p>
            )}
            {paymentMethod === "ONLINE" && (
              <p className="text-gray-600 text-sm pt-2">
                Thanh toán qua Paypal. Đảm bảo an toàn và nhanh chóng.
              </p>
            )}
          </div>

          {paymentMethod === "ONLINE" && (
            <div className="w-full mt-4">
              <Paypal
                payload={{
                  products: selectedItems.map((el) => ({
                    productVariationId: el.productVariationId,
                    quantity: el.quantity,
                    price: variationData[el.productVariationId]?.price || 0,
                  })),
                  total: totalUSD,
                  address: current?.address,
                }}
                setIsSuccess={setIsSuccess}
                amount={totalUSD}
              />
            </div>
          )}

          <div className="flex justify-between items-center border-t-2 py-2">
            <p>
              Nếu đồng ý thanh toán, bạn chấp nhận các
              <span className="text-[#00AFFF]"> điều khoản Shop</span>
            </p>
            <div className="flex items-center gap-4">
              <span className="font-medium">Tổng thanh toán:</span>
              <span className="font-bold text-main text-lg">
                {formatMoney(totalVND)} VND
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => navigate(`/${path.HOME}`)}
              className="mt-2 px-6 py-2 bg-gray-300 text-black rounded-md hover:bg-gray-400"
            >
              Hủy
            </button>
            <button
              onClick={handleConfirmPayment}
              className="mt-2 px-6 py-2 bg-main text-white rounded-md hover:bg-blue-700"
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
