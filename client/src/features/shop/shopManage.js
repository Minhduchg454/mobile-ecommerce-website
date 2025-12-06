import { useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import {
  apiGetShops,
  apiUpdateShop,
  apiDeleteShop,
} from "../../services/shop.api";
import { showAlert, showModal } from "store/app/appSlice";
import { AiOutlineDelete, AiOutlineExclamationCircle } from "react-icons/ai";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";
import { nextAlertId, registerHandlers } from "store/alert/alertBus";
import noData from "../../assets/data-No.png";
import { Loading, ReasonModal } from "../../components";
import { useSearchParams } from "react-router-dom";
import moment from "moment";
import { IoMdCheckmark } from "react-icons/io";
import { IoLockClosedOutline, IoLockOpenOutline } from "react-icons/io5";
import noPhoto from "../../assets/image-not-found.png";
import { STATUS_LABELS } from "../../ultils/contants";

export const ShopManage = ({ status }) => {
  const dispatch = useDispatch();
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(0);

  const [searchParams, setSearchParams] = useSearchParams();
  const searchKeyword = searchParams.get("s") || "";
  const statusParam = searchParams.get("status") || "";
  const sortParam = searchParams.get("sort") || "newest";

  const [isShowSort, setIsShowSort] = useState(false);
  const [isShowStatus, setIsShowStatus] = useState(false);

  // options sort (Giữ nguyên)
  const sortOptions = [
    { label: "Mới nhất", sort: "newest" },
    { label: "Cũ nhất", sort: "oldest" },
    { label: "Bán nhiều nhất", sort: "sold_desc" },
    { label: "Bán ít nhất", sort: "sold_asc" },
    { label: "Đánh giá cao nhất", sort: "rate_desc" },
    { label: "Đánh giá thấp nhất", sort: "product_asc" },
    { label: "Nhiều sản phẩm nhất", sort: "rate_desc" },
    { label: "Ít sản phẩm nhất", sort: "product_asc" },
    { label: "Shop mall", sort: "shopMall" },
  ];

  const currentSort =
    sortOptions.find((opt) => opt.sort === sortParam) || sortOptions[0];

  const statusOptions = [
    { label: "Tất cả trạng thái", value: "" },
    { label: "Đang chờ duyệt", value: "pending" },
    { label: "Đã được duyệt", value: "approved" },
    { label: "Đã bị khóa", value: "blocked" },
  ];

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    let changed = false;
    if (status && !params.get("status")) {
      params.set("status", status);
      changed = true;
    }
    if (changed) setSearchParams(params);
  }, []);

  const currentStatus =
    statusOptions.find((opt) => opt.value === statusParam) || statusOptions[0];

  const fetchShops = async () => {
    setLoading(true);
    try {
      const query = {};

      if (searchKeyword) query.s = searchKeyword;
      if (statusParam) query.status = statusParam;
      if (status) {
        query.status = status;
      }

      // mapping sort (Giữ nguyên)
      switch (sortParam) {
        case "newest":
          query.sort = "-shopCreateAt";
          break;
        case "oldest":
          query.sort = "shopCreateAt";
          break;
        case "sold_desc":
          query.sort = "-shopSoldCount";
          break;
        case "sold_asc":
          query.sort = "shopSoldCount";
          break;
        case "rate_desc":
          query.sort = "-shopRateAvg";
          break;
        case "rate_asc":
          query.sort = "shopRateAvg";
          break;
        case "product_desc":
          query.sort = "-shopProductCount";
          break;
        case "product_asc":
          query.sort = "shopProductCount";
          break;
        case "shopMall":
          query.isMall = "true";
          break;
        default:
          query.sort = "-createdAt";
      }

      query.includeSubscription = true;

      const res = await apiGetShops(query);
      if (res?.success) {
        setShops(res.shops || []);
        setCount(res.shops?.length || 0);
      } else {
        setShops([]);
        dispatch(
          showAlert({
            title: "Không thể tải danh sách shop",
            message: res?.message || "Vui lòng thử lại sau",
            variant: "danger",
            duration: 1500,
            showConfirmButton: false,
          })
        );
      }
    } catch (err) {
      console.error("fetchShops error:", err);
      setShops([]);
      dispatch(
        showAlert({
          title: "Lỗi",
          message: "Không thể tải danh sách shop",
          variant: "danger",
          duration: 1500,
        })
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShops();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchKeyword, sortParam, statusParam]);

  const executeStatusChange = async (shop, newStatus, reason = null) => {
    try {
      const updateData = { shopStatus: newStatus };

      if (newStatus === "blocked" || newStatus === "pending") {
        // BẮT BUỘC: phải gửi lý do khi khóa hoặc chuyển về pending
        updateData.shopReviewReason = reason;
      } else if (shop.shopReviewReason) {
        // Nếu là phê duyệt/mở khóa, hãy xóa lý do cũ
        updateData.shopReviewReason = null;
      }

      const res = await apiUpdateShop(updateData, shop._id);

      dispatch(showModal({ isShowModal: false })); // Đóng modal loading/lý do

      if (res?.success) {
        dispatch(
          showAlert({
            title: "Thành công",
            message: `Cập nhật trạng thái shop "${shop.shopName}" thành công`,
            variant: "success",
            duration: 1500,
            showCancelButton: false,
            showConfirmButton: false,
          })
        );
        fetchShops();
      } else {
        dispatch(
          showAlert({
            title: "Lỗi",
            message: res?.message || "Không thể cập nhật trạng thái shop",
            variant: "danger",
            duration: 1500,
          })
        );
        throw new Error(res?.message || "Lỗi API");
      }
    } catch (err) {
      throw err;
    }
  };

  const handleChangeStatus = (shop, newStatus) => {
    const shouldAskReason = newStatus === "blocked" || newStatus === "pending";
    const actionLabel = newStatus === "blocked" ? "Khóa" : "Từ chối";

    // Đóng modal cũ (nếu có) trước khi mở modal mới
    dispatch(showModal({ isShowModal: false }));

    if (shouldAskReason) {
      dispatch(
        showModal({
          isShowModal: true,
          modalChildren: (
            <ReasonModal
              title={`${actionLabel} shop: ${shop.shopName}`}
              itemName={shop.shopName}
              actionName={actionLabel}
              onCancel={() => dispatch(showModal({ isShowModal: false }))}
              onSubmit={(reason) =>
                executeStatusChange(shop, newStatus, reason)
              }
            />
          ),
        })
      );
    } else {
      dispatch(showModal({ isShowModal: true, modalChildren: <Loading /> }));
      executeStatusChange(shop, newStatus, null);
    }
  };

  const handleDeleteShop = (shop) => {
    const alertId = nextAlertId();

    registerHandlers(alertId, {
      onConfirm: async () => {
        try {
          dispatch(
            showModal({ isShowModal: true, modalChildren: <Loading /> })
          );
          const res = await apiDeleteShop(shop._id);
          dispatch(showModal({ isShowModal: false }));

          if (res?.success) {
            dispatch(
              showAlert({
                title: "Đã xoá shop",
                message: shop.shopName,
                variant: "success",
                duration: 1500,
                showConfirmButton: false,
                showCancelButton: false,
              })
            );
            fetchShops();
          } else {
            dispatch(
              showAlert({
                title: "Xoá thất bại",
                message:
                  res?.message || "Không thể xoá shop. Vui lòng thử lại.",
                variant: "danger",
                duration: 1500,
                showCancelButton: false,
                showConfirmButton: false,
              })
            );
          }
        } catch (err) {
          console.error("delete shop error:", err);
          dispatch(showModal({ isShowModal: false }));
          dispatch(
            showAlert({
              title: "Lỗi",
              message: err?.message || "Không thể xoá shop",
              variant: "danger",
              duration: 1500,
            })
          );
        }
      },
    });

    dispatch(
      showAlert({
        id: alertId,
        title: "Xác nhận xoá shop?",
        message: shop.shopName,
        variant: "danger",
        showCancelButton: true,
        confirmText: "Xoá",
        cancelText: "Hủy",
      })
    );
  };

  const titleCls = "font-bold line-clamp-1";
  const buttonAction =
    "text-xs md:text-sm whitespace-nowrap border px-2 py-1 rounded-3xl flex  items-center justify-center gap-1 text-black bg-white hover:bg-button-hv";

  const renderShopItem = (shop) => {
    const statusInfo = STATUS_LABELS[shop.shopStatus];
    const isMall = shop.shopOfficial;
    const status = shop.shopStatus;

    return (
      <div
        key={shop._id}
        className="bg-white rounded-3xl md:p-4 p-2 flex justify-between items-center border"
      >
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 md:w-20 md:h-20 rounded-full overflow-hidden border bg-gray-100 flex items-center justify-center">
            <img
              src={shop.shopLogo || noPhoto}
              alt={shop.shopName}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-sm md:text-base text-black">
                {shop.shopName}
              </p>
              {isMall && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                  Mall
                </span>
              )}
            </div>

            <p className="text-xs md:text-sm flex items-center gap-2">
              Trạng thái:
              {statusInfo ? (
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.textColor}`}
                >
                  {statusInfo.label}
                </span>
              ) : (
                <span className="text-gray-400 italic">Không xác định</span>
              )}
            </p>

            {shop.shopReviewReason && (
              <div className="text-xs text-red-500 italic mt-1 flex items-center gap-1">
                <AiOutlineExclamationCircle size={14} />
                Lý do: {shop.shopReviewReason}
              </div>
            )}

            <p className="text-xs md:text-sm ">
              Gói: {shop?.activeSubscription?.serviceId?.serviceName}
            </p>

            <p className="text-xs md:text-sm ">
              Đánh giá: {shop.shopRateAvg}/5 sao
            </p>

            <p className="text-xs md:text-sm ">
              Số sản phẩm: {shop.shopProductCount}
            </p>

            {typeof shop.shopSoldCount === "number" && (
              <p className="text-xs md:text-sm ">
                Đã bán: {shop.shopSoldCount}
              </p>
            )}

            <p className="text-[11px] text-gray-500 italic">
              Ngày tham gia: {moment(shop.createdAt).format("DD/MM/YYYY")}
            </p>
          </div>
        </div>

        {/* Actions inline */}
        <div className="flex flex-col md:flex-row gap-2 ">
          {status === "pending" && (
            <>
              <button
                className={buttonAction}
                onClick={() => handleChangeStatus(shop, "approved")}
              >
                <IoMdCheckmark size={16} />
                Phê duyệt
              </button>
              <button
                className={buttonAction}
                onClick={() => handleChangeStatus(shop, "blocked")}
              >
                <IoLockClosedOutline size={16} />
                Khoá
              </button>
            </>
          )}

          {status === "approved" && (
            <>
              <button
                className={buttonAction}
                onClick={() => handleChangeStatus(shop, "blocked")}
              >
                <IoLockClosedOutline size={16} />
                Khoá
              </button>
              <button
                className={buttonAction}
                onClick={() => handleDeleteShop(shop)}
              >
                <AiOutlineDelete size={16} />
                Xoá
              </button>
            </>
          )}

          {status === "blocked" && (
            <>
              <button
                className={buttonAction}
                onClick={() => handleChangeStatus(shop, "approved")}
              >
                <IoLockOpenOutline size={16} />
                Mở khoá
              </button>
              <button
                className={buttonAction}
                onClick={() => handleDeleteShop(shop)}
              >
                <AiOutlineDelete size={16} />
                Xoá
              </button>
            </>
          )}

          {/* Fallback cho trạng thái khác */}
          {!["pending", "approved", "blocked"].includes(status) && (
            <button
              className={buttonAction}
              onClick={() => handleDeleteShop(shop)}
            >
              <AiOutlineDelete size={16} />
              Xoá
            </button>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="w-full h-[500px] flex justify-center items-center">
        <p>Đang tải dữ liệu ...</p>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col gap-4">
      <div className="bg-app-bg/60 backdrop-blur-sm rounded-3xl px-3 py-2 md:px-4 sticky top-[50px] z-10 flex justify-between items-center gap-2">
        <h1 className={titleCls}>{count} shop</h1>

        <div className="flex items-center justify-end gap-2 ">
          {!status && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsShowStatus((v) => !v)}
                className="glass shadow-md md:px-2 py-1 px-1 border rounded-2xl text-description flex items-center gap-1 text-sm bg-white"
                aria-haspopup="listbox"
                aria-expanded={isShowStatus}
              >
                Trạng thái:{" "}
                <span className="font-bold">{currentStatus.label}</span>
                {isShowStatus ? (
                  <MdKeyboardArrowUp size={18} className="ml-1" />
                ) : (
                  <MdKeyboardArrowDown size={18} className="ml-1" />
                )}
              </button>

              {isShowStatus && (
                <div
                  role="listbox"
                  className="absolute right-0 mt-2 w-56 bg-white/90 backdrop-blur-md border rounded-xl shadow-lg p-1 z-20"
                >
                  {statusOptions.map((opt) => {
                    const isActive = opt.value === statusParam;
                    return (
                      <button
                        key={opt.value || "all"}
                        onClick={() => {
                          setSearchParams((prev) => {
                            const params = new URLSearchParams(prev);
                            if (opt.value) params.set("status", opt.value);
                            else params.delete("status");
                            return params;
                          });
                          setIsShowStatus(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-gray-action ${
                          isActive ? "bg-white/20 font-bold" : ""
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* SORT */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsShowSort((v) => !v)}
              className="glass shadow-md md:px-2 py-1 px-1 border rounded-2xl text-description flex items-center gap-1 text-sm bg-white"
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
                className="absolute right-0 mt-2 w-56 bg-white/90 backdrop-blur-md border rounded-xl shadow-lg p-1 z-20"
              >
                {sortOptions.map((opt) => {
                  const isActive = opt.sort === sortParam;
                  return (
                    <button
                      key={opt.sort}
                      onClick={() => {
                        setSearchParams((prev) => {
                          const params = new URLSearchParams(prev);
                          params.set("sort", opt.sort);
                          return params;
                        });
                        setIsShowSort(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-gray-action ${
                        isActive ? "bg-white/20 font-bold" : ""
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* LIST */}
      {shops.length > 0 ? (
        <div className="flex flex-col gap-3 animate-fadeIn">
          {shops.map((shop) => renderShopItem(shop))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-2 md:p-4 flex flex-col items-center justify-center w-full h-[500px]">
          <img src={noData} alt="Không có dữ liệu" className="w-36 h-36 mb-2" />
          <p className="text-gray-600">Chưa có shop nào</p>
        </div>
      )}
    </div>
  );
};
