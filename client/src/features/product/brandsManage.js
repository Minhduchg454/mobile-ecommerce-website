// BrandManage.jsx
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { apiGetBrands, apiDeleteBrand } from "../../services/catalog.api";
import { showAlert, showModal } from "store/app/appSlice";
import { AiOutlineEdit, AiOutlineDelete } from "react-icons/ai";
import { nextAlertId, registerHandlers } from "store/alert/alertBus";
import noData from "../../assets/data-No.png";
import { Loading } from "../../components";
import { useSearchParams } from "react-router-dom";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";
import moment from "moment";
import { CreateBrandForm } from "./createBrandForm";
import { BRAND_STATUS_LABELS } from "../../ultils/contants";

export const BrandsManage = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(0);
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isShowSort, setIsShowSort] = useState(false);
  const [isShowStatus, setIsShowStatus] = useState(false);
  const { current } = useSelector((s) => s.user);
  const isAdmin = current?.roles.includes("admin");

  const sortOptions = [
    { label: "Mới nhất", sort: "newest" },
    { label: "Cũ nhất", sort: "oldest" },
    { label: "Tên A-Z", sort: "name_asc" },
    { label: "Tên Z-A", sort: "name_desc" },
  ];

  const statusOptions = [
    { label: "Tất cả trạng thái", value: "" },
    { label: "Đang chờ duyệt", value: "pending" },
    { label: "Đã được duyệt", value: "approved" },
    { label: "Đã bị khóa", value: "blocked" },
    { label: "Không được duyệt", value: "rejected" },
  ];

  const statusParam = searchParams.get("status") || "";
  const sortParam = searchParams.get("sort") || "newest";
  const searchKeyword = searchParams.get("s") || "";
  const currentSort =
    sortOptions.find((opt) => opt.sort === sortParam) || sortOptions[0];

  const currentStatus =
    statusOptions.find((opt) => opt.value === statusParam) || statusOptions[0];

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const res = await apiGetBrands({
        isAdmin,
        sort: sortParam,
        status: statusParam,
        ...(searchKeyword && { s: searchKeyword }),
      });

      if (res?.success) {
        setBrands(res?.brands || []);
        setCount(res?.brands?.length || 0);
      } else {
        dispatch(
          showAlert({
            title: "Lỗi tải dữ liệu",
            message: res?.message || "Không thể tải thương hiệu",
            variant: "danger",
            duration: 1500,
          })
        );
      }
    } catch (err) {
      dispatch(
        showAlert({
          title: "Lỗi",
          message: `Không thể tải thương hiệu. ${err}`,
          variant: "danger",
          duration: 1500,
        })
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortParam, searchKeyword, statusParam]);

  const handlerDelete = (id, name) => {
    const alertId = nextAlertId();
    registerHandlers(alertId, {
      onConfirm: async () => {
        dispatch(showModal({ isShowModal: true, modalChildren: <Loading /> }));
        const res = await apiDeleteBrand(id);
        dispatch(showModal({ isShowModal: false }));

        if (res?.success) {
          fetchBrands();
          dispatch(
            showAlert({
              title: "Đã xóa thương hiệu",
              message: name,
              variant: "success",
              duration: 1500,
              showCancelButton: false,
              showConfirmButton: false,
            })
          );
        } else {
          dispatch(
            showAlert({
              title: "Xóa thất bại",
              message: res?.message || "Không thể xóa thương hiệu này",
              variant: "danger",
              duration: 1500,
              showCancelButton: false,
              showConfirmButton: false,
            })
          );
        }
      },
    });

    dispatch(
      showAlert({
        id: alertId,
        title: "Xác nhận xóa thương hiệu?",
        message: name,
        variant: "danger",
        showCancelButton: true,
        confirmText: "Xóa",
        cancelText: "Hủy",
      })
    );
  };

  const titleCls = "font-bold mb-1";
  const buttonAction =
    "text-xs md:text-sm whitespace-nowrap border px-2 py-1 rounded-3xl flex items-center gap-1 text-black bg-button-bg hover:bg-button-hv";

  if (loading)
    return (
      <div className="text-center py-8 text-sm text-gray-600">
        Đang tải dữ liệu...
      </div>
    );

  const handleCreateBrand = () => {
    dispatch(
      showModal({
        isShowModal: true,
        modalChildren: (
          <CreateBrandForm
            isAdmin={isAdmin}
            brand={null}
            onCancel={() => dispatch(showModal({ isShowModal: false }))}
            onSuccess={() => {
              dispatch(showModal({ isShowModal: false }));
              fetchBrands();
            }}
          />
        ),
      })
    );
  };

  const handleEditBrand = (brand) => {
    dispatch(
      showModal({
        isShowModal: true,
        modalChildren: (
          <CreateBrandForm
            isAdmin={isAdmin}
            brand={brand}
            onCancel={() => dispatch(showModal({ isShowModal: false }))}
            onSuccess={() => {
              dispatch(showModal({ isShowModal: false }));
              fetchBrands();
            }}
          />
        ),
      })
    );
  };

  return (
    <div className="relative flex flex-col gap-4">
      {/* Header */}
      <div className="bg-app-bg/60 backdrop-blur-sm rounded-3xl px-3 py-2 md:px-4 sticky top-[50px] z-10 flex justify-between items-center">
        <h1 className={titleCls}>{count} thương hiệu</h1>

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
          {/* Sort */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsShowSort((v) => !v)}
              className="glass shadow-md md:px-2 py-1 px-1 border rounded-2xl text-description flex items-center gap-1"
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
                className="absolute right-0 mt-2 w-52 bg-white/90 backdrop-blur-md border rounded-xl shadow-lg p-1 z-20"
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

          <button
            onClick={handleCreateBrand}
            className="bg-button-bg-ac hover:bg-button-bg-hv px-4 py-1 whitespace-nowrap rounded-3xl text-white shadow-md text-sm"
          >
            Thêm thương hiệu mới
          </button>
        </div>
      </div>

      {/* Danh sách thương hiệu */}
      {brands.length > 0 ? (
        <div className="flex flex-col gap-3 animate-fadeIn">
          {brands.map((b) => {
            const badge = BRAND_STATUS_LABELS[b.brandStatus] || {
              label: "Không xác định",
              bgColor: "bg-gray-100",
              textColor: "text-gray-600",
            };
            return (
              <div
                key={b._id}
                className="bg-white border rounded-3xl p-3 flex justify-between items-center"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={b.brandLogo}
                    alt={b.brandName}
                    className="w-14 h-14 rounded-xl object-contain border"
                  />
                  <div>
                    <div className="font-semibold text-sm md:text-base text-black mb-1">
                      {b.brandName}{" "}
                      <span
                        className={`ml-1 text-xs px-2 py-0.5 rounded-3xl whitespace-nowrap ${badge.bgColor} ${badge.textColor}`}
                      >
                        {badge.label}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 italic">
                      Ngày tạo: {moment(b.createdAt).format("DD/MM/YYYY")}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    className={buttonAction}
                    onClick={() => handleEditBrand(b)}
                  >
                    <AiOutlineEdit size={16} />
                    Sửa
                  </button>
                  <button
                    className={buttonAction}
                    onClick={() => handlerDelete(b._id, b.brandName)}
                  >
                    <AiOutlineDelete size={16} />
                    Xóa
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-2 md:p-4 flex flex-col items-center justify-center w-full h-[500px]">
          <img src={noData} alt="Không có dữ liệu" className="w-36 h-36 mb-2" />
          <p className="text-gray-600">Chưa có thương hiệu nào</p>
        </div>
      )}
    </div>
  );
};
