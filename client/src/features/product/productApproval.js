import { useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import {
  apiGetProducts,
  apiUpdateProduct,
  apiDeleteProduct,
} from "../../services/catalog.api";
import { showAlert, showModal } from "store/app/appSlice";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AiOutlineDelete, AiOutlineExclamationCircle } from "react-icons/ai";
import { nextAlertId, registerHandlers } from "store/alert/alertBus";
import noData from "../../assets/data-No.png";
import noPhoto from "../../assets/image-not-found.png";
import React from "react";
import { formatMoney } from "ultils/helpers";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";
import { IoMdCheckmark } from "react-icons/io";
import { IoLockClosedOutline } from "react-icons/io5";
import moment from "moment";
import { Loading, ReasonModal } from "../../components";
import { STATUS_LABELS } from "../../ultils/contants";

export const ProductApproval = () => {
  const dispatch = useDispatch();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(0);

  const [searchParams, setSearchParams] = useSearchParams();
  const searchKeyword = searchParams.get("s") || "";
  const statusParam = searchParams.get("status"); // null nếu không có
  const sortParam = searchParams.get("sort") || "newest";

  const [isShowSort, setIsShowSort] = useState(false);
  const [isShowStatus, setIsShowStatus] = useState(false);

  // Sort options
  const sortOptions = [
    { label: "Mới nhất", sort: "newest" },
    { label: "Cũ nhất", sort: "oldest" },
    { label: "Tên A-Z", sort: "name_asc" },
    { label: "Tên Z-A", sort: "name_desc" },
  ];

  const currentSort =
    sortOptions.find((opt) => opt.sort === sortParam) || sortOptions[0];

  // Status options
  const statusOptions = [
    { label: "Tất cả trạng thái", value: "all" },
    { label: "Đang chờ duyệt", value: "pending" },
    { label: "Đã được duyệt", value: "approved" },
    { label: "Đã bị khóa", value: "blocked" },
  ];

  // Xác định currentStatus: ưu tiên statusParam, nếu null hoặc "all" → chọn "all"
  const currentStatus =
    statusOptions.find((opt) => {
      if (!statusParam || statusParam === "all") return opt.value === "all";
      return opt.value === statusParam;
    }) || statusOptions[0];

  // Chỉ set default status=pending khi truy cập lần đầu (không có status)
  useEffect(() => {
    if (!searchParams.get("status")) {
      setSearchParams(
        (prev) => {
          const params = new URLSearchParams(prev);
          params.set("status", "pending");
          return params;
        },
        { replace: true }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Chỉ chạy 1 lần khi mount

  // Fetch products
  const fetchProducts = async () => {
    try {
      setLoading(true);

      // Chỉ gửi status nếu không phải "all" và không null
      const statusToQuery =
        statusParam && statusParam !== "all" ? statusParam : null;

      const query = {
        sortKey: sortParam === "newest" ? "createdAt" : "createdAt",
        sortDir:
          sortParam === "newest" || sortParam === "oldest"
            ? sortParam === "newest"
              ? "desc"
              : "asc"
            : sortParam === "name_asc"
            ? "asc"
            : "desc",
        s: searchKeyword,
        viewer: "admin",
      };

      if (statusToQuery) {
        query.status = statusToQuery;
      }

      const res = await apiGetProducts(query);

      if (res?.success) {
        setProducts(res?.products || []);
        setCount(res?.products?.length || 0);
      } else {
        setProducts([]);
        dispatch(
          showAlert({
            title: "Lỗi tải dữ liệu",
            message: res?.message || "Không thể tải sản phẩm",
            variant: "danger",
            duration: 1500,
            showConfirmButton: false,
          })
        );
      }
    } catch (err) {
      dispatch(
        showAlert({
          title: "Lỗi",
          message: `Không thể tải sản phẩm. ${err}`,
          variant: "danger",
          duration: 1500,
        })
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchKeyword, sortParam, statusParam]);

  // Xử lý thay đổi trạng thái
  const executeStatusChange = async (product, newStatus, reason = null) => {
    try {
      const updateData = {
        productStatus: newStatus,
        shopId: product.shopId._id,
      };

      if (newStatus === "blocked" || newStatus === "pending") {
        updateData.productReviewReason = reason;
      } else if (newStatus === "approved") {
        updateData.productReviewReason = null;
      }

      const res = await apiUpdateProduct(updateData, product._id);

      dispatch(showModal({ isShowModal: false }));

      if (res?.success) {
        dispatch(
          showAlert({
            title: "Thành công",
            message: `Cập nhật trạng thái sản phẩm "${product.productName}" thành công`,
            variant: "success",
            duration: 1500,
            showCancelButton: false,
            showConfirmButton: false,
          })
        );
        fetchProducts();
      } else {
        dispatch(
          showAlert({
            title: "Lỗi",
            message: res?.message || "Không thể cập nhật trạng thái sản phẩm",
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

  const handlerDeleteProduct = (product) => {
    const alertId = nextAlertId();
    registerHandlers(alertId, {
      onConfirm: async () => {
        try {
          dispatch(
            showModal({ isShowModal: true, modalChildren: <Loading /> })
          );
          const res = await apiDeleteProduct(product._id);
          dispatch(showModal({ isShowModal: false }));

          if (res?.success) {
            fetchProducts();
            dispatch(
              showAlert({
                title: "Đã xóa sản phẩm",
                message: product.productName,
                variant: "success",
                duration: 1500,
                showConfirmButton: false,
                showCancelButton: false,
              })
            );
          } else {
            dispatch(
              showAlert({
                title: "Xóa thất bại",
                message: res?.message || "Không thể xóa sản phẩm này",
                variant: "danger",
                duration: 1500,
                showCancelButton: false,
                showConfirmButton: false,
              })
            );
          }
        } catch (err) {
          console.error("delete product error:", err);
          dispatch(showModal({ isShowModal: false }));
          dispatch(
            showAlert({
              title: "Lỗi",
              message: err.message || "Lỗi xóa sản phẩm",
              variant: "danger",
            })
          );
        }
      },
    });

    dispatch(
      showAlert({
        id: alertId,
        title: "Xác nhận xóa sản phẩm?",
        message: `Bạn muốn xóa vĩnh viễn sản phẩm "${product.productName}"? (Xóa mềm)`,
        variant: "danger",
        showCancelButton: true,
        confirmText: "Xóa",
        cancelText: "Hủy",
      })
    );
  };

  const handleChangeStatus = (product, newStatus) => {
    const shouldAskReason = newStatus === "blocked" || newStatus === "pending";
    const actionLabel = newStatus === "blocked" ? "Khóa" : "Từ chối/Pending";

    if (shouldAskReason) {
      dispatch(
        showModal({
          isShowModal: true,
          modalChildren: (
            <ReasonModal
              title={`${actionLabel} sản phẩm: ${product.productName}`}
              item={product}
              actionName={actionLabel}
              onCancel={() => dispatch(showModal({ isShowModal: false }))}
              onSubmit={(reason) =>
                executeStatusChange(product, newStatus, reason)
              }
            />
          ),
        })
      );
    } else {
      dispatch(showModal({ isShowModal: true, modalChildren: <Loading /> }));
      executeStatusChange(product, newStatus, null);
    }
  };

  const titleCls = "font-bold mb-1";
  const buttonAction =
    "text-xs md:text-sm whitespace-nowrap border px-2 py-1 rounded-3xl flex items-center gap-1 text-black bg-white hover:bg-button-hv";

  const renderProductItem = (p) => {
    const statusInfo = STATUS_LABELS[p.productStatus];

    return (
      <div
        key={p._id}
        className="bg-white border rounded-3xl p-3 flex justify-between items-center"
      >
        <div className="flex flex-col items-start gap-2">
          <div className="flex justify-start items-center gap-2">
            <img
              src={p.shopId?.shopLogo || noPhoto}
              alt={p.shopId?.shopName}
              className="w-6 h-6 border rounded-full object-contain"
            />
            <p className="text-xs md:text-sm">{p.shopId?.shopName || "N/A"}</p>
            {p.shopId?.shopIsOfficial && (
              <div className="border rounded-lg line-clamp-1 bg-red-600 text-white py-0.5 px-1 text-[8px]">
                Mall
              </div>
            )}
          </div>
          <div className="flex gap-2 items-center justify-start">
            <img
              src={p.productThumb || noPhoto}
              alt={p.productName}
              className="w-16 h-16 rounded-xl object-cover border"
            />
            <div>
              <div className="font-semibold text-sm md:text-base text-black flex items-center gap-2 mb-1">
                {p.productName}
              </div>

              <div className="text-xs md:text-sm flex items-center gap-2">
                Trạng thái:
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.textColor}`}
                >
                  {statusInfo.label}
                </span>
              </div>

              {p.productReviewReason && (
                <div className="text-xs text-red-500 italic mt-1 flex items-center gap-1">
                  <AiOutlineExclamationCircle size={14} />
                  Lý do: {p.productReviewReason}
                </div>
              )}

              <div className="text-xs md:text-sm">
                Danh mục: {p.categoryId?.categoryName}
              </div>

              <div className="text-xs md:text-sm">
                Giá: {formatMoney(p.productMinPrice)} đ
              </div>
              <div className="text-[11px] text-gray-500 italic">
                Ngày tạo: {moment(p.productCreateAt).format("DD/MM/YYYY")}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-2">
          {(p.productStatus === "pending" || p.productStatus === "blocked") && (
            <button
              className={buttonAction}
              onClick={() => handleChangeStatus(p, "approved")}
            >
              <IoMdCheckmark size={16} />
              Phê duyệt
            </button>
          )}

          {(p.productStatus === "approved" ||
            p.productStatus === "pending") && (
            <button
              className={buttonAction}
              onClick={() => handleChangeStatus(p, "blocked")}
            >
              <IoLockClosedOutline size={16} />
              Khóa
            </button>
          )}

          <button
            className={buttonAction}
            onClick={() => handlerDeleteProduct(p)}
          >
            <AiOutlineDelete size={16} />
            Xóa
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="relative flex flex-col gap-4">
      {/* Header: Bộ lọc */}
      <div className="bg-app-bg/60 backdrop-blur-sm rounded-3xl px-3 py-2 md:px-4 sticky top-[50px] z-10 flex justify-between items-center">
        <h1 className={titleCls}>{count} sản phẩm</h1>

        <div className="flex gap-2">
          {/* Lọc trạng thái */}
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
                  const isActive =
                    (!statusParam && opt.value === "all") ||
                    statusParam === opt.value;

                  return (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setSearchParams((prev) => {
                          const params = new URLSearchParams(prev);
                          if (opt.value && opt.value !== "all") {
                            params.set("status", opt.value);
                          } else {
                            params.delete("status");
                          }
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

          {/* Sắp xếp */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsShowSort((v) => !v)}
              className="glass shadow-md md:px-2 py-1 px-1 border rounded-2xl text-description flex items-center gap-1 text-sm bg-white"
              aria-haspopup="listbox"
              aria-expanded={isShowSort}
            >
              Sắp xếp: <span className="font-bold">{currentSort.label}</span>
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

      {/* Danh sách sản phẩm */}
      {loading ? (
        <div className="flex justify-center items-center h-96">
          <Loading />
        </div>
      ) : products.length > 0 ? (
        <div className="flex flex-col gap-3 animate-fadeIn">
          {products.map((p) => renderProductItem(p))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-2 md:p-4 flex flex-col items-center justify-center w-full h-[500px]">
          <img src={noData} alt="Không có dữ liệu" className="w-36 h-36 mb-2" />
          <p className="text-gray-600">Không có sản phẩm nào cần phê duyệt.</p>
        </div>
      )}
    </div>
  );
};
