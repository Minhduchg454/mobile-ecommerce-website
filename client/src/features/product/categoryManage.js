import { useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import {
  apiGetProductCategories,
  apiDeleteCategory,
} from "../../services/catalog.api";
import { showAlert, showModal } from "store/app/appSlice";
import { AiOutlineEdit, AiOutlineDelete } from "react-icons/ai";
import { nextAlertId, registerHandlers } from "store/alert/alertBus";
import noData from "../../assets/data-No.png";
import { Loading } from "../../components";
import { useSearchParams } from "react-router-dom";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";
import moment from "moment";
import { CreateCategoryForm } from "./createCategoryForm";

export const CategoryManage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(0);

  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isShowSort, setIsShowSort] = useState(false);

  const sortOptions = [
    { label: "Mới nhất", sort: "newest" },
    { label: "Cũ nhất", sort: "oldest" },
    { label: "Tên A-Z", sort: "name_asc" },
    { label: "Tên Z-A", sort: "name_desc" },
  ];

  const sortParam = searchParams.get("sort") || "newest";
  const searchKeyword = searchParams.get("s") || "";
  const currentSort =
    sortOptions.find((opt) => opt.sort === sortParam) || sortOptions[0];

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await apiGetProductCategories({
        sort: sortParam,
        ...(searchKeyword && { s: searchKeyword }),
      });

      if (res?.success) {
        setCategories(res?.categories || []);
        setCount(res?.categories?.length || 0);
      } else {
        dispatch(
          showAlert({
            title: "Lỗi tải dữ liệu",
            message: res?.message || "Không thể tải danh mục",
            variant: "danger",
            duration: 1500,
          })
        );
      }
    } catch (err) {
      dispatch(
        showAlert({
          title: "Lỗi",
          message: `Không thể tải danh mục. ${err}`,
          variant: "danger",
          duration: 1500,
        })
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortParam, searchKeyword]);

  const handlerDelete = (id, name) => {
    const alertId = nextAlertId();
    registerHandlers(alertId, {
      onConfirm: async () => {
        dispatch(showModal({ isShowModal: true, modalChildren: <Loading /> }));
        const res = await apiDeleteCategory(id);
        dispatch(showModal({ isShowModal: false }));

        if (res?.success) {
          fetchCategories();
          dispatch(
            showAlert({
              title: "Đã xóa danh mục",
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
              message: res?.message || "Không thể xóa danh mục này",
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
        title: "Xác nhận xóa danh mục?",
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

  const handleCreateCategory = () => {
    dispatch(
      showModal({
        isShowModal: true,
        modalChildren: (
          <CreateCategoryForm
            category={null}
            onCancel={() => dispatch(showModal({ isShowModal: false }))}
            onSuccess={() => {
              dispatch(showModal({ isShowModal: false }));
              fetchCategories();
            }}
          />
        ),
      })
    );
  };

  const handleEditCategory = (category) => {
    dispatch(
      showModal({
        isShowModal: true,
        modalChildren: (
          <CreateCategoryForm
            category={category}
            onCancel={() => dispatch(showModal({ isShowModal: false }))}
            onSuccess={() => {
              dispatch(showModal({ isShowModal: false }));
              fetchCategories();
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
        <h1 className={titleCls}>{count} danh mục</h1>

        <div className="flex gap-2">
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
            onClick={handleCreateCategory}
            className="bg-button-bg-ac hover:bg-button-bg-hv px-4 py-1 whitespace-nowrap rounded-3xl text-white shadow-md text-sm"
          >
            Thêm danh mục mới
          </button>
        </div>
      </div>

      {/* Danh sách danh mục */}
      {categories.length > 0 ? (
        <div className="flex flex-col gap-3 animate-fadeIn">
          {categories.map((c) => (
            <div
              key={c._id}
              className="bg-white border rounded-3xl p-3 flex justify-between items-center"
            >
              <div className="flex items-center gap-3">
                <img
                  src={c.categoryThumb}
                  alt={c.categoryName}
                  className="w-14 h-14 rounded-xl object-cover border"
                />
                <div>
                  <div className="font-semibold text-sm md:text-base text-black">
                    {c.categoryName}
                  </div>
                  <div className="text-xs text-gray-500 italic">
                    Ngày tạo: {moment(c.createdAt).format("DD/MM/YYYY")}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  className={buttonAction}
                  onClick={() => handleEditCategory(c)}
                >
                  <AiOutlineEdit size={16} />
                  Sửa
                </button>
                <button
                  className={buttonAction}
                  onClick={() => handlerDelete(c._id, c.categoryName)}
                >
                  <AiOutlineDelete size={16} />
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-2 md:p-4 flex flex-col items-center justify-center w-full h-[500px]">
          <img src={noData} alt="Không có dữ liệu" className="w-36 h-36 mb-2" />
          <p className="text-gray-600">Chưa có danh mục nào</p>
        </div>
      )}
    </div>
  );
};
