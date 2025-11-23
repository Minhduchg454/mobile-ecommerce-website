import { showModal, showAlert } from "store/app/appSlice";
import { apiGetCoupons, apiDeleteCoupon } from "../../services/coupon.api";
import noData from "../../assets/data-No.png";
import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CopyText } from "../../components";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";
import { nextAlertId, registerHandlers } from "store/alert/alertBus";
import { AiOutlineEdit, AiOutlineDelete } from "react-icons/ai";
import { formatMoney } from "ultils/helpers";
import moment from "moment";
import { VoucherForm } from "./voucherForm";
import { useSelector, useDispatch } from "react-redux";

export const CouponManage = ({ createdById }) => {
  const dispatch = useDispatch();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const { current } = useSelector((s) => s.user);
  const { current: shopCurrent } = useSelector((s) => s.seller);
  const [searchParams, setSearchParams] = useSearchParams();
  const searchKeyword = searchParams.get("s") || "";
  const sortKeyParam = searchParams.get("sortKey") || "createdAt";
  const sortDirParam = searchParams.get("sortDir") || "-1";

  const [isShowSort, setIsShowSort] = useState(false);
  const [count, setCount] = useState(0);
  const isBlock = !!(createdById && shopCurrent?.shopStatus === "blocked");

  // ===== SORT OPTIONS =====
  const sortOptions = [
    { label: "Mới nhất", sortKey: "createdAt", sortDir: "-1" },
    { label: "Cũ nhất", sortKey: "createdAt", sortDir: "1" },
    { label: "Còn hạn sử dụng", sortKey: "isActive", sortDir: "true" },
    { label: "Hết hạn sử dụng", sortKey: "isActive", sortDir: "false" },
    { label: "Giảm phần trăm", sortKey: "type", sortDir: "percentage" },
    { label: "Giảm tiền mặt", sortKey: "type", sortDir: "fixed_amount" },
  ];

  const currentSort =
    sortOptions.find(
      (opt) => opt.sortKey === sortKeyParam && opt.sortDir === sortDirParam
    ) || sortOptions[0];

  // ===== API FETCH =====
  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const query = {
        s: searchKeyword || undefined,
        createdById: createdById || undefined,
        createdByType: createdById ? "Shop" : "Admin",
      };

      // Mapping sort
      if (sortKeyParam === "createdAt") {
        query.sort = sortDirParam === "-1" ? "-createdAt" : "createdAt";
      } else if (sortKeyParam === "isActive") {
        query.isActive = sortDirParam === "true";
      } else if (sortKeyParam === "type") {
        query.type = sortDirParam;
      }

      const res = await apiGetCoupons(query);

      if (res?.success) {
        const formatted = (res?.coupons || []).map((cp) => {
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

        setCoupons(formatted);
        setCount(res?.coupons?.length || 0);
      } else {
        dispatch(
          showAlert({
            title: "Không thể tải danh sách",
            message: res?.message || "Vui lòng thử lại sau",
            variant: "danger",
            showConfirmButton: false,
            duration: 1500,
          })
        );
        setCoupons([]);
      }
    } catch (err) {
      console.error("Lỗi khi lấy coupon:", err);
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  // ==== gọi lại khi params thay đổi ====
  useEffect(() => {
    fetchCoupons();
  }, [searchKeyword, sortKeyParam, sortDirParam, createdById]);

  // ===== HANDLERS =====
  const handleDelete = (couponId) => {
    const id = nextAlertId();
    registerHandlers(id, {
      onConfirm: async () => {
        const res = await apiDeleteCoupon(couponId);
        if (res.success) {
          dispatch(
            showAlert({
              title: "Đã xoá",
              message: "Xoá voucher thành công",
              variant: "success",
              duration: 1500,
              showConfirmButton: false,
            })
          );
          await fetchCoupons();
        } else {
          dispatch(
            showAlert({
              title: "Lỗi",
              message: `Xoá voucher thất bại, ${res?.message || ""}`,
              variant: "danger",
            })
          );
        }
      },
      onCancel: () => {},
      onClose: () => {},
    });

    dispatch(
      showAlert({
        id,
        title: "Bạn có chắc chắn muốn xóa voucher này không",
        variant: "danger",
        showCancelButton: true,
        confirmText: "Có",
        cancelText: "Không",
      })
    );
  };
  const handleEdit = (coupon) => {
    dispatch(
      showModal({
        isShowModal: true,
        modalChildren: (
          <VoucherForm
            initialData={coupon}
            createdById={current._id}
            createdByType={createdById ? "Shop" : "Admin"}
            onClose={() => dispatch(showModal({ isShowModal: false }))}
            onCloseSuccess={() => fetchCoupons()}
          />
        ),
      })
    );
  };
  const handleCreateCoupon = () => {
    dispatch(
      showModal({
        isShowModal: true,
        modalChildren: (
          <VoucherForm
            createdById={current._id}
            createdByType={createdById ? "Shop" : "Admin"}
            onClose={() => dispatch(showModal({ isShowModal: false }))}
            onCloseSuccess={() => fetchCoupons()}
          />
        ),
      })
    );
  };

  const { freeshipList, activeList, inactiveList } = useMemo(() => {
    const up = (s) => (s || "").toUpperCase();

    const freeship = coupons.filter((cp) =>
      up(cp.couponCode).startsWith("FREESHIP")
    );

    const active = coupons.filter(
      (cp) =>
        !up(cp.couponCode).startsWith("FREESHIP") && cp.couponIsActive === true
    );

    const inactive = coupons.filter(
      (cp) =>
        !up(cp.couponCode).startsWith("FREESHIP") && cp.couponIsActive === false
    );

    return {
      freeshipList: freeship,
      activeList: active,
      inactiveList: inactive,
    };
  }, [coupons]);

  const rederCouponItem = (cp) => {
    return (
      <div
        key={cp._id}
        className={`flex items-center justify-between p-2 md:p-4 rounded-3xl cursor-pointer transition-all duration-100  ${cp.color} border`}
      >
        <div
          className={`${!cp.couponIsActive ? "opacity-50" : ""} flex flex-col`}
        >
          <div className="font-bold  text-sm flex items-center gap-1">
            <p>{cp.couponCode}</p>
            <CopyText text={cp.couponCode} className="text-black text-xs" />
            {!cp.couponIsActive && (
              <span className="text-gray-400">(Đã hết hạn)</span>
            )}
          </div>
          <div className="text-sm text-gray-800">{cp.couponDescription}</div>
          <div className="text-sm text-gray-800">
            Trạng thái: {cp.couponIsActive ? "hoạt động" : "vô hiệu hóa"}
          </div>

          <div className="text-sm text-gray-800">
            Giảm tối đa: {formatMoney(cp.couponMaxDiscountAmount)}đ
          </div>

          <div className="text-xs text-gray-600 italic">
            Đơn tối thiểu: {formatMoney(cp.couponMinOrderAmount)}đ • Loại:
            {cp.couponDiscountType === "percentage" ? `%` : `tiền mặt`} • Lượt
            còn lại: {cp.couponUsageLimit - cp.couponUsedCount}
          </div>
          <div className="text-xs text-gray-600 italic">
            NBD:{moment(cp.couponStartDate).format("DD/MM/YYYY")} • NHH:{" "}
            {moment(cp.couponExpirationDate).format("DD/MM/YYYY")}
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-start  gap-2">
          <button
            disabled={isBlock}
            onClick={() => handleEdit(cp)}
            className={`${buttonAction}`}
          >
            <AiOutlineEdit size={16} /> Sửa
          </button>
          <button
            disabled={isBlock}
            onClick={() => handleDelete(cp._id)}
            className={`${buttonAction}`}
          >
            <AiOutlineDelete size={16} /> Xóa
          </button>
        </div>
      </div>
    );
  };

  // ===== UI =====
  const titleCls = "font-bold mb-1";
  const buttonAction =
    "text-xs md:text-sm whitespace-nowrap border px-2 py-1 rounded-3xl flex items-center gap-1 text-black bg-white hover:bg-button-hv";

  return (
    <div className="relative flex flex-col gap-4">
      {/* HEADER BAR */}
      <div className="bg-app-bg/60 backdrop-blur-sm rounded-3xl px-3 py-2 md:px-4 sticky top-[50px] z-10 flex justify-between items-center gap-2">
        <h1 className={titleCls}>{count} voucher</h1>

        <div className="flex items-center gap-2">
          {/* SORT */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsShowSort((v) => !v)}
              className="glass shadow-md md:px-2 py-1 px-1 border rounded-2xl text-description flex items-center gap-1"
              aria-haspopup="listbox"
              aria-expanded={isShowSort}
            >
              Sắp xếp:{" "}
              <span className="font-bold text-sm">{currentSort.label}</span>
              {isShowSort ? (
                <MdKeyboardArrowUp size={18} className="ml-1" />
              ) : (
                <MdKeyboardArrowDown size={18} className="ml-1" />
              )}
            </button>

            {isShowSort && (
              <div
                role="listbox"
                className="absolute right-0 mt-2 w-52 bg-white/90 backdrop-blur-md border rounded-xl shadow-lg p-1 z-20"
              >
                {sortOptions.map((opt) => {
                  const isActive =
                    opt.sortKey === sortKeyParam &&
                    opt.sortDir === sortDirParam;

                  return (
                    <button
                      key={`${opt.sortKey}:${opt.sortDir}`}
                      role="option"
                      aria-selected={isActive}
                      onClick={() => {
                        setSearchParams((prev) => {
                          const params = new URLSearchParams(prev);
                          params.set("sortKey", opt.sortKey);
                          params.set("sortDir", opt.sortDir);
                          return params;
                        });
                        setIsShowSort(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-gray-action ${
                        isActive ? "bg-gray-100 font-bold" : ""
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <button
            disabled={isBlock}
            onClick={handleCreateCoupon}
            className={`px-3 py-1 whitespace-nowrap rounded-3xl text-white shadow-md text-sm  ${
              isBlock
                ? "bg-gray-400 cursor-not-allowed opacity-50"
                : "bg-button-bg-ac hover:bg-button-bg-hv cursor-pointer"
            }`}
          >
            Thêm voucher
          </button>
        </div>
      </div>

      {/* BODY */}
      {loading ? (
        <div className="flex justify-center py-12">Đang tải...</div>
      ) : coupons.length > 0 ? (
        <div className="flex flex-col gap-6 animate-fadeIn">
          {freeshipList.length > 0 && (
            <div>
              <h3 className="font-semibold text-sm mb-2 px-2">
                Ưu đãi phí vận chuyển
              </h3>
              <div className="flex flex-col gap-3">
                {freeshipList.map((cp) => rederCouponItem(cp))}
              </div>
            </div>
          )}

          {activeList.length > 0 && (
            <div>
              <h3 className="font-semibold text-sm mb-2 px-2">Mã giảm giá</h3>
              <div className="flex flex-col gap-3">
                {activeList.map((cp) => rederCouponItem(cp))}
              </div>
            </div>
          )}

          {inactiveList.length > 0 && (
            <div>
              <h3 className="font-semibold text-sm mb-2 px-2">
                Hết hạn / Vô hiệu hóa
              </h3>
              <div className="flex flex-col gap-3">
                {inactiveList.map((cp) => rederCouponItem(cp))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-6 h-[500px] bg-white rounded-3xl">
          <img
            src={noData}
            alt="No Data"
            className="w-32 h-32 mb-4 opacity-50"
          />
          <p className="text-black">Không có voucher nào</p>
        </div>
      )}
    </div>
  );
};
