import { useEffect, useState, useRef, useMemo } from "react";
import {
  useNavigate,
  useParams,
  useSearchParams,
  createSearchParams,
} from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";

import {
  apiGetOrdersByShop,
  apiUpdateOrders,
  apiGetOrderCountsByStatus,
} from "../../services/order.api";
import { showAlert } from "store/app/appSlice";
import { nextAlertId, registerHandlers } from "store/alert/alertBus";
import path from "ultils/path";
import { formatMoney } from "ultils/helpers";
import emptyOrder from "../../assets/order-empty.png";
import defaultAvatar from "../../assets/avatarDefault.png";
import { STATUS_BADGE } from "../../ultils/contants";
import { CopyText } from "../../components";

const TABS = [
  { label: "Tất cả", value: "" },
  { label: "Chờ xác nhận", value: "Pending" },
  { label: "Chờ lấy hàng", value: "Confirmed" },
  { label: "Vận chuyển", value: "Shipping" },
  { label: "Hoàn thành", value: "Succeeded" },
  { label: "Đã hủy", value: "Cancelled" },
];

const STATUS_LABEL = {
  Pending: "Chờ xác nhận",
  Confirmed: "Chờ lấy hàng",
  Shipping: "Vận chuyển",
  Delivered: "Đã giao",
  Succeeded: "Hoàn thành",
  Cancelled: "Đã hủy",
};

export const OrdersShopManage = ({ statusOrder }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { shopId: shopIdParams } = useParams();
  const [params] = useSearchParams();
  const { current } = useSelector((s) => s.seller);
  const isBlock = current?.shopStatus === "blocked";

  const shopId = current?._id || shopIdParams;

  // 1. Lưu lại giá trị mặc định được truyền từ trang (ví dụ "Cancelled")
  //    Nó sẽ KHÔNG thay đổi giữa các render.
  const initialStatusRef = useRef(statusOrder || "");

  // 2. Đọc trạng thái filter từ URL hiện tại (nếu có)
  const statusFromURL = params.get("orderStatusName") || "";
  const searchKeyword = params.get("s") || "";

  const statusParam = statusFromURL || initialStatusRef.current;

  // state data
  const [orders, setOrders] = useState([]);
  const [countsByStatus, setCountsByStatus] = useState({});
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  // ================== Fetchers ==================
  const fetchOrders = async () => {
    if (!shopId) return;
    setLoading(true);
    try {
      //Mục đích: riêng tab “Vận chuyển” mình muốn hiển thị Shipping + Delivered, nên không filter ở BE, mà để FE tự lọc.
      const paramsReq = {
        ...(statusParam &&
          statusParam !== "Shipping" && {
            orderStatusName: statusParam,
          }),
        ...(searchKeyword && { s: searchKeyword }),
      };

      const res = await apiGetOrdersByShop(shopId, paramsReq);

      if (res?.success) {
        let list = res.data || [];

        if (statusParam === "Shipping") {
          list = list.filter((o) => {
            const st = o?.orderStatusId?.orderStatusName;
            return st === "Shipping" || st === "Delivered";
          });
        }

        setOrders(list);
      }
    } catch (e) {
      console.error(e);
      dispatch(
        showAlert({
          title: "Lỗi",
          message: "Không thể tải đơn hàng.",
          variant: "danger",
        })
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchCountsByStatus = async () => {
    try {
      const res = await apiGetOrderCountsByStatus({ shopId });
      if (res.success) {
        const raw = res.counts || {};

        const merged = {
          ...raw,
          Shipping: (raw.Shipping || 0) + (raw.Delivered || 0),
        };
        setCountsByStatus(merged);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchCountsByStatus();
  }, [shopId, statusParam, searchKeyword]);

  // ================== Handlers ==================
  const handleClickTab = (tabValue) => {
    navigate({
      pathname: `/${path.SELLER}/${shopId}/${path.S_ORDER}`,
      search: createSearchParams({
        orderStatusName: tabValue,
        ...(searchKeyword && { s: searchKeyword }),
      }).toString(),
    });
  };

  const handleUpdate = async (orderId, nextStatus) => {
    if (nextStatus === "Cancelled") {
      const id = nextAlertId();
      registerHandlers(id, {
        onConfirm: async () => {
          try {
            setUpdatingId(orderId);
            const res = await apiUpdateOrders(orderId, {
              orderStatusName: nextStatus,
            });
            if (res?.success) {
              dispatch(
                showAlert({
                  title: "Thành công",
                  message: `Đã cập nhật trạng thái: ${STATUS_LABEL[nextStatus]}`,
                  variant: "success",
                  duration: 1500,
                })
              );
              await Promise.all([fetchOrders(), fetchCountsByStatus()]);
            } else {
              dispatch(
                showAlert({
                  title: "Lỗi",
                  message: res?.message || "Cập nhật trạng thái thất bại",
                  variant: "danger",
                })
              );
            }
          } catch (e) {
            dispatch(
              showAlert({
                title: "Lỗi",
                message: "Không thể cập nhật trạng thái.",
                variant: "danger",
              })
            );
          } finally {
            setUpdatingId(null);
          }
        },
      });

      dispatch(
        showAlert({
          id,
          title: "Xác nhận hủy đơn",
          message: "Bạn có chắc chắn muốn hủy đơn hàng này?",
          variant: "danger",
          showCancelButton: true,
          confirmText: "Hủy đơn",
          cancelText: "Không",
        })
      );

      return;
    }

    // Các trạng thái khác -> cập nhật trực tiếp
    try {
      setUpdatingId(orderId);

      const payload = {
        orderStatusName: nextStatus,
        ...(nextStatus === "Succeeded" && { orderDeliveryDate: new Date() }),
      };

      const res = await apiUpdateOrders(orderId, payload);

      if (res?.success) {
        dispatch(
          showAlert({
            title: "Thành công",
            message: `Đã cập nhật trạng thái: ${STATUS_LABEL[nextStatus]}`,
            variant: "success",
            duration: 1500,
            showConfirmButton: false,
          })
        );
        await Promise.all([fetchOrders(), fetchCountsByStatus()]);
      } else {
        dispatch(
          showAlert({
            title: "Lỗi",
            message: res?.message || "Cập nhật trạng thái thất bại",
            variant: "danger",
          })
        );
      }
    } catch (e) {
      dispatch(
        showAlert({
          title: "Lỗi",
          message: "Không thể cập nhật trạng thái.",
          variant: "danger",
        })
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const tabCss =
    "flex-1 py-1 px-2 transition-all duration-200 rounded-2xl hover:bg-gray-200 whitespace-nowrap text-sm lg:text-base";

  return (
    <div className="w-full relative px-4">
      {/* Thanh tabs */}
      <div className="sticky top-[50px] z-10">
        <div className="bg-button-hv text-black rounded-3xl p-1 border flex overflow-hidden">
          {TABS.map((tab) => {
            const countKey = tab.value || null;
            const count = countKey ? countsByStatus[countKey] || 0 : 0;
            const showCount =
              tab.value !== "" &&
              tab.value !== "Succeeded" &&
              tab.value !== "Cancelled" &&
              count > 0;

            return (
              <button
                key={tab.value}
                onClick={() => handleClickTab(tab.value)}
                className={`${tabCss} ${
                  statusParam === tab.value
                    ? "bg-white text-button-bg-ac font-bold"
                    : ""
                }`}
              >
                <span>
                  {tab.label}
                  {showCount && (
                    <span
                      className={
                        statusParam === tab.value
                          ? "font-bold text-button-bg-ac"
                          : ""
                      }
                    >
                      {" "}
                      ({count})
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Danh sách đơn */}
      <div className="space-y-4 mt-4">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Đang tải...</div>
        ) : orders.length > 0 ? (
          orders.map((o) => {
            const statusName = o?.orderStatusId?.orderStatusName;
            const badge = STATUS_BADGE[statusName] || {
              label: "Không xác định",
              bg: "bg-gray-100",
              text: "text-gray-600",
            };

            return (
              <div
                key={o._id}
                className="bg-white rounded-3xl border p-5 space-y-4 "
              >
                <div className="flex justify-between items-center border-b pb-3">
                  <div className="flex items-center gap-2 text-xs md:text-sm">
                    <div className="w-7 h-7  aspect-auto overflow-hidden rounded-full border">
                      <img
                        src={o?.customerId?._id?.userAvatar || defaultAvatar}
                        alt="userAvatar"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p>{o.addressId?.addressUserName}</p>
                    <p className="hidden lg:flex justify-center items-center gap-1">
                      {" "}
                      | Mã đơn: {o._id} <CopyText text={o._id} />
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-3xl ${badge.bg} ${badge.text} whitespace-nowrap`}
                  >
                    {badge.label}
                  </span>
                </div>

                <div className="flex flex-col gap-3">
                  {(o.items || []).map((it) => {
                    const pv = it.productVariation || it.pvId;
                    const product = pv?.productId;
                    const isOnSale = product?.productDiscountPercent > 0;
                    const thumb = pv?.pvImages?.[0];
                    const pvName = pv?.pvName || "Phân loại";
                    const productName = product?.productName || "Sản phẩm";
                    const qty = it.odQuantity ?? 1;
                    const unitPrice = it.odPrice ?? 0;
                    const originalPrice = pv?.pvOriginalPrice || pv?.pvPrice;

                    return (
                      <div
                        key={it._id}
                        className="flex items-center gap-4 border rounded-3xl p-3 bg-white shadow-sm"
                      >
                        <img
                          src={thumb || "/no-image.png"}
                          alt="thumb"
                          className="w-20 h-20 object-cover rounded-xl border"
                        />
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 text-sm md:text-base">
                            {isOnSale && (
                              <span className="mr-1 rounded-3xl border bg-red-500 text-white text-[8px] px-1 py-1 align-middle">
                                Sale {product?.productDiscountPercent}%
                              </span>
                            )}
                            {productName}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Phân loại: {pvName}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            x{qty}
                          </div>
                        </div>
                        <div className="text-right min-w-[120px]">
                          <div className="text-gray-400 line-through text-xs">
                            {formatMoney(originalPrice)}đ
                          </div>
                          <div className="text-red-500 text-xs md:text-sm">
                            {formatMoney(unitPrice)}đ
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex flex-col text-sm">
                  <div className="flex justify-between items-center gap-4">
                    <div className="text-xs">
                      <div>
                        Ngày đặt hàng:{" "}
                        {moment(o.orderDate).format("DD/MM/YYYY HH:mm")}
                      </div>
                      {o.orderDeliveryDate && (
                        <div>
                          Ngày nhận:{" "}
                          {moment(o.orderDeliveryDate).format(
                            "DD/MM/YYYY HH:mm"
                          )}
                        </div>
                      )}
                    </div>
                    <div>
                      <span className="text-gray-500">Tổng tiền: </span>
                      <span className="font-bold text-red-500 text-sm md:text-base">
                        {Number(o.orderTotalPrice || 0).toLocaleString()}₫
                      </span>
                      <span></span>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() =>
                        navigate(
                          `/${path.SELLER}/${shopId}/${path.S_ORDER}/${o._id}`
                        )
                      }
                      className="border rounded-3xl px-2 py-1 hover:bg-button-hv"
                    >
                      Xem chi tiết
                    </button>

                    {/* Nút hành động theo trạng thái hiện tại */}
                    {!isBlock &&
                      (STATUS_BADGE[statusName]?.action || []).map((act) => (
                        <button
                          key={act.value}
                          onClick={() => handleUpdate(o._id, act.value)}
                          disabled={updatingId === o._id}
                          className={`
          border rounded-3xl px-2 py-1
          ${
            act.value === "Cancelled"
              ? "bg-red-500 hover:bg-red-600 text-white"
              : "bg-button-bg-ac hover:bg-button-bg-hv text-white"
          }
          ${updatingId === o._id ? "opacity-60 cursor-not-allowed" : ""}
        `}
                        >
                          {updatingId === o._id
                            ? "Đang cập nhật..."
                            : act.label}
                        </button>
                      ))}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center h-[500px]">
            <img src={emptyOrder} alt="empty" className="w-36 h-36 mb-2" />
            <p className="text-center italic text-gray-400">Chưa có đơn hàng</p>
          </div>
        )}
      </div>
    </div>
  );
};
