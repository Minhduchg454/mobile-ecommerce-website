import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import {
  apiGetShopProductsWithVariations,
  apiDeleteProduct,
} from "../../services/catalog.api";
import { showAlert } from "store/app/appSlice";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AiOutlineEdit, AiOutlineDelete } from "react-icons/ai";
import path from "ultils/path";
import { nextAlertId, registerHandlers } from "store/alert/alertBus";
import noData from "../../assets/data-No.png";
import React from "react";
import {
  formatMoney,
  getServiceFeatureValue,
  calculateFinalPrice,
} from "ultils/helpers";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";
import { STATUS_LABELS } from "../../ultils/contants";
import moment from "moment";
import { AiOutlineExclamationCircle } from "react-icons/ai";

export const ProductManage = () => {
  const { current } = useSelector((s) => s.seller);
  const servicePlan = current?.activeSubscription; // Lấy gói đang hoạt động
  const isShopBlocked = current?.shopStatus === "blocked";

  const MAX_PRODUCTS = getServiceFeatureValue(servicePlan, "MAX_PRODUCTS", 0);

  const isOperationDisabled =
    isShopBlocked || !servicePlan || servicePlan.subStatus !== "active";

  const [shopProducts, setShopProducts] = useState([]);
  const [count, setCount] = useState(0);

  const isCreateProductDisabled = isOperationDisabled || count >= MAX_PRODUCTS;

  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isShowSort, setIsShowSort] = useState(false);
  const [isShowStatus, setIsShowStatus] = useState(false);

  const sortOptions = [
    { label: "Mới nhất", sortKey: "createdAt", sortDir: "desc" },
    { label: "Cũ nhất", sortKey: "createdAt", sortDir: "asc" },
    { label: "Bán chạy nhất", sortKey: "sold", sortDir: "desc" },
    { label: "Giá từ cao đến thấp", sortKey: "price", sortDir: "desc" },
    { label: "Giá từ thấp đến cao", sortKey: "price", sortDir: "asc" },
    { label: "Được yêu thích nhất", sortKey: "rating", sortDir: "desc" },
    { label: "Hết hàng", sortKey: "isOutOfStock", sortDir: "desc" },
  ];

  const statusOptions = [
    { label: "Tất cả trạng thái", value: "" },
    { label: "Đang chờ duyệt", value: "pending" },
    { label: "Đã được duyệt", value: "approved" },
    { label: "Đã bị khóa", value: "blocked" },
  ];

  // Giá trị sort lấy từ URL, fallback mặc định
  const statusParam = searchParams.get("status") || "";
  const sortKeyParam = searchParams.get("sortKey") || "createdAt";
  const sortDirParam = searchParams.get("sortDir") || "desc";

  const currentStatus =
    statusOptions.find((opt) => opt.value === statusParam) || statusOptions[0];

  // Tìm option đang được chọn
  const currentSort =
    sortOptions.find(
      (opt) => opt.sortKey === sortKeyParam && opt.sortDir === sortDirParam
    ) || sortOptions[0];

  const handleCreateProduct = () => {
    navigate(`/${path.SELLER}/${current._id}/${path.S_CREATE_PRODUCT}`);
  };

  const fetchShopProducts = async (shopId, query = {}) => {
    try {
      setLoading(true);
      const resShopProducts = await apiGetShopProductsWithVariations({
        shopId,
        ...query,
      });

      if (resShopProducts?.success) {
        setShopProducts(resShopProducts?.products || []);
        setCount(resShopProducts?.count || 0);
      } else {
        dispatch(
          showAlert({
            title: "Tải dữ liệu thất bại",
            message: `Vui lòng thử lại. ${resShopProducts?.message}`,
            variant: "danger",
            showCancelButton: false,
            showConfirmButton: false,
            duration: 1500,
          })
        );
      }
    } catch (err) {
      dispatch(
        showAlert({
          title: "Lỗi",
          message: `Vui lòng thử lại. ${err}`,
          variant: "danger",
          showCancelButton: false,
          showConfirmButton: false,
          duration: 1500,
        })
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (current?._id) {
      const query = Object.fromEntries(searchParams.entries());
      fetchShopProducts(current._id, query);
    }
  }, [current?._id, searchParams]);

  const titleCls = "font-bold mb-1 text-sm md:text-base";
  const buttonAction =
    "text-xs md:text-sm whitespace-nowrap border px-2 py-1 rounded-3xl flex items-center gap-1 text-black bg-button-bg hover:bg-button-hv";

  if (loading) {
    return <div className="text-center py-8">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="relative flex flex-col gap-4">
      {count >= MAX_PRODUCTS && (
        <div className="flex gap-2 justify-center items-center border border-orange-400 bg-orange-50 text-xs md:text-sm rounded-3xl px-3 py-2">
          <AiOutlineExclamationCircle size={16} className="text-orange-500" />
          <span className="font-medium">
            Đã đạt giới hạn {MAX_PRODUCTS} sản phẩm theo gói hiện tại. Vui lòng
            nâng cấp gói hoặc xóa bớt sản phẩm để tạo mới.
          </span>
        </div>
      )}
      {/* Thanh tiêu đề / thêm mới */}
      <div className="bg-app-bg/60 backdrop-blur-sm rounded-3xl px-3 py-2 md:px-4 sticky top-[50px] z-10 flex justify-between items-center">
        <h1 className={titleCls}>
          {count} sản phẩm{" "}
          {servicePlan && (
            <span className="hidden md:inline-block text-sm font-normal text-gray-500">
              (Giới hạn: {MAX_PRODUCTS})
            </span>
          )}
        </h1>

        <div className="flex gap-2">
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsShowStatus((v) => !v)}
              className="glass shadow-md md:px-2 py-1 px-1 border rounded-2xl md:text-sm text-xs flex items-center gap-1  bg-white"
              aria-haspopup="listbox"
              aria-expanded={isShowStatus}
            >
              Trạng thái:{" "}
              <span className="hidden md:block font-bold text-xs md:text-sm">
                {currentStatus.label}
              </span>
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
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsShowSort((v) => !v)}
              className="glass shadow-md md:px-2 py-1 px-1 border rounded-2xl md:text-sm text-xs flex items-center gap-1"
              aria-haspopup="listbox"
              aria-expanded={isShowSort}
            >
              Sắp xếp:{" "}
              <span className="hidden md:block font-bold text-xs md:text-sm">
                {currentSort.label}
              </span>
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
          {/* NÚT THÊM SẢN PHẨM MỚI (ÁP DỤNG LOGIC KHÓA/GIỚI HẠN) */}
          <button
            disabled={isCreateProductDisabled}
            onClick={handleCreateProduct}
            className={`px-3 py-1 whitespace-nowrap md:text-sm text-xs rounded-3xl text-white shadow-md  ${
              isCreateProductDisabled
                ? "bg-gray-400 cursor-not-allowed opacity-50"
                : "bg-button-bg-ac hover:bg-button-bg-hv cursor-pointer"
            }`}
            title={
              isShopBlocked
                ? "Shop đang bị khóa"
                : !servicePlan || servicePlan.subStatus !== "active"
                ? "Shop chưa có gói dịch vụ hoặc gói đã hết hạn"
                : count >= MAX_PRODUCTS
                ? `Đã đạt giới hạn ${MAX_PRODUCTS} sản phẩm`
                : "Thêm sản phẩm mới"
            }
          >
            Thêm sản phẩm mới
          </button>
        </div>
      </div>

      {/* Nếu có sản phẩm */}
      {shopProducts.length > 0 ? (
        <div className="flex flex-col gap-4 animate-fadeIn">
          {shopProducts.map((p) => {
            const rawVariations = p.variations || [];
            const statusInfo = STATUS_LABELS[p.productStatus];
            const isOnSale = p?.productDiscountPercent > 0;

            // Nếu không có biến thể thì chế ra 1 biến thể "ảo"
            const displayVariations =
              rawVariations.length > 0
                ? rawVariations
                : [
                    {
                      _id: p._id,
                      pvName: "Chưa có biến thể",
                      pvOriginalPrice: 0,
                      pvPrice: 0,
                      pvStockQuantity: 0,
                      pvSoldCount: 0,
                    },
                  ];

            return (
              <div
                key={p._id}
                className="bg-white border rounded-3xl p-2 md:p-4 flex flex-col gap-2 md:gap-4"
              >
                {/* PHẦN HEADER SẢN PHẨM */}
                <div className="flex flex-row gap-2 md:gap-4">
                  {/* Ảnh */}
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 border rounded-xl overflow-hidden">
                      <img
                        src={p.productThumb}
                        alt={p.productName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Thông tin sản phẩm */}
                  <div className="flex-1 flex flex-col gap-1">
                    <div className="text-sm md:text-lg font-bold text-black leading-snug line-clamp-2">
                      {p.productName}{" "}
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.textColor}`}
                      >
                        {statusInfo.label}
                      </span>
                    </div>

                    <div className="text-xs text-gray-500">
                      <span className="text-gray-600">Thương hiệu: </span>
                      {p.brandId?.brandName || "Không có"}
                    </div>

                    {/* Danh mục hệ thống */}
                    <div className="text-xs text-gray-500">
                      <span className="text-gray-600">Danh mục: </span>
                      {p.categoryId?.categoryName || "Không có"}
                    </div>

                    {/* Danh mục shop */}
                    <div className="text-xs text-gray-500">
                      <span className="text-gray-600">Danh mục shop: </span>
                      {p.categoryShopId?.csName || "Không có"}
                    </div>
                    {isOnSale && (
                      <div className="text-xs text-gray-500">
                        <p>
                          Sale:{" "}
                          <span className="text-red-500">
                            {p.productDiscountPercent}%
                          </span>
                        </p>
                      </div>
                    )}
                    <div className="text-xs text-gray-500">
                      <span className="text-gray-600">Ngày tạo: </span>
                      {`${moment(p.createdAt).format("DD/MM/YYYY")}` ||
                        "Không có"}
                    </div>
                  </div>

                  {/* Nút thao tác (Sửa/Xóa) */}
                  <div className="flex flex-col items-start md:items-end gap-2">
                    <button
                      disabled={isOperationDisabled} // ÁP DỤNG LOGIC KHÓA/GÓI
                      className={`${buttonAction} ${
                        isOperationDisabled
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                      onClick={() =>
                        navigate(
                          `/${path.SELLER}/${current._id}/${path.S_CREATE_PRODUCT}`,
                          {
                            state: { product: p },
                          }
                        )
                      }
                      title={
                        isOperationDisabled
                          ? "Shop đang bị khóa hoặc gói dịch vụ không hợp lệ"
                          : "Sửa"
                      }
                    >
                      <AiOutlineEdit size={18} />
                      <span>Sửa</span>
                    </button>

                    <button
                      disabled={isOperationDisabled} // ÁP DỤNG LOGIC KHÓA/GÓI
                      className={`${buttonAction} ${
                        isOperationDisabled
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                      onClick={() => {
                        const id = nextAlertId();
                        registerHandlers(id, {
                          onConfirm: async () => {
                            const res = await apiDeleteProduct(p._id);
                            if (res?.success) {
                              fetchShopProducts(current._id);
                            } else {
                              dispatch(
                                showAlert({
                                  title: "Xoá thất bại",
                                  message:
                                    res?.message || "Không thể xoá sản phẩm",
                                  variant: "danger",
                                  showCancelButton: false,
                                  showConfirmButton: false,
                                  duration: 2000,
                                })
                              );
                            }
                          },
                        });
                        dispatch(
                          showAlert({
                            id,
                            title: "Bạn muốn xoá sản phẩm này?",
                            message: p.productName,
                            variant: "danger",
                            showCancelButton: true,
                            confirmText: "Xoá",
                            cancelText: "Hủy",
                          })
                        );
                      }}
                      title={
                        isOperationDisabled
                          ? "Shop đang bị khóa hoặc gói dịch vụ không hợp lệ"
                          : "Xóa"
                      }
                    >
                      <AiOutlineDelete size={18} />
                      <span>Xóa</span>
                    </button>
                  </div>
                </div>

                {/* KẺ NGANG PHÂN CÁCH VÀ DANH SÁCH BIẾN THỂ */}
                <div className="border-t md:border-none pt-2 md:pt-4 mt-2 md:mt-0">
                  {/* Tiêu đề cột biến thể (Desktop) */}
                  <div className="hidden md:grid grid-cols-[1.2fr,0.8fr,0.8fr,0.6fr,0.6fr] text-xs md:text-sm font-semibold text-gray-700 bg-gray-50 border rounded-3xl px-3 py-2">
                    <div className="">Biến thể</div>
                    <div>Giá gốc</div>
                    <div>Giá bán</div>
                    <div className="text-center">Kho</div>
                    <div className="text-center">Đã bán</div>
                  </div>

                  {/* DANH SÁCH BIẾN THỂ */}
                  <div className="flex flex-col divide-y">
                    {displayVariations.map((v) => {
                      const finalPrice = calculateFinalPrice(
                        v?.pvPrice,
                        p?.productDiscountPercent
                      );
                      const displayPrice = formatMoney(v?.pvPrice);
                      const finalPriceFormatted = formatMoney(finalPrice);

                      return (
                        <div
                          key={v._id}
                          className="
                        grid grid-cols-1 
                        md:grid-cols-[1.2fr,0.8fr,0.8fr,0.6fr,0.6fr]
                        gap-y-2 md:gap-3
                        px-0 md:px-3 py-3
                        text-sm
                      "
                        >
                          {/* cột 1: tên biến thể */}
                          <div className="flex flex-col">
                            <span className="font-medium text-black truncate max-w-[220px]">
                              {v.pvName}
                            </span>

                            {/* Mobile: Hiển thị giá bán */}
                            <div className="md:hidden text-xs mt-1 flex flex-col">
                              {/* Hiển thị giá cuối cùng (đỏ) và giá gốc bị gạch ngang (xám) */}
                              {isOnSale && v.pvPrice > 0 ? (
                                <>
                                  <span className="font-bold text-red-600">
                                    {finalPriceFormatted}đ
                                  </span>
                                  <span className="text-gray-500 line-through text-xs">
                                    {displayPrice}đ
                                  </span>
                                </>
                              ) : (
                                <span className="font-bold text-black">
                                  {displayPrice}đ
                                </span>
                              )}
                            </div>
                          </div>

                          {/* cột 2: giá gốc */}
                          <div className="hidden md:block text-gray-500">
                            {v.pvOriginalPrice != null
                              ? `${formatMoney(v.pvOriginalPrice)}đ`
                              : "—"}
                          </div>

                          {/* cột 3: giá bán (Desktop) */}
                          <div className="hidden md:flex flex-col font-medium">
                            {/* Hiển thị giá cuối cùng (đỏ) và giá gốc bị gạch ngang (xám) */}
                            {isOnSale && v.pvPrice > 0 ? (
                              <>
                                <span className="text-black">
                                  {finalPriceFormatted}đ
                                </span>
                                <span className="text-gray-500 line-through text-xs">
                                  {displayPrice}đ
                                </span>
                              </>
                            ) : (
                              <span className="text-black">
                                {displayPrice}đ
                              </span>
                            )}
                          </div>

                          {/* cột 4: kho (Desktop) */}
                          <div className="hidden md:block text-center">
                            {v.pvStockQuantity ?? 0}
                          </div>

                          {/* cột 5: đã bán (Desktop) */}
                          <div className="hidden md:block text-center">
                            {v.pvSoldCount ?? 0}
                          </div>

                          {/* Mobile: Gộp thông tin phụ */}
                          <div className="md:hidden flex flex-row flex-wrap text-xs text-gray-500 gap-x-4 gap-y-1">
                            <span>Kho: {v.pvStockQuantity ?? 0}</span>
                            <span>Đã bán: {v.pvSoldCount ?? 0}</span>
                            {/* Mobile: Giá gốc (hiển thị pvOriginalPrice nếu nó lớn hơn giá bán/giá cuối cùng) */}
                            {(v.pvOriginalPrice > v.pvPrice ||
                              v.pvOriginalPrice > finalPrice) && (
                              <span className="text-gray-400">
                                Giá gốc: {formatMoney(v.pvOriginalPrice)}đ
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // Nếu không có sản phẩm nào
        <div className="bg-white rounded-3xl p-2 md:p-4 flex flex-col items-center justify-center w-full h-[500px]">
          <img src={noData} alt="Không có dữ liệu" className="w-36 h-36 mb-2" />
          <p className="text-gray-600">Sản phẩm của bạn còn trống</p>
        </div>
      )}
    </div>
  );
};
