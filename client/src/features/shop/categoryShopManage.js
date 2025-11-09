import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState, useRef } from "react";
import {
  apiGetShopCategories,
  apiDeleteShopCategory,
} from "../../services/shop.api";
import { showAlert, showModal } from "store/app/appSlice";
import { CreateCategoryShopForm } from "./createCategoryShopForm";
import { AiOutlineEdit, AiOutlineDelete } from "react-icons/ai";
import { nextAlertId, registerHandlers } from "store/alert/alertBus";
import noData from "../../assets/data-No.png";
import { Loading } from "../../components";
import { useSearchParams } from "react-router-dom";
import moment from "moment";

export const CategoryShopManage = () => {
  const { current } = useSelector((s) => s.seller);
  const shopId = current?._id;
  const isBlock = current?.shopStatus === "blocked";
  const [categories, setCategories] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [params] = useSearchParams();
  const searchKeyword = params.get("s") || "";

  // popup state
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null); // null = tạo mới

  const dispatch = useDispatch();

  // fetch list
  const fetchCategories = async (sid) => {
    try {
      const res = await apiGetShopCategories({
        shopId: sid,
        sort: "newest",
        ...(searchKeyword && { s: searchKeyword }),
      });
      if (res?.success) {
        setCategories(res?.categoryShops || []);
        setCount(res?.count || 0);
      }
    } catch (err) {
      dispatch(
        showAlert({
          title: "Không thể tải danh sách",
          message: err || "Vui lòng thử lại sau",
          variant: "danger",
          duration: 1500,
        })
      );
      setLoading(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (shopId) fetchCategories(shopId);
  }, [shopId, searchKeyword]);

  // mở popup tạo mới
  const handleCreateCategoryShop = () => {
    setEditingCategory(null);
    setShowFormModal(true);
  };

  // mở popup sửa
  const handlerEdit = (category) => {
    setEditingCategory(category);
    setShowFormModal(true);
  };

  // xoá
  const handlerDelete = (csId) => {
    const id = nextAlertId();
    registerHandlers(id, {
      onConfirm: async () => {
        // có thể showModal Loading nếu bạn muốn:
        dispatch(showModal({ isShowModal: true, modalChildren: <Loading /> }));
        const res = await apiDeleteShopCategory(csId);
        dispatch(showModal({ isShowModal: false }));

        if (res?.success) {
          fetchCategories(shopId);
          dispatch(
            showAlert({
              title: "Xóa thành công",
              message: "Danh mục đã được xoá",
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
              message: "Vui lòng thử lại",
              variant: "danger",
              showCancelButton: false,
              showConfirmButton: false,
              duration: 1500,
            })
          );
        }
      },
    });

    dispatch(
      showAlert({
        id,
        title: "Bạn có chắc chắn muốn xóa danh mục này?",
        variant: "danger",
        showCancelButton: true,
        confirmText: "Có",
        cancelText: "Không",
      })
    );
  };

  // callback khi form submit OK
  const handleFormSuccess = () => {
    // reload list
    fetchCategories(shopId);
    // đóng popup
    setShowFormModal(false);
    // clear editingCategory
    setEditingCategory(null);
  };

  // callback khi hủy popup (ở chế độ edit)
  const handleFormCancel = () => {
    setShowFormModal(false);
    setEditingCategory(null);
  };

  // ================== UI ==================
  const cardCategory =
    "bg-white rounded-3xl md:p-4 p-2 flex justify-between items-center border";
  const buttonAction =
    "text-xs md:text-sm whitespace-nowrap border px-2 py-1 rounded-3xl flex items-center gap-1 text-black bg-button-bg hover:bg-button-hv";
  const titleCls = "font-bold mb-1";

  if (loading) {
    return (
      <div className="w-full h-[500px] flex justify-center items-center">
        <p>Đang tải dữ liệu ...</p>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col gap-4">
      {/* HEADER */}
      <div className="bg-app-bg/60 backdrop-blur-sm rounded-3xl px-3 py-2 md:px-4 sticky top-[50px] z-10 flex justify-between items-center ">
        <h1 className={titleCls}>{count} danh mục sản phẩm</h1>
        <button
          disabled={isBlock}
          onClick={handleCreateCategoryShop}
          className={`px-3 py-1 whitespace-nowrap rounded-3xl text-white shadow-md  ${
            isBlock
              ? "bg-gray-400 cursor-not-allowed opacity-50"
              : "bg-button-bg-ac hover:bg-button-bg-hv cursor-pointer"
          }`}
        >
          Thêm danh mục mới
        </button>
      </div>

      {/* LIST */}
      {categories.length > 0 ? (
        categories.map((c) => (
          <div key={c._id} className={cardCategory}>
            <div>
              <p className="font-semibold text-sm md:text-base text-black">
                {c.csName}
              </p>
              <p className="text-xs text-gray-500 italic">
                {" "}
                Ngày tạo: {moment(c.createdAt).format("DD/MM/YYYY")}
              </p>
            </div>

            <div className="flex flex-col md:flex-row gap-2">
              <button
                disabled={isBlock}
                onClick={() => handlerEdit(c)}
                className={buttonAction}
              >
                <AiOutlineEdit size={16} />
                Sửa
              </button>
              <button
                disabled={isBlock}
                className={buttonAction}
                onClick={() => handlerDelete(c._id)}
              >
                <AiOutlineDelete size={16} />
                Xóa
              </button>
            </div>
          </div>
        ))
      ) : (
        <div className="bg-white rounded-3xl p-2 md:p-4 flex flex-col items-center justify-center w-full h-[500px]">
          <img src={noData} alt="" className="w-36 h-36 mb-2" />
          <p>Danh mục của bạn còn trống</p>
        </div>
      )}

      {/* MODAL OVERLAY + FORM */}
      {showFormModal && (
        <div
          onClick={handleFormCancel}
          className="fixed inset-0 bg-white/10 backdrop-blur-sm flex items-center justify-center z-50"
        >
          <div className="relative bg-transparent">
            {/* nút đóng góc trên phải */}
            <CreateCategoryShopForm
              category={editingCategory}
              shopId={shopId}
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
            />
          </div>
        </div>
      )}
    </div>
  );
};
