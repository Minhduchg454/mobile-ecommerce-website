import React, { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import moment from "moment";
import { apiGetCoupons } from "../../services/coupon.api";
import { showModal } from "store/app/appSlice";
import { formatMoney } from "ultils/helpers";
import { CloseButton } from "../../components";

moment.locale("vi");

export const VoucherSelectModal = ({
  onSelectVoucher,
  orderTotal,
  createdById,
  initialSelected = [],
}) => {
  const dispatch = useDispatch();
  const [coupons, setCoupons] = useState([]);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    fetchCoupons();
  }, [createdById, orderTotal, initialSelected]);

  const fetchCoupons = async () => {
    try {
      const res = createdById
        ? await apiGetCoupons({ createdById })
        : await apiGetCoupons({ createdByType: "Admin" });

      const data = res?.coupons;
      console.log("Dữ liệu nhận voucher:", res);
      if (!res?.success) return setCoupons([]);

      // ======== CHUẨN HÓA THỜI GIAN ========
      // nowVN là thời điểm hiện tại theo giờ Việt Nam
      const nowVN = new Date(Date.now() + 7 * 60 * 60 * 1000);
      // Bỏ phần giờ, chỉ giữ ngày để tránh lệch múi giờ
      const todayVN = new Date(
        nowVN.getFullYear(),
        nowVN.getMonth(),
        nowVN.getDate()
      );

      const total = Number(orderTotal || 0);

      const actives = (data || [])
        .filter((cp) => {
          const start = cp.couponStartDate
            ? new Date(cp.couponStartDate)
            : null;
          const end = cp.couponExpirationDate
            ? new Date(cp.couponExpirationDate)
            : null;
          const minOrder = Number(cp.couponMinOrderAmount || 0);
          const limit = Number(cp.couponUsageLimit ?? -1);
          const used = Number(cp.couponUsedCount || 0);

          // Làm phẳng start và end về đầu ngày VN
          const startDay = start
            ? new Date(start.getFullYear(), start.getMonth(), start.getDate())
            : null;
          const endDay = end
            ? new Date(end.getFullYear(), end.getMonth(), end.getDate())
            : null;

          const reasons = [];

          if (!cp.couponIsActive) reasons.push("inactive");
          if (!endDay) reasons.push("no_end");
          else if (endDay < todayVN) reasons.push("expired");
          if (startDay && startDay > todayVN) reasons.push("not_started");
          if (total < minOrder) reasons.push(`min_order(${minOrder})`);
          if (limit >= 0 && used >= limit) reasons.push("usage_limit");

          const ok = reasons.length === 0;

          console.log("[COUPON CHECK]", cp.couponCode, {
            ok,
            nowVN,
            startDay,
            endDay,
            total,
            minOrder,
            limit,
            used,
            reasons,
          });

          return ok;
        })
        .map((cp) => {
          let color = "bg-purple-100";
          if (
            String(cp.couponCode || "")
              .toUpperCase()
              .startsWith("FREESHIP")
          ) {
            color = "bg-green-100";
          } else if (cp.couponDiscountType === "percentage") {
            color = "bg-blue-100";
          }
          return { ...cp, color };
        });

      setCoupons(actives);

      // ======== Giữ lại các lựa chọn đã có ========
      if (Array.isArray(initialSelected) && initialSelected.length) {
        const want = new Set(initialSelected.map((x) => x._id));
        const hydrated = actives
          .filter((c) => want.has(c._id))
          .map((c) => withAppliedAmount(c));
        setSelected(hydrated);
      } else {
        setSelected((prev) => {
          if (!prev?.length) return [];
          const byId = new Map(actives.map((c) => [c._id, c]));
          return prev
            .map((old) => byId.get(old._id))
            .filter(Boolean)
            .map((c) => withAppliedAmount(c));
        });
      }
    } catch (err) {
      console.error("Lỗi khi lấy coupon:", err);
      setCoupons([]);
    }
  };

  const withAppliedAmount = (cp) => {
    const total = Number(orderTotal || 0);
    let discount = 0;

    if (cp.couponDiscountType === "percentage") {
      discount = (total * Number(cp.couponDiscount || 0)) / 100;
    } else if (cp.couponDiscountType === "fixed_amount") {
      discount = Number(cp.couponDiscount || 0);
    }

    const cap =
      cp.couponMaxDiscountAmount ?? cp.couponmaxDiscountAmount ?? null;
    if (typeof cap === "number") discount = Math.min(discount, cap);
    discount = Math.max(0, Math.min(discount, total));

    const isFS = String(cp.couponCode || "")
      .toUpperCase()
      .startsWith("FREESHIP");
    const color = isFS ? "bg-green-100" : cp.color;
    cp.color = color;
    cp.appliedAmount = discount;
    return { ...cp };
  };

  const handleToggle = (cp) => {
    setSelected((prev) => {
      const exists = prev.find((x) => x._id === cp._id);
      let next;
      if (exists) {
        next = prev.filter((x) => x._id !== cp._id);
      } else {
        next = [...prev, withAppliedAmount(cp)];
      }
      onSelectVoucher(next);
      return next;
    });
  };

  const { freeshipList, otherList } = useMemo(() => {
    const up = (s) => (s || "").toUpperCase();
    return {
      freeshipList: coupons.filter((cp) =>
        up(cp.couponCode).startsWith("FREESHIP")
      ),
      otherList: coupons.filter(
        (cp) => !up(cp.couponCode).startsWith("FREESHIP")
      ),
    };
  }, [coupons]);

  const handleClose = () => {
    dispatch(showModal({ isShowModal: false, modalChildren: null }));
  };

  const renderCouponItem = (cp) => {
    const checked = !!selected.find((x) => x._id === cp._id);
    const maxCap =
      cp.couponMaxDiscountAmount ?? cp.couponmaxDiscountAmount ?? null;

    return (
      <li
        key={cp._id}
        onClick={() => handleToggle(cp)}
        className={`p-3 rounded-3xl hover:scale-103 cursor-pointer transition-all duration-100 ${
          cp.color
        } ${checked ? "border-[2px] border-button-bg-ac" : ""}`}
      >
        <div className="flex justify-between items-start">
          <div>
            <div className="font-bold text-main text-sm">{cp.couponCode}</div>
            <div className="text-sm text-gray-800">{cp.couponDescription}</div>
            {maxCap != null && (
              <div className="text-sm text-gray-800 ">
                Giảm tối đa: {formatMoney(maxCap)}đ
              </div>
            )}
            <div className="text-xs text-gray-600 italic">
              Đơn tối thiểu: {formatMoney(cp.couponMinOrderAmount)}đ • Lượt còn
              lại: {cp.couponUsageLimit - cp.couponUsedCount}
            </div>
            <div className="text-xs text-gray-600 italic">
              NBD: {moment(cp.couponStartDate).format("DD/MM/YYYY")} • NHH:{" "}
              {moment(cp.couponExpirationDate).format("DD/MM/YYYY")}
            </div>
          </div>
          <div className="flex flex-col justify-between">
            <input
              type="checkbox"
              checked={checked}
              readOnly
              className="w-4 h-4 accent-blue-600 cursor-pointer "
            />
          </div>
        </div>
      </li>
    );
  };

  return (
    <div
      className="bg-white rounded-3xl w-[540px] max-h-[70vh] overflow-hidden flex flex-col relative shadow-md border"
      onClick={(e) => e.stopPropagation()}
    >
      <CloseButton onClick={handleClose} className="top-2 right-2" />

      <div className="p-4 border-b shadow-md text-center">
        <h2 className="text-md font-bold">Chọn voucher</h2>
      </div>

      <div className="overflow-y-auto p-4 space-y-4">
        {!createdById && (
          <div>
            <div className="font-semibold text-sm mb-2">
              Ưu đãi phí vận chuyển
            </div>
            {freeshipList.length ? (
              <ul className="space-y-2">
                {freeshipList.map(renderCouponItem)}
              </ul>
            ) : (
              <div className="text-xs text-gray-400">
                Không có mã FreeShip phù hợp
              </div>
            )}
          </div>
        )}

        <div>
          <div className="font-semibold text-sm mb-2">Mã giảm giá</div>
          {otherList.length ? (
            <ul className="space-y-2">{otherList.map(renderCouponItem)}</ul>
          ) : (
            <div className="text-xs text-gray-400">
              Không có mã khác phù hợp
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto border-t p-4 flex items-center justify-center w-full gap-2">
        <button
          onClick={() => {
            setSelected([]);
            onSelectVoucher([]);
            handleClose();
          }}
          className="rounded-3xl px-2 py-1 text-sm text-black bg-button-bg hover:bg-button-hv"
        >
          Bỏ tất cả
        </button>
        <button
          onClick={() => {
            handleClose();
          }}
          className="rounded-3xl px-2 py-1 text-sm text-white bg-button-bg-ac hover:bg-button-bg-hv"
        >
          Áp dụng
        </button>
      </div>
    </div>
  );
};
