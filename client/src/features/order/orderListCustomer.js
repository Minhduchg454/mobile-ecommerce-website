// src/pages/orders/OrderListCustomer.jsx
import { useEffect, useMemo, useState, useRef } from "react";
import {
  createSearchParams,
  useLocation,
  useNavigate,
  useSearchParams,
  useParams,
} from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";
import { CreatePreviewProductForm } from "../preview/createPreviewProductForm"; // Đã import
import {
  apiGetOrdersByCustomer,
  apiUpdateOrders,
  apiGetOrderCountsByStatus,
} from "../../services/order.api";
import { apiGetPreviews } from "../../services/preview.api";
import { showAlert } from "store/app/appSlice";
import { nextAlertId, registerHandlers } from "store/alert/alertBus";
import { showModal } from "store/app/appSlice"; // Đã import
import path from "ultils/path";
import { formatMoney } from "ultils/helpers";
import emptyOrder from "../../assets/order-empty.png";
import noPhoto from "../../assets/image-not-found.png";
import { STATUS_BADGE } from "../../ultils/contants";

// ================== UI helpers ==================
const TABS = [
  { label: "Tất cả", value: "" },
  { label: "Chờ xác nhận", value: "Pending" },
  { label: "Chờ lấy hàng", value: "Confirmed" },
  { label: "Vận chuyển", value: "Shipping" },
  { label: "Hoàn thành", value: "Succeeded" },
  { label: "Đã hủy", value: "Cancelled" },
];

export const OrderListCustomer = ({ statusOrder }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const { customerId } = useParams;

  const { current } = useSelector((s) => s.user);
  const userId = current?._id || current?.userId;
  const [orders, setOrders] = useState([]);
  const [countsByStatus, setCountsByStatus] = useState({});
  const [loading, setLoading] = useState(false);
  const statusFromURL = params.get("orderStatusName") || "";
  const initialStatusRef = useRef(statusOrder || "");

  // query state
  const statusParam = statusFromURL || initialStatusRef.current;
  const searchKeyword = params.get("s") || "";
  const idParam = customerId || userId || "";

  // ================== Fetchers ==================

  const fetchOrders = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const paramsReq = {};

      // nếu có trạng thái thì thêm vào
      if (statusParam && statusParam !== "Shipping") {
        paramsReq.orderStatusName = statusParam;
      }

      if (searchKeyword.trim()) {
        paramsReq.s = searchKeyword.trim();
      }

      const res = await apiGetOrdersByCustomer(userId, paramsReq);

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

  const checkIsExpired = (deliveryDate, expireDays = 3) => {
    if (!deliveryDate) return true;
    const diffDays = moment().diff(moment(deliveryDate), "days");
    return diffDays > expireDays;
  };

  const fetchCountsByStatus = async () => {
    try {
      const res = await apiGetOrderCountsByStatus({ customerId: current._id });

      if (res.success) {
        const raw = res.counts || {};

        const merged = {
          ...raw,
          Shipping: (raw.Shipping || 0) + (raw.Delivered || 0),
        };
        setCountsByStatus(merged);
      }
    } catch (err) {
      console.error("Failed to fetch counts by status:", err);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchCountsByStatus();
  }, [userId, statusParam, searchKeyword, idParam]);

  // ================== Handlers ==================

  // Hàm mới: Mở modal đánh giá
  const handleOpenPreviewModal = async (item, order) => {
    const previewId = item.previewInfo?._id;
    const edited = item?.previewInfo?.isEdited || false;
    let oldPreview = item.previewInfo; // Giữ lại thông tin cơ bản

    // Tải dữ liệu chi tiết nếu đã có ID đánh giá (Lazy loading)
    if (previewId) {
      try {
        // [Chưa xác minh] Giả định API getPreviews hỗ trợ lấy chi tiết theo ID
        const res = await apiGetPreviews({ _id: previewId });
        if (res?.success && res.previews?.length > 0) {
          oldPreview = res.previews[0]; // Cập nhật với dữ liệu chi tiết
        }
      } catch (e) {
        console.error("Lỗi khi tải chi tiết đánh giá:", e);
        dispatch(
          showAlert({
            title: "Lỗi",
            message: "Không thể tải chi tiết đánh giá.",
            variant: "danger",
          })
        );
        // dispatch(showModal({ isShowModal: false, modalChildren: null })); // Đóng modal nếu lỗi
        return;
      } finally {
        // [Suy luận] Nếu có hiển thị Loading, cần ẩn nó đi ở đây
      }
    }

    dispatch(
      showModal({
        isShowModal: true,
        modalChildren: (
          <CreatePreviewProductForm
            onClose={() => {
              dispatch(showModal({ isShowModal: false, modalChildren: null }));
              fetchOrders();
              fetchCountsByStatus();
            }}
            customerId={userId}
            orderId={order._id}
            pvId={item.productVariation?._id}
            deliveryDate={order.orderDeliveryDate}
            isEdited={edited}
            oldPreview={oldPreview}
          />
        ),
      })
    );
  };

  // Hàm mới: Kiểm tra sản phẩm đã được đánh giá chưa
  const checkIfPreviewed = (item) => {
    // [Chưa xác minh] Giả định server trả về item.previewInfo khi đã đánh giá
    return !!item.previewInfo?._id;
  };

  const handleClickTab = (tabValue) => {
    navigate({
      pathname: `/${path.CUSTOMER}/${current._id}/${path.C_ORDER}`,
      search: createSearchParams({
        orderStatusName: tabValue,
        ...(searchKeyword && { s: searchKeyword }),
      }).toString(),
    });
  };

  const handleConfirmReceived = async (orderId) => {
    const id = nextAlertId();
    registerHandlers(id, {
      onConfirm: async () => {
        try {
          const res = await apiUpdateOrders(orderId, {
            orderStatusName: "Succeeded",
            orderDeliveryDate: new Date(),
          });

          if (res?.success) {
            dispatch(
              showAlert({
                title: "Thành công",
                message: "Cảm ơn bạn đã xác nhận đã nhận hàng.",
                variant: "success",
                showConfirmButton: false,
                duration: 1500,
              })
            );
            await Promise.all([fetchOrders(), fetchCountsByStatus()]);
          } else {
            dispatch(
              showAlert({
                title: "Lỗi",
                message: res?.message || "Không thể xác nhận đã nhận hàng.",
                variant: "danger",
              })
            );
          }
        } catch (e) {
          dispatch(
            showAlert({
              title: "Lỗi",
              message: "Không thể xác nhận đã nhận hàng.",
              variant: "danger",
            })
          );
        }
      },
    });

    dispatch(
      showAlert({
        id,
        title: "Xác nhận đã nhận hàng",
        message: "Bạn đã nhận đủ hàng và muốn hoàn tất đơn này?",
        variant: "success",
        showCancelButton: true,
        confirmText: "Đã nhận",
        cancelText: "Chưa",
      })
    );
  };

  const handleCancelOrder = async (orderId) => {
    const id = nextAlertId();

    registerHandlers(id, {
      onConfirm: async () => {
        const res = await apiUpdateOrders(orderId, {
          orderStatusName: "Cancelled",
        });

        if (res?.success) {
          dispatch(
            showAlert({
              title: "Thành công",
              message: "Đã hủy đơn hàng.",
              variant: "success",
              showConfirmButton: false,
              duration: 1500,
            })
          );
          fetchOrders();
        } else {
          dispatch(
            showAlert({
              title: "Lỗi",
              message: `Không thể hủy đơn hàng: ${
                res?.message || "Lỗi không xác định"
              }`,
              variant: "danger",
            })
          );
        }
      },
    });

    dispatch(
      showAlert({
        id,
        title: "Xác nhận hủy đơn hàng",
        message: "Bạn có chắc muốn hủy đơn hàng này không?",
        variant: "danger",
        showCancelButton: true,
        confirmText: "Có",
        cancelText: "Không",
      })
    );
  };
  const tabCss =
    "flex-1 py-1 px-2 transition-all duration-200 rounded-2xl hover:bg-gray-200 whitespace-nowrap text-sm lg:text-base";

  // ================== Render ==================
  return (
    <div className="w-full relative px-4">
      <div className="sticky top-[50px] z-10 flex flex-col flex-wrap">
        {/* Tabs trạng thái */}
        <div className="bg-button-hv text-black rounded-3xl p-1 border flex overflow-hidden ">
          {TABS.map((tab) => {
            const hiddenCountTabs = ["", "Succeeded", "Cancelled"];
            const count = countsByStatus[tab.value] || 0;
            const showCount =
              tab.value && !hiddenCountTabs.includes(tab.value) && count > 0;

            return (
              <button
                key={tab.value}
                onClick={() => handleClickTab(tab.value)}
                className={`${tabCss} ${
                  (statusParam || "") === tab.value
                    ? "bg-white  text-button-bg-ac font-bold"
                    : ""
                }`}
              >
                <span>
                  {tab.label}{" "}
                  {showCount && (
                    <span
                      className={`${
                        (statusParam || "") === tab.value
                          ? " font-bold text-button-bg-ac"
                          : ""
                      }`}
                    >
                      ({countsByStatus[tab.value]})
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
        ) : orders?.length > 0 ? (
          orders.map((o) => {
            const statusName = o?.orderStatusId?.orderStatusName;
            const isSucceeded = statusName === "Succeeded"; // Trạng thái Hoàn thành
            const badge = STATUS_BADGE[statusName] || {
              label: "Không xác định",
              bg: "bg-gray-100",
              text: "text-gray-600",
            };

            return (
              <div
                key={o._id}
                className="bg-white rounded-3xl  border p-5 space-y-4"
              >
                {/* Header */}
                <div className="flex justify-between items-center border-b pb-3">
                  <div className="flex items-center justify-start gap-2">
                    <div className="relative">
                      <img
                        onClick={() =>
                          navigate(`/${path.SHOP}/${o.shopId?._id}`)
                        }
                        src={o.shopId?.shopLogo}
                        alt={o.shopId?.shopName}
                        className="w-10 h-10 rounded-full object-cover border cursor-pointer border-gray-300"
                      />
                      {o.shopId?.shopIsOfficial && (
                        <div className="border rounded-lg line-clamp-1 absolute -bottom-2 right-1/2 translate-x-1/2 bg-red-600 text-white py-0.5 px-1 text-[8px]">
                          Mall
                        </div>
                      )}
                    </div>

                    <p
                      className="font-semibold text-base md:text-lg block max-w-[200px] truncate"
                      title={o.shopId?.shopName}
                    >
                      {o.shopId?.shopName}
                    </p>
                    <button
                      onClick={() => navigate(`/${path.SHOP}/${o.shopId?._id}`)}
                      className="text-xs md:text-sm border hover:bg-button-hv px-2 py-0.5 rounded-3xl whitespace-nowrap"
                    >
                      Xem shop
                    </button>
                  </div>

                  <span
                    className={`text-xs md:text-sm px-2 py-0.5 rounded-3xl whitespace-nowrap ${badge.bg} ${badge.text}`}
                  >
                    {badge.label}
                  </span>
                </div>

                {/* Items */}
                <div className="flex flex-col gap-3">
                  {(o.items || []).map((it) => {
                    const pv = it.productVariation;
                    const product = pv?.productId;
                    const thumb = pv?.pvImages?.[0] || noPhoto;
                    const pvName = pv?.pvName || "Phân loại";
                    const productName = product?.productName || "Sản phẩm";
                    const isOnSale = product?.productDiscountPercent > 0;
                    const qty = it.odQuantity ?? 1;
                    const unitPrice = it.odPrice ?? 0;
                    const originalPrice = pv?.pvOriginalPrice || pv?.pvPrice;
                    const isPreviewed = checkIfPreviewed(it);
                    const isExpired = checkIsExpired(o.orderDeliveryDate);
                    const isAlreadyEdited = it.previewInfo?.isEdited || false;

                    let buttonText = "";
                    let buttonClass = "";

                    if (isSucceeded) {
                      if (isExpired || isAlreadyEdited) {
                        buttonText = isPreviewed
                          ? "Xem đánh giá"
                          : "Hết hạn đánh giá";
                        buttonClass =
                          "text-gray-500 bg-transparent border-0 hover:text-button-bg-ac hover:underline";
                      } else {
                        buttonText = isPreviewed ? "Sửa đánh giá" : "Đánh giá";
                        buttonClass = isPreviewed
                          ? " text-black hover:bg-green-600 border"
                          : " text-black hover:bg-yellow-600 border";
                      }
                    }
                    return (
                      <div
                        key={it._id}
                        className="flex justify-between items-center gap-4 border rounded-3xl p-3 bg-white shadow-sm "
                      >
                        <button
                          onClick={() => {
                            navigate(`/${path.PRODUCTS}/${it.pvId}`);
                          }}
                          className="flex gap-2"
                        >
                          <img
                            src={thumb}
                            alt="thumb"
                            className="w-20 h-20 object-cover rounded-xl border"
                            onError={(e) => {
                              e.currentTarget.src = "/no-image.png";
                            }}
                          />

                          <div className="flex flex-col justify-center items-start flex-1">
                            <span className="text-left font-semibold text-sm md:text-base text-gray-900">
                              {isOnSale && (
                                <span className="mr-1 rounded-3xl border bg-red-500 text-white text-[8px] px-1 py-1 align-middle">
                                  Sale {product?.productDiscountPercent}%
                                </span>
                              )}

                              {productName}
                            </span>
                            <span className="text-xs md:text-sm text-gray-500 mt-1">
                              Phân loại: {pvName}
                            </span>
                            <span className="text-xs md:text-sm text-gray-500 mt-1">
                              x{qty}
                            </span>
                          </div>
                        </button>
                        <div className="flex flex-col justify-center items-end gap-2 text-right min-w-[120px]">
                          <div className="flex flex-col">
                            <span className="text-gray-400 line-through text-xs md:text-sm">
                              {formatMoney(originalPrice)}đ
                            </span>
                            <span className="text-red-500 text-xs md:text-sm">
                              {formatMoney(unitPrice)}đ
                            </span>
                          </div>

                          {/* Nút đánh giá/Xem chi tiết */}
                          {isSucceeded && (
                            <button
                              onClick={() => {
                                handleOpenPreviewModal(it, o);
                              }}
                              className={`w-fit text-xs px-2 py-1 rounded-3xl whitespace-nowrap transition-all duration-150 border
                                ${buttonClass}
                              `}
                            >
                              {buttonText}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex flex-col  text-sm">
                  <div className="flex justify-between items-center pt-2 gap-4">
                    <div className="text-xs md:text-sm">
                      <div>
                        Ngày mua:{" "}
                        {moment(o.createdAt).format("DD/MM/YYYY HH:mm")}
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
                      <span className="text-gray-500 text-xs md:text-sm">
                        Tổng tiền:{" "}
                      </span>
                      <span className="font-semibold text-red-500 text-sm md:text-base">
                        {Number(o.orderTotalPrice || 0).toLocaleString()}₫
                      </span>
                    </div>
                  </div>

                  {/* Hành động */}
                  <div className="flex justify-end items-center gap-2 pt-2 text-sm md:text-base">
                    <button
                      onClick={() =>
                        navigate(
                          `/${path.CUSTOMER}/${userId}/${path.C_ORDER}/${o._id}`
                        )
                      }
                      className="border border-3 rounded-3xl px-2 py-1 hover:bg-button-hv"
                    >
                      Xem chi tiết
                    </button>

                    {/* Hủy đơn – chỉ khi Pending (hoặc thêm Confirmed nếu bạn cho phép) */}
                    {statusName === "Pending" && (
                      <button
                        className="border rounded-3xl px-2 py-1 text-white bg-red-500 hover:bg-red-600"
                        onClick={() => handleCancelOrder(o._id)}
                      >
                        Hủy đơn
                      </button>
                    )}

                    {/* Đã nhận hàng – chỉ khi ĐÃ GIAO (Delivered) */}
                    {statusName === "Delivered" && (
                      <button
                        className="border rounded-3xl px-2 py-1 text-white bg-button-bg-ac hover:bg-button-bg-hv"
                        onClick={() => handleConfirmReceived(o._id)}
                      >
                        Đã nhận hàng
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-[500px]">
            <img src={emptyOrder} alt="" className="w-36 h-36 mb-2" />
            <p className="text-center italic text-gray-400 mb-2">
              Chưa có đơn hàng
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
