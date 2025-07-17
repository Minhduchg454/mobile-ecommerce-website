import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import { MdLocationOn } from "react-icons/md";
import { FaMoneyCheckAlt } from "react-icons/fa";
import { showModal } from "store/app/appSlice";
import { formatMoney } from "ultils/helpers";
import { apiCreateOrder, apiGetProductVariation } from "apis";
import withBaseComponent from "hocs/withBaseComponent";
import { getCurrent } from "store/user/asyncActions";
import { Congrat, Paypal, VoucherSelectorModal } from "components";
import path from "ultils/path";
import logo from "assets/logo-removebg-preview-Photoroom.png";
import { FaTicketAlt } from "react-icons/fa";
import { QRCodeCanvas } from "qrcode.react";

const Checkout = ({ dispatch, navigate }) => {
  const { state } = useLocation();
  const selectedItems = state?.selectedItems || [];
  const { current } = useSelector((state) => state.user);

  const [variationData, setVariationData] = useState({});
  const [isSuccess, setIsSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("OFFLINE");
  const [loading, setLoading] = useState(true);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState(null);

  const paymentMethods = [
    { _id: "OFFLINE", productCategoryName: "Thanh toán khi nhận hàng" },
    {
      _id: "BANK_TRANSFER",
      productCategoryName: "Chuyển khoản ngân hàng (QR)",
    },
    { _id: "ONLINE", productCategoryName: "Thanh toán Paypal" },
  ];

  const bankInfo = {
    bankName: "Vietinbank",
    accountName: "NGUYEN HUU DUC",
    accountNumber: "103874068274",
    notePrefix: "Thanh toan don hang",
  };

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

  useEffect(() => {
    if (!selectedItems || selectedItems.length === 0) {
      Swal.fire({
        icon: "error",
        title: "Không có sản phẩm để thanh toán",
        text: "Vui lòng chọn sản phẩm trước khi thanh toán!",
      }).then(() => {
        navigate("/");
      });
    }
  }, [selectedItems]);

  const handleSaveOrder = async () => {
    const payload = {
      products: selectedItems.map((el) => ({
        productVariationId: el.productVariationId,
        quantity: el.quantity,
        price: variationData[el.productVariationId]?.price || 0,
      })),
      total: totalUSD,
      address: current?.address,
      appliedCoupon: selectedVoucher?._id || null,
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

    if (!current?.address || !current?.mobile) {
      Swal.fire({
        icon: "error",
        title: "Thông tin không đầy đủ",
        text: "Bạn cần cập nhật địa chỉ và số điện thoại để tiếp tục.",
        showCancelButton: true,
        confirmButtonText: "Cập nhật ngay",
        cancelButtonText: "Đóng",
      }).then((result) => {
        if (result.isConfirmed) navigate(`/${path.MEMBER}/${path.PERSONAL}`);
      });
      return;
    }

    if (hasOutOfStock) {
      Swal.fire({
        icon: "error",
        title: "Không thể thanh toán",
        text: "Một hoặc nhiều sản phẩm trong giỏ hàng đã hết hàng hoặc không đủ số lượng.",
      });
      return;
    }

    if (paymentMethod === "BANK_TRANSFER") {
      Swal.fire({
        icon: "info",
        title: "Xác nhận đã chuyển khoản",
        text: "Bạn đã chuyển khoản thành công đến cửa hàng?",
        showConfirmButton: true,
        confirmButtonText: "Xác nhận",
      }).then((result) => {
        if (result.isConfirmed) handleSaveOrder();
      });
    }

    if (paymentMethod === "ONLINE") {
      Swal.fire({
        icon: "info",
        title: "Xác nhận thanh toán quay paypal",
        text: "Bạn đã chuyển khoản thành công đến cửa hàng?",
        showConfirmButton: true,
        confirmButtonText: "Xác nhận",
      }).then((result) => {
        if (result.isConfirmed) handleSaveOrder();
      });
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
      }).then((result) => {
        if (result.isConfirmed) handleSaveOrder();
      });
    }
  };

  const hasOutOfStock = selectedItems.some((item) => {
    const variation = variationData[item.productVariationId];
    return !variation || variation.stockQuantity < item.quantity;
  });

  const totalAfterDiscount = (() => {
    if (!selectedVoucher) return totalVND;

    const isApplicable = totalVND >= (selectedVoucher.miniOrderAmount || 0);
    if (!isApplicable) return totalVND;

    let discountAmount = 0;

    if (selectedVoucher.discountType === "percentage") {
      discountAmount = (totalVND * selectedVoucher.discount) / 100;

      if (selectedVoucher.maxDiscountAmount) {
        discountAmount = Math.min(
          discountAmount,
          selectedVoucher.maxDiscountAmount
        );
      }
    } else {
      discountAmount = selectedVoucher.discount || 0;
    }

    return Math.max(totalVND - discountAmount, 0);
  })();

  const notePrefix = "FONE";
  const userName = `${current?.firstName}`;
  const amount = formatMoney(totalAfterDiscount);
  const dateStr = new Date().toLocaleDateString("vi-VN");

  const transferContent = `${userName} ${amount} ${dateStr} DEN CUA HANG ${notePrefix}`;

  return (
    <div className="w-full h-screen flex flex-col bg-[#F5F5F7]">
      {isSuccess && <Congrat />}

      {/*header */}
      <div className="shadow-lg bg-[#FFF] mb-2 h-16">
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

      {/* Nội dung chính cho phép cuộn */}
      <div
        className="lg:w-main w-full mx-auto flex-1 overflow-y-auto flex flex-col gap-3 p-2"
        style={{ maxHeight: "calc(100vh - 64px)" }}
      >
        {/* Khối địa chỉ */}
        <div className="flex flex-col border rounded-xl p-4 gap-2 shadow-sm bg-[#fff]">
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
        {/* Danh sach san pham */}
        <div className="border rounded-xl p-4 shadow-sm bg-[#fff]">
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
                  const currentPrice = variation?.price || 0;
                  return (
                    <tr key={el.productVariationId} className="border-t">
                      {/* Ảnh sản phẩm, tên, id */}
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
                          <p className="font-medium">
                            {`${productName} - `}
                            {variation?.productVariationName || "Đang tải..."}
                          </p>
                          <p className="text-sm text-gray-500 italic">
                            ID: {el.productVariationId}
                          </p>
                        </div>
                      </td>
                      {/* Số lượng */}
                      <td className="text-center">{el.quantity}</td>
                      {/* Đơn giá hiện tại */}
                      <td className="text-center">
                        {formatMoney(currentPrice)} VND
                      </td>
                      {/* Đơn giá khi thêm vào giỏ */}
                      <td className="text-center text-gray-400 line-through">
                        {formatMoney(el.priceAtTime)} VND
                      </td>
                      {/* Thành tiền */}
                      <td className="text-right">
                        {formatMoney(currentPrice * el.quantity)} VND
                      </td>
                      {/* Ghi chú */}
                      <td className="text-center">
                        {variation?.stockQuantity < el.quantity ? (
                          <span className="text-red-500 font-medium">
                            ⚠ Không đủ hàng ({variation?.stockQuantity} có sẵn)
                          </span>
                        ) : (
                          ""
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        {/* Khối voucher */}
        <div className="p-4 flex border rounded-xl gap-4 shadow-sm bg-[#FFF] items-center justify-between">
          <div>
            <p className="font-medium flex items-center gap-2 text-lg">
              <FaTicketAlt className="text-orange-500 text-2xl" />
              Voucher áp dụng:
            </p>
            {selectedVoucher ? (
              <div className="text-sm text-gray-600">
                <span className="font-bold text-main">
                  {selectedVoucher.couponCode}
                </span>{" "}
                - {selectedVoucher.description}
              </div>
            ) : (
              <div className="text-sm italic text-gray-400">
                Chưa chọn mã giảm giá
              </div>
            )}
          </div>
          <button
            className="text-blue-600 text-md"
            onClick={() =>
              dispatch(
                showModal({
                  isShowModal: true,
                  modalChildren: (
                    <VoucherSelectorModal
                      orderTotal={totalVND}
                      onSelectVoucher={(voucher) => setSelectedVoucher(voucher)}
                    />
                  ),
                })
              )
            }
          >
            Chọn voucher
          </button>
        </div>

        {/* Khối thanh toán */}
        <div className="flex flex-col border rounded-xl gap-4 shadow-sm bg-[#FFF]">
          {totalVND !== totalOldVND && (
            <div className="text-red-500 text-sm font-medium">
              ⚠️ Có chênh lệch giá so với lúc thêm vào giỏ hàng:
              <span className="ml-2 font-bold">
                {formatMoney(totalVND - totalOldVND)} VND
              </span>
            </div>
          )}

          <div className="p-4 ">
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
                    className={`border rounded-xl p-2 min-w-[200px] text-center text-md
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

            {paymentMethod === "BANK_TRANSFER" && (
              <div className="flex flex-col items-center gap-4 mt-4 p-4 border rounded-xl bg-gray-50">
                <p className="text-gray-700 text-md font-medium">
                  Quét mã để chuyển khoản ngân hàng:
                </p>

                <img
                  src={`https://img.vietqr.io/image/ICB-${
                    bankInfo.accountNumber
                  }-compact2.jpg?amount=${totalAfterDiscount}&addInfo=${encodeURIComponent(
                    transferContent
                  )}`}
                  alt="QR VietQR"
                  className="w-72 h-72 object-contain"
                />

                <div className="text-sm text-center text-gray-600">
                  <p>
                    <strong>Ngân hàng:</strong> {bankInfo.bankName}
                  </p>
                  <p>
                    <strong>Chủ tài khoản:</strong> {bankInfo.accountName}
                  </p>
                  <p>
                    <strong>Số tài khoản:</strong> {bankInfo.accountNumber}
                  </p>
                  <p>
                    <strong>Nội dung chuyển khoản:</strong> {transferContent}
                  </p>
                  <p className="text-orange-600 italic text-sm">
                    Sau khi chuyển khoản, nhấn "Tôi đã chuyển khoản" để hoàn tất
                    đơn hàng.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="px-4 mb-5 bg-[#FFFEFB] rounded-b-xl border-t-2">
            <div className="flex flex-col items-end gap-1 my-2">
              <table className="lg:w-[400px] w-full text-md">
                <tbody>
                  <tr>
                    <td className="text-left">Phí vận chuyển:</td>
                    <td className="text-right">Miễn phí</td>
                  </tr>
                  {selectedVoucher && (
                    <tr>
                      <td className="text-left">Mã giảm giá:</td>
                      <td className="text-right text-green-600">
                        - {formatMoney(totalVND - totalAfterDiscount)} VND
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td className="text-left">Tổng thanh toán:</td>
                    <td className="text-right font-bold text-main text-xl">
                      {formatMoney(totalAfterDiscount)} VND
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center gap-3 border-t-2 border-dashed">
              <div>
                <p>
                  Nếu đồng ý thanh toán, bạn chấp nhận các
                  <span className="text-[#00AFFF]"> điều khoản Shop</span>
                </p>
              </div>
              <div>
                <button
                  onClick={() => navigate(`/${path.HOME}`)}
                  className="mt-2 mr-4 px-6 py-2 bg-gray-300 text-black rounded-md hover:bg-gray-400"
                >
                  Hủy
                </button>
                <button
                  onClick={handleConfirmPayment}
                  className="mt-2 px-6 py-2 bg-main text-white rounded-md hover:bg-blue-700"
                >
                  {paymentMethod === "BANK_TRANSFER"
                    ? "Tôi đã chuyển khoản"
                    : "Xác nhận thanh toán"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withBaseComponent(Checkout);
