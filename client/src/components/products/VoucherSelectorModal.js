import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import moment from "moment";
import { apiGetAllCoupons } from "apis";
import { showModal } from "store/app/appSlice";
import { formatMoney } from "ultils/helpers";
import { CloseButton } from "../../components";

moment.locale("vi");

const VoucherSelectorModal = ({ onSelectVoucher, orderTotal }) => {
  const dispatch = useDispatch();
  const [coupons, setCoupons] = useState([]);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const res = await apiGetAllCoupons();
      if (res?.success) {
        const now = new Date();
        const activeCoupons = res.coupons
          .filter(
            (cp) =>
              cp.isActive &&
              new Date(cp.startDate) <= now &&
              new Date(cp.expirationDate) >= now &&
              orderTotal >= cp.miniOrderAmount
          )
          .map((cp) => {
            let color = "bg-gray-100";
            if (cp.discountType === "percentage") {
              if (cp.discount <= 5) color = "bg-green-100";
              else if (cp.discount <= 10) color = "bg-purple-100";
              else color = "bg-blue-100";
            } else {
              if (cp.discount <= 20000) color = "bg-orange-100";
              else if (cp.discount <= 50000) color = "bg-red-100";
              else color = "bg-orange-300";
            }
            return { ...cp, color };
          });
        setCoupons(activeCoupons);
      } else {
        setCoupons([]);
      }
    } catch (error) {
      console.error("Lỗi khi lấy coupon:", error);
      setCoupons([]);
    }
  };

  const handleSelect = (coupon) => {
    onSelectVoucher(coupon);
    dispatch(showModal({ isShowModal: false, modalChildren: null }));
  };

  const handleClose = () => {
    dispatch(showModal({ isShowModal: false, modalChildren: null }));
  };

  return (
    <div
      className="bg-white rounded-xl w-[500px] max-h-[60vh] overflow-hidden flex flex-col relative shadow-md border"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Đóng */}

      <CloseButton onClick={handleClose} className="top-2 right-2" />

      <div className="p-4 border-b shadow-md">
        <h2 className="text-md font-bold">Chọn mã giảm giá</h2>
      </div>

      <div className="overflow-y-auto p-4 space-y-3">
        {coupons.length > 0 ? (
          coupons.map((cp) => (
            <div
              key={cp._id}
              className={`p-3 rounded-xl cursor-pointer hover:scale-103 flex justify-between items-start ${cp.color}`}
              onClick={() => handleSelect(cp)}
            >
              <div className="space-y-1">
                <div className="font-bold text-main text-sm">
                  {cp.couponCode}
                </div>
                <div className="text-sm text-gray-800">{cp.description}</div>
                <div className="text-xs text-gray-600">
                  HSD: {moment(cp.expirationDate).format("DD/MM/YYYY")} • Đơn
                  tối thiểu: {formatMoney(cp.miniOrderAmount)}đ
                </div>
                {cp.discountType === "percentage" && (
                  <div className="text-xs text-gray-500 italic">
                    Giảm tối đa: {formatMoney(cp.maxDiscountAmount)}đ
                  </div>
                )}
              </div>
              <div className="text-right text-blue-600 font-semibold text-sm">
                {cp.discountType === "percentage"
                  ? `- ${cp.discount}%`
                  : `- ${formatMoney(cp.discount)}đ`}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-400 py-6">
            Không có mã giảm giá khả dụng
          </div>
        )}
      </div>

      <div className="border-t p-4 text-center">
        <button
          onClick={() => handleSelect(null)}
          className="text-sm text-red-500 hover:underline"
        >
          Không áp dụng mã giảm giá
        </button>
      </div>
    </div>
  );
};

export default VoucherSelectorModal;
